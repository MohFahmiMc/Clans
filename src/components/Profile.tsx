"use client";

import React, { useEffect } from 'react';
import MinecraftSkin from './MinecraftSkin';

// IMPORT BANNER CARD DEFAULT
import cardRedstoner from '../assets/cardRedstoner.png';
import cardMiner from '../assets/cardMiner.png';
import cardBuilder from '../assets/cardBuilder.png';
import cardPvp from '../assets/cardPvp.png';
import cardFarmer from '../assets/cardFarmer.png';
import cardAdventure from '../assets/cardAdventure.png';
import cardDefault from '../assets/cardMinecraft.png';

// IMPORT GAMBAR SKIN SEBAGAI FALLBACK
import steveSkin from '../assets/steve.png';

const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');

interface ProfileProps {
  member: { 
    name: string; 
    role: string; 
    specialRoles: string[];
    description?: string;
    customSkinUrl?: string | null;
    customBannerUrl?: string | null;
    bannerUrl?: string | null;
    customTheme?: string | null;
    themeColor?: string | null;
    accentColor?: string | null;
  };
  onClose: () => void;
  getRoleColor: (role: string) => string;
  getSpecialIcon: (specialRole: string) => string | null;
}

export default function Profile({ member, onClose, getRoleColor, getSpecialIcon }: ProfileProps) {
  
  // LOGIKA UX: Tutup modal dengan tombol ESC & kunci scroll background
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = 'auto';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  // LOGIKA BANNER: Cek banner kustom terlebih dahulu (bannerUrl / customBannerUrl)
  const getBannerImage = () => {
    const customBanner = member.bannerUrl || member.customBannerUrl;
    if (customBanner && customBanner.trim() !== '') {
      return customBanner;
    }

    const primaryRole = member.specialRoles?.[0]?.toLowerCase(); 
    switch (primaryRole) {
      case 'redstoner': return getSrc(cardRedstoner);
      case 'miner': return getSrc(cardMiner);
      case 'builder': return getSrc(cardBuilder);
      case 'pvp': return getSrc(cardPvp);
      case 'farmer': return getSrc(cardFarmer);
      case 'adventure': return getSrc(cardAdventure);
      default: return getSrc(cardDefault);
    }
  };

  // LOGIKA TEMA KUSTOM ALA DISCORD NITRO
  const userTheme = member.customTheme || member.themeColor || member.accentColor;
  
  const getCustomBackgroundStyle = () => {
    if (!userTheme || userTheme.trim() === '') {
      return { background: 'linear-gradient(180deg, #121218 0%, #09090d 100%)' };
    }
    
    const theme = userTheme.trim();
    if (theme.includes('gradient')) {
      return { background: theme };
    }
    
    return {
      background: `linear-gradient(180deg, ${theme} 0%, #09090d 85%)`
    };
  };

  const roleStyle = getRoleColor(member.role);
  const skinUrl = member.customSkinUrl ? member.customSkinUrl : getSrc(steveSkin);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-xl transition-all duration-300">
      
      {/* Backdrop Hitam Transparan */}
      <div 
        className="fixed inset-0 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Kontainer Profile Utama Ala Discord Nitro */}
      <div 
        className="relative w-full max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl rounded-3xl border border-white/15 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.95)] my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] sm:max-h-[85vh] z-10 transition-all"
        style={getCustomBackgroundStyle()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow Effect Ambient Ambient di Belakang Card */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-orange-600/10 rounded-full blur-[100px] pointer-events-none" />

        {/* Scrollable Container */}
        <div className="overflow-y-auto relative z-10 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.15)_transparent]">
          
          {/* Banner Bagian Atas */}
          <div 
            className="w-full h-40 sm:h-52 md:h-64 lg:h-72 bg-cover bg-center relative border-b border-white/10 flex-shrink-0 group"
            style={{ backgroundImage: `url(${getBannerImage()})` }}
          >
            {/* Gradient Overlay Seamless Blend */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#09090d] via-black/40 to-black/20" />
            
            {/* Glossy Top Bar Effect */}
            <div className="absolute top-0 inset-x-0 h-16 bg-gradient-to-b from-black/60 to-transparent pointer-events-none" />

            {/* Tombol Close (X) */}
            <button 
              onClick={onClose}
              aria-label="Tutup Profil"
              className="absolute top-3.5 right-3.5 sm:top-5 sm:right-5 w-9 h-9 sm:w-10 sm:h-10 bg-black/60 hover:bg-rose-600/90 rounded-2xl flex items-center justify-center text-white transition-all duration-300 border border-white/20 hover:border-rose-400 backdrop-blur-md z-50 shadow-xl group/btn focus:outline-none"
            >
              <span className="text-sm font-black group-hover/btn:scale-110 transition-transform">✕</span>
            </button>
          </div>

          {/* Konten Detail Profil */}
          <div className="px-5 sm:px-8 md:px-10 pb-8 sm:pb-10 relative">
            
            {/* Header Avatar 2D Head & Skin 3D */}
            <div className="flex items-end justify-between -mt-14 sm:-mt-20 md:-mt-24 relative z-20 mb-6">
              
              {/* Avatar Kepala 2D dengan Nitro Frame */}
              <div className="relative group">
                {/* Ring Outer Glow */}
                <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 opacity-70 blur-sm group-hover:opacity-100 transition duration-300" />
                
                <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 lg:w-32 lg:h-32 rounded-2xl bg-[#0a0a0e] border-4 border-[#0a0a0e] overflow-hidden shadow-2xl relative">
                  <div 
                    className="w-full h-full relative group-hover:scale-105 transition-transform duration-300"
                    style={{ imageRendering: 'pixelated' }}
                  >
                    {/* Layer 1: Base Face */}
                    <img 
                      src={skinUrl} 
                      alt={`${member.name} skin head`} 
                      className="absolute max-w-none select-none pointer-events-none"
                      style={{ 
                        width: '800%', 
                        height: 'auto', 
                        left: '-100%', 
                        top: '-100%' 
                      }} 
                    />
                    {/* Layer 2: Hat Overlay */}
                    <img 
                      src={skinUrl} 
                      alt="" 
                      className="absolute max-w-none select-none pointer-events-none"
                      style={{ 
                        width: '800%', 
                        height: 'auto', 
                        left: '-500%', 
                        top: '-100%' 
                      }} 
                    />
                  </div>
                </div>
              </div>

              {/* Model Karakter 3D dengan Floor Shadow */}
              <div className="relative w-28 h-36 sm:w-32 sm:h-40 md:w-40 md:h-48 lg:w-44 lg:h-52 flex flex-col items-center justify-end">
                {/* Ellipse Floor Glow/Shadow */}
                <div className="absolute bottom-1 w-20 sm:w-24 h-4 bg-black/80 rounded-[100%] blur-xs border border-white/5" />
                <div className="absolute bottom-0 w-16 sm:w-20 h-3 bg-amber-500/20 rounded-[100%] blur-md" />

                <div className="drop-shadow-[0_12px_24px_rgba(0,0,0,0.9)] filter relative z-10 hover:scale-105 transition-transform duration-300">
                  <MinecraftSkin 
                    skinUrl={skinUrl} 
                    width={150} 
                    height={190} 
                    isWalking={true} 
                  />
                </div>
              </div>
            </div>

            {/* Nama Player, Clan Role & Badges */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-5 bg-black/40 p-5 sm:p-6 rounded-2xl border border-white/10 backdrop-blur-md shadow-xl">
              <div className="space-y-2.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
                    {member.name}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border shadow-lg backdrop-blur-md ${roleStyle}`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    Clan {member.role}
                  </span>
                </div>
              </div>

              {/* List Icon Role Khusus (Nitro Badges Style) */}
              {member.specialRoles && member.specialRoles.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-black/60 rounded-2xl border border-white/10 backdrop-blur-md shadow-inner">
                  {member.specialRoles.map((role, i) => {
                    const iconSrc = getSpecialIcon(role);
                    if (!iconSrc) return null;
                    return (
                      <div 
                        key={i} 
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/15 px-3 py-1.5 rounded-xl border border-white/10 hover:border-amber-400/50 transition-all duration-200 group/badge"
                      >
                        <img 
                          src={iconSrc} 
                          alt={role} 
                          title={role} 
                          className="w-4 h-4 sm:w-5 sm:h-5 object-contain group-hover/badge:scale-110 transition-transform" 
                        />
                        <span className="text-[10px] sm:text-xs text-slate-200 font-bold uppercase tracking-wider">{role}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Deskripsi Profil (About Me Box) */}
            <div className="mt-5">
              <div className="flex items-center justify-between mb-2 px-1">
                <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                  <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  <span>Tentang Player</span>
                </h3>
              </div>

              <div className="relative bg-black/50 backdrop-blur-md p-5 rounded-2xl border border-white/10 shadow-inner group">
                <div className="absolute top-3 right-4 text-4xl text-white/5 font-serif select-none pointer-events-none">
                  “
                </div>
                <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed relative z-10 whitespace-pre-line">
                  {member.description || "Player ini belum mengonfigurasi pesan deskripsi atau bio kutipan di dalam basis data clan."}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
