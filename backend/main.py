import os
import json
import uuid
import shutil
from typing import List, Optional
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File, Form, Query, Header
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr

from database import engine, Base, get_db, SessionLocal
from models import Post, Comment, SiteStat, User, SessionToken
from auth import hash_password, verify_password, generate_token

# Create tables in database (Neon Postgres or SQLite)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Bibi Blog API", version="1.0.0")

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload directory
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), "uploads")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Pydantic Schemas
class CommentCreate(BaseModel):
    author_name: str
    content: str
    avatar: Optional[str] = "🌸"

class PostCreate(BaseModel):
    title: str
    excerpt: Optional[str] = ""
    content: str
    category: str = "Reflexiones"
    cover_image: Optional[str] = ""
    media: Optional[List[dict]] = []

class RegisterRequest(BaseModel):
    name: str
    email: str
    password: str

class LoginRequest(BaseModel):
    email: str
    password: str

# Auth dependency
def get_current_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Acceso restringido solo para la autora (Bibi). Por favor inicia sesión.")
    
    token_str = authorization.replace("Bearer ", "").strip()
    session = db.query(SessionToken).filter(SessionToken.token == token_str).first()
    if not session or not session.user:
        raise HTTPException(status_code=401, detail="Tu sesión ha expirado o es inválida.")
    
    return session.user

# Seed initial posts if empty
def seed_initial_data(db: Session):
    if db.query(Post).count() == 0:
        initial_posts = [
            Post(
                title="Mejora tus apuntes con estos lapiceros estéticos 🌷",
                slug="mejora-tus-apuntes-lapiceros-esteticos",
                excerpt="Transforma tus libretas de estudio en algo inspirador con los tonos pastel y la tinta gel perfecta.",
                content="""Tener unos apuntes limpios, organizados y bonitos no solo hace que estudiar sea más agradable, sino que también nos motiva cada mañana. 

Descubrí que usar una paleta de colores suaves (tonos pastel, rosa empolvado, verde menta y beige) ayuda a retener mejor las ideas clave sin cansar la vista. Además, la textura y suavidad de los lapiceros de tinta de gel japonesa hacen toda la diferencia al escribir.

Consejos rápidos para apuntes aesthetic:
1. Elige una gama de 3 colores como máximo por tema.
2. Usa un resaltador pastel para títulos y encabezados.
3. Deja espacios en blanco: respira la hoja.
4. Agrega pequeños íconos o viñetas personalizadas.""",
                category="Papelería & Apuntes",
                cover_image="https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=1200&q=80",
                media_json=json.dumps([
                    {
                        "type": "image",
                        "url": "https://images.unsplash.com/photo-1585776245991-cf89dd7fc73a?auto=format&fit=crop&w=1200&q=80",
                        "caption": "Mis indispensables de papelería en mi escritorio 🌸"
                    },
                    {
                        "type": "image",
                        "url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=1200&q=80",
                        "caption": "Paleta de colores pasteles y organización diaria"
                    }
                ]),
                views_count=184,
                likes_count=29,
                reading_time="3 min"
            ),
            Post(
                title="El plan perfecto: Un cafecito y algo rico 🍵",
                slug="el-plan-perfecto-cafecito",
                excerpt="A veces la felicidad es tan sencilla como una taza caliente, un libro y una tarde sin prisas.",
                content="""Hay días en los que el mejor regalo que nos podemos dar es una pausa. Salir a una cafetería linda, pedir una bebida caliente con espuma suave y acompañarla de algo delicioso.

El aroma del café recién molido, la música suave de fondo y el tiempo detenido. Esos pequeños rituales son los que recargan el alma para el resto de la semana. ¿Cuál es tu rincón favorito para desconectar?""",
                category="Cafecito & Planes",
                cover_image="https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
                media_json=json.dumps([
                    {
                        "type": "image",
                        "url": "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=1200&q=80",
                        "caption": "Tarde de café y buena compañía ☕✨"
                    }
                ]),
                views_count=242,
                likes_count=45,
                reading_time="2 min"
            ),
            Post(
                title="Energía bonita: Días tranquilos y corazón en paz 💛",
                slug="energia-bonita-dias-tranquilos",
                excerpt="Construyendo días tranquilos, con actitud positiva y el corazón en paz. Que todo lo bueno te encuentre.",
                content="""Construir una vida bonita empieza por las decisiones pequeñas: elegir alejarse de lo que resta, agradecer lo que ya tenemos y rodearnos de personas que suman luz.

Que todo lo bueno te encuentre, te abrace y se quede contigo hoy y siempre. 🌟""",
                category="Reflexiones",
                cover_image="https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80",
                media_json=json.dumps([
                    {
                        "type": "image",
                        "url": "https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80",
                        "caption": "La luz de la tarde y la calma interior 🌻"
                    }
                ]),
                views_count=310,
                likes_count=68,
                reading_time="1 min"
            ),
            Post(
                title="Has llegado más lejos de lo que crees ✨",
                slug="has-llegado-mas-lejos",
                excerpt="A veces vamos tan rápido que olvidamos mirar hacia atrás y aplaudir todo lo que hemos superado.",
                content="""Date crédito por cada paso, por los días en los que parecía difícil y aun así seguiste adelante. No estás tarde en la vida; estás justo en tu propio tiempo construyendo tu propio camino.""",
                category="Reflexiones",
                cover_image="https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80",
                media_json=json.dumps([
                    {
                        "type": "image",
                        "url": "https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=1200&q=80",
                        "caption": "Un recordatorio para tu corazón hoy ✨"
                    }
                ]),
                views_count=195,
                likes_count=52,
                reading_time="2 min"
            )
        ]
        db.add_all(initial_posts)
        db.commit()

