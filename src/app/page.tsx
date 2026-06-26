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
  const [errorMembers, setErrorMembers] = useState(false);

  // FUNGSI PINTAR UNTUK MEMASTIKAN GAMBAR TERBACA DI NEXT.JS
  const getSrc = (asset: any) => asset?.src || asset || '';
  
  const logoSrc = getSrc(logoAsset);
  const bgSrc = getSrc(backgroundAsset);
  const logoPnSrc = getSrc(logoPnAsset);
  const mcProwSrc = getSrc(mcProwAsset);

  // FUNGSI MEMBACA LIST MEMBER MURNI DARI public/listmember.txt
  useEffect(() => {
    // Menambahkan timestamp (?t=...) agar browser tidak membaca cache lama
    fetch(`/listmember.txt?t=${new Date().getTime()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat listmember.txt");
        return res.text();
      })
      .then((text) => {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const parsedMembers: Member[] = [];
        let currentRole = "Member";

        lines.forEach(line => {
          if (!line.includes(',')) {
            currentRole = line; // Jika tidak ada koma, jadikan sebagai Role (Leader/Admin)
          } else {
            const tags = line.split(',').map(t => t.trim()).filter(Boolean);
            tags.forEach(tag => {
              parsedMembers.push({ name: tag, role: currentRole });
            });
          }
        });
        
        setMembers(parsedMembers);
        setLoadingMembers(false);
        setErrorMembers(false);
      })
      .catch((err) => {
        console.error(err);
        setErrorMembers(true);
        setLoadingMembers(false);
      });
  }, []);

  return (
    <div className="bg-[#050505] text-slate-200 min-h-screen font-sans selection:bg-orange-600 selection:text-white scroll-smooth relative">
      
      {/* 1. BACKGROUND IMAGE (DIJAMIN MUNCUL & TERLIHAT JELAS) */}
      <div className="fixed inset-0 z-[-1] overflow-hidden pointer-events-none">
        {/* Gambar Latar Asli */}
        <img 
          src={bgSrc} 
          alt="Background" 
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        {/* Overlay Gradien Gelap di Bawah agar teks tetap terbaca */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-[#050505]/80 to-[#050505]"></div>
        
        {/* Efek Cahaya (Glow) di Sudut */}
        <div className="absolute top-[-20%] left-[-10%] w-[50vw] h-[50vw] bg-yellow-500/10 rounded-full blur-[150px] animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[60vw] h-[60vw] bg-orange-600/15 rounded-full blur-[180px] animate-pulse" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* 2. NAVIGATION BAR (GLOSSY & AGRESIF) */}
      <nav className="border-b border-orange-500/30 bg-black/50 backdrop-blur-xl sticky top-0 z-50 px-6 py-4 shadow-[0_4px_30px_rgba(234,88,12,0.2)]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-4 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-orange-600 blur-lg opacity-50 rounded-full group-hover:opacity-100 transition-opacity duration-300"></div>
              <img src={logoSrc} alt="Freedom Logo" className="relative h-12 w-12 sm:h-14 sm:w-14 object-contain" />
            </div>
            <span className="text-3xl font-black tracking-tighter text-white drop-shadow-[0_2px_10px_rgba(234,88,12,0.4)]">
              FREEDOM
            </span>
          </div>
          <div className="hidden lg:flex gap-10 text-sm font-black text-slate-300 uppercase tracking-widest">
            <a href="#home" className="hover:text-orange-500 transition-colors">Base</a>
            <a href="#server" className="hover:text-orange-500 transition-colors">Server</a>
            <a href="#roster" className="hover:text-orange-500 transition-colors">Members</a>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION */}
      <header id="home" className="relative pt-24 pb-20 sm:pt-40 sm:pb-32 text-center px-4 flex flex-col items-center justify-center min-h-[85vh]">
        <div className="relative z-10 max-w-5xl mx-auto flex flex-col items-center">
          
          {/* Badge ProwNetwork */}
          <div className="flex items-center gap-3 mb-8 bg-[#0a0a0a] px-6 py-3 border border-orange-500/50 rounded-full shadow-[0_0_25px_rgba(234,88,12,0.3)]">
            <img src={logoPnSrc} alt="PN Logo" className="h-6 w-6 object-contain" />
            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.3em] text-orange-500">
              ProwNetwork Official Clan
            </span>
          </div>
          
          {/* Judul Utama */}
          <h1 className="text-7xl sm:text-[11rem] font-black tracking-tighter uppercase leading-none text-white mb-6 drop-shadow-[0_10px_30px_rgba(234,88,12,0.5)]">
            FREEDOM
          </h1>
          
          <p className="text-xl sm:text-3xl text-slate-200 max-w-3xl mx-auto font-bold leading-relaxed mb-12 drop-shadow-lg">
            Kekuatan <span className="text-orange-500">Murni</span>. Kebebasan <span className="text-yellow-500">Mutlak</span>.
          </p>
          
          {/* Tombol Aksi */}
          <div className="flex flex-col sm:flex-row justify-center gap-6 w-full sm:w-auto">
            <a href="https://discord.gg/2veK4TDWtF" target="_blank" rel="noreferrer" className="relative px-14 py-6 bg-gradient-to-r from-orange-600 to-yellow-600 text-white font-black shadow-[0_0_40px_rgba(234,88,12,0.6)] transition-all transform hover:scale-105 hover:shadow-[0_0_60px_rgba(234,88,12,0.8)] uppercase tracking-widest text-lg overflow-hidden group border border-orange-400">
              <span className="absolute inset-0 w-full h-full bg-white/30 -translate-x-full skew-x-12 group-hover:animate-[shine_0.8s_ease-out]"></span>
              <span className="relative">Join Freedom Clan</span>
            </a>
          </div>
        </div>
      </header>

      {/* 4. PROWNETWORK SERVER INFO SECTION */}
      <section id="server" className="py-24 border-y-2 border-orange-600/30 bg-[#000000]/80 backdrop-blur-lg relative">
        <div className="max-w-6xl mx-auto px-6 text-center flex flex-col items-center">
          <h2 className="text-sm sm:text-base font-black uppercase tracking-[0.4em] text-orange-600 mb-10">
            <span className="inline-block w-12 h-[3px] bg-orange-600 align-middle mr-4"></span>
            Base of Operations
            <span className="inline-block w-12 h-[3px] bg-orange-600 align-middle ml-4"></span>
          </h2>
          
          {/* Gambar Tulisan Minecraft ProwNetwork */}
          <img 
            src={mcProwSrc} 
            alt="Minecraft ProwNetwork" 
            className="w-full max-w-[700px] object-contain mb-16 drop-shadow-[0_15px_30px_rgba(0,0,0,1)] hover:scale-105 transition-transform duration-500" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
            {/* Kotak IP Server */}
            <div className="bg-[#0a0a0a] border-2 border-slate-800 p-10 flex flex-col items-center justify-center group hover:border-yellow-500 transition-colors shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-500/20 blur-2xl"></div>
              <span className="text-xs font-black text-yellow-500 uppercase tracking-[0.4em] mb-4 z-10">Bedrock IP Server</span>
              <span className="text-3xl sm:text-5xl font-black text-white tracking-wider group-hover:text-yellow-500 transition-colors z-10">
                be.prownetwork.net
              </span>
            </div>
            
            {/* Kotak Discord Server */}
            <a href="https://discord.gg/8X4rz7eARM" target="_blank" rel="noreferrer" className="bg-[#0a0a0a] border-2 border-slate-800 p-10 flex flex-col items-center justify-center group hover:bg-[#5865F2]/10 hover:border-[#5865F2] transition-all cursor-pointer shadow-2xl relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#5865F2]/20 blur-2xl"></div>
              <span className="text-xs font-black text-[#5865F2] uppercase tracking-[0.4em] mb-4 z-10">Official Community</span>
              <span className="text-2xl sm:text-4xl font-black text-white uppercase tracking-widest group-hover:text-[#5865F2] transition-colors z-10">
                PN Discord Server
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* 5. STATS & INTEL */}
      <section className="py-24 px-4 sm:px-6 w-full relative border-b-2 border-orange-600/20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
            {[
              { value: "95%", label: "PVP Win Rate" },
              { value: "S-Tier", label: "Clan Class" },
              { value: "10+", label: "Elite Members" },
              { value: "Full", label: "Kebebasan" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-8 bg-[#0a0a0a] border-2 border-white/5 hover:border-orange-600 hover:bg-orange-600/10 transition-all duration-300 group shadow-lg">
                <h3 className="text-5xl sm:text-7xl font-black text-white group-hover:text-orange-500 transition-all mb-4">
                  {stat.value}
                </h3>
                <p className="text-slate-400 uppercase tracking-[0.3em] text-[10px] sm:text-xs font-black">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ROSTER / SQUAD SECTION (MURNI MEMBACA FILE .TXT) */}
      <section id="roster" className="max-w-7xl mx-auto py-24 px-4 sm:px-6 w-full mb-10">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-6xl sm:text-8xl font-black uppercase tracking-tighter text-white">
              CLAN <span className="text-orange-500">MEMBERS</span>
            </h2>
            <p className="text-orange-500 mt-3 text-xl font-black tracking-[0.3em] uppercase">The Faces of Freedom</p>
          </div>
          
          <div className="text-yellow-500 font-black uppercase tracking-[0.2em] text-xs bg-yellow-950/50 px-6 py-3 border-2 border-yellow-500/50 flex items-center gap-3">
            {loadingMembers ? (
              <><span className="w-3 h-3 rounded-full bg-yellow-500 animate-ping"></span> Syncing Data...</>
            ) : errorMembers ? (
              <><span className="w-3 h-3 rounded-full bg-red-600"></span> Error Load TXT</>
            ) : (
              <><span className="w-3 h-3 rounded-full bg-green-500 shadow-[0_0_15px_#22c55e]"></span> Live Roster</>
            )}
          </div>
        </div>

        {/* LOGIKA TAMPILAN MEMBER */}
        {loadingMembers ? (
          <div className="text-center py-20 text-orange-500 font-black text-2xl animate-pulse uppercase tracking-widest">
            Membaca data dari public/listmember.txt ...
          </div>
        ) : errorMembers ? (
          <div className="text-center py-20 bg-red-950/50 border border-red-500 rounded-lg">
            <h3 className="text-red-500 font-black text-2xl uppercase tracking-widest mb-2">Gagal Membaca File</h3>
            <p className="text-slate-300">Pastikan kamu sudah membuat file <code className="bg-black px-2 py-1 text-orange-400">public/listmember.txt</code> di GitHub.</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-20 bg-[#0a0a0a] border border-orange-500/30 rounded-lg">
            <h3 className="text-orange-500 font-black text-2xl uppercase tracking-widest mb-2">Daftar Member Kosong</h3>
            <p className="text-slate-300">Isi file <code className="bg-black px-2 py-1 text-orange-400">public/listmember.txt</code> kamu untuk menampilkan roster di sini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {members.map((member, index) => (
              <div 
                key={index} 
                className="bg-[#080808] p-8 border-l-4 border-slate-800 hover:border-orange-600 hover:bg-[#111] hover:shadow-[0_15px_35px_rgba(234,88,12,0.2)] transition-all duration-300 group flex flex-col relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-orange-600/5 blur-xl group-hover:bg-orange-600/20 transition-all"></div>
                
                <span className="text-xs font-black text-orange-500 uppercase tracking-[0.3em] block mb-4 border-b border-white/10 pb-2 w-fit">
                  {member.role}
                </span>
                
                <h3 className="text-2xl sm:text-3xl font-black tracking-tight text-white group-hover:text-yellow-500 transition-colors truncate">
                  {member.name}
                </h3>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t-2 border-orange-600/30 bg-[#050505] py-20 text-center w-full px-4 flex flex-col items-center">
        <div className="flex gap-8 mb-10 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-500">
          <img src={logoSrc} alt="Freedom" className="h-16 w-16 object-contain" />
          <img src={logoPnSrc} alt="PN" className="h-16 w-16 object-contain" />
        </div>
        <h2 className="text-4xl font-black text-white tracking-tighter mb-4">
          FREEDOM CLAN
        </h2>
        <p className="text-orange-600 text-xs font-black uppercase tracking-[0.4em]">
          &copy; {new Date().getFullYear()} Elite ProwNetwork Fraksi. All Rights Reserved.
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
