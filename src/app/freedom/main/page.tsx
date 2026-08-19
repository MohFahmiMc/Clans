"use client";

import React, { useState, useEffect } from 'react';
import logoPnAsset from '../../../assets/logo_pn.png';
import mcProwAsset from '../../../assets/mc_prow.png';
import backgroundImage from '../../../assets/background.png';
import background2Asset from '../../../assets/background2.png';
import Profile from '../../../components/Profile';
import RatingSection from '../../../components/RatingSection';
import ViewCounter from '../../../components/ViewCounter';

// IMPORT GAMBAR SKIN SEBAGAI FALLBACK DEFAULT JIKA BELUM SET SKIN
import steveSkin from '../../../assets/steve.png';

// IMPORT ICON ROLE UNTUK KEBUTUHAN INDIKATOR POPUP PROFILE CARD
import redstonerAsset from '../../../assets/redstoner.png';
import minerAsset from '../../../assets/miner.png';
import builderAsset from '../../../assets/builder.png';
import pvpAsset from '../../../assets/pvp.png';
import farmerAsset from '../../../assets/farmer.png';
import adventureAsset from '../../../assets/adventure.png';
import minecraftAsset from '../../../assets/Minecraft.png';

interface Member {
  _id?: string;
  name: string;
  role: string;
  specialRoles: string[];
  description?: string;
  customSkinUrl?: string | null;
}