# Run seed on startup
with SessionLocal() as db:
    seed_initial_data(db)

# ----------------- AUTHENTICATION ROUTES ----------------- #

@app.get("/api/auth/status")
def auth_status(db: Session = Depends(get_db)):
    """Check if owner account has been registered."""
    owner_exists = db.query(User).count() > 0
    return {"owner_registered": owner_exists}

@app.post("/api/auth/register")
def register(data: RegisterRequest, db: Session = Depends(get_db)):
    """Register Bibi as the exclusive owner of the blog."""
    email_clean = data.email.strip().lower()
    if not email_clean or "@" not in email_clean:
        raise HTTPException(status_code=400, detail="Por favor ingresa un correo electrónico válido.")
    
    if len(data.password) < 6:
        raise HTTPException(status_code=400, detail="La contraseña debe tener al menos 6 caracteres.")

    existing_user = db.query(User).filter(User.email == email_clean).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Ya existe una cuenta con este correo. Inicia sesión.")

    # Only one owner can be created
    total_users = db.query(User).count()
    if total_users >= 1:
        raise HTTPException(status_code=403, detail="Este blog es de uso personal y exclusivo para María Bibiana.")

    user = User(
        name=data.name.strip() or "María Bibiana (Bibi)",
        email=email_clean,
        hashed_password=hash_password(data.password),
        role="owner",
        avatar="🌸"
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    # Generate session token
    token = generate_token()
    session = SessionToken(token=token, user_id=user.id)
    db.add(session)
    db.commit()

    return {"user": user.to_dict(), "token": token}

@app.post("/api/auth/login")
def login(data: LoginRequest, db: Session = Depends(get_db)):
    """Log in as Bibi."""
    email_clean = data.email.strip().lower()
    user = db.query(User).filter(User.email == email_clean).first()
    if not user or not verify_password(data.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Correo o contraseña incorrectos.")

    # Generate new session token
    token = generate_token()
    session = SessionToken(token=token, user_id=user.id)
    db.add(session)
    db.commit()

    return {"user": user.to_dict(), "token": token}

@app.get("/api/auth/me")
def get_me(current_user: User = Depends(get_current_user)):
    """Get currently logged-in user."""
    return current_user.to_dict()

@app.post("/api/auth/logout")
def logout(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    if authorization and authorization.startswith("Bearer "):
        token_str = authorization.replace("Bearer ", "").strip()
        db.query(SessionToken).filter(SessionToken.token == token_str).delete()
        db.commit()
    return {"message": "Sesión cerrada correctamente"}

# ----------------- BLOG ROUTES (PUBLIC & PROTECTED) ----------------- #

@app.get("/api/stats")
def get_stats(db: Session = Depends(get_db)):
    stat = db.query(SiteStat).first()
    if not stat:
        stat = SiteStat(total_visits=1420)
        db.add(stat)
        db.commit()
        db.refresh(stat)
    
    stat.total_visits += 1
    db.commit()

    total_posts = db.query(Post).count()
    total_comments = db.query(Comment).count()

    return {
        "total_visits": stat.total_visits,
        "total_posts": total_posts,
        "total_comments": total_comments,
    }

@app.get("/api/posts")
def list_posts(
    category: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db)
):
    query = db.query(Post)
    if category and category != "Todos":
        query = query.filter(Post.category == category)
    if search:
        query = query.filter(
            Post.title.ilike(f"%{search}%") | Post.content.ilike(f"%{search}%")
        )
    posts = query.order_by(Post.created_at.desc()).all()
    return [p.to_dict() for p in posts]

@app.get("/api/posts/{post_id}")
def get_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    
    post.views_count += 1
    db.commit()
    return post.to_dict()

@app.post("/api/posts/{post_id}/like")
def like_post(post_id: int, db: Session = Depends(get_db)):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    post.likes_count += 1
    db.commit()
    return {"likes_count": post.likes_count}

@app.get("/api/posts/{post_id}/comments")
def get_comments(post_id: int, db: Session = Depends(get_db)):
    comments = db.query(Comment).filter(Comment.post_id == post_id).order_by(Comment.created_at.desc()).all()
    return [c.to_dict() for c in comments]

@app.post("/api/posts/{post_id}/comments")
def create_comment(post_id: int, data: CommentCreate, db: Session = Depends(get_db)):
    """Open to anyone! No login required to comment."""
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    
    comment = Comment(
        post_id=post.id,
        author_name=data.author_name.strip() or "Amiga lectora",
        avatar=data.avatar or "🌸",
        content=data.content.strip()
    )
    db.add(comment)
    db.commit()
    db.refresh(comment)
    return comment.to_dict()

# PROTECTED: Only Bibi can create posts
@app.post("/api/posts")
def create_post(
    data: PostCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    import re
    slug = re.sub(r'[^a-zA-Z0-9]+', '-', data.title.lower()).strip('-')
    existing = db.query(Post).filter(Post.slug == slug).first()
    if existing:
        slug = f"{slug}-{uuid.uuid4().hex[:4]}"

    post = Post(
        title=data.title,
        slug=slug,
        excerpt=data.excerpt or data.content[:150] + "...",
        content=data.content,
        category=data.category,
        cover_image=data.cover_image or (data.media[0]["url"] if data.media else None),
        media_json=json.dumps(data.media or []),
        reading_time=f"{max(1, len(data.content.split()) // 150)} min"
    )
    db.add(post)
    db.commit()
    db.refresh(post)
    return post.to_dict()

# PROTECTED: Only Bibi can delete posts
@app.delete("/api/posts/{post_id}")
def delete_post(
    post_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    post = db.query(Post).filter(Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Artículo no encontrado")
    db.delete(post)
    db.commit()
    return {"message": "Artículo eliminado con éxito"}

# PROTECTED: Only Bibi can upload media files
@app.post("/api/upload")
async def upload_media(
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user)
):
    ext = os.path.splitext(file.filename)[1].lower()
    allowed_images = [".jpg", ".jpeg", ".png", ".webp", ".gif"]
    allowed_videos = [".mp4", ".mov", ".webm", ".mkv"]

    media_type = "image" if ext in allowed_images else "video" if ext in allowed_videos else None
    if not media_type:
        raise HTTPException(status_code=400, detail="Formato no soportado. Usa fotos (JPG, PNG, WebP) o videos (MP4, WebM, MOV)")

    filename = f"{uuid.uuid4().hex}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    return {
        "url": f"/uploads/{filename}",
        "type": media_type,
        "filename": file.filename
    }

# Mount static React frontend if built
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), "frontend_dist")
if not os.path.exists(FRONTEND_DIST):
    FRONTEND_DIST = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))

if os.path.exists(FRONTEND_DIST):
    app.mount("/", StaticFiles(directory=FRONTEND_DIST, html=True), name="frontend")
