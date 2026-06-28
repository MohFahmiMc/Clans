"use client";

import React, { useState, useEffect } from 'react';
import bannerImage from '../../../assets/benner.png';
import background2Image from '../../../assets/background2.png';
import defaultEagleLogo from '../../../assets/steve.png'; // Ganti atau pasang fallback logo default klan anda disini jika diperlukan

interface Alliance {
  _id: string;
  name: string;
  owner: string;
  network: string;
  createdDate: string;
  philosophy: string;
  slogan: string;
  logoUrl?: string | null;
  order: number;
}

export default function AlliancePage() {
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [loading, setLoading] = useState(true);

  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');
  const bannerSrc = getSrc(bannerImage);
  const bg2ImgSrc = getSrc(background2Image);

  const fetchAlliances = async () => {
    try {
      const res = await fetch('/api/alliances?t=' + new Date().getTime(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a: Alliance, b: Alliance) => (a.order || 0) - (b.order || 0));
        setAlliances(sorted);
      }
    } catch (err) {
      console.error('Gagal mengambil data aliansi:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlliances();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-sans uppercase tracking-widest text-xs animate-pulse">
        Menghubungkan Jaringan Aliansi Clan Freedom...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 relative overflow-x-hidden">
      {/* BACKGROUND GRAPHIC */}
      {bg2ImgSrc && (
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-40 z-0 pointer-events-none"
          style={{ backgroundImage: `url(${bg2ImgSrc})` }}
        />
      )}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#050505]/70 to-[#050505] z-0 pointer-events-none" />

      {/* TOP BANNER */}
      {bannerSrc && (
        <div className="w-full h-48 md:h-64 relative overflow-hidden border-b border-white/5 bg-neutral-900 z-10">
          <img src={bannerSrc} alt="Freedom Alliance Banner" className="w-full h-full object-cover opacity-50" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
        </div>
      )}

      {/* CONTAINER EMBED LIST */}
      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10 flex flex-col gap-6">
        
        {/* HEADER INFORMATION BOARD */}
        <div className="bg-[#0a0a0b]/90 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-yellow-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Global Diplomacy Network</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white">The Freedom Alliance</h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2 border-l-2 border-yellow-500 pl-3 italic">
            "Daftar klan resmi yang terikat kontrak traktat aliansi pertahanan, perdagangan, dan persaudaraan bersama Freedom Clan."
          </p>
        </div>

        {alliances.length === 0 ? (
          <div className="bg-[#0a0a0b]/80 border border-white/5 rounded-xl p-12 text-center text-xs uppercase font-bold text-slate-500 tracking-wider">
            Belum ada klan eksternal yang terikat kontrak aliansi saat ini.
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {alliances.map((clan, idx) => (
              /* DISCORD EMBED VISUAL LAYOUT CARD STYLE */
              <div 
                key={clan._id || idx} 
                className="relative w-full bg-[#1e1f22] border-l-4 border-yellow-500 p-5 rounded-r-xl shadow-xl flex justify-between gap-6 overflow-hidden transition-all hover:translate-x-1 duration-200"
              >
                {/* Bagian Teks Detail Konten Embed */}
                <div className="flex flex-col text-sm font-medium text-slate-200 tracking-wide leading-relaxed z-10 max-w-[75%]">
                  
                  {/* Title Embed Header */}
                  <h3 className="text-base font-black text-white flex items-center gap-1.5 mb-2 select-none">
                    #{idx + 1} 🕊️ {clan.name} 🕊️
                  </h3>

                  <div className="text-slate-400 font-bold space-y-0.5">
                    <p>|</p>
                    <p className="text-white font-extrabold">{clan.name}</p>
                    <p>Owned By {clan.owner}</p>
                    <p className="text-slate-300">{clan.network}</p>
                    <p>|</p>
                    <p>Created on {clan.createdDate}</p>
                    <p>|</p>
                  </div>

                  {/* Filosofi Section */}
                  <div className="mt-1">
                    <span className="font-extrabold text-white block">Filosofi</span>
                    <p className="text-slate-300 italic">
                      {clan.philosophy || "Tidak ada landasan filosofi tertulis."}
                    </p>
                  </div>

                  <p className="text-slate-400 font-bold mt-1 select-none">|</p>

                  {/* Slogan Section */}
                  <div className="mt-1">
                    <span className="font-extrabold text-white block">Slogan</span>
                    <p className="text-slate-300 font-semibold tracking-wide">
                      {clan.slogan || "Tidak ada slogan tertulis."}
                    </p>
                  </div>

                  {/* Footer Embed */}
                  <p className="text-slate-400 font-bold mt-3 select-none">|</p>
                  <p className="text-slate-300 text-xs font-semibold tracking-tight mt-1">
                    -Dm Raindraa jika ingin aliansi!
                  </p>
                </div>

                {/* Bagian Gambar Logo Klan Terpajang di Sisi Kanan Atas Embed */}
                {clan.logoUrl && (
                  <div className="w-24 h-24 md:w-32 md:h-32 flex-shrink-0 z-10 self-start md:self-center mt-2 p-1 bg-black/10 rounded-xl border border-white/5 shadow-inner flex items-center justify-center">
                    <img 
                      src={clan.logoUrl} 
                      alt={`Logo ${clan.name}`} 
                      className="max-w-full max-h-full object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.3)]"
                    />
                  </div>
                )}
                
                {/* Variasi Hiasan watermark transparan di pojok kanan bawah agar terkesan modern */}
                <div className="absolute right-[-2%] bottom-[-5%] text-[80px] font-black text-white/[0.01] select-none pointer-events-none uppercase italic tracking-tighter">
                  ALLIANCE
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
