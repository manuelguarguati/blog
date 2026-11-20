import React, { useState } from 'react';
import { X, Upload, Sparkles } from 'lucide-react';
import type { Post, MediaItem } from '../types';
import { uploadMedia, createPost, resolveMediaUrl } from '../api';

interface NewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: (newPost: Post) => void;
}

const CATEGORIES = [
  'Reflexiones',
  'Cafecito & Planes',
  'Papelería & Apuntes',
  'Momentos & Fotos',
];

export const NewPostModal: React.FC<NewPostModalProps> = ({
  isOpen,
  onClose,
  onPostCreated,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [excerpt, setExcerpt] = useState('');
  const [content, setContent] = useState('');
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [customCover, setCustomCover] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const res = await uploadMedia(file);
        setMediaList((prev) => [
          ...prev,
          {
            type: res.type,
            url: res.url,
            caption: file.name.replace(/\.[^/.]+$/, ''),
          },
        ]);
        if (!customCover && res.type === 'image') {
          setCustomCover(res.url);
        }
      }
    } catch (err: any) {
      alert(err.message || 'Error al subir archivo');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const handleRemoveMedia = (index: number) => {
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      alert('Por favor ingresa un título y el contenido.');
      return;
    }

    setSubmitting(true);
    try {
      const cover =
        customCover ||
        (mediaList.find((m) => m.type === 'image')?.url ??
          'https://images.unsplash.com/photo-1518495973542-4542c06a5843?auto=format&fit=crop&w=1200&q=80');

      const created = await createPost({
        title: title.trim(),
        category,
        excerpt: excerpt.trim() || content.trim().slice(0, 140) + '...',
        content: content.trim(),
        cover_image: cover,
        media: mediaList,
      });

      onPostCreated(created);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Error al publicar');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-fadeIn">
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-[#FFFDF9] w-full max-w-2xl rounded-3xl shadow-2xl border border-[#EFE5DC] overflow-hidden my-auto max-h-[92vh] flex flex-col"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#F0E6DE] flex items-center justify-between bg-[#FFFDF9]/95 backdrop-blur-md">
          <div className="flex items-center space-x-2">
            <span className="text-xl">✨</span>
            <h2 className="font-serif text-xl font-bold text-[#3A2D2D]">
              Nueva Publicación
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#F5ECE5] hover:bg-[#EADBCE] text-[#635350] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#735F5C] mb-1.5">
              Título del Post *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ej. Una tarde de café y nuevos apuntes 🌸"
              className="w-full bg-[#FAF5F0] border border-[#DECFC5] rounded-2xl px-4 py-3 text-base text-[#4A3D3C] focus:outline-none focus:ring-2 focus:ring-[#D88D96]/40 focus:border-[#D88D96]"
            />
          </div>

          {/* Category & Excerpt */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#735F5C] mb-1.5">
                Categoría
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#FAF5F0] border border-[#DECFC5] rounded-xl px-3.5 py-2.5 text-sm text-[#4A3D3C] focus:outline-none focus:ring-2 focus:ring-[#D88D96]/40"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-[#735F5C] mb-1.5">
                Resumen breve (Opcional)
              </label>
              <input
                type="text"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Una frase corta para la tarjeta..."
                className="w-full bg-[#FAF5F0] border border-[#DECFC5] rounded-xl px-3.5 py-2.5 text-sm text-[#4A3D3C] focus:outline-none focus:ring-2 focus:ring-[#D88D96]/40"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#735F5C] mb-1.5">
              Historia / Contenido *
            </label>
            <textarea
              required
              rows={5}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Escribe aquí tu reflexión, momentos o lo que quieras compartir..."
              className="w-full bg-[#FAF5F0] border border-[#DECFC5] rounded-2xl p-4 text-sm text-[#4A3D3C] focus:outline-none focus:ring-2 focus:ring-[#D88D96]/40 resize-none leading-relaxed"
            />
          </div>

          {/* Upload Photos and Videos */}
          <div className="border border-dashed border-[#DECFC5] bg-[#FAF5F0] rounded-3xl p-5 text-center">
            <input
              type="file"
              id="media-upload"
              multiple
              accept="image/*,video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label
              htmlFor="media-upload"
              className="cursor-pointer inline-flex flex-col items-center justify-center space-y-2"
            >
              <div className="w-12 h-12 rounded-full bg-[#FFFDF9] border border-[#E8DAD1] flex items-center justify-center text-[#B57C86] shadow-xs hover:scale-105 transition-transform">
                <Upload className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-[#4A3D3C]">
                  {uploading ? 'Subiendo archivo...' : 'Haz clic para subir Fotos o Videos'}
                </p>
                <p className="text-xs text-[#9E8B88]">
                  Soporta JPG, PNG, WebP y videos MP4, WebM
                </p>
              </div>
            </label>

            {/* Media Previews */}
            {mediaList.length > 0 && (
              <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mediaList.map((m, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden border border-[#EBD7CE] group aspect-square bg-black">
                    {m.type === 'video' ? (
                      <video src={resolveMediaUrl(m.url)} className="w-full h-full object-cover" />
                    ) : (
                      <img src={resolveMediaUrl(m.url)} alt="preview" className="w-full h-full object-cover" />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(idx)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center text-xs hover:bg-black"
                    >
                      ×
                    </button>
                    <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded">
                      {m.type === 'video' ? '🎥 Video' : '📷 Foto'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Submit */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-[#F0E6DE]">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-semibold text-[#735F5C] hover:bg-[#F2ECE6] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting || uploading}
              className="flex items-center space-x-2 bg-[#D88D96] hover:bg-[#C97A88] disabled:opacity-50 text-white px-6 py-2.5 rounded-full text-xs font-semibold shadow-xs hover:shadow transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>{submitting ? 'Publicando...' : 'Publicar Entrada ✨'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
