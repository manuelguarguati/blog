import datetime
import json
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), default="María Bibiana (Bibi)")
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), default="owner")  # owner / admin
    avatar = Column(String(50), default="🌸")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    tokens = relationship("SessionToken", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "email": self.email,
            "role": self.role,
            "avatar": self.avatar,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class SessionToken(Base):
    __tablename__ = "session_tokens"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String(255), unique=True, index=True, nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("User", back_populates="tokens")

class Post(Base):
    __tablename__ = "posts"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True)
    excerpt = Column(Text, nullable=True)
    content = Column(Text, nullable=False)
    category = Column(String(100), default="Reflexiones")
    cover_image = Column(String(500), nullable=True)
    media_json = Column(Text, default="[]")  # List of {type: 'image'|'video', url: str, caption: str}
    views_count = Column(Integer, default=0)
    likes_count = Column(Integer, default=0)
    reading_time = Column(String(50), default="2 min")
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    comments = relationship("Comment", back_populates="post", cascade="all, delete-orphan")

    def to_dict(self):
        try:
            media = json.loads(self.media_json) if self.media_json else []
        except Exception:
            media = []

        return {
            "id": self.id,
            "title": self.title,
            "slug": self.slug,
            "excerpt": self.excerpt,
            "content": self.content,
            "category": self.category,
            "cover_image": self.cover_image,
            "media": media,
            "views_count": self.views_count,
            "likes_count": self.likes_count,
            "reading_time": self.reading_time,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "comments_count": len(self.comments) if self.comments else 0,
        }

class Comment(Base):
    __tablename__ = "comments"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"), nullable=False)
    author_name = Column(String(100), default="Amiga lectora")
    avatar = Column(String(50), default="🌸")
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    post = relationship("Post", back_populates="comments")

    def to_dict(self):
        return {
            "id": self.id,
            "post_id": self.post_id,
            "author_name": self.author_name,
            "avatar": self.avatar,
            "content": self.content,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }

class SiteStat(Base):
    __tablename__ = "site_stats"

    id = Column(Integer, primary_key=True)
    total_visits = Column(Integer, default=0)
