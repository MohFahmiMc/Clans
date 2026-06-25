"use client";

import React, { useState, useEffect } from 'react';

// Tipe data untuk member
interface Member { name: string; role: string; }

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [logoError, setLogoError] = useState(false); // Deteksi error logo

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
        setMembers([{ name: "Belum ada data roster!", role: "System" }]);
        setLoadingMembers(false);
      });
  }, []);

  return (
    <div className="text-slate-100 min-h-screen font-sans selection:bg-yellow-500 selection:text-slate-950 scroll-smooth relative">
      
      {/* ANIMATED BACKGROUND TEMA KUNING EMAS */}
      <div className="fixed inset-0 z-[-1] bg-slate-950 overflow-hidden">
        {/* Grid Pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#eab308_1px,transparent_1px),linear-gradient(to_bottom,#eab308_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        {/* Glow Effects */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-yellow-600/10 rounded-full blur-[120px] animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-yellow-800/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '3s' }}></div>
      </div>

      {/* NAVIGATION BAR */}
      <nav className="border-b border-yellow-900/40 bg-slate-950/70 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* LOGO FALLBACK SYSTEM */}
            {!logoError ? (
              <img 
                src="/logo.png" 
                alt="Freedom Logo" 
                className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
                onError={() => setLogoError(true)} // Jika gagal, ganti ke icon perisai
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.749.749 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l-.143.001c-2.996 0-5.717-1.17-7.734-3.08zm3.094 8.016a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
              </svg>
            )}
            <span className="text-2xl font-black tracking-tighter text-white">FREEDOM</span>
          </div>
          <div className="hidden md:flex gap-8 text-sm font-bold text-slate-400 uppercase tracking-wider">
            <a href="#home" className="hover:text-yellow-400 transition">Home</a>
            <a href="#stats" className="hover:text-yellow-400 transition">Stats</a>
            <a href="#roster" className="hover:text-yellow-400 transition">Roster</a>
            <a href="#matches" className="hover:text-yellow-400 transition">Matches</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header id="home" className="relative py-32 sm:py-48 text-center px-4 flex flex-col items-center justify-center">
        <div className="relative z-10 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 border border-yellow-500/20 mb-8">
            <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
            <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-yellow-400">
              Elite Gaming Syndicate
            </span>
          </div>
          <h1 className="text-6xl sm:text-[9rem] font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-100 to-yellow-600 mb-6 drop-shadow-2xl">
            FREEDOM
          </h1>
          <p className="text-lg sm:text-2xl text-slate-300 max-w-3xl mx-auto font-light leading-relaxed mb-12">
            Lebih dari sekadar klan. Kami adalah simbol dominasi, strategi tanpa cela, dan kekuatan absolut di arena pertempuran.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <a href="#roster" className="px-10 py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-black rounded-sm shadow-[0_0_30px_rgba(234,179,8,0.4)] transition-all transform hover:scale-105 uppercase tracking-widest">
              Lihat Pasukan
            </a>
            <a href="https://discord.gg" target="_blank" rel="noreferrer" className="px-10 py-4 bg-transparent border-2 border-yellow-500/50 hover:border-yellow-400 text-yellow-400 font-black rounded-sm transition-all hover:bg-yellow-500/10 uppercase tracking-widest">
              Join Discord
            </a>
          </div>
        </div>
      </header>

      {/* STATS & ACHIEVEMENTS SECTION (Fitur Baru) */}
      <section id="stats" className="py-20 px-4 sm:px-6 w-full border-t border-yellow-900/30 bg-slate-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "85%", label: "Win Rate" },
              { value: "24", label: "Tournaments Won" },
              { value: "50+", label: "Active Members" },
              { value: "Top 10", label: "Regional Rank" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <h3 className="text-4xl sm:text-6xl font-black text-yellow-500 mb-2 drop-shadow-[0_0_10px_rgba(234,179,8,0.3)]">{stat.value}</h3>
                <p className="text-slate-400 uppercase tracking-widest text-xs sm:text-sm font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROSTER SECTION */}
      <section id="roster" className="max-w-7xl mx-auto py-24 px-4 sm:px-6 w-full">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 border-b border-yellow-900/30 pb-6 gap-6">
          <div>
            <h2 className="text-4xl sm:text-6xl font-black uppercase tracking-tighter text-white">
              CLAN <span className="text-yellow-500">ROSTER</span>
            </h2>
            <p className="text-slate-400 mt-2 text-lg">Prajurit garis depan yang siap bertempur.</p>
          </div>
          <div className="text-yellow-500 font-bold uppercase tracking-widest text-sm bg-yellow-500/10 px-4 py-2 rounded border border-yellow-500/20">
            {loadingMembers ? "Syncing Database..." : "Database Synced"}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {members.map((member, index) => (
            <div 
              key={index} 
              className="bg-slate-900/80 backdrop-blur-md p-6 border-l-4 border-slate-800 hover:border-yellow-500 hover:bg-slate-800 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute -right-10 -top-10 w-32 h-32 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/20 transition-all"></div>
              <div className="relative z-10">
                <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest block mb-2">
                  // {member.role}
                </span>
                <h3 className="text-2xl font-black tracking-tight text-white group-hover:text-yellow-400 transition truncate">
                  {member.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* RECENT MATCHES SECTION (Fitur Baru) */}
      <section id="matches" className="max-w-7xl mx-auto py-20 px-4 sm:px-6 w-full mb-20">
        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tighter text-white text-center mb-12">
          Recent <span className="text-yellow-500">Matches</span>
        </h2>
        
        <div className="space-y-4 max-w-4xl mx-auto">
          {[
            { enemy: "Team Phantom", result: "VICTORY", score: "3 - 0", date: "Hari Ini" },
            { enemy: "Apex Legends E-Sports", result: "VICTORY", score: "2 - 1", date: "Kemarin" },
            { enemy: "Vanguard Syndicate", result: "DEFEAT", score: "1 - 2", date: "3 Hari Lalu" },
            { enemy: "Rogue Warriors", result: "VICTORY", score: "3 - 0", date: "Minggu Lalu" },
          ].map((match, i) => (
            <div key={i} className="flex flex-col sm:flex-row items-center justify-between bg-slate-900/60 p-6 border border-slate-800 hover:border-yellow-500/30 transition-colors">
              <div className="flex items-center gap-6 w-full sm:w-auto mb-4 sm:mb-0">
                <span className="text-slate-500 font-mono text-sm">{match.date}</span>
                <span className="text-xl font-bold text-white hidden sm:block">FREEDOM</span>
                <span className="text-yellow-500 text-sm font-bold mx-2 hidden sm:block">VS</span>
                <span className="text-xl font-bold text-slate-400 truncate">{match.enemy}</span>
              </div>
              <div className="flex items-center justify-between w-full sm:w-auto gap-8">
                <span className="text-2xl font-black text-white">{match.score}</span>
                <span className={`px-4 py-1 text-xs font-black uppercase tracking-widest border ${match.result === 'VICTORY' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                  {match.result}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-yellow-900/20 bg-slate-950 py-12 text-center w-full">
        <h2 className="text-3xl font-black text-slate-800 tracking-tighter mb-4">FREEDOM CLAN</h2>
        <p className="text-slate-600 text-sm uppercase tracking-widest">&copy; {new Date().getFullYear()} All Rights Reserved.</p>
      </footer>
      
    </div>
  );
}
