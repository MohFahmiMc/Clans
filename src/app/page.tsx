"use client";

import React, { useState, useEffect } from 'react';

// IMPORT GAMBAR
import logoAsset from '../assets/logo.png';
import backgroundAsset from '../assets/background.png';
import logoPnAsset from '../assets/logo_pn.png';
import mcProwAsset from '../assets/mc_prow.png';

interface Member { name: string; role: string; }

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errorMembers, setErrorMembers] = useState(false);

  // FUNGSI EKSTRAK GAMBAR YANG AMAN UNTUK NEXT.JS
  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');
  
  const logoSrc = getSrc(logoAsset);
  const bgSrc = getSrc(backgroundAsset);
  const logoPnSrc = getSrc(logoPnAsset);
  const mcProwSrc = getSrc(mcProwAsset);

  // FUNGSI MEMBACA LIST MEMBER (SUDAH DIPERBAIKI!)
  useEffect(() => {
    fetch(`/listmember.txt?t=${new Date().getTime()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal memuat file");
        return res.text();
      })
      .then((text) => {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const parsedMembers: Member[] = [];
        let currentRole = "Member";

        // LOGIKA BARU: Jika baris adalah kata-kata role, set sebagai role. 
        // Sisanya pasti Gamertag / Nama Member.
        const knownRoles = ['leader', 'admin', 'member', 'co-leader', 'moderator', 'staff', 'owner'];

        lines.forEach(line => {
          if (knownRoles.includes(line.toLowerCase())) {
            currentRole = line; // Update Role (Contoh: "Leader")
          } else {
            // Ini pasti nama orang. Pecah kalau ada koma, kalau tidak langsung masukkan.
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
    <div className="bg-[#0a0a0a] text-slate-200 min-h-screen font-sans selection:bg-orange-500 selection:text-black">
      
      {/* 1. BACKGROUND IMAGE (DIJAMIN MUNCUL & LEBIH CLEAN) */}
      <div className="fixed inset-0 z-[-1] overflow-hidden bg-[#050505]">
        {bgSrc && (
          <img 
            src={bgSrc} 
            alt="Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/80 to-transparent"></div>
        {/* Subtle accent colors (Tidak terlalu lebay kayak AI) */}
        <div className="absolute top-0 right-0 w-[80vw] md:w-[40vw] h-[40vw] bg-orange-600/10 rounded-full blur-[100px]"></div>
      </div>

      {/* 2. NAVIGATION BAR (UKURAN LEBIH PAS DI MOBILE) */}
      <nav className="border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50 px-4 py-3">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="Freedom" className="h-8 w-8 md:h-10 md:w-10 object-contain drop-shadow-md" />
            <span className="text-xl md:text-2xl font-black tracking-tighter text-white">
              FREEDOM
            </span>
          </div>
          <div className="hidden md:flex gap-8 text-xs font-bold text-slate-400 uppercase tracking-widest">
            <a href="#home" className="hover:text-orange-500 transition-colors">Base</a>
            <a href="#server" className="hover:text-orange-500 transition-colors">Server</a>
            <a href="#roster" className="hover:text-orange-500 transition-colors">Members</a>
          </div>
        </div>
      </nav>

      {/* 3. HERO SECTION (TIDAK KEBESARAN DI MOBILE) */}
      <header id="home" className="relative pt-16 pb-16 md:pt-32 md:pb-24 px-4 text-center flex flex-col items-center">
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
          
          <div className="flex items-center gap-2 mb-6 bg-white/5 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-sm">
            <img src={logoPnSrc} alt="PN Logo" className="h-4 w-4 md:h-5 md:w-5 object-contain" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-orange-400">
              ProwNetwork Official Clan
            </span>
          </div>
          
          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter uppercase text-white mb-4 drop-shadow-lg">
            FREEDOM
          </h1>
          
          <p className="text-sm md:text-lg text-slate-400 max-w-xl mx-auto font-medium leading-relaxed mb-8 px-2">
            Simbol <span className="text-orange-400">Kebebasan</span> dan <span className="text-yellow-500">Kekuatan</span>. Kami mendominasi setiap sudut ProwNetwork.
          </p>
          
          <a href="https://discord.gg/2veK4TDWtF" target="_blank" rel="noreferrer" className="w-full sm:w-auto px-8 py-3.5 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded shadow-[0_0_15px_rgba(234,88,12,0.4)] transition-all uppercase tracking-widest text-xs md:text-sm">
            Join Freedom Clan
          </a>
        </div>
      </header>

      {/* 4. SERVER INFO (TAMPILAN KOTAK RAPI) */}
      <section id="server" className="py-16 md:py-20 border-y border-white/5 bg-black/40 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] text-orange-500 mb-8">
            Base of Operations
          </h2>
          
          <img 
            src={mcProwSrc} 
            alt="Minecraft ProwNetwork" 
            className="w-full max-w-[280px] md:max-w-[450px] mx-auto object-contain mb-10 drop-shadow-xl" 
          />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* IP Server */}
            <div className="bg-[#111] border border-white/10 p-6 rounded text-center hover:border-orange-500 transition-colors">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Bedrock IP Server</span>
              <span className="text-lg md:text-2xl font-black text-white tracking-widest">
                be.prownetwork.net
              </span>
            </div>
            
            {/* Discord PN */}
            <a href="https://discord.gg/8X4rz7eARM" target="_blank" rel="noreferrer" className="bg-[#111] border border-white/10 p-6 rounded text-center hover:border-[#5865F2] transition-colors block">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Official Community</span>
              <span className="text-lg md:text-2xl font-black text-[#5865F2] uppercase tracking-wider">
                PN Discord Server
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* 5. STATS GRID (GRID 2 KOLOM DI MOBILE) */}
      <section className="py-12 md:py-20 px-4 w-full border-b border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[
              { value: "95%", label: "PVP Win Rate" },
              { value: "S-Tier", label: "Clan Class" },
              { value: "10+", label: "Elite Members" },
              { value: "Full", label: "Kebebasan" }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 bg-[#111] border border-white/5 rounded hover:border-orange-600 transition-colors">
                <h3 className="text-2xl md:text-4xl font-black text-white mb-1 md:mb-2">{stat.value}</h3>
                <p className="text-slate-500 uppercase tracking-widest text-[9px] md:text-xs font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. ROSTER SECTION (BERFUNGSI NORMAL & CARD COMPACT) */}
      <section id="roster" className="max-w-5xl mx-auto py-16 md:py-20 px-4 w-full mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
              CLAN <span className="text-orange-500">MEMBERS</span>
            </h2>
            <p className="text-orange-400 mt-1 text-xs md:text-sm font-bold tracking-widest uppercase">The Faces of Freedom</p>
          </div>
          
          <div className="text-yellow-500 font-bold uppercase tracking-widest text-[9px] md:text-[10px] bg-yellow-950/30 px-3 py-1.5 rounded border border-yellow-500/30 flex items-center gap-2">
            <span className={`w-1.5 h-1.5 rounded-full ${loadingMembers ? 'bg-orange-500 animate-pulse' : errorMembers ? 'bg-red-500' : 'bg-green-500'}`}></span>
            {loadingMembers ? "Syncing..." : errorMembers ? "Error Load" : "Live Roster"}
          </div>
        </div>

        {loadingMembers ? (
          <div className="text-center py-10 text-orange-500 font-bold text-sm uppercase tracking-widest animate-pulse">
            Membaca data roster...
          </div>
        ) : errorMembers ? (
          <div className="text-center py-10 bg-red-950/20 border border-red-900 rounded">
            <h3 className="text-red-500 font-bold text-sm uppercase tracking-widest mb-1">Gagal Membaca File</h3>
            <p className="text-slate-400 text-xs">Pastikan file public/listmember.txt tersedia.</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-10 bg-[#111] border border-white/5 rounded">
            <h3 className="text-orange-500 font-bold text-sm uppercase tracking-widest mb-1">Roster Kosong</h3>
            <p className="text-slate-400 text-xs">Data member di listmember.txt kosong.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
            {members.map((member, index) => (
              <div 
                key={index} 
                className="bg-[#111] p-5 rounded border-l-2 border-slate-700 hover:border-orange-500 transition-colors flex items-center gap-4"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 flex-shrink-0 rounded bg-gradient-to-br from-orange-600 to-yellow-600 flex items-center justify-center text-black font-black text-lg md:text-xl">
                  {member.name.charAt(0).toUpperCase()}
                </div>
                
                <div className="flex-1 min-w-0">
                  <span className="text-[9px] md:text-[10px] font-bold text-orange-500 uppercase tracking-widest block mb-0.5">
                    {member.role}
                  </span>
                  <h3 className="text-base md:text-lg font-black tracking-tight text-white truncate">
                    {member.name}
                  </h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 7. FOOTER */}
      <footer className="border-t border-white/5 bg-[#080808] py-12 text-center px-4">
        <div className="flex justify-center gap-4 mb-6 opacity-40">
          <img src={logoSrc} alt="Freedom" className="h-8 w-8 object-contain" />
          <img src={logoPnSrc} alt="PN" className="h-8 w-8 object-contain" />
        </div>
        <h2 className="text-xl font-black text-slate-500 tracking-tighter mb-2">
          FREEDOM CLAN
        </h2>
        <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">
          &copy; {new Date().getFullYear()} Elite ProwNetwork Fraksi.
        </p>
      </footer>

    </div>
  );
}
