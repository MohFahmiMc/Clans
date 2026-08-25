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

// Helper Parser Link & Icon Sosial Media Otomatis
function renderBioWithLinks(text?: string) {
  if (!text || text.trim() === '') {
    return (
      <span className="text-slate-400 italic">
        Player ini belum mengonfigurasi pesan deskripsi atau bio kutipan.
      </span>
    );
  }

  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);

  return parts.map((part, index) => {
    if (part.match(urlRegex)) {
      const lower = part.toLowerCase();
      
      // Deteksi Tipe Social Media
      let icon = (
        <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
        </svg>
      );

      if (lower.includes('discord.')) {
        icon = (
          <svg className="w-3.5 h-3.5 fill-current shrink-0 text-[#5865F2]" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .079.009c.12.098.245.195.372.288a.077.077 0 0 1-.006.127c-.598.344-1.22.642-1.873.891a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        );
      } else if (lower.includes('youtube.') || lower.includes('youtu.be')) {
        icon = (
          <svg className="w-3.5 h-3.5 fill-current shrink-0 text-red-500" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
          </svg>
        );
      } else if (lower.includes('github.')) {
        icon = (
          <svg className="w-3.5 h-3.5 fill-current shrink-0 text-white" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/>
          </svg>
        );
      } else if (lower.includes('instagram.')) {
        icon = (
          <svg className="w-3.5 h-3.5 fill-current shrink-0 text-pink-500" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
        );
      }

      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 px-2.5 py-1 my-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-sky-400 hover:text-sky-300 border border-white/15 transition-all text-xs font-semibold underline underline-offset-2"
          onClick={(e) => e.stopPropagation()}
        >
          {icon}
          <span className="truncate max-w-[180px] sm:max-w-[260px]">{part}</span>
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
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

  // LOGIKA BANNER: Cek banner kustom terlebih dahulu
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

  // LOGIKA WAKTU & TEMA DINAMIS
  const userTheme = member.customTheme || member.themeColor || member.accentColor;
  
  const getCustomBackgroundStyle = () => {
    if (!userTheme || userTheme.trim() === '') {
      return { background: 'linear-gradient(180deg, #181824 0%, #0a0a0f 100%)' };
    }
    
    const theme = userTheme.trim();
    if (theme.includes('gradient')) {
      return { background: theme };
    }
    
    return {
      background: `linear-gradient(180deg, ${theme} 0%, #0a0a0f 90%)`
    };
  };

  // EKSTRAKSI WARNA GLOW DINAMIS UNTUK AVATAR (Mengikuti Tema Member)
  const getGlowColor = () => {
    const themeCandidates = [member.accentColor, member.themeColor, member.customTheme];
    
    for (const c of themeCandidates) {
      if (!c) continue;
      const str = c.trim();
      
      // Jika warna berupa hex (#fff), rgb, atau hsl murni
      if ((str.startsWith('#') || str.startsWith('rgb') || str.startsWith('hsl')) && !str.includes('gradient')) {
        return str;
      }
      
      // Jika berupa string linear-gradient, ambil kode warna pertama yang ditemukan
      const colorMatch = str.match(/#(?:[0-9a-fA-F]{3,8})|rgba?\([^)]+\)|hsla?\([^)]+\)/);
      if (colorMatch) {
        return colorMatch[0];
      }
    }
    
    return '#eab308'; // Default fallback warna kuning jika tema tidak diatur
  };

  const themeGlow = getGlowColor();
  const roleStyle = getRoleColor(member.role);
  const skinUrl = member.customSkinUrl ? member.customSkinUrl : getSrc(steveSkin);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 transition-all duration-300">
      
      {/* KEYFRAMES ANIMASI SMOOTH BUKA MODAL */}
      <style jsx global>{`
        @keyframes profileModalIn {
          0% {
            opacity: 0;
            transform: scale(0.85) translateY(24px);
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }
        @keyframes profileBackdropIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        .animate-profile-modal {
          animation: profileModalIn 0.35s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-profile-backdrop {
          animation: profileBackdropIn 0.25s ease-out forwards;
        }
      `}</style>
      
      {/* Backdrop Hitam Transparan dengan Animasi Smooth Fade-In */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer animate-profile-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Kontainer Profile Utama dengan Animasi Smooth Pop-Up */}
      <div 
        className="animate-profile-modal relative w-full max-w-sm sm:max-w-xl md:max-w-2xl rounded-3xl border border-white/15 overflow-hidden shadow-2xl my-auto flex flex-col max-h-[90vh] sm:max-h-[85vh] z-10 font-sans"
        style={getCustomBackgroundStyle()}
        onClick={(e) => e.stopPropagation()}
      >

        {/* Scrollable Container */}
        <div className="overflow-y-auto relative z-10 [scrollbar-width:thin] [scrollbar-color:rgba(255,255,255,0.2)_transparent]">
          
          {/* Banner Bagian Atas */}
          <div 
            className="w-full h-36 sm:h-48 md:h-56 bg-cover bg-center relative flex-shrink-0"
            style={{ backgroundImage: `url(${getBannerImage()})` }}
          >
            {/* Subtle Gradient Shadow Hanya di Bagian Bawah Banner */}
            <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-[#0a0a0f] to-transparent" />

            {/* Tombol Close (X) */}
            <button 
              onClick={onClose}
              aria-label="Tutup Profil"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-black/60 hover:bg-rose-600 rounded-full flex items-center justify-center text-white transition-all border border-white/20 backdrop-blur-md z-50 shadow-lg group focus:outline-none"
            >
              <span className="text-sm font-bold group-hover:scale-110 transition-transform">✕</span>
            </button>
          </div>

          {/* Konten Detail Profil */}
          <div className="px-4 sm:px-6 md:px-8 pb-6 sm:pb-8 relative">
            
            {/* Header Avatar 2D Head & Skin 3D */}
            <div className="flex items-end justify-between -mt-12 sm:-mt-16 relative z-20 mb-4">
              
              {/* Avatar Kepala 2D DENGAN EFEK GLOW MENGIKUTI TEMA MEMBER */}
              <div 
                className="w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-2xl bg-[#0a0a0e] border-4 border-[#0a0a0e] overflow-hidden relative transition-all duration-300"
                style={{
                  boxShadow: `0 0 24px ${themeGlow}, 0 0 8px ${themeGlow}`
                }}
              >
                <div 
                  className="w-full h-full relative"
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

              {/* Model Karakter 3D */}
              <div className="relative w-28 h-36 sm:w-32 sm:h-40 md:w-36 md:h-44 flex items-end justify-center">
                <div className="drop-shadow-[0_8px_16px_rgba(0,0,0,0.8)] relative z-10 hover:scale-105 transition-transform duration-300">
                  <MinecraftSkin 
                    skinUrl={skinUrl} 
                    width={130} 
                    height={170} 
                    isWalking={true} 
                  />
                </div>
              </div>
            </div>

            {/* Nama Player, Clan Role & Badges (Typography Gaya Minecraft) */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 bg-black/40 p-4 sm:p-5 rounded-2xl border border-white/10 backdrop-blur-md shadow-lg">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-wider font-mono drop-shadow-md">
                  {member.name}
                </h2>

                <div className="flex items-center gap-2">
                  <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest inline-flex items-center gap-1.5 px-3 py-1 rounded-lg border shadow-md font-mono ${roleStyle}`}>
                    <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                    CLAN {member.role}
                  </span>
                </div>
              </div>

              {/* List Icon Role Khusus */}
              {member.specialRoles && member.specialRoles.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-black/60 rounded-xl border border-white/10 backdrop-blur-md">
                  {member.specialRoles.map((role, i) => {
                    const iconSrc = getSpecialIcon(role);
                    if (!iconSrc) return null;
                    return (
                      <div 
                        key={i} 
                        className="flex items-center gap-2 bg-white/5 hover:bg-white/15 px-2.5 py-1 rounded-lg border border-white/10 transition-all duration-200"
                      >
                        <img 
                          src={iconSrc} 
                          alt={role} 
                          title={role} 
                          className="w-4 h-4 sm:w-5 sm:h-5 object-contain" 
                        />
                        <span className="text-[10px] sm:text-xs text-slate-200 font-mono font-bold uppercase tracking-wider">{role}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Deskripsi Profil (Tentang Player & Auto Link Parser) */}
            <div className="mt-4">
              <div className="flex items-center gap-2 mb-2 px-1">
                <svg className="w-4 h-4 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <h3 className="text-[11px] sm:text-xs font-mono font-bold uppercase tracking-widest text-slate-300">
                  TENTANG PLAYER
                </h3>
              </div>

              <div className="bg-black/50 backdrop-blur-md p-4 sm:p-5 rounded-2xl border border-white/10 shadow-inner">
                <p className="text-slate-200 text-xs sm:text-sm font-medium leading-relaxed whitespace-pre-line break-words">
                  {renderBioWithLinks(member.description)}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
