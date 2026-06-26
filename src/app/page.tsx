"use client";

import React, { useState, useEffect } from 'react';

// MENGAMBIL GAMBAR DARI FOLDER SRC/ASSETS
import logoAsset from '../assets/logo.png';
import backgroundAsset from '../assets/background.png';
import logoPnAsset from '../assets/logo_pn.png';
import mcProwAsset from '../assets/mc_prow.png';

interface Member { name: string; role: string; }

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

  // FIX TYPE ERROR UNTUK NEXT.JS IMAGE IMPORTS
  const logoSrc: string = typeof logoAsset === 'object' ? (logoAsset as any).src : (logoAsset as unknown as string);
  const bgSrc: string = typeof backgroundAsset === 'object' ? (backgroundAsset as any).src : (backgroundAsset as unknown as string);
  const logoPnSrc: string = typeof logoPnAsset === 'object' ? (logoPnAsset as any).src : (logoPnAsset as unknown as string);
  const mcProwSrc: string = typeof mcProwAsset === 'object' ? (mcProwAsset as any).src : (mcProwAsset as unknown as string);

  // FUNGSI MEMBACA LIST MEMBER DARI public/listmember.txt
  useEffect(() => {
    fetch('/listmember.txt')
      .then((res) => {
        if (!res.ok) throw new Error("File tidak ditemukan");
        return res.text();
      })
      .then((text) => {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const parsedMembers: Member[] = [];
        let currentRole = "Member";

        lines.forEach(line => {
          if (!line.includes(',')) {
            currentRole = line;
          } else {
            const tags = line.split(',').map(t => t.trim()).filter(Boolean);
            tags.forEach(tag => {
              parsedMembers.push({ name: tag, role: currentRole });
            });
          }
        });
        
        setMembers(parsedMembers);
        setLoadingMembers(false);
      })
      .catch((err) => {
        console.error("Gagal load member:", err);
        setMembers([{ name: "Roster Not Found", role: "System" }]);
        setLoadingMembers(false);
      });
  }, []);

  return (
    <div className="bg-black text-slate-200 min-h-screen font-sans selection:bg-amber-500 selection:text-black scroll-smooth">
      
      {/* PREMIUM BACKGROUND DENGAN GAMBAR CUSTOM */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        {/* Latar Belakang Gambar Penuh */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity scale-105"
          style={{ backgroundImage: `url(${bgSrc})` }}
        ></div>
        
        {/* Overlay Gelap agar teks mudah dibaca */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/90 to-black"></div>
        
        {/* Abstract Gold Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-amber-600/20 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-800/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* VIP NAVIGATION BAR */}
      <nav className="border-b border-white/10 bg-black/50 backdrop-blur-2xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 blur-md opacity-30 rounded-full"></div>
              <img 
                src={logoSrc} 
                alt="Freedom Logo" 
                className="relative h-10 w-10 sm:h-12 sm:w-12 object-contain"
              />
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(251,191,36,0.2)]">
              FREEDOM
            </span>
          </div>
          <div className="hidden lg:flex gap-10 text-xs font-bold text-slate-300 uppercase tracking-[0.2em]">
            <a href="#home" className="hover:text-amber-500 transition-colors">Base</a>
            <a href="#server" className="hover:text-amber-500 transition-colors">Server</a>
            <a href="#roster" className="hover:text-amber-500 transition-colors">Squad</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - MC ESPORTS VIBE */}
      <header id="home" className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 text-center px-4 flex flex-col items-center justify-center min-h-[85vh]">
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          
          {/* Logo ProwNetwork Kecil di Atas */}
          <div className="flex items-center gap-4 mb-8 opacity-80 bg-black/40 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
            <img src={logoPnSrc} alt="PN Logo" className="h-6 w-6 object-contain" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-amber-500">
              ProwNetwork Official Clan
            </span>
          </div>
          
          <h1 className="text-6xl sm:text-[10rem] font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-700 mb-6 drop-shadow-[0_0_40px_rgba(217,119,6,0.3)]">
            FREEDOM
          </h1>
          
          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed mb-12">
            Menguasai daratan, menembus batas bedrock. Kami adalah fraksi elit yang mendominasi server ProwNetwork.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6 w-full sm:w-auto">
            <a href="https://discord.gg/2veK4TDWtF" target="_blank" rel="noreferrer" className="px-12 py-5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black rounded-sm shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all transform hover:-translate-y-1 uppercase tracking-widest text-sm flex items-center justify-center gap-3">
              Join Freedom Clan
            </a>
          </div>
        </div>
      </header>

      {/* PROWNETWORK SERVER INFO SECTION */}
      <section id="server" className="py-20 border-y border-white/10 bg-black/60 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          <h2 className="text-sm font-black uppercase tracking-[0.3em] text-slate-500 mb-10">Bermain Secara Eksklusif Di</h2>
          
          {/* Gambar Tulisan Minecraft ProwNetwork */}
          <img 
            src={mcProwSrc} 
            alt="Minecraft ProwNetwork" 
            className="w-full max-w-[600px] object-contain mb-12 drop-shadow-2xl hover:scale-105 transition-transform duration-500" 
          />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full max-w-3xl">
            {/* Kotak IP Server */}
            <div className="bg-white/[0.03] border border-white/10 p-6 rounded-sm flex flex-col items-center justify-center group hover:border-amber-500/50 transition-colors">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-2">Bedrock IP Server</span>
              <span className="text-xl sm:text-3xl font-mono font-bold text-white tracking-wider group-hover:text-amber-400 transition-colors selection:bg-amber-500 selection:text-black">
                be.prownetwork.net
              </span>
            </div>
            
            {/* Kotak Discord Server */}
            <a href="https://discord.gg/8X4rz7eARM" target="_blank" rel="noreferrer" className="bg-white/[0.03] border border-white/10 p-6 rounded-sm flex flex-col items-center justify-center group hover:bg-[#5865F2]/10 hover:border-[#5865F2]/50 transition-all cursor-pointer">
              <span className="text-[10px] font-black text-[#5865F2] uppercase tracking-[0.2em] mb-2">ProwNetwork Community</span>
              <span className="text-xl sm:text-2xl font-black text-white uppercase tracking-widest group-hover:text-[#5865F2] transition-colors">
                Join PN Discord
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* STATS & INTEL */}
      <section className="py-24 px-4 sm:px-6 w-full relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { value: "92.4%", label: "PVP Win Rate" },
              { value: "Tier 1", label: "Clan Rank" },
              { value: "100+", label: "Elite Members" },
              { value: "24/7", label: "Active Raid" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-8 bg-white/[0.02] border border-white/5 rounded-sm hover:border-amber-500/30 transition-colors group">
                <h3 className="text-4xl sm:text-6xl font-black text-white group-hover:text-amber-500 transition-colors mb-2">{stat.value}</h3>
                <p className="text-slate-500 uppercase tracking-[0.2em] text-[10px] sm:text-xs font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROSTER / SQUAD SECTION */}
      <section id="roster" className="max-w-7xl mx-auto py-24 px-4 sm:px-6 w-full mb-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter text-white">
              SQUAD <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">ROSTER</span>
            </h2>
            <p className="text-slate-400 mt-2 text-lg font-light tracking-wide">Prajurit garis depan Freedom di ProwNetwork.</p>
          </div>
          <div className="text-amber-500 font-bold uppercase tracking-[0.2em] text-[10px] bg-amber-500/10 px-4 py-2 rounded-sm border border-amber-500/20 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${loadingMembers ? 'bg-red-500' : 'bg-green-500'}`}></span>
            {loadingMembers ? "Syncing Network..." : "Database Synced"}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {members.map((member, index) => (
            <div 
              key={index} 
              className="bg-white/[0.03] backdrop-blur-sm p-8 border border-white/5 hover:border-amber-500/50 transition-all duration-500 group relative overflow-hidden flex flex-col justify-between min-h-[160px]"
            >
              {/* Gold Accent Line */}
              <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-amber-400 to-amber-700 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              <div className="relative z-10">
                <span className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] block mb-3 opacity-80">
                  {member.role}
                </span>
                <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors truncate">
                  {member.name}
                </h3>
              </div>
              
              <div className="relative z-10 mt-6 flex justify-between items-center border-t border-white/10 pt-4 opacity-50 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] uppercase tracking-widest text-slate-400">Status</span>
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Online</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/10 bg-black py-16 text-center w-full px-4 flex flex-col items-center">
        <div className="flex gap-4 mb-6 opacity-40 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
          <img src={logoSrc} alt="Freedom" className="h-10 w-10 object-contain" />
          <img src={logoPnSrc} alt="PN" className="h-10 w-10 object-contain" />
        </div>
        <h2 className="text-2xl font-black text-slate-600 tracking-tighter mb-4">FREEDOM CLAN x PROWNETWORK</h2>
        <p className="text-slate-700 text-[10px] uppercase tracking-[0.2em]">&copy; {new Date().getFullYear()} Elite Minecraft E-Sports Organization. All Rights Reserved.</p>
      </footer>
      
    </div>
  );
}
