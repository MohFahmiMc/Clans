"use client";

import React, { useState, useEffect } from 'react';

// MENGAMBIL GAMBAR DARI FOLDER SRC/ASSETS
// @ts-ignore - (Digunakan agar GitHub/TypeScript tidak error saat membaca file manual)
import logoAsset from '../assets/logo.png';

interface Member { name: string; role: string; }

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);

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
      
      {/* PREMIUM BACKGROUND EFFECTS */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,20,20,1)_0%,rgba(0,0,0,1)_100%)]"></div>
        {/* Abstract Gold Glows */}
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-amber-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-amber-800/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* VIP NAVIGATION BAR */}
      <nav className="border-b border-white/5 bg-black/40 backdrop-blur-2xl sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4">
            {/* LOGO DARI SRC/ASSETS DIMUNCULKAN DI SINI */}
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500 blur-md opacity-30 rounded-full"></div>
              <img 
                src={logoAsset?.src || logoAsset} 
                alt="Freedom Logo" 
                className="relative h-10 w-10 sm:h-12 sm:w-12 object-contain"
              />
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(251,191,36,0.2)]">
              FREEDOM
            </span>
          </div>
          <div className="hidden lg:flex gap-10 text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">
            <a href="#home" className="hover:text-amber-500 transition-colors">Base</a>
            <a href="#stats" className="hover:text-amber-500 transition-colors">Intel</a>
            <a href="#roster" className="hover:text-amber-500 transition-colors">Squad</a>
            <a href="#matches" className="hover:text-amber-500 transition-colors">Operations</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION - CINEMATIC ESPORTS VIBE */}
      <header id="home" className="relative pt-32 pb-20 sm:pt-48 sm:pb-32 text-center px-4 flex flex-col items-center justify-center min-h-[85vh]">
        <div className="relative z-10 max-w-5xl mx-auto">
          {/* Live Status Badge */}
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-sm bg-black/50 border border-white/10 mb-8 backdrop-blur-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-[ping_1.5s_ease-in-out_infinite]"></span>
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 absolute"></span>
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-amber-500">
              Professional E-Sports Syndicate
            </span>
          </div>
          
          <h1 className="text-6xl sm:text-[10rem] font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-amber-100 to-amber-700 mb-6 drop-shadow-[0_0_40px_rgba(217,119,6,0.3)]">
            FREEDOM
          </h1>
          
          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed mb-12">
            Kekuatan bukan sekadar gelar, ia adalah hasil dari strategi mutlak, dedikasi tanpa batas, dan dominasi penuh di setiap arena.
          </p>
          
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a href="#roster" className="px-12 py-5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-black rounded-sm shadow-[0_0_30px_rgba(245,158,11,0.3)] transition-all transform hover:-translate-y-1 uppercase tracking-widest text-sm">
              Deploy Squad
            </a>
            <a href="https://discord.gg" target="_blank" rel="noreferrer" className="px-12 py-5 bg-black/50 backdrop-blur-md border border-amber-500/30 hover:border-amber-400 text-amber-400 font-black rounded-sm transition-all hover:bg-amber-500/10 uppercase tracking-widest text-sm">
              Comm Link
            </a>
          </div>
        </div>
      </header>

      {/* PARTNERS / SPONSORS (FAKE BUT PREMIUM LOOK) */}
      <section className="py-10 border-y border-white/5 bg-black/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-6 flex flex-wrap justify-center items-center gap-10 sm:gap-20 opacity-40 grayscale hover:grayscale-0 transition-all duration-700">
          <span className="text-xl sm:text-2xl font-black tracking-widest uppercase">Republic of Gamers</span>
          <span className="text-xl sm:text-2xl font-black tracking-widest uppercase">Secretlab</span>
          <span className="text-xl sm:text-2xl font-black tracking-widest uppercase">Logitech G</span>
          <span className="text-xl sm:text-2xl font-black tracking-widest uppercase">NVIDIA</span>
        </div>
      </section>

      {/* STATS & INTEL */}
      <section id="stats" className="py-24 px-4 sm:px-6 w-full relative">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { value: "92.4%", label: "Global Win Rate" },
              { value: "38", label: "Championships" },
              { value: "100+", label: "Elite Operators" },
              { value: "#1", label: "Server Rank" }
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
      <section id="roster" className="max-w-7xl mx-auto py-24 px-4 sm:px-6 w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-5xl sm:text-7xl font-black uppercase tracking-tighter text-white">
              SQUAD <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">ROSTER</span>
            </h2>
            <p className="text-slate-400 mt-2 text-lg font-light tracking-wide">Prajurit garis depan Freedom E-Sports.</p>
          </div>
          <div className="text-amber-500 font-bold uppercase tracking-[0.2em] text-[10px] bg-amber-500/10 px-4 py-2 rounded-sm border border-amber-500/20 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${loadingMembers ? 'bg-red-500' : 'bg-green-500'}`}></span>
            {loadingMembers ? "Syncing Network..." : "Network Synced"}
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
                <span className="text-[10px] uppercase tracking-widest text-amber-400 font-bold">Active</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT MATCHES / OPERATIONS */}
      <section id="matches" className="max-w-7xl mx-auto py-24 px-4 sm:px-6 w-full mb-10">
        <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white text-center mb-16">
          Recent <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">Operations</span>
        </h2>
        
        <div className="space-y-3 max-w-5xl mx-auto">
          {[
            { enemy: "Team Phantom", result: "VICTORY", score: "3 - 0", date: "Hari Ini" },
            { enemy: "Apex Legends E-Sports", result: "VICTORY", score: "2 - 1", date: "Kemarin" },
            { enemy: "Vanguard Syndicate", result: "DEFEAT", score: "1 - 2", date: "3 Hari Lalu" },
            { enemy: "Rogue Warriors", result: "VICTORY", score: "3 - 0", date: "Minggu Lalu" },
          ].map((match, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center justify-between bg-white/[0.02] p-5 border border-white/5 hover:bg-white/[0.05] transition-colors group">
              <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
                <span className="text-slate-600 font-mono text-xs w-24">{match.date}</span>
                <span className="text-lg font-black text-white hidden sm:block tracking-wide">FREEDOM</span>
                <span className="text-amber-600 text-xs font-black mx-4 hidden sm:block">VS</span>
                <span className="text-lg font-bold text-slate-400 group-hover:text-white transition-colors truncate">{match.enemy}</span>
              </div>
              <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                <span className="text-2xl font-black text-white tracking-widest">{match.score}</span>
                <span className={`px-5 py-2 text-[10px] font-black uppercase tracking-[0.2em] border ${match.result === 'VICTORY' ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                  {match.result}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-black py-16 text-center w-full px-4">
        <img 
          src={logoAsset?.src || logoAsset} 
          alt="Freedom Logo" 
          className="h-12 w-12 mx-auto mb-6 opacity-30 grayscale hover:grayscale-0 hover:opacity-100 transition-all"
        />
        <h2 className="text-2xl font-black text-slate-700 tracking-tighter mb-4">FREEDOM CLAN</h2>
        <p className="text-slate-600 text-[10px] uppercase tracking-[0.2em]">&copy; {new Date().getFullYear()} Elite E-Sports Organization. All Rights Reserved.</p>
      </footer>
      
    </div>
  );
}
