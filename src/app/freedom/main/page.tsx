"use client";

import React, { useState, useEffect } from 'react';
import logoPnAsset from '../../../assets/logo_pn.png';
import mcProwAsset from '../../../assets/mc_prow.png';
import backgroundImage from '../../../assets/background.png';
import Profile from '../../../components/Profile';

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

interface RatingItem {
  _id: string;
  name: string;
  message: string;
  stars: number;
  createdAt: string;
}

export default function MainPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);

  // System States
  const [leaderMember, setLeaderMember] = useState<Member | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [ratingHover, setRatingHover] = useState<number>(0);
  const [selectedStars, setSelectedStars] = useState<number>(0);
  const [showRateModal, setShowRateModal] = useState(false);
  
  // Form Review States
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerMessage, setReviewerMessage] = useState('');
  const [submittingRate, setSubmittingRate] = useState(false);

  // Password Verification Panel Admin States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');
  const logoPnSrc = getSrc(logoPnAsset);
  const mcProwSrc = getSrc(mcProwAsset);
  const bgImgSrc = getSrc(backgroundImage);

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

  const loadDataCenter = async () => {
    try {
      const [resMembers, resRatings] = await Promise.all([
        fetch('/api/members?t=' + new Date().getTime(), { cache: 'no-store' }),
        fetch('/api/ratings?t=' + new Date().getTime(), { cache: 'no-store' })
      ]);

      if (resMembers.ok) {
        const dataMembers: Member[] = await resMembers.json();
        setMembers(dataMembers);
        const foundLeader = dataMembers.find(m => m.role.toLowerCase() === 'leader');
        if (foundLeader) setLeaderMember(foundLeader);
      }

      if (resRatings.ok) {
        const dataRatings: RatingItem[] = await resRatings.json();
        setRatings(dataRatings);
      }
    } catch (err) {
      console.error("Gagal melakukan sinkronisasi dengan database:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    loadDataCenter();
  }, []);

  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0;
    const totalStars = ratings.reduce((acc, curr) => acc + curr.stars, 0);
    return (totalStars / ratings.length).toFixed(1);
  };

  const handleStarClick = (starValue: number) => {
    setSelectedStars(starValue);
    setShowRateModal(true);
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || selectedStars === 0) return;

    setSubmittingRate(true);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reviewerName,
          message: reviewerMessage,
          stars: selectedStars
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        setShowRateModal(false);
        setReviewerName('');
        setReviewerMessage('');
        setSelectedStars(0);
        loadDataCenter();
      } else {
        alert(data.error || 'Gagal mengirimkan ulasan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSubmittingRate(false);
    }
  };

  const verifyAdminAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      if (res.ok) {
        setIsAdminMode(true);
        setShowAuthModal(false);
        if (targetDeleteId) {
          executeDeleteRating(targetDeleteId);
        }
      } else {
        alert('Password administrasi salah!');
      }
    } catch (err) {
      alert('Gagal terhubung ke modul otentikasi.');
    }
  };

  const triggerDeleteRating = (id: string) => {
    if (isAdminMode) {
      executeDeleteRating(id);
    } else {
      setTargetDeleteId(id);
      setShowAuthModal(true);
    }
  };

  const executeDeleteRating = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin memoderasi dan menghapus ulasan ini secara permanen?')) return;
    try {
      const res = await fetch('/api/ratings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: adminPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        setTargetDeleteId(null);
        loadDataCenter();
      } else {
        alert(data.error || 'Gagal menghapus ulasan.');
      }
    } catch (err) {
      alert('Terjadi gangguan koneksi sistem.');
    }
  };

  const handleMinusAdminToggle = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      setAdminPassword('');
      alert('Mode otentikasi manajemen rating dinonaktifkan.');
    } else {
      setTargetDeleteId(null);
      setShowAuthModal(true);
    }
  };

  const leaderSkinUrl = leaderMember?.customSkinUrl ? leaderMember.customSkinUrl : getSrc(steveSkin);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden transition-all duration-500 animate-in fade-in">
      
      {/* --- BACKGROUND WALLPAPER --- */}
      {bgImgSrc && (
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-60 z-0 pointer-events-none transition-opacity duration-1000 animate-in fade-in"
          style={{ backgroundImage: `url(${bgImgSrc})` }}
        />
      )}
      <div className="fixed inset-0 bg-gradient-to-b from-[#050505]/20 via-[#050505]/50 to-[#050505] z-0 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 pb-20">
        
        {/* ======================================================== */}
        {/* 1. HERO SECTION */}
        {/* ======================================================== */}
        <header className="pt-20 pb-12 md:pt-32 md:pb-16 text-center flex flex-col items-center animate-in slide-in-from-top-12 duration-1000">
          <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            <div className="flex items-center gap-2 mb-6 bg-black/60 px-4 py-2 rounded-full border border-orange-500/30 backdrop-blur-md shadow-lg shadow-orange-500/5">
              <img src={logoPnSrc} alt="PN Logo" className="h-4 w-4 md:h-5 md:w-5 object-contain animate-pulse" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-orange-500">
                ProwNetwork Official
              </span>
              <div className="w-px h-3 bg-white/20 mx-1" />
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Dibuat: 02-01-2023
              </span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase text-white mb-4 drop-shadow-[0_0_50px_rgba(234,88,12,0.5)] transition-transform hover:scale-[1.01] duration-500">
              FREEDOM
            </h1>
            
            <p className="text-sm md:text-lg text-slate-300 max-w-xl mx-auto font-medium leading-relaxed mb-8 px-2">
              Welcome to the official website of Clan Freedom, the first clan in <span className="text-yellow-500 font-bold">ProwNetwork</span>.
            </p>
            
            {/* BUTTON ORANGE DISCORD FREEDOM CLAN ASLI */}
            <a 
              href="https://discord.gg/2veK4TDWtF" 
              target="_blank" 
              rel="noreferrer" 
              className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded shadow-[0_0_20px_rgba(234,88,12,0.4)] hover:shadow-[0_0_30px_rgba(234,88,12,0.6)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 uppercase tracking-widest text-xs md:text-sm"
            >
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 h-.946 2.4189-2.1568 2.4189z"/>
              </svg>
              Join Server Discord
            </a>
          </div>
        </header>

        {/* ======================================================== */}
        {/* PREMIUM LEADER CARD (Screenshot_2026_0629_092448_3.png) */}
        {/* ======================================================== */}
        {leaderMember && (
          <section className="pb-16 w-full flex flex-col items-center animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
            <div 
              onClick={() => setSelectedMember(leaderMember)}
              className="relative w-full max-w-sm bg-[#111214] border border-white/5 rounded-[20px] p-5 flex items-center gap-4 overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.7)] group hover:scale-[1.03] hover:border-red-500/30 transition-all duration-300 cursor-pointer"
              title="Klik untuk membuka Detail 3D Roster Profil Leader"
            >
              {/* Avatar Box Berwarna Slate Gelap dengan Border Tebal Abu-abu */}
              <div className="w-16 h-16 rounded-[16px] bg-[#2b2d31] border-[3px] border-[#3f4248] overflow-hidden flex-shrink-0 relative transition-transform duration-300 group-hover:scale-105">
                <div className="w-full h-full relative" style={{ imageRendering: 'pixelated' }}>
                  <img src={leaderSkinUrl} alt="" className="absolute max-w-none" style={{ width: '800%', height: 'auto', left: '-100%', top: '-100%' }} />
                  <img src={leaderSkinUrl} alt="" className="absolute max-w-none" style={{ width: '800%', height: 'auto', left: '-500%', top: '-100%' }} />
                </div>
              </div>

              {/* Detail Konten Identitas */}
              <div className="flex flex-col items-start gap-0.5 min-w-0">
                {/* LEADER Badge Kotak Merah Gelap */}
                <span className="text-[10px] font-extrabold text-[#ff4d4d] bg-[#ff4d4d]/10 border border-[#ff4d4d]/20 px-2.5 py-0.5 rounded-md tracking-wider uppercase">
                  LEADER
                </span>
                
                {/* Nickname Utama */}
                <h3 className="text-xl font-bold text-white tracking-wide truncate max-w-full">
                  {leaderMember.name}
                </h3>
                
                {/* Pill Special Role (Icon + Teks) */}
                <div className="flex items-center gap-1.5 bg-black/40 border border-white/5 px-2.5 py-1 rounded-md mt-0.5">
                  <img 
                    src={getSpecialIcon(leaderMember.specialRoles[0] || 'pvp')} 
                    alt="" 
                    className="w-3.5 h-3.5 object-contain" 
                  />
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-300">
                    {leaderMember.specialRoles[0] || 'PVP'}
                  </span>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 2. BEDROCK ONLY SERVER INFO BOX (PORT 19132) */}
        {/* ======================================================== */}
        <section id="server" className="py-12 border-y border-white/5 bg-black/40 backdrop-blur-md rounded-2xl mb-16 animate-in fade-in duration-1000">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <img src={mcProwSrc} alt="Minecraft ProwNetwork" className="w-full max-w-[240px] md:max-w-[320px] mx-auto object-contain mb-8 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" />
            
            <div className="max-w-xl mx-auto">
              <div className="bg-[#0f0f0f] border border-white/10 p-8 rounded-xl flex flex-col items-center justify-center group hover:border-orange-500/40 hover:bg-orange-500/[0.01] transition-all duration-300 shadow-xl transform hover:-translate-y-0.5">
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
              { value: "95%", label: "Win Rate", icon: <svg className="w-5 h-5 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> },
              { value: "S-Tier", label: "Clan Rank", icon: <svg className="w-5 h-5 mx-auto mb-2 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg> },
              { value: loadingStats ? "..." : `${members.length} Player`, label: "Active Members", icon: <svg className="w-5 h-5 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 0 0-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> },
              { value: "Full", label: "Kebebasan", icon: <svg className="w-5 h-5 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg> }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 bg-[#0f0f0f]/60 border border-white/5 rounded-xl hover:border-orange-500/20 transition-all duration-300 shadow-lg transform hover:-translate-y-0.5">
                {stat.icon}
                <h3 className="text-2xl md:text-3xl font-black text-white mb-1">{stat.value}</h3>
                <p className="text-slate-500 uppercase tracking-widest text-[9px] font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ======================================================== */}
        {/* KOTAK SERVER DC PROW (Screenshot_2026_0629_092448_2.png) */}
        {/* ======================================================== */}
        <section className="mb-16 flex flex-col items-center w-full animate-in fade-in duration-1000">
          <a 
            href="https://discord.gg/8X4rz7eARM" 
            target="_blank" 
            rel="noreferrer" 
            className="w-full max-w-xl bg-[#111214] border border-white/5 rounded-[20px] p-8 md:p-10 flex flex-col items-center justify-center text-center group hover:border-[#5865F2]/40 shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:shadow-[0_20px_50px_rgba(88,101,242,0.15)] transition-all duration-500 transform hover:-translate-y-1"
          >
            {/* Logo Blueprint Discord Original Sesuai Gambar */}
            <svg className="w-12 h-12 text-[#5865F2] fill-current mb-4 drop-shadow-[0_0_15px_rgba(88,101,242,0.3)] transition-transform duration-300 group-hover:scale-105" viewBox="0 0 127.14 96.36" xmlns="http://www.w3.org/2000/svg">
              <path d="M107.7,8.07A105.15,105.15,0,0,0,77.26,0a77.19,77.19,0,0,0-3.3,6.83A96.67,96.67,0,0,0,53.22,6.83,77.19,77.19,0,0,0,49.88,0,105.15,105.15,0,0,0,19.44,8.07C3.66,31.58-1.86,54.65,1,77.53A105.73,105.73,0,0,0,32,96.36a77.7,77.7,0,0,0,6.63-10.85,68.43,68.43,0,0,1-10.5-5c.9-.65,1.76-1.34,2.58-2a75.58,75.58,0,0,0,73,0c.83.71,1.69,1.4,2.58,2a68.43,68.43,0,0,1-10.5,5,77.7,77.7,0,0,0,6.63,10.85,105.73,105.73,0,0,0,31.05-18.83C129.83,48.24,123.41,25.43,107.7,8.07ZM42.45,65.69C36.18,65.69,31,60,31,53s5.14-12.67,11.43-12.67S53.94,46,53.86,53,48.74,65.69,42.45,65.69Zm42.24,0C78.41,65.69,73.24,60,73.24,53s5.14-12.67,11.43-12.67S96.13,46,96.05,53,90.93,65.69,84.69,65.69Z"/>
            </svg>
            
            {/* Sub-Header Text */}
            <span className="text-xs font-bold text-slate-400 uppercase tracking-[0.25em] mb-1.5 text-center">
              PN OFFICIAL COMMUNITY
            </span>
            
            {/* Big Main Title Header */}
            <h2 className="text-2xl md:text-4xl font-extrabold text-white tracking-wide uppercase select-none">
              JOIN PROW DISCORD
            </h2>
          </a>
        </section>

        {/* ======================================================== */}
        {/* EVALUASI KEPUASAN & RATING SYSTEM */}
        {/* ======================================================== */}
        <section className="py-10 px-6 bg-[#0a0a0b]/60 border border-white/5 rounded-2xl backdrop-blur-md p-6 md:p-8 animate-in fade-in duration-1000 shadow-2xl">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight">Evaluasi Kepuasan Website</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Sistem Penilaian Global Real-Time</p>
            </div>
            
            <div className="flex items-center gap-4 bg-neutral-900/40 border border-white/5 px-5 py-3 rounded-xl backdrop-blur-md">
              <div className="text-center">
                <span className="text-2xl font-black text-yellow-500 block leading-none">{calculateAverageRating()}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Skor Rata-Rata</span>
              </div>
              <div className="w-px h-8 bg-white/10" />
              <div className="text-center">
                <span className="text-2xl font-black text-white block leading-none">{ratings.length}</span>
                <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Total Ulasan</span>
              </div>
            </div>
          </div>

          <div className="bg-black/30 border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center max-w-xl mx-auto mb-12 shadow-inner">
            <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Berikan Penilaian Anda terhadap Website</h4>
            
            <div className="flex items-center gap-2 mb-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setRatingHover(star)}
                  onMouseLeave={() => setRatingHover(0)}
                  className="text-2xl transition-transform hover:scale-125 focus:outline-none"
                >
                  <svg 
                    className={`w-8 h-8 ${star <= (ratingHover || selectedStars) ? 'text-yellow-500 fill-current' : 'text-slate-700'} transition-colors duration-150`} 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.151-.312.596-.312.748 0l2.165 4.474 4.887.71c.343.05.48.474.231.719l-3.537 3.473.835 4.896c.059.344-.298.61-.606.44l-4.37-2.31-4.37 2.31c-.308.17-.665-.095-.606-.44l.835-4.896-3.537-3.473c-.249-.245-.113-.668.231-.72l4.888-.711 2.164-4.474z" />
                  </svg>
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-500 uppercase tracking-wider">Klik bintang untuk melampirkan ulasan pesan tertulis</p>
          </div>

          <div className="w-full overflow-hidden relative py-4 border-y border-white/5 bg-black/20 rounded-xl mb-6">
            {ratings.length === 0 ? (
              <p className="text-center text-xs text-slate-600 uppercase font-bold tracking-wider py-6">Belum ada obrolan ulasan bintang terdaftar.</p>
            ) : (
              <div className="flex gap-6 overflow-x-auto pb-3 px-4 scrollbar-thin scrollbar-thumb-white/10">
                {ratings.map((item) => (
                  <div 
                    key={item._id} 
                    className="flex-shrink-0 w-72 bg-[#0f0f0f] border border-white/5 p-5 rounded-xl flex flex-col justify-between shadow-md relative group hover:border-white/10 transition-colors"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h5 className="text-sm font-black text-white truncate max-w-[150px]">{item.name}</h5>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <svg key={idx} className={`w-3 h-3 ${idx < item.stars ? 'text-yellow-500 fill-current' : 'text-neutral-800'}`} viewBox="0 0 24 24">
                              <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z"/>
                            </svg>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-slate-400 font-medium line-clamp-3 leading-relaxed break-words">
                        {item.message}
                      </p>
                    </div>

                    <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-4 block">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                    </span>

                    <button
                      type="button"
                      onClick={() => triggerDeleteRating(item._id)}
                      className={`absolute bottom-4 right-4 p-1.5 rounded-md border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-600 hover:text-white transition-all ${isAdminMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                      title="Hapus Ulasan Chat"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end px-2">
            <button
              type="button"
              onClick={handleMinusAdminToggle}
              className={`w-7 h-7 rounded-md border flex items-center justify-center text-sm font-bold transition-all ${isAdminMode ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
              title={isAdminMode ? "Matikan Panel Moderasi" : "Aktifkan Panel Moderasi"}
            >
              －
            </button>
          </div>

        </section>

      </div>

      {/* ======================================================== */}
      {/* MODAL POPUP PROFILE VIEW (MENAMPILKAN MODEL ANIMASI 3D) */}
      {/* ======================================================== */}
      {selectedMember && (
        <Profile 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
          getRoleColor={getRoleColor}
          getSpecialIcon={getSpecialIcon}
        />
      )}

      {/* ======================================================== */}
      {/* JENDELA MODAL OVERLAY INPUT CHAT ULASAN BARU */}
      {/* ======================================================== */}
      {showRateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowRateModal(false)}></div>
          <div className="relative bg-[#0a0a0b] p-6 rounded-xl border border-white/10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-white/10">
              <h3 className="text-md font-black uppercase tracking-wider text-white">Formulir Komentar Evaluasi</h3>
              <button type="button" onClick={() => setShowRateModal(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRateSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Nama / Gamertag</label>
                <input 
                  type="text"
                  value={reviewerName}
                  onChange={e => setReviewerName(e.target.value)}
                  placeholder="Masukkan nama identitas Anda..."
                  className="bg-black border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-orange-500 font-bold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Pesan Ulasan Umpan Balik</label>
                <textarea 
                  value={reviewerMessage}
                  onChange={e => setReviewerMessage(e.target.value)}
                  placeholder="Ketik impresi atau saran Anda untuk kemajuan clan Freedom..."
                  className="bg-black border border-white/10 p-3 rounded text-xs text-slate-300 h-24 resize-none focus:outline-none focus:border-orange-500 leading-relaxed"
                />
              </div>

              <button 
                type="submit" 
                disabled={submittingRate}
                className="bg-orange-600 hover:bg-orange-500 text-white font-black p-4 rounded-lg text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg mt-2"
              >
                {submittingRate ? "Menyimpan Data..." : "Kirim Ulasan Resmi"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* JENDELA MODAL OVERLAY AKSES VERIFIKASI ADMIN */}
      {/* ======================================================== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowAuthModal(false)}></div>
          <div className="relative bg-[#0a0a0a] p-6 rounded-xl border border-white/10 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-md font-black text-orange-500 uppercase tracking-wider text-center mb-4">Akses Otentikasi Rating</h3>
            <form onSubmit={verifyAdminAction} className="flex flex-col gap-3">
              <input 
                type="password" 
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Masukkan Password..."
                className="bg-black border border-white/10 p-3 rounded text-white focus:outline-none text-center font-bold tracking-widest text-sm"
                required
              />
              <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white font-bold p-3 rounded text-xs uppercase tracking-widest transition-colors">
                Buka Kunci Akses
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
