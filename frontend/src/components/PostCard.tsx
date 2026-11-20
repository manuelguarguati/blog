import React, { useState } from 'react';
import { Eye, Heart, MessageCircle, Play, Image as ImageIcon, Trash2 } from 'lucide-react';
import type { Post } from '../types';
import { resolveMediaUrl, likePost } from '../api';

interface PostCardProps {
  post: Post;
  onClick: () => void;
  isOwner?: boolean;
  onDelete?: (id: number) => void;
}

export const PostCard: React.FC<PostCardProps> = ({ post, onClick, isOwner, onDelete }) => {
  const [likes, setLikes] = useState(post.likes_count);
  const [liked, setLiked] = useState(false);
  const [isLiking, setIsLiking] = useState(false);

  const hasVideo = post.media && post.media.some((m) => m.type === 'video');
  const hasMultipleImages = post.media && post.media.length > 1;

  const handleLike = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (liked || isLiking) return;
    setIsLiking(true);
    try {
      setLikes((prev) => prev + 1);
      setLiked(true);
      await likePost(post.id);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLiking(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onDelete && window.confirm(`¿Estás segura de eliminar "${post.title}"?`)) {
      onDelete(post.id);
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    switch (category) {
      case 'Papelería & Apuntes':
        return 'bg-[#EDE8F5] text-[#695482] border-[#D8CEE6]';
      case 'Cafecito & Planes':
        return 'bg-[#F9EDE0] text-[#8C5D30] border-[#EAD5BE]';
      case 'Reflexiones':
        return 'bg-[#FCE8EB] text-[#9E4D5D] border-[#F2CAD2]';
      default:
        return 'bg-[#F2ECE6] text-[#78645F] border-[#E2D5CB]';
    }
  };

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString('es-ES', {
        month: 'short',
        day: 'numeric',
      })
    : '';

  return (
    <article
      onClick={onClick}
      className="group bg-[#FFFDF9] rounded-3xl border border-[#EFE5DC] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full relative"
    >
      {/* Cover Media */}
      <div className="relative aspect-[16/10] overflow-hidden bg-[#F0E6DE]">
        <img
          src={resolveMediaUrl(post.cover_image)}
          alt={post.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
          loading="lazy"
        />

        {/* Delete button (Owner only) */}
        {isOwner && (
          <button
            onClick={handleDelete}
            title="Eliminar publicación"
            className="absolute top-3 left-3 w-8 h-8 rounded-full bg-rose-600/80 hover:bg-rose-700 text-white flex items-center justify-center transition-colors shadow-sm z-10"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Media Badges */}
        <div className="absolute top-3 right-3 flex items-center space-x-1.5">
          {hasVideo && (
            <span className="flex items-center space-x-1 bg-black/60 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-full font-medium">
              <Play className="w-3 h-3 fill-current" />
              <span>Video</span>
            </span>
          )}
          {hasMultipleImages && (
            <span className="flex items-center space-x-1 bg-black/60 backdrop-blur-md text-white text-[11px] px-2.5 py-1 rounded-full font-medium">
              <ImageIcon className="w-3 h-3" />
              <span>{post.media.length}</span>
            </span>
          )}
        </div>

        {/* Category Pill */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`text-[11px] font-semibold px-3 py-1 rounded-full border shadow-2xs backdrop-blur-md ${getCategoryBadgeColor(
              post.category
            )}`}
          >
            {post.category}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata */}
          <div className="flex items-center space-x-2 text-xs text-[#9E8B88] mb-2 font-medium">
            <span>{formattedDate}</span>
            <span>•</span>
            <span>{post.reading_time || '2 min de lectura'}</span>
          </div>

          {/* Title */}
          <h2 className="font-serif text-xl sm:text-2xl text-[#3A2D2D] font-bold leading-snug group-hover:text-[#9B4E5D] transition-colors line-clamp-2 mb-2">
            {post.title}
          </h2>

          {/* Snippet */}
          <p className="text-sm text-[#736360] line-clamp-3 leading-relaxed mb-4">
            {post.excerpt}
          </p>
        </div>

        {/* Footer interactions: Views, Likes, Comments */}
        <div className="pt-4 border-t border-[#F2E9E1] flex items-center justify-between text-xs text-[#8E7C79] font-medium">
          {/* Views Counter on Post */}
          <div className="flex items-center space-x-1.5" title="Personas que leyeron este post">
            <Eye className="w-3.5 h-3.5 text-[#B57C86]" />
            <span>{post.views_count} vistas</span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Likes */}
            <button
              onClick={handleLike}
              className={`flex items-center space-x-1.5 transition-colors p-1 rounded-lg ${
                liked ? 'text-[#C93B52] font-semibold' : 'hover:text-[#C93B52]'
              }`}
              title="Me gusta"
            >
              <Heart
                className={`w-4 h-4 transition-transform ${
                  liked ? 'fill-[#C93B52] text-[#C93B52] scale-110' : ''
                }`}
              />
              <span>{likes}</span>
            </button>

            {/* Comments count */}
            <div className="flex items-center space-x-1.5 hover:text-[#7A5B55]">
              <MessageCircle className="w-4 h-4" />
              <span>{post.comments_count}</span>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
