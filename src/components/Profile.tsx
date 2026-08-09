"use client";

import React, { useEffect } from 'react';
import MinecraftSkin from './MinecraftSkin';

// IMPORT BANNER CARD
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

  const getBannerImage = () => {
    const primaryRole = member.specialRoles[0]?.toLowerCase(); 
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

  const roleStyle = getRoleColor(member.role);
  
  // LOGIKA AMBIL SKIN: Gunakan customSkinUrl jika ada di MongoDB, jika tidak ada pakai steve.png bawaan
  const skinUrl = member.customSkinUrl ? member.customSkinUrl : getSrc(steveSkin);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 md:p-6 bg-black/80 backdrop-blur-md transition-all duration-300">
      
      {/* Backdrop Hitam Transparan dengan Click Listener */}
      <div 
        className="fixed inset-0 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Kontainer Profile Utama */}
      <div 
        className="relative w-full max-w-sm sm:max-w-xl md:max-w-2xl lg:max-w-3xl bg-[#0d0d0e] rounded-2xl border border-white/10 overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] my-auto animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh] sm:max-h-[85vh] z-10"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Scrollable Container untuk Layar Kecil/HP */}
        <div className="overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          
          {/* Banner Bagian Atas */}
          <div 
            className="w-full h-36 sm:h-48 md:h-60 lg:h-64 bg-cover bg-center relative border-b border-white/10 flex-shrink-0"
            style={{ backgroundImage: `url(${getBannerImage()})` }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#0d0d0e] via-[#0d0d0e]/40 to-black/30" />
            
            {/* Tombol Close (X) */}
            <button 
              onClick={onClose}
              aria-label="Tutup Profil"
              className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 bg-black/60 hover:bg-red-600/90 rounded-full flex items-center justify-center text-white transition-all duration-200 border border-white/20 hover:border-red-400 backdrop-blur-md z-50 shadow-lg group focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              <span className="text-lg font-bold group-hover:scale-110 transition-transform">✕</span>
            </button>
          </div>

          {/* Konten Detail Profil */}
          <div className="px-4 sm:px-6 md:px-8 lg:px-10 pb-6 sm:pb-8 md:pb-10 relative">
            
            {/* Header Avatar 2D Head & Skin 3D */}
            <div className="flex items-end justify-between -mt-12 sm:-mt-16 md:-mt-20 relative z-10 mb-4 sm:mb-6">
              
              {/* Avatar Kepala 2D (Texture Crop Skin) */}
              <div className="group relative">
                <div className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 lg:w-28 lg:h-28 rounded-2xl bg-[#141416] border-2 sm:border-4 border-[#0d0d0e] overflow-hidden shadow-2xl group-hover:border-amber-500 transition-all duration-300 flex-shrink-0 relative">
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
              </div>

              {/* Model Karakter 3D Animasi Berjalan */}
              <div className="w-24 h-32 sm:w-28 sm:h-36 md:w-36 md:h-44 lg:w-40 lg:h-48 flex items-end justify-center drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] filter">
                <MinecraftSkin 
                  skinUrl={skinUrl} 
                  width={140} 
                  height={180} 
                  isWalking={true} 
                />
              </div>
            </div>

            {/* Nama Player, Clan Role & Badges */}
            <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mt-1 sm:mt-2">
              <div className="space-y-2">
                <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none drop-shadow-md">
                  {member.name}
                </h2>
                <span className={`text-[10px] sm:text-xs font-black uppercase tracking-widest inline-block px-3 py-1 rounded-md border shadow-sm ${roleStyle}`}>
                  Clan {member.role}
                </span>
              </div>

              {/* List Icon Role Khusus (Special Roles) */}
              {member.specialRoles && member.specialRoles.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2.5 sm:p-3 bg-[#141416]/90 rounded-xl border border-white/10 backdrop-blur-md">
                  {member.specialRoles.map((role, i) => {
                    const iconSrc = getSpecialIcon(role);
                    if (!iconSrc) return null;
                    return (
                      <div 
                        key={i} 
                        className="flex items-center gap-2 bg-black/60 hover:bg-black/90 px-2.5 py-1.5 rounded-lg border border-white/5 hover:border-white/20 transition-all duration-200"
                      >
                        <img 
                          src={iconSrc} 
                          alt={role} 
                          title={role} 
                          className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 object-contain" 
                        />
                        <span className="text-[10px] sm:text-xs text-slate-300 font-bold uppercase tracking-wider">{role}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
            
            {/* Deskripsi Profil (Bio MongoDB) */}
            <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-white/10">
              <h3 className="text-[11px] sm:text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">
                Tentang Player
              </h3>
              <div className="bg-gradient-to-b from-white/[0.07] to-white/[0.02] p-4 sm:p-5 rounded-xl border border-white/10 shadow-inner">
                <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
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
