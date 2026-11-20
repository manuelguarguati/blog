export interface MediaItem {
  type: 'image' | 'video';
  url: string;
  caption?: string;
}

export interface Comment {
  id: number;
  post_id: number;
  author_name: string;
  avatar: string;
  content: string;
  created_at: string;
}

export interface Post {
  id: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  cover_image?: string;
  media: MediaItem[];
  views_count: number;
  likes_count: number;
  reading_time: string;
  created_at: string;
  comments_count: number;
}

export interface SiteStats {
  total_visits: number;
  total_posts: number;
  total_comments: number;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: string;
  avatar: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}
