"use client";

import React from 'react';
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
  
  const getBannerImage = () => {
    const primaryRole = member.specialRoles[0]; 
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

  // URL Render Kepala 2D Minecraft Avatar otomatis berdasarkan Gamertag Player
  const headAvatarUrl = `https://mc-heads.net/avatar/${member.name}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop Hitam Transparan */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
        onClick={onClose}
      ></div>

      {/* Kontainer Profile Utama */}
      <div className="relative w-full max-w-2xl bg-[#0a0a0a] rounded-xl border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-200">
        
        {/* Banner Bagian Atas */}
        <div 
          className="w-full h-48 md:h-64 bg-cover bg-center relative border-b border-white/10"
          style={{ backgroundImage: `url(${getBannerImage()})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors border border-white/20 backdrop-blur-md z-50"
          >
            ✕
          </button>
        </div>

        {/* Konten Detail Profil */}
        <div className="px-6 pb-8 md:px-10 md:pb-10 relative">
          
          {/* PERBAIKAN TATA LETAK: Kepala 2D Avatar diletakkan di sebelah kiri model 3D */}
          <div className="flex items-end justify-between -mt-16 md:-mt-20 relative z-10 mb-4">
            {/* Avatar Kepala 2D Minecraft Rapi Sesuai Gamertag */}
            <div className="w-20 h-20 md:w-24 md:h-24 rounded-2xl bg-[#151515] border-4 border-[#0a0a0a] overflow-hidden shadow-xl hover:border-orange-500 transition-colors flex-shrink-0">
              <img 
                src={headAvatarUrl} 
                alt={`${member.name} head`} 
                className="w-full h-full object-contain"
                style={{ imageRendering: 'pixelated' }}
                onError={(e) => {
                  // Fallback jika API avatar offline
                  (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steve';
                }}
              />
            </div>

            {/* Model Karakter 3D Animasi Berjalan */}
            <div className="w-28 h-36 md:w-36 md:h-44 flex items-end drop-shadow-2xl">
              <MinecraftSkin 
                skinUrl={skinUrl} 
                width={140} 
                height={180} 
                isWalking={true} 
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4 mt-2">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2">
                {member.name}
              </h2>
              <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest inline-block px-3 py-1 rounded border ${roleStyle}`}>
                Clan {member.role}
              </span>
            </div>

            {/* List Icon Role Berjejer di Kanan/Bawah */}
            {member.specialRoles.length > 0 && (
              <div className="flex flex-wrap gap-2 p-3 bg-[#111] rounded-lg border border-white/5">
                {member.specialRoles.map((role, i) => {
                  const iconSrc = getSpecialIcon(role);
                  if (!iconSrc) return null;
                  return (
                    <div key={i} className="flex items-center gap-2 bg-black/50 px-2 py-1.5 rounded">
                      <img src={iconSrc} alt={role} title={role} className="w-5 h-5 md:w-6 md:h-6 object-contain" />
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{role}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
          
          {/* PERBAIKAN: Deskripsi Profil mengambil data dinamis real-time dari MongoDB */}
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-slate-300 text-sm font-medium leading-relaxed bg-white/5 p-4 rounded-lg border border-white/5">
              {member.description || "Player ini belum mengonfigurasi pesan deskripsi atau bio kutipan di dalam basis data clan."}
            </p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
