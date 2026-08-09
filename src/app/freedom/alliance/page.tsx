"use client";

import React, { useState, useEffect } from 'react';
import bannerImage from '../../../assets/benner.png';
import background2Image from '../../../assets/background2.png';
import defaultEagleLogo from '../../../assets/steve.png';

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
      // Quiet fail - log dihilangkan
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAlliances();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="w-16 h-16 border-4 border-white/10 border-t-yellow-500 rounded-full animate-spin mb-6 shadow-[0_0_15px_rgba(234,179,8,0.5)]" />
        <p className="text-yellow-500 font-sans uppercase tracking-[0.2em] text-xs font-bold animate-pulse">
          Menghubungkan Jaringan Aliansi...
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507] text-slate-200 font-sans pb-24 relative overflow-x-hidden selection:bg-yellow-500/30">
      
      {/* BACKGROUND EFFECTS */}
      {bg2ImgSrc && (
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-10 z-0 pointer-events-none mix-blend-luminosity"
          style={{ backgroundImage: `url(${bg2ImgSrc})` }}
        />
      )}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-900/10 via-[#050507]/80 to-[#050507] z-0 pointer-events-none" />

      {/* TOP HERO BANNER */}
      <div className="w-full h-56 md:h-72 relative overflow-hidden bg-neutral-950 z-10 border-b border-white/5">
        {bannerSrc && (
          <img 
            src={bannerSrc} 
            alt="Freedom Alliance Banner" 
            className="w-full h-full object-cover opacity-40 scale-105 transform transition-transform duration-1000 hover:scale-100" 
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#050507] via-[#050507]/50 to-transparent" />
      </div>

      {/* MAIN CONTENT CONTAINER */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 -mt-24 relative z-10 flex flex-col gap-8">
        
        {/* HEADER INFORMATION BOARD */}
        <div className="bg-[#0a0a0d]/90 backdrop-blur-xl border border-white/10 p-8 md:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.5)] flex flex-col gap-3 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -mr-20 -mt-20 transition-all group-hover:bg-yellow-500/10" />
          
          <div className="flex items-center gap-3 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-500 shadow-[0_0_10px_rgba(234,179,8,0.8)]"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-yellow-500">Global Diplomacy Network</span>
          </div>
          
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-slate-500 drop-shadow-sm">
            The Freedom Alliance
          </h1>
          
          <p className="text-sm text-slate-400 font-medium leading-relaxed max-w-2xl border-l-2 border-yellow-500/50 pl-4 mt-2">
            Daftar klan resmi yang terikat kontrak traktat aliansi pertahanan, perdagangan, dan persaudaraan bersama Freedom Clan.
          </p>
        </div>

        {/* ALLIANCE LIST */}
        {alliances.length === 0 ? (
          <div className="bg-[#0a0a0d]/80 border border-white/5 rounded-2xl p-16 text-center shadow-xl backdrop-blur-md">
            <svg className="w-12 h-12 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <p className="text-xs uppercase font-bold text-slate-400 tracking-widest">
              Belum ada klan eksternal yang terikat kontrak aliansi saat ini.
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {alliances.map((clan, idx) => (
              
              /* ALLIANCE CARD */
              <div 
                key={clan._id || idx} 
                className="group relative w-full bg-gradient-to-br from-[#111216]/95 to-[#0a0a0d]/95 backdrop-blur-md border border-white/5 hover:border-yellow-500/30 rounded-2xl shadow-xl hover:shadow-[0_10px_40px_rgba(234,179,8,0.1)] transition-all duration-300 overflow-hidden flex flex-col-reverse md:flex-row gap-6 p-6 md:p-8"
              >
                {/* Yellow Accent Left Line */}
                <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-gradient-to-b from-yellow-400 to-yellow-600 shadow-[0_0_15px_rgba(234,179,8,0.5)]" />

                {/* Left Content Area */}
                <div className="flex-1 flex flex-col z-10 pl-2">
                  
                  {/* Header & Order Number */}
                  <div className="flex items-center gap-3 mb-5">
                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded-lg text-xs font-black tracking-widest shadow-inner">
                      #{idx + 1}
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-white tracking-wide flex items-center gap-2 group-hover:text-yellow-400 transition-colors">
                      {clan.name}
                    </h3>
                  </div>

                  {/* Info Grid (Owner, Network, Date) - Menggantikan spasi karakter "|" */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 bg-black/40 p-4 rounded-xl border border-white/5">
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Owner</span>
                      <span className="text-sm font-semibold text-white truncate block">{clan.owner}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Network</span>
                      <span className="text-sm font-semibold text-yellow-500 truncate block">{clan.network}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest block mb-1">Terbentuk</span>
                      <span className="text-sm font-semibold text-slate-300 truncate block">{clan.createdDate}</span>
                    </div>
                  </div>

                  {/* Philosophy & Slogan */}
                  <div className="flex flex-col gap-4">
                    <div className="border-l-2 border-slate-700 pl-4">
                      <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest block mb-1">Filosofi Klan</span>
                      <p className="text-sm text-slate-300 leading-relaxed italic">
                        "{clan.philosophy || "Tidak ada landasan filosofi tertulis."}"
                      </p>
                    </div>
                    <div className="border-l-2 border-slate-700 pl-4">
                      <span className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest block mb-1">Slogan Utama</span>
                      <p className="text-sm text-white font-medium tracking-wide">
                        {clan.slogan || "Tidak ada slogan tertulis."}
                      </p>
                    </div>
                  </div>

                  {/* Footer Contact */}
                  <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Status: Aliansi Aktif
                    </p>
                    <p className="text-[10px] text-slate-400 font-semibold tracking-wider bg-white/5 px-3 py-1.5 rounded-md border border-white/5">
                      Ingin bergabung? <span className="text-white font-bold">DM Raindraa</span>
                    </p>
                  </div>
                </div>

                {/* Right Area - Logo Clan */}
                <div className="w-full md:w-40 flex-shrink-0 flex items-center justify-center md:items-start z-10 pt-2">
                  <div className="w-32 h-32 md:w-36 md:h-36 bg-[#050507] border border-white/10 rounded-2xl p-3 shadow-inner group-hover:border-yellow-500/40 transition-colors relative">
                    <img 
                      src={clan.logoUrl || getSrc(defaultEagleLogo)} 
                      alt={`Logo ${clan.name}`} 
                      className="w-full h-full object-contain filter drop-shadow-[0_0_12px_rgba(255,255,255,0.1)] group-hover:drop-shadow-[0_0_20px_rgba(234,179,8,0.4)] transition-all duration-300 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = getSrc(defaultEagleLogo);
                      }}
                    />
                  </div>
                </div>

                {/* Background Watermark */}
                <div className="absolute right-2 bottom-0 text-[100px] font-black text-white/[0.02] select-none pointer-events-none uppercase italic tracking-tighter group-hover:text-yellow-500/[0.03] transition-colors duration-500 leading-none">
                  ALLY
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
