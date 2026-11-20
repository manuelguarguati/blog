import type { Post, Comment, SiteStats, User, AuthResponse } from './types';

export const API_BASE = import.meta.env.VITE_API_URL 
  ? (import.meta.env.VITE_API_URL.startsWith('http') ? import.meta.env.VITE_API_URL : `https://${import.meta.env.VITE_API_URL}`)
  : (window.location.port === '8000' || window.location.port === '5173' ? 'http://localhost:8000' : window.location.origin);

export function getAuthToken(): string | null {
  return localStorage.getItem('bibi_auth_token');
}

export function setAuthSession(user: User, token: string) {
  localStorage.setItem('bibi_auth_token', token);
  localStorage.setItem('bibi_user', JSON.stringify(user));
}

export function getStoredUser(): User | null {
  const u = localStorage.getItem('bibi_user');
  if (!u) return null;
  try {
    return JSON.parse(u);
  } catch {
    return null;
  }
}

export function clearAuthSession() {
  localStorage.removeItem('bibi_auth_token');
  localStorage.removeItem('bibi_user');
}

export function resolveMediaUrl(url: string | undefined): string {
  if (!url) return 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
}

export async function checkAuthStatus(): Promise<{ owner_registered: boolean }> {
  const res = await fetch(`${API_BASE}/api/auth/status`);
  if (!res.ok) throw new Error('Error al consultar estado');
  return res.json();
}

export async function registerAuthor(name: string, email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error en el registro');
  }
  const data = await res.json();
  setAuthSession(data.user, data.token);
  return data;
}

export async function loginAuthor(email: string, password: string): Promise<AuthResponse> {
  const res = await fetch(`${API_BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al iniciar sesión');
  }
  const data = await res.json();
  setAuthSession(data.user, data.token);
  return data;
}

export async function fetchMe(): Promise<User> {
  const token = getAuthToken();
  if (!token) throw new Error('No hay sesión activa');
  const res = await fetch(`${API_BASE}/api/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    clearAuthSession();
    throw new Error('Sesión expirada');
  }
  return res.json();
}

export async function logoutAuthor(): Promise<void> {
  const token = getAuthToken();
  if (token) {
    await fetch(`${API_BASE}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` },
    }).catch(() => {});
  }
  clearAuthSession();
}

export async function fetchStats(): Promise<SiteStats> {
  const res = await fetch(`${API_BASE}/api/stats`);
  if (!res.ok) throw new Error('Error al cargar estadísticas');
  return res.json();
}

export async function fetchPosts(category?: string, search?: string): Promise<Post[]> {
  const params = new URLSearchParams();
  if (category && category !== 'Todos') params.append('category', category);
  if (search) params.append('search', search);

  const res = await fetch(`${API_BASE}/api/posts?${params.toString()}`);
  if (!res.ok) throw new Error('Error al cargar publicaciones');
  return res.json();
}

export async function fetchPostDetail(id: number): Promise<Post> {
  const res = await fetch(`${API_BASE}/api/posts/${id}`);
  if (!res.ok) throw new Error('Error al cargar artículo');
  return res.json();
}

export async function likePost(id: number): Promise<{ likes_count: number }> {
  const res = await fetch(`${API_BASE}/api/posts/${id}/like`, { method: 'POST' });
  if (!res.ok) throw new Error('Error al dar me gusta');
  return res.json();
}

export async function fetchComments(postId: number): Promise<Comment[]> {
  const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`);
  if (!res.ok) throw new Error('Error al cargar comentarios');
  return res.json();
}

export async function submitComment(postId: number, author_name: string, content: string, avatar: string): Promise<Comment> {
  const res = await fetch(`${API_BASE}/api/posts/${postId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ author_name, content, avatar }),
  });
  if (!res.ok) throw new Error('Error al enviar comentario');
  return res.json();
}

export async function uploadMedia(file: File): Promise<{ url: string; type: 'image' | 'video'; filename: string }> {
  const token = getAuthToken();
  if (!token) throw new Error('Debes iniciar sesión para subir archivos');

  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || 'Error al subir archivo');
  }
  return res.json();
}

export async function createPost(postData: {
  title: string;
  excerpt?: string;
  content: string;
  category: string;
  cover_image?: string;
  media?: { type: 'image' | 'video'; url: string; caption?: string }[];
}): Promise<Post> {
  const token = getAuthToken();
  if (!token) throw new Error('Debes iniciar sesión para publicar');

  const res = await fetch(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(postData),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al crear publicación');
  }
  return res.json();
}

export async function deletePost(id: number): Promise<void> {
  const token = getAuthToken();
  if (!token) throw new Error('Debes iniciar sesión para eliminar');

  const res = await fetch(`${API_BASE}/api/posts/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al eliminar publicación');
  }
}
