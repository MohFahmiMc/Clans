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

  // MENCEGAH TYPE ERROR SAAT IMPORT GAMBAR DI NEXT.JS
  const logoSrc: string = typeof logoAsset === 'object' ? (logoAsset as any).src : (logoAsset as unknown as string);
  const bgSrc: string = typeof backgroundAsset === 'object' ? (backgroundAsset as any).src : (backgroundAsset as unknown as string);
  const logoPnSrc: string = typeof logoPnAsset === 'object' ? (logoPnAsset as any).src : (logoPnAsset as unknown as string);
  const mcProwSrc: string = typeof mcProwAsset === 'object' ? (mcProwAsset as any).src : (mcProwAsset as unknown as string);

  // DATA DEFAULT JIKA FILE listmember.txt GAGAL DIMUAT
  const defaultMembers: Member[] = [
    { name: "FreedomLeader", role: "Leader" },
    { name: "AlphaWolf", role: "Admin" },
    { name: "GhostSniper", role: "Member" },
    { name: "ShadowStep", role: "Member" },
    { name: "DarkKnight", role: "Member" }
  ];

  // FUNGSI MEMBACA LIST MEMBER
  useEffect(() => {
    fetch('/listmember.txt')
      .then((res) => {
        if (!res.ok) throw new Error("File listmember.txt tidak ditemukan");
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
        
        // Jika file ada tapi kosong, pakai default
        setMembers(parsedMembers.length > 0 ? parsedMembers : defaultMembers);
        setLoadingMembers(false);
      })
      .catch((err) => {
        console.error("Menggunakan data roster default:", err);
        setMembers(defaultMembers); // Auto fallback ke default jika gagal
        setLoadingMembers(false);
      });
  }, []);

  return (
    <div className="bg-[#050505] text-slate-200 min-h-screen font-sans selection:bg-orange-500 selection:text-black scroll-smooth relative">
      
      {/* BACKGROUND IMAGE & GLOW EFFECTS */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none bg-black">
        {/* Gambar Latar Pasti Muncul */}
        <img 
          src={bgSrc} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-screen scale-105"
        />
        {/* Overlay Gelap */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#050505]/90 to-[#050505]"></div>
        
        {/* Neon Orange & Yellow Glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-yellow-500/15 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-orange-600/15 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* NAVIGATION BAR */}
      <nav className="border-b border-orange-500/20 bg-black/60 backdrop-blur-2xl sticky top-0 z-50 px-6 py-4 shadow-[0_4px_30px_rgba(249,115,22,0.1)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-500 blur-lg opacity-40 rounded-full group-hover:opacity-70 transition-opacity"></div>
              <img 
                src={logoSrc} 
                alt="Freedom Logo" 
                className="relative h-10 w-10 sm:h-12 sm:w-12 object-contain"
              />
            </div>
            <span className="text-2xl sm:text-3xl font-black tracking-tighter text-white">
              FREEDOM
            </span>
          </div>
          <div className="hidden lg:flex gap-10 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
            <a href="#home" className="hover:text-yellow-400 hover:scale-110 transition-all">Home</a>
            <a href="#server" className="hover:text-yellow-400 hover:scale-110 transition-all">Server</a>
            <a href="#roster" className="hover:text-yellow-400 hover:scale-110 transition-all">Members</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header id="home" className="relative pt-32 pb-20 sm:pt-40 sm:pb-32 text-center px-4 flex flex-col items-center justify-center min-h-[85vh]">
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          
          {/* Badge ProwNetwork */}
          <div className="flex items-center gap-3 mb-8 bg-orange-950/40 px-6 py-2.5 rounded-sm border border-orange-500/30 backdrop-blur-md shadow-[0_0_20px_rgba(249,115,22,0.2)]">
            <img src={logoPnSrc} alt="PN Logo" className="h-5 w-5 sm:h-6 sm:w-6 object-contain drop-shadow-md" />
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] text-orange-400">
              ProwNetwork Official Clan
            </span>
          </div>
          
          {/* Judul Utama */}
          <h1 className="text-7xl sm:text-[11rem] font-black tracking-tighter uppercase leading-none text-transparent bg-clip-text bg-gradient-to-b from-white via-yellow-200 to-orange-600 mb-6 drop-shadow-[0_0_50px_rgba(249,115,22,0.4)]">
            FREEDOM
          </h1>
          
          <p className="text-lg sm:text-2xl text-slate-300 max-w-3xl mx-auto font-medium leading-relaxed mb-12">
            Simbol <span className="text-yellow-400 font-bold">Kebebasan</span> dan <span className="text-orange-400 font-bold">Kekuatan</span>. Kami hadir untuk mendominasi setiap sudut ProwNetwork.
          </p>
          
          {/* Tombol Aksi */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 w-full sm:w-auto">
            <a href="https://discord.gg/2veK4TDWtF" target="_blank" rel="noreferrer" className="relative px-12 py-5 bg-gradient-to-r from-orange-600 to-yellow-500 hover:from-yellow-500 hover:to-orange-500 text-black font-black rounded-sm shadow-[0_0_40px_rgba(249,115,22,0.5)] transition-all transform hover:scale-105 uppercase tracking-widest text-sm overflow-hidden group">
              <span className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full skew-x-12 group-hover:animate-[shine_0.8s_ease-out]"></span>
              <span className="relative">Join Freedom Clan</span>
            </a>
          </div>
        </div>
      </header>

      {/* PROWNETWORK SERVER INFO SECTION */}
      <section id="server" className="py-24 border-y border-orange-500/20 bg-[#0a0a0a]/80 backdrop-blur-xl relative">
        <div className="max-w-5xl mx-auto px-6 text-center flex flex-col items-center">
          <h2 className="text-xs sm:text-sm font-black uppercase tracking-[0.4em] text-orange-500 mb-8">
            <span className="inline-block w-8 h-[2px] bg-orange-500 align-middle mr-4"></span>
            Base of Operations
            <span className="inline-block w-8 h-[2px] bg-orange-500 align-middle ml-4"></span>
          </h2>
          
          {/* Gambar Tulisan Minecraft ProwNetwork */}
          <img 
            src={mcProwSrc} 
            alt="Minecraft ProwNetwork" 
            className="w-full max-w-[650px] object-contain mb-16 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] hover:scale-105 transition-transform duration-500" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl">
            {/* Kotak IP Server */}
            <div className="bg-[#111] border-2 border-slate-800 p-8 rounded-xl flex flex-col items-center justify-center group hover:border-yellow-500 transition-colors shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-yellow-500/10 rounded-bl-full"></div>
              <span className="text-[10px] font-black text-yellow-500 uppercase tracking-[0.3em] mb-4">Bedrock IP Server</span>
              <span className="text-2xl sm:text-4xl font-black text-white tracking-wider group-hover:text-yellow-400 transition-colors">
                be.prownetwork.net
              </span>
            </div>
            
            {/* Kotak Discord Server */}
            <a href="https://discord.gg/8X4rz7eARM" target="_blank" rel="noreferrer" className="bg-[#111] border-2 border-slate-800 p-8 rounded-xl flex flex-col items-center justify-center group hover:bg-[#5865F2]/10 hover:border-[#5865F2] transition-all cursor-pointer shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-[#5865F2]/10 rounded-bl-full"></div>
              <span className="text-[10px] font-black text-[#5865F2] uppercase tracking-[0.3em] mb-4">Official Community</span>
              <span className="text-2xl sm:text-3xl font-black text-white uppercase tracking-widest group-hover:text-[#5865F2] transition-colors">
                PN Discord Server
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* STATS & INTEL */}
      <section className="py-24 px-4 sm:px-6 w-full relative border-b border-orange-500/10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-8">
            {[
              { value: "95%", label: "PVP Win Rate" },
              { value: "S-Tier", label: "Clan Class" },
              { value: "10+", label: "Elite Members" }, // Diubah menjadi 10+ sesuai permintaan
              { value: "Full", label: "Kebebasan Penuh" } // Diubah dari "Active Raid"
            ].map((stat, i) => (
              <div key={i} className="text-center p-8 bg-gradient-to-b from-white/[0.05] to-transparent border border-white/5 rounded-2xl hover:border-orange-500/50 hover:bg-orange-900/10 transition-all duration-300 group">
                <h3 className="text-5xl sm:text-7xl font-black text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-yellow-400 group-hover:to-orange-500 transition-all mb-3">
                  {stat.value}
                </h3>
                <p className="text-slate-400 uppercase tracking-[0.3em] text-[10px] sm:text-xs font-black">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ROSTER / SQUAD SECTION */}
      <section id="roster" className="max-w-7xl mx-auto py-24 px-4 sm:px-6 w-full mb-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter text-white">
              CLAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-yellow-400">MEMBERS</span>
            </h2>
            <p className="text-orange-400 mt-2 text-lg font-bold tracking-widest uppercase">The Faces of Freedom</p>
          </div>
          <div className="text-yellow-400 font-bold uppercase tracking-[0.2em] text-[10px] bg-yellow-950/50 px-5 py-2.5 rounded-sm border border-yellow-500/30 flex items-center gap-3">
            <span className={`w-2 h-2 rounded-full ${loadingMembers ? 'bg-red-500 animate-pulse' : 'bg-green-500 shadow-[0_0_10px_#22c55e]'}`}></span>
            {loadingMembers ? "Loading Data..." : "System Online"}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {members.map((member, index) => (
            <div 
              key={index} 
              className="bg-[#0f0f0f] p-8 rounded-2xl border border-white/5 hover:border-orange-500 hover:shadow-[0_10px_30px_rgba(249,115,22,0.15)] transition-all duration-300 group flex items-center gap-6"
            >
              {/* Avatar Placeholder */}
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-600 to-yellow-500 flex items-center justify-center text-black font-black text-2xl shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover:scale-110 transition-transform">
                {member.name.charAt(0).toUpperCase()}
              </div>
              
              <div className="flex-1">
                <span className="text-[10px] font-black text-orange-500 uppercase tracking-[0.2em] block mb-1">
                  // {member.role}
                </span>
                <h3 className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-yellow-400 transition-colors truncate">
                  {member.name}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-orange-500/20 bg-[#050505] py-16 text-center w-full px-4 flex flex-col items-center">
        <div className="flex gap-6 mb-8 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <img src={logoSrc} alt="Freedom" className="h-12 w-12 object-contain" />
          <img src={logoPnSrc} alt="PN" className="h-12 w-12 object-contain" />
        </div>
        <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-slate-600 to-slate-400 tracking-tighter mb-4">
          FREEDOM CLAN
        </h2>
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.3em]">
          &copy; {new Date().getFullYear()} Elite ProwNetwork Fraksi.
        </p>
      </footer>
      
      {/* CSS KHUSUS UNTUK EFEK ANIMASI SHINE DI TOMBOL */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes shine {
          100% { left: 125%; }
        }
      `}} />

    </div>
  );
}
