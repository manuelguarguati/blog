import React from 'react';
import { Sparkles, MessageSquareHeart, Eye, BookOpen, Search } from 'lucide-react';
import type { SiteStats } from '../types';

interface HeroProps {
  stats: SiteStats | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Hero: React.FC<HeroProps> = ({ stats, searchQuery, onSearchChange }) => {
  return (
    <section className="relative overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16">
      {/* Background soft ambient blurs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-gradient-to-r from-[#F5D5D8]/40 via-[#F7E6DC]/40 to-[#EAD4DC]/40 blur-3xl pointer-events-none rounded-full" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
        
        {/* Profile Pill */}
        <div className="inline-flex items-center space-x-2 bg-[#FFFDF9]/90 border border-[#EADBCE] px-4 py-1.5 rounded-full shadow-xs mb-6">
          <span className="text-base">☕</span>
          <span className="text-xs font-medium tracking-wide text-[#7C6662]">
            El rincón de reflexiones, café y apuntes de Bibi
          </span>
          <Sparkles className="w-3.5 h-3.5 text-[#D88D96]" />
        </div>

        {/* Title */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl text-[#3A2D2D] font-medium tracking-tight leading-[1.15] mb-5">
          Creando días tranquilos y <br />
          <span className="italic font-normal text-[#9B4E5D]">momentos que inspiran</span>
        </h1>

        {/* Quote from Bibi's Blog */}
        <p className="max-w-xl mx-auto text-[#715F5C] text-sm sm:text-base leading-relaxed mb-8">
          «Construyendo días tranquilos, con actitud positiva y el corazón en paz. 
          Que todo lo bueno te encuentre, te abrace y se quede.» 💛
        </p>

        {/* Global Statistics Counter */}
        <div className="grid grid-cols-3 gap-3 sm:gap-6 max-w-lg mx-auto mb-10">
          <div className="bg-[#FFFDF9] border border-[#EFE5DC] rounded-2xl p-3 sm:p-4 shadow-xs">
            <div className="flex items-center justify-center space-x-1.5 text-[#9B4E5D] mb-1">
              <Eye className="w-4 h-4" />
              <span className="text-base sm:text-lg font-bold">
                {stats?.total_visits ? stats.total_visits.toLocaleString() : '1,420'}
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#8C7A77] font-medium">Visitas al blog</p>
          </div>

          <div className="bg-[#FFFDF9] border border-[#EFE5DC] rounded-2xl p-3 sm:p-4 shadow-xs">
            <div className="flex items-center justify-center space-x-1.5 text-[#B87748] mb-1">
              <BookOpen className="w-4 h-4" />
              <span className="text-base sm:text-lg font-bold">{stats?.total_posts ?? 4}</span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#8C7A77] font-medium">Historias & Posts</p>
          </div>

          <div className="bg-[#FFFDF9] border border-[#EFE5DC] rounded-2xl p-3 sm:p-4 shadow-xs">
            <div className="flex items-center justify-center space-x-1.5 text-[#C97A88] mb-1">
              <MessageSquareHeart className="w-4 h-4" />
              <span className="text-base sm:text-lg font-bold">{stats?.total_comments ?? 12}</span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#8C7A77] font-medium">Comentarios</p>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto relative">
          <Search className="w-4 h-4 text-[#9E8B88] absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Buscar entre reflexiones, café, apuntes..."
            className="w-full bg-[#FFFDF9] border border-[#EADBCE] rounded-full pl-11 pr-5 py-3 text-sm text-[#4A3D3C] placeholder-[#A69592] focus:outline-none focus:ring-2 focus:ring-[#D88D96]/40 focus:border-[#D88D96] shadow-xs transition-all"
          />
        </div>

      </div>
    </section>
  );
};
