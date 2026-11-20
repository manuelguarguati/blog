import React from 'react';
import { Eye, Plus } from 'lucide-react';
import type { SiteStats } from '../types';

interface NavbarProps {
  stats: SiteStats | null;
  onOpenNewPost: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  onOpenNewPost,
  selectedCategory,
  onSelectCategory,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#FAF7F2]/90 backdrop-blur-md border-b border-[#EFE5DC] transition-all">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Logo & Brand */}
          <div 
            onClick={() => onSelectCategory('Todos')}
            className="cursor-pointer group flex items-center space-x-3"
          >
            <div className="w-11 h-11 rounded-full bg-gradient-to-tr from-[#E8B4B8] to-[#F7D6D0] flex items-center justify-center text-xl shadow-sm group-hover:scale-105 transition-transform">
              🌸
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-serif text-2xl font-bold tracking-tight text-[#3A2D2D] group-hover:text-[#8C3A48] transition-colors">
                  Bibi
                </span>
                <span className="text-sm">🥰</span>
              </div>
              <p className="text-[11px] uppercase tracking-widest text-[#9A847F] font-medium">
                Diario & Momentos
              </p>
            </div>
          </div>

          {/* Navigation links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-7 text-sm font-medium text-[#6B5A57]">
            {['Todos', 'Reflexiones', 'Cafecito & Planes', 'Papelería & Apuntes'].map((cat) => (
              <button
                key={cat}
                onClick={() => onSelectCategory(cat)}
                className={`transition-all pb-1 relative ${
                  selectedCategory === cat
                    ? 'text-[#8C3A48] font-semibold border-b-2 border-[#8C3A48]'
                    : 'hover:text-[#8C3A48]'
                }`}
              >
                {cat}
              </button>
            ))}
          </nav>

          {/* Right section: Views Badge & New Post Button */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Live Visitor Counter */}
            <div 
              title="Personas que han visitado este blog"
              className="flex items-center space-x-1.5 bg-[#FFFDF9] px-3 py-1.5 rounded-full border border-[#E8DAD1] shadow-xs text-xs font-medium text-[#7D6662]"
            >
              <Eye className="w-3.5 h-3.5 text-[#C97A88] animate-pulse" />
              <span>{stats?.total_visits ? stats.total_visits.toLocaleString() : '1,420'} lecturas</span>
            </div>

            {/* Create Post Button */}
            <button
              onClick={onOpenNewPost}
              className="flex items-center space-x-1.5 bg-[#D88D96] hover:bg-[#C97A88] text-white px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm hover:shadow transition-all hover:-translate-y-0.5 active:translate-y-0"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva Entrada</span>
              <span className="sm:hidden">Publicar</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
