import type { Post, Comment, SiteStats } from './types';

export const API_BASE = import.meta.env.VITE_API_URL 
  ? (import.meta.env.VITE_API_URL.startsWith('http') ? import.meta.env.VITE_API_URL : `https://${import.meta.env.VITE_API_URL}`)
  : 'http://localhost:8000';

export function resolveMediaUrl(url: string | undefined): string {
  if (!url) return 'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${API_BASE}${url.startsWith('/') ? '' : '/'}${url}`;
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
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/api/upload`, {
    method: 'POST',
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
  const res = await fetch(`${API_BASE}/api/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(postData),
  });
  if (!res.ok) throw new Error('Error al crear publicación');
  return res.json();
}
