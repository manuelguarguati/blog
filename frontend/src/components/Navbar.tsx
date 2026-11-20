import React from 'react';
import { Eye, Plus, LogOut, KeyRound, Sparkles } from 'lucide-react';
import type { SiteStats, User } from '../types';

interface NavbarProps {
  stats: SiteStats | null;
  user: User | null;
  onOpenAuth: () => void;
  onLogout: () => void;
  onOpenNewPost: () => void;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  stats,
  user,
  onOpenAuth,
  onLogout,
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

          {/* Right section: Views Badge, Auth & New Post Button */}
          <div className="flex items-center space-x-2.5 sm:space-x-4">
            {/* Live Visitor Counter */}
            <div 
              title="Personas que han visitado este blog"
              className="hidden xs:flex items-center space-x-1.5 bg-[#FFFDF9] px-3 py-1.5 rounded-full border border-[#E8DAD1] shadow-xs text-xs font-medium text-[#7D6662]"
            >
              <Eye className="w-3.5 h-3.5 text-[#C97A88] animate-pulse" />
              <span>{stats?.total_visits ? stats.total_visits.toLocaleString() : '1,420'} lecturas</span>
            </div>

            {/* If logged in as Bibi */}
            {user ? (
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenNewPost}
                  className="flex items-center space-x-1.5 bg-[#D88D96] hover:bg-[#C97A88] text-white px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm hover:shadow transition-all hover:-translate-y-0.5 active:translate-y-0"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nueva Entrada</span>
                  <span className="sm:hidden">Publicar</span>
                </button>

                <div className="hidden lg:flex items-center space-x-1 bg-[#F9ECEF] border border-[#F0D5DA] px-3 py-1.5 rounded-full text-xs font-semibold text-[#8C3A48]">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Bibi (Autora)</span>
                </div>

                <button
                  onClick={onLogout}
                  title="Cerrar sesión"
                  className="w-9 h-9 rounded-full bg-[#FAF4EE] hover:bg-[#F2E5DC] text-[#7A6460] flex items-center justify-center transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* If not logged in, provide Bibi access button */
              <div className="flex items-center space-x-2">
                <button
                  onClick={onOpenAuth}
                  className="flex items-center space-x-1.5 bg-[#FFFDF9] hover:bg-[#FAF4EE] text-[#7A6460] border border-[#E8DAD1] px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-2xs hover:shadow-xs transition-all"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#C97A88]" />
                  <span>Acceso Autora</span>
                </button>

                <button
                  onClick={onOpenAuth}
                  className="flex items-center space-x-1.5 bg-[#D88D96] hover:bg-[#C97A88] text-white px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-medium shadow-sm hover:shadow transition-all"
                  title="Solo Bibi puede publicar"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nueva Entrada</span>
                  <span className="sm:hidden">Publicar</span>
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
