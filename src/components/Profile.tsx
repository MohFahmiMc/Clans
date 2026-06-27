"use client";

import React from 'react';

interface ProfileProps {
  member: { name: string; role: string; specialRoles: string[] };
  onClose: () => void;
  getRoleColor: (role: string) => string;
  getSpecialIcon: (specialRole: string) => string | null;
}

export default function Profile({ member, onClose, getRoleColor, getSpecialIcon }: ProfileProps) {
  
  // LOGIKA BARU: Mengambil gambar dari folder public/cards/
  // Build tidak akan error meskipun gambarnya belum kamu upload
  const getBannerImage = () => {
    const primaryRole = member.specialRoles[0]; 
    
    // Jika tidak punya role di kurung, pakai background default Freedom
    if (!primaryRole) return 'https://i.imgur.com/U2eVJEi.png'; 

    // Mengubah huruf pertama jadi kapital (contoh: 'pvp' jadi 'Pvp', 'redstoner' jadi 'Redstoner')
    // Ini menyesuaikan dengan format nama file kamu: cardPvp.png
    const formattedRole = primaryRole.charAt(0).toUpperCase() + primaryRole.slice(1);
    
    return `/cards/card${formattedRole}.png`;
  };

  const roleStyle = getRoleColor(member.role);

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
        {/* Fallback bg-[#111] jika gambar belum diload/tidak ada */}
        <div 
          className="w-full h-48 md:h-64 bg-[#111] bg-cover bg-center relative border-b border-white/10"
          style={{ backgroundImage: `url(${getBannerImage()})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-black/30"></div>
          
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 bg-black/50 hover:bg-red-500 rounded-full flex items-center justify-center text-white transition-colors border border-white/20 backdrop-blur-md"
          >
            ✕
          </button>
        </div>

        {/* Konten Detail Profil */}
        <div className="px-6 pb-8 md:px-10 md:pb-10 relative">
          
          <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-[#151515] border-4 border-[#0a0a0a] flex items-center justify-center text-white font-black text-4xl md:text-5xl -mt-12 md:-mt-16 relative z-10 shadow-xl mb-4 group hover:border-orange-500 transition-colors">
            {member.name.charAt(0).toUpperCase()}
          </div>

          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-2">
                {member.name}
              </h2>
              <span className={`text-[10px] md:text-xs font-black uppercase tracking-widest inline-block px-3 py-1 rounded border ${roleStyle}`}>
                Clan {member.role}
              </span>
            </div>

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
          
          <div className="mt-8 pt-6 border-t border-white/5">
            <p className="text-slate-500 text-xs italic font-medium">Informasi tambahan member belum ditambahkan...</p>
          </div>
          
        </div>
      </div>
    </div>
  );
}
