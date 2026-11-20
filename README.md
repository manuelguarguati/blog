# 🌸 Bibi's Blog — Momentos, Café & Vida Bonita

Un blog personal moderno, estético y elegante diseñado para **María Bibiana ("Bibi 🥰")**, adaptado desde su blog original a una arquitectura web profesional con **React**, **FastAPI**, **PostgreSQL** y despliegue continuo en **Render**.

---

## ✨ Características Principales

* **Diseño Editorial & Aesthetic:** Cuidado al detalle con tonos cálidos (*beige*, crema, rosa suave), tipografía refinada (*Playfair Display* y *Plus Jakarta Sans*) y tarjetas con sombras delicadas.
* **Fotos & Videos:** Soporte nativo para galerías de fotos y reproductor de video HTML5 limpio.
* **Comentarios Abiertos:** Cualquier persona puede dejar un mensaje bonito eligiendo su nombre y un avatar/ícono especial (🌸, ✨, ☕, 🎀, 🌿, 🧸).
* **Contador de Vistas en Tiempo Real:** Muestra cuántas personas han visitado el blog en general y cuántas han leído cada artículo.
* **Botón Interactivo de Me Gusta (❤️):** Reacciones en vivo para cada publicación.
* **Panel Rápido de Publicación:** Modal para que Bibi pueda subir sus artículos con fotos y videos de forma inmediata.
* **Despliegue en Render:** Totalmente configurado mediante `render.yaml` y Docker.

---

## 🛠️ Tecnologías Utilizadas

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Lucide Icons.
* **Backend:** Python 3.11+, FastAPI, SQLAlchemy, Pydantic, Uvicorn.
* **Base de Datos:** PostgreSQL (para Render) / SQLite (para desarrollo local rápido).
* **Contenedores & Despliegue:** Docker, Docker Compose y Render.

---

## 🚀 Cómo Ejecutar en tu Computadora (Local)

### Opción A: Con Docker (Recomendado)
Asegúrate de tener Docker encendido y ejecuta en la raíz del proyecto:

```bash
docker-compose up --build
```
* **Frontend:** http://localhost:5173 (o http://localhost:3000)
* **Backend API & Swagger:** http://localhost:8000/docs

---

### Opción B: Sin Docker (Desarrollo directo)

#### 1. Iniciar el Backend (FastAPI):
```bash
# Entrar y activar el entorno virtual
backend\venv\Scripts\activate

# Ejecutar el servidor
uvicorn main:app --reload --port 8000 --app-dir backend
```

#### 2. Iniciar el Frontend (React + Vite):
En otra terminal:
```bash
cd frontend
npm run dev
```
Abre tu navegador en `http://localhost:5173`.

---

## 🌐 Cómo Publicar en Render (Paso a Paso)

1. **Sube este proyecto a tu GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Mi nuevo blog para Bibi"
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

2. **Ir a [Render.com](https://render.com):**
   * Inicia sesión (puedes entrar con tu cuenta de GitHub).
   * Haz clic en **New +** y selecciona **Blueprint**.
   * Conecta tu repositorio de GitHub recién creado.
   * Render leerá automáticamente el archivo `render.yaml` y creará:
     * La base de datos PostgreSQL (`bibi-db`).
     * El servidor backend en Python con Docker (`bibi-backend`).
     * La página web en React (`bibi-blog`).

3. **¡Listo!** En unos minutos tendrás tus enlaces públicos funcionando 24/7.
