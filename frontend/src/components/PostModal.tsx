import React, { useState, useEffect } from 'react';
import { X, Eye, Heart, MessageCircle, Share2, Sparkles, Send, Check } from 'lucide-react';
import type { Post, Comment } from '../types';
import { resolveMediaUrl, likePost, fetchComments, submitComment } from '../api';

interface PostModalProps {
  post: Post | null;
  onClose: () => void;
  onPostUpdated?: (updated: Post) => void;
}

const AVATAR_OPTIONS = ['🌸', '✨', '☕', '🎀', '🌿', '🧸', '💛', '🌷'];

export const PostModal: React.FC<PostModalProps> = ({ post, onClose, onPostUpdated }) => {
  if (!post) return null;

  const [likes, setLikes] = useState(post.likes_count);
  const [liked, setLiked] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [loadingComments, setLoadingComments] = useState(true);
  
  // Comment Form state
  const [authorName, setAuthorName] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('🌸');
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    // Load comments
    let isMounted = true;
    setLoadingComments(true);
    fetchComments(post.id)
      .then((data) => {
        if (isMounted) setComments(data);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (isMounted) setLoadingComments(false);
      });

    return () => {
      isMounted = false;
    };
  }, [post.id]);

  const handleLike = async () => {
    if (liked) return;
    try {
      setLikes((prev) => prev + 1);
      setLiked(true);
      await likePost(post.id);
      if (onPostUpdated) {
        onPostUpdated({ ...post, likes_count: likes + 1 });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    setSubmittingComment(true);
    try {
      const newComment = await submitComment(
        post.id,
        authorName.trim() || 'Amiga lectora',
        commentText.trim(),
        selectedAvatar
      );
      setComments((prev) => [newComment, ...prev]);
      setCommentText('');
      if (onPostUpdated) {
        onPostUpdated({ ...post, comments_count: post.comments_count + 1 });
      }
    } catch (err) {
      alert('Error al enviar el comentario. Intenta de nuevo.');
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const formattedDate = post.created_at
    ? new Date(post.created_at).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : '';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 animate-fadeIn">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FFFDF9] w-full max-w-3xl rounded-3xl sm:rounded-4xl shadow-2xl border border-[#EFE5DC] overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Top Bar with Close Button */}
        <div className="sticky top-0 z-20 bg-[#FFFDF9]/95 backdrop-blur-md px-6 py-4 border-b border-[#F0E6DE] flex items-center justify-between">
          <div className="flex items-center space-x-2 text-xs font-medium text-[#8F7D7A]">
            <span className="bg-[#F8EFE9] px-2.5 py-1 rounded-full text-[#9B4E5D] font-semibold border border-[#EBD7CE]">
              {post.category}
            </span>
            <span>•</span>
            <div className="flex items-center space-x-1" title="Vistas registradas">
              <Eye className="w-3.5 h-3.5 text-[#B57C86]" />
              <span>{post.views_count} lecturas</span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-[#F5ECE5] hover:bg-[#EADBCE] text-[#635350] flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="overflow-y-auto px-6 sm:px-10 py-6 space-y-8 flex-1">
          
          {/* Header Title */}
          <div>
            <div className="text-xs text-[#9E8B88] mb-2 font-medium">
              {formattedDate} • {post.reading_time || '2 min de lectura'}
            </div>
            <h1 className="font-serif text-2xl sm:text-4xl text-[#3A2D2D] font-bold leading-tight mb-4">
              {post.title}
            </h1>
            <p className="text-base sm:text-lg text-[#7C6A67] italic font-serif leading-relaxed border-l-2 border-[#D88D96] pl-4">
              {post.excerpt}
            </p>
          </div>

          {/* Cover / Main Media */}
          {post.cover_image && (
            <div className="rounded-3xl overflow-hidden border border-[#EDE2D8] shadow-xs">
              <img
                src={resolveMediaUrl(post.cover_image)}
                alt={post.title}
                className="w-full max-h-[450px] object-cover"
              />
            </div>
          )}

          {/* Article Text */}
          <div className="prose prose-stone max-w-none text-[#514341] text-base sm:text-lg leading-relaxed whitespace-pre-line font-normal">
            {post.content}
          </div>

          {/* Additional Media: Videos and Photos Gallery */}
          {post.media && post.media.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-[#F2EAE2]">
              <h3 className="font-serif text-lg font-bold text-[#3A2D2D] flex items-center space-x-2">
                <span>Fotos & Momentos</span>
                <Sparkles className="w-4 h-4 text-[#D88D96]" />
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {post.media.map((item, index) => (
                  <div key={index} className="rounded-2xl overflow-hidden border border-[#EFE5DC] bg-[#FAF5F0] flex flex-col">
                    {item.type === 'video' ? (
                      <div className="relative aspect-video bg-black flex items-center justify-center">
                        <video
                          src={resolveMediaUrl(item.url)}
                          controls
                          className="w-full h-full object-contain"
                          poster={post.cover_image}
                        />
                      </div>
                    ) : (
                      <div className="aspect-[4/3] overflow-hidden">
                        <img
                          src={resolveMediaUrl(item.url)}
                          alt={item.caption || `Foto ${index + 1}`}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    {item.caption && (
                      <div className="p-3 text-xs text-[#7B6A67] italic bg-[#FFFDF9]">
                        {item.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Author Signature & Interactive Likes */}
          <div className="pt-6 border-t border-[#F0E6DE] flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#FBF7F2] p-5 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-full bg-[#F3D6D8] flex items-center justify-center text-xl shadow-xs">
                🌸
              </div>
              <div>
                <p className="font-serif font-bold text-[#3A2D2D]">María Bibiana (Bibi)</p>
                <p className="text-xs text-[#8F7D7A]">Gracias por visitar mi rincón bonito ✨</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              {/* Like Button */}
              <button
                onClick={handleLike}
                className={`flex items-center space-x-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all shadow-xs ${
                  liked
                    ? 'bg-[#EAB4BC] text-[#63222D] shadow-sm'
                    : 'bg-[#FFFDF9] border border-[#E8DAD1] hover:bg-[#FCEBED] text-[#715D5A] hover:text-[#C93B52]'
                }`}
              >
                <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
                <span>{likes} Me gusta</span>
              </button>

              {/* Share Button */}
              <button
                onClick={handleCopyLink}
                className="flex items-center space-x-1.5 px-4 py-2.5 rounded-full bg-[#FFFDF9] border border-[#E8DAD1] text-xs font-medium text-[#715D5A] hover:bg-[#FAF4EE] transition-colors"
                title="Copiar enlace"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? '¡Copiado!' : 'Compartir'}</span>
              </button>
            </div>
          </div>

          {/* COMMENTS SECTION - Open for anyone */}
          <div className="pt-6 border-t border-[#F0E6DE] space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-bold text-[#3A2D2D] flex items-center space-x-2">
                <MessageCircle className="w-5 h-5 text-[#C97A88]" />
                <span>Comentarios ({comments.length})</span>
              </h3>
              <span className="text-xs text-[#9E8B88]">Cualquier persona puede comentar 💌</span>
            </div>

            {/* Comment Submission Form */}
            <form onSubmit={handleSubmitComment} className="bg-[#FAF5F0] p-5 rounded-3xl border border-[#EBE0D6] space-y-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#9E7B7F]">
                Deja tu mensaje o saludo
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div>
                  <label className="block text-xs font-medium text-[#6B5A57] mb-1">
                    Tu nombre o apodo:
                  </label>
                  <input
                    type="text"
                    required
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Ej. Sofía, Dani, Lector anónimo..."
                    className="w-full bg-[#FFFDF9] border border-[#DECFC5] rounded-xl px-3.5 py-2 text-sm text-[#4A3D3C] focus:outline-none focus:ring-2 focus:ring-[#D88D96]/40 focus:border-[#D88D96]"
                  />
                </div>

                {/* Avatar selection */}
                <div>
                  <label className="block text-xs font-medium text-[#6B5A57] mb-1">
                    Elige tu ícono:
                  </label>
                  <div className="flex items-center space-x-1.5 bg-[#FFFDF9] p-1.5 rounded-xl border border-[#DECFC5]">
                    {AVATAR_OPTIONS.map((emoji) => (
                      <button
                        type="button"
                        key={emoji}
                        onClick={() => setSelectedAvatar(emoji)}
                        className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all ${
                          selectedAvatar === emoji
                            ? 'bg-[#EAB4BC] scale-110 shadow-xs'
                            : 'hover:bg-[#F2ECE6]'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="block text-xs font-medium text-[#6B5A57] mb-1">
                  Tu comentario:
                </label>
                <textarea
                  required
                  rows={3}
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Escribe algo bonito para Bibi..."
                  className="w-full bg-[#FFFDF9] border border-[#DECFC5] rounded-2xl p-3 text-sm text-[#4A3D3C] focus:outline-none focus:ring-2 focus:ring-[#D88D96]/40 focus:border-[#D88D96] resize-none"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingComment || !commentText.trim()}
                  className="flex items-center space-x-2 bg-[#D88D96] hover:bg-[#C97A88] disabled:opacity-50 text-white px-5 py-2.5 rounded-full text-xs font-semibold shadow-xs hover:shadow transition-all"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingComment ? 'Publicando...' : 'Publicar comentario 💌'}</span>
                </button>
              </div>
            </form>

            {/* Comments List */}
            {loadingComments ? (
              <div className="text-center py-6 text-xs text-[#9E8B88]">Cargando comentarios...</div>
            ) : comments.length === 0 ? (
              <div className="text-center py-8 bg-[#FAF5F0] rounded-2xl border border-dashed border-[#E3D6CD] text-[#9E8B88] text-sm">
                🌸 Sé la primera persona en dejarle un comentario a Bibi
              </div>
            ) : (
              <div className="space-y-3">
                {comments.map((comment) => (
                  <div
                    key={comment.id}
                    className="bg-[#FFFDF9] p-4 rounded-2xl border border-[#EFE5DC] shadow-2xs space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-2">
                        <span className="text-base">{comment.avatar}</span>
                        <span className="font-semibold text-[#4A3D3C]">{comment.author_name}</span>
                      </div>
                      <span className="text-[#A3928E] text-[11px]">
                        {comment.created_at
                          ? new Date(comment.created_at).toLocaleDateString('es-ES', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                    <p className="text-sm text-[#61514E] pl-6 leading-relaxed">
                      {comment.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

          </div>

        </div>
      </div>
    </div>
  );
};