export default function MainPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [leaderMember, setLeaderMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // STATE SKELETON PRELOADER UNTUK ASSET GAMBAR LATAR BELAKANG
  const [isBgLoaded, setIsBgLoaded] = useState(false);
  const [isBg2Loaded, setIsBg2Loaded] = useState(false);

  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');
  const logoPnSrc = getSrc(logoPnAsset);
  const mcProwSrc = getSrc(mcProwAsset);
  const bgImgSrc = getSrc(backgroundImage);
  const bg2ImgSrc = getSrc(background2Asset);

  const getRoleColor = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'leader' || r === 'owner') return 'text-red-500 border-red-500/30 bg-red-500/10';
    if (r === 'admin' || r === 'co-leader') return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
    return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
  };

  const getSpecialIcon = (specialRole: string) => {
    switch (specialRole.toLowerCase().trim()) {
      case 'redstoner': return getSrc(redstonerAsset);
      case 'miner': return getSrc(minerAsset);
      case 'builder': return getSrc(builderAsset);
      case 'pvp': return getSrc(pvpAsset);
      case 'farmer': return getSrc(farmerAsset);
      case 'adventure': return getSrc(adventureAsset);
      default: return getSrc(minecraftAsset);
    }
  };

  const loadMembersData = async () => {
    try {
      const resMembers = await fetch('/api/members?t=' + new Date().getTime(), { cache: 'no-store' });
      if (resMembers.ok) {
        const dataMembers: Member[] = await resMembers.json();
        setMembers(dataMembers);
        const foundLeader = dataMembers.find(m => m.role.toLowerCase() === 'leader');
        if (foundLeader) setLeaderMember(foundLeader);
      }
    } catch (err) {
      // Error handling diredam
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadMembersData();

    // PROCESS ASYNCHRONOUS PRELOADING LATAR BELAKANG DENGAN DETEKSI CACHE
    if (bgImgSrc) {
      const img1 = new Image();
      img1.src = bgImgSrc;
      if (img1.complete) {
        setIsBgLoaded(true);
      } else {
        img1.onload = () => setIsBgLoaded(true);
        img1.onerror = () => setIsBgLoaded(true);
      }
    } else {
      setIsBgLoaded(true);
    }

    if (bg2ImgSrc) {
      const img2 = new Image();
      img2.src = bg2ImgSrc;
      if (img2.complete) {
        setIsBg2Loaded(true);
      } else {
        img2.onload = () => setIsBg2Loaded(true);
        img2.onerror = () => setIsBg2Loaded(true);
      }
    } else {
      setIsBg2Loaded(true);
    }
  }, [bgImgSrc, bg2ImgSrc]);

  const leaderSkinUrl = leaderMember?.customSkinUrl ? leaderMember.customSkinUrl : getSrc(steveSkin);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden transition-all duration-500 animate-in fade-in">
      
      {/* --- BACKGROUND WALLPAPER SKELETON & IMAGE INTEGRATION --- */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        {!isBgLoaded && (
          <div className="absolute inset-0 bg-[#050505]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#050505] via-[#121215] to-[#050505] animate-pulse" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-orange-950/20 via-transparent to-transparent opacity-60 animate-pulse" />
          </div>
        )}
        {bgImgSrc && (
          <div 
            className={`absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-700 ease-in-out ${isBgLoaded ? 'opacity-40' : 'opacity-0'}`}
            style={{ backgroundImage: `url(${bgImgSrc})` }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/20 via-[#050505]/50 to-[#050505]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
        
        {/* ======================================================== */}
        {/* 1. HERO SECTION */}
        {/* ======================================================== */}
        <header className="pt-20 pb-12 md:pt-32 md:pb-16 text-center flex flex-col items-center animate-in slide-in-from-top-12 duration-1000">
          <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            
            {/* BADGE PURIFIED */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-2 bg-black/60 px-4 py-2 rounded-full border border-orange-500/30 backdrop-blur-md shadow-lg shadow-orange-500/5 animate-bounce-slow">
                <img src={logoPnSrc} alt="PN Logo" className="h-4 w-4 md:h-5 md:w-5 object-contain animate-pulse" />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-orange-500">
                  ProwNetwork Official
                </span>
                <div className="w-px h-3 bg-white/20 mx-1" />
                <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  Dibuat: 02-01-2023
                </span>
              </div>
            </div>
            
            <h1 className="text-5xl sm:text-7xl md:text-9xl font-black tracking-tighter uppercase text-white mb-4 drop-shadow-[0_0_50px_rgba(234,88,12,0.5)] transition-transform hover:scale-[1.01] duration-500 select-none">
              THE FREEDOM
            </h1>
            
            <p className="text-sm md:text-lg text-slate-300 max-w-xl mx-auto font-medium leading-relaxed mb-8 px-2">
              Welcome to the official website of Clan Freedom, the first clan in <span className="text-yellow-500 font-bold">ProwNetwork</span>.
            </p>
            
            {/* ACTION & VIEW COUNTER PLACEMENT */}
            <div className="flex flex-col items-center gap-5 w-full sm:w-auto">
              <a 
                href="https://discord.gg/2veK4TDWtF" 
                target="_blank" 
                rel="noreferrer" 
                className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_35px_rgba(234,88,12,0.7)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 uppercase tracking-widest text-xs md:text-sm transform"
              >
                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 h-.946 2.4189-2.1568 2.4189z"/>
                </svg>
                Join Server Discord
              </a>

              {/* VIEW COUNTER DIPINDAH KESINI AGAR HEADLINE ATAS TERLIHAT RAPI & SIMETRIS */}
              <ViewCounter />
            </div>
          </div>
        </header>

        {/* ======================================================== */}
        {/* PREMIUM LEADER CARD / SKELETON SCREEN LOADING */}
        {/* ======================================================== */}
        {loadingStats ? (
          <section className="pb-16 w-full flex flex-col items-center animate-in fade-in duration-500">
            <div className="relative w-full max-w-md bg-[#0a0a0b] border border-white/5 rounded-[24px] p-6 flex items-center gap-5 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] animate-pulse">
              <div className="w-20 h-20 rounded-[20px] bg-white/10 flex-shrink-0" />
              <div className="flex flex-col items-start gap-2 min-w-0 flex-1">
                <div className="h-4 w-16 bg-red-500/20 rounded-md" />
                <div className="h-7 w-36 bg-white/10 rounded-md" />
                <div className="h-6 w-24 bg-white/10 rounded-lg mt-1" />
              </div>
            </div>
          </section>
        ) : leaderMember ? (
          <section className="pb-16 w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            <div 
              onClick={() => setSelectedMember(leaderMember)}
              className="relative w-full max-w-md bg-[#0a0a0b] border border-white/5 rounded-[24px] p-6 flex items-center gap-5 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] group hover:scale-[1.03] hover:border-red-500/30 hover:shadow-[0_25px_60px_rgba(239,68,68,0.12)] transition-all duration-300 cursor-pointer"
              title="Klik untuk membuka Detail 3D Roster Profil Leader"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0b] via-[#0a0a0b]/80 to-transparent z-10 pointer-events-none" />
              
              {!isBg2Loaded && (
                <div className="absolute right-0 inset-y-0 w-2/3 bg-gradient-to-r from-transparent via-orange-500/10 to-orange-950/20 animate-pulse pointer-events-none z-0" />
              )}
              {bg2ImgSrc && (
                <div 
                  className={`absolute right-0 inset-y-0 w-2/3 bg-cover bg-center mix-blend-normal pointer-events-none z-0 transform group-hover:scale-105 transition-all duration-700 ${isBg2Loaded ? 'opacity-45' : 'opacity-0'}`} 
                  style={{ backgroundImage: `url(${bg2ImgSrc})` }} 
                />
              )}

              <div className="w-20 h-20 rounded-[20px] bg-[#2b2d31] border-4 border-[#3f4248] overflow-hidden flex-shrink-0 relative z-20 transition-transform duration-300 group-hover:scale-105 shadow-xl">
                <div className="w-full h-full relative" style={{ imageRendering: 'pixelated' }}>
                  <img src={leaderSkinUrl} alt="" className="absolute max-w-none" style={{ width: '800%', height: 'auto', left: '-100%', top: '-100%' }} />
                  <img src={leaderSkinUrl} alt="" className="absolute max-w-none" style={{ width: '800%', height: 'auto', left: '-500%', top: '-100%' }} />
                </div>
              </div>

              <div className="flex flex-col items-start gap-0.5 min-w-0 relative z-20">
                <span className="text-[10px] font-extrabold text-[#ff4d4d] bg-[#ff4d4d]/10 border border-[#ff4d4d]/20 px-3 py-0.5 rounded-md tracking-wider uppercase shadow-sm">
                  LEADER
                </span>
                
                <h3 className="text-2xl font-bold text-white tracking-wide truncate max-w-full drop-shadow">
                  {leaderMember.name}
                </h3>
                
                <div className="flex items-center gap-1.5 bg-black/50 border border-white/5 px-3 py-1 rounded-lg mt-1 shadow-inner">
                  <img 
                    src={getSpecialIcon(leaderMember.specialRoles[0] || 'pvp')} 
                    alt="" 
                    className="w-4 h-4 object-contain" 
                  />
                  <span className="text-[11px] font-black uppercase tracking-wider text-slate-300">
                    {leaderMember.specialRoles[0] || 'PVP'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        {/* ======================================================== */}
        {/* 2. BEDROCK ONLY SERVER INFO BOX */}
        {/* ======================================================== */}
        <section id="server" className="py-12 border-y border-white/5 bg-black/40 backdrop-blur-md rounded-2xl mb-16 animate-in fade-in duration-1000">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <img src={mcProwSrc} alt="Minecraft ProwNetwork" className="w-full max-w-[240px] md:max-w-[320px] mx-auto object-contain mb-8 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transform hover:scale-[1.02] transition-transform duration-300" />
            
            <div className="max-w-xl mx-auto">
              <div className="bg-[#0f0f0f] border border-white/10 p-8 rounded-2xl flex flex-col items-center justify-center group hover:border-orange-500/40 hover:bg-orange-500/[0.01] transition-all duration-300 shadow-xl transform hover:-translate-y-0.5">
                <svg className="w-8 h-8 text-orange-500 mb-4 animate-pulse" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path>
                </svg>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">Bedrock IP Server</span>
                <span className="text-xl md:text-3xl font-black text-white tracking-widest group-hover:text-orange-400 transition-colors select-all">
                  be.prownetwork.net
                </span>
                <div className="mt-3 bg-black/60 px-4 py-1 border border-white/5 rounded-md">
                  <span className="text-xs font-mono font-bold text-slate-400">Port: <span className="text-orange-500">19132</span></span>
                </div>

                <a 
                  href="https://discord.gg/8X4rz7eARM" 
                  target="_blank" 
                  rel="noreferrer" 
                  className="mt-6 flex items-center justify-center gap-2 text-xs font-bold bg-[#5865F2]/10 hover:bg-[#5865F2] text-[#5865F2] hover:text-white px-5 py-2.5 rounded-xl border border-[#5865F2]/20 hover:border-[#5865F2]/50 transition-all duration-300 uppercase tracking-wider transform hover:scale-[1.03] shadow-md shadow-black/40"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg">
                    <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,73,0c.83.71,1.69,1.4,2.58,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.05-18.83C129.83,48.24,123.41,25.43,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.14-12.67,11.43-12.67S53.94,46,53.86,53,48.74,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53s5.14-12.67,11.43-12.67S96.13,46,96.05,53,90.93,65.69,84.69,65.69Z"/>
                  </svg>
                  Join ProwNetwork Discord Server
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* CLAN STATS GRID */}
        {/* ======================================================== */}
        <section className="mb-16 animate-in slide-in-from-bottom-4 duration-1000">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { 
                value: "95%", 
                label: "Win Rate", 
                isSkeleton: false,
                icon: <svg className="w-5 h-5 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> 
              },
              { 
                value: "S-Tier", 
                label: "Clan Rank", 
                isSkeleton: false,
                icon: <svg className="w-5 h-5 mx-auto mb-2 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg> 
              },
              { 
                value: `${members.length} Player`, 
                label: "Active Members", 
                isSkeleton: loadingStats,
                icon: <svg className="w-5 h-5 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 0 0-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> 
              },
              { 
                value: "Full", 
                label: "Kebebasan", 
                isSkeleton: false,
                icon: <svg className="w-5 h-5 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg> 
              }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 bg-[#0f0f0f]/60 border border-white/5 rounded-xl hover:border-orange-500/20 transition-all duration-300 shadow-lg transform hover:-translate-y-0.5">
                {stat.icon}
                {stat.isSkeleton ? (
                  <div className="h-8 w-24 bg-white/10 rounded-md animate-pulse mx-auto my-1" />
                ) : (
                  <h3 className="text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</h3>
                )}
                <p className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* EVALUASI KEPUASAN & RATING SYSTEM */}
        {/* ======================================================== */}
        <RatingSection />

      </div>

      {/* MODAL POPUP PROFILE VIEW */}
      {selectedMember && (
        <Profile 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
          getRoleColor={getRoleColor}
          getSpecialIcon={getSpecialIcon}
        />
      )}

    </div>
  );
}
