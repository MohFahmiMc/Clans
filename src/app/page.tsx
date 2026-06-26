"use client";

import React, { useState, useEffect } from 'react';

// IMPORT ASSETS LOKAL
import logoAsset from '../assets/logo.png';
import logoPnAsset from '../assets/logo_pn.png';
import mcProwAsset from '../assets/mc_prow.png';

interface Member { name: string; role: string; }

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errorMembers, setErrorMembers] = useState(false);

  // Fungsi ambil gambar
  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');
  const logoSrc = getSrc(logoAsset);
  const logoPnSrc = getSrc(logoPnAsset);
  const mcProwSrc = getSrc(mcProwAsset);
  
  // Link Imgur
  const bgSrc = "https://i.imgur.com/U2eVJEi.png";

  // FETCH LIST MEMBER
  useEffect(() => {
    fetch(`/listmember.txt?t=${new Date().getTime()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal");
        return res.text();
      })
      .then((text) => {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const parsedMembers: Member[] = [];
        let currentRole = "Member";
        const knownRoles = ['leader', 'admin', 'member', 'co-leader', 'moderator', 'staff', 'owner'];

        lines.forEach(line => {
          if (knownRoles.includes(line.toLowerCase())) {
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
        setErrorMembers(false);
      })
      .catch((err) => {
        console.error(err);
        setErrorMembers(true);
        setLoadingMembers(false);
      });
  }, []);

  // Fungsi Warna Berdasarkan Role
  const getRoleColor = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'leader' || r === 'owner') return 'text-red-500 border-red-500/30 bg-red-500/10';
    if (r === 'admin' || r === 'co-leader') return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
    return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
  };

  return (
    <div className="relative min-h-screen font-sans text-slate-200 selection:bg-orange-500 selection:text-black bg-[#050505]">
      
      {/* 1. BACKGROUND IMGUR (DIJAMIN MUNCUL 100%) */}
      {/* Menggunakan div fixed di layer paling bawah z-0 */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
        style={{ backgroundImage: `url(${bgSrc})` }}
      ></div>
      {/* Overlay Hitam Gradasi agar teks tetap terbaca */}
      <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/40 via-[#0a0a0a]/80 to-[#050505]"></div>
      
      {/* Pembungkus Konten Utama (z-10 agar selalu di atas background) */}
      <div className="relative z-10">

        {/* 2. NAVIGATION BAR */}
        <nav className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 px-4 py-4">
          <div className="max-w-6xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <img src={logoSrc} alt="Freedom" className="h-9 w-9 md:h-10 md:w-10 object-contain drop-shadow-lg" />
              <span className="text-xl md:text-2xl font-black tracking-tighter text-white">FREEDOM</span>
            </div>
            
            {/* Navigasi Kanan & Icon Discord Mini */}
            <div className="flex items-center gap-6">
              <div className="hidden md:flex gap-8 text-xs font-bold text-slate-300 uppercase tracking-widest">
                <a href="#home" className="hover:text-orange-500 transition-colors">Base</a>
                <a href="#server" className="hover:text-orange-500 transition-colors">Server</a>
                <a href="#roster" className="hover:text-orange-500 transition-colors">Members</a>
              </div>
              <a href="https://discord.gg/2veK4TDWtF" target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-[#5865F2]/20 hover:bg-[#5865F2]/40 text-[#5865F2] hover:text-white px-3 py-1.5 rounded border border-[#5865F2]/30 transition-all text-xs font-bold">
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
                Join
              </a>
            </div>
          </div>
        </nav>

        {/* 3. HERO SECTION */}
        <header id="home" className="pt-20 pb-16 md:pt-32 md:pb-24 px-4 text-center flex flex-col items-center">
          <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            
            {/* Badge */}
            <div className="flex items-center gap-2 mb-6 bg-black/40 px-4 py-1.5 rounded-full border border-orange-500/30 backdrop-blur-md">
              <img src={logoPnSrc} alt="PN Logo" className="h-4 w-4 md:h-5 md:w-5 object-contain" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-orange-500">
                ProwNetwork Official
              </span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase text-white mb-4 drop-shadow-[0_0_30px_rgba(234,88,12,0.5)]">
              FREEDOM
            </h1>
            
            <p className="text-sm md:text-lg text-slate-300 max-w-xl mx-auto font-medium leading-relaxed mb-8 px-2">
              Mendominasi tanpa batas. Kami adalah fraksi elit penguasa <span className="text-yellow-500 font-bold">ProwNetwork</span>.
            </p>
            
            {/* Tombol Discord Raksasa */}
            <a href="https://discord.gg/2veK4TDWtF" target="_blank" rel="noreferrer" className="flex items-center gap-3 w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all uppercase tracking-widest text-xs md:text-sm">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
              Join Server Discord
            </a>
          </div>
        </header>

        {/* 4. SERVER INFO (KOTAK RAPI + ICON) */}
        <section id="server" className="py-16 md:py-24 border-y border-white/5 bg-black/50 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 text-center">
            
            <img 
              src={mcProwSrc} 
              alt="Minecraft ProwNetwork" 
              className="w-full max-w-[250px] md:max-w-[400px] mx-auto object-contain mb-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" 
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {/* Kotak IP Server */}
              <div className="bg-[#0f0f0f] border border-white/10 p-8 rounded-lg flex flex-col items-center justify-center group hover:border-orange-500 hover:bg-orange-500/5 transition-all">
                <svg className="w-8 h-8 text-orange-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Bedrock IP Server</span>
                <span className="text-xl md:text-3xl font-black text-white tracking-widest group-hover:text-orange-400">
                  be.prownetwork.net
                </span>
              </div>
              
              {/* Kotak Discord PN */}
              <a href="https://discord.gg/8X4rz7eARM" target="_blank" rel="noreferrer" className="bg-[#0f0f0f] border border-white/10 p-8 rounded-lg flex flex-col items-center justify-center group hover:border-[#5865F2] hover:bg-[#5865F2]/5 transition-all">
                <svg className="w-8 h-8 text-[#5865F2] mb-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152... (discord path is same as above)... M8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">PN Official Community</span>
                <span className="text-xl md:text-3xl font-black text-white uppercase tracking-wider group-hover:text-[#5865F2]">
                  Join PN Discord
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* 5. STATS GRID */}
        <section className="py-12 md:py-20 px-4 w-full border-b border-white/5 bg-black/30 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: "95%", label: "Win Rate", icon: <svg className="w-5 h-5 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> },
                { value: "S-Tier", label: "Clan Rank", icon: <svg className="w-5 h-5 mx-auto mb-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg> },
                { value: "10+", label: "Elite Members", icon: <svg className="w-5 h-5 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> },
                { value: "Full", label: "Kebebasan", icon: <svg className="w-5 h-5 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg> }
              ].map((stat, i) => (
                <div key={i} className="text-center p-6 bg-[#0f0f0f] border border-white/5 rounded-lg hover:border-orange-500/50 transition-all shadow-lg">
                  {stat.icon}
                  <h3 className="text-2xl md:text-4xl font-black text-white mb-1">{stat.value}</h3>
                  <p className="text-slate-500 uppercase tracking-widest text-[9px] md:text-[10px] font-bold">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. ROSTER SECTION (BERFUNGSI NORMAL & CARD COMPACT) */}
        <section id="roster" className="max-w-5xl mx-auto py-16 md:py-24 px-4 w-full mb-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
            <div>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
                CLAN <span className="text-orange-500">ROSTER</span>
              </h2>
              <p className="text-orange-400 mt-1 text-xs md:text-sm font-bold tracking-widest uppercase">The Faces of Freedom</p>
            </div>
            
            <div className="text-yellow-500 font-bold uppercase tracking-widest text-[9px] md:text-[10px] bg-[#0f0f0f] px-4 py-2 rounded-full border border-yellow-500/30 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${loadingMembers ? 'bg-orange-500 animate-pulse' : errorMembers ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'}`}></span>
              {loadingMembers ? "Syncing..." : errorMembers ? "Error Load" : "Live Roster"}
            </div>
          </div>

          {loadingMembers ? (
            <div className="text-center py-10 text-orange-500 font-bold text-sm uppercase tracking-widest animate-pulse">
              Membaca data roster...
            </div>
          ) : errorMembers ? (
            <div className="text-center py-10 bg-red-950/20 border border-red-900 rounded-lg">
              <h3 className="text-red-500 font-bold text-sm uppercase tracking-widest mb-1">Gagal Membaca File</h3>
              <p className="text-slate-400 text-xs">Pastikan file public/listmember.txt tersedia.</p>
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-10 bg-[#111] border border-white/5 rounded-lg">
              <h3 className="text-orange-500 font-bold text-sm uppercase tracking-widest mb-1">Roster Kosong</h3>
              <p className="text-slate-400 text-xs">Data member di listmember.txt kosong.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
              {members.map((member, index) => {
                const roleStyle = getRoleColor(member.role);
                return (
                  <div 
                    key={index} 
                    className="bg-[#0f0f0f] p-5 rounded-lg border border-white/5 hover:border-white/20 hover:bg-[#151515] transition-all flex items-center gap-4 group"
                  >
                    <div className="w-12 h-12 flex-shrink-0 rounded-full bg-slate-800 flex items-center justify-center text-white font-black text-xl group-hover:bg-orange-600 transition-colors">
                      {member.name.charAt(0).toUpperCase()}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest inline-block px-2 py-0.5 rounded border mb-1 ${roleStyle}`}>
                        {member.role}
                      </span>
                      <h3 className="text-base md:text-xl font-black tracking-tight text-white truncate">
                        {member.name}
                      </h3>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {/* 7. FOOTER */}
        <footer className="border-t border-white/5 bg-black/80 backdrop-blur-md py-12 text-center px-4">
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

      </div> {/* End of Relative Z-10 Wrapper */}
    </div>
  );
}
