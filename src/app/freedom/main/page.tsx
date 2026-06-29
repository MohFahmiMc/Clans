"use client";

import React, { useState, useEffect } from 'react';
import logoPnAsset from '../../../assets/logo_pn.png';
import mcProwAsset from '../../../assets/mc_prow.png';
import backgroundImage from '../../../assets/background.png';
import MinecraftSkin from '../../../components/MinecraftSkin';
import Profile from '../../../components/Profile'; // IMPORT KOMPONEN PROFILE

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
  description?: string; // Menambahkan deskripsi agar sinkron dengan database
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
  const [selectedMember, setSelectedMember] = useState<Member | null>(null); // STATE MODAL PROFILE ACTIVE
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

  // HELPER METODE WARNA BADGE ROLE SINKRON DENGAN CARD ROSTER
  const getRoleColor = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'leader' || r === 'owner') return 'text-red-500 border-red-500/30 bg-red-500/10';
    if (r === 'admin' || r === 'co-leader') return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
    return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
  };

  // HELPER METODE GET SPECIAL ICON UNTUK POPUP PROFILE
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

  // Memuat data koleksi roster dan ulasan rating secara simultan
  const loadDataCenter = async () => {
    try {
      const [resMembers, resRatings] = await Promise.all([
        fetch('/api/members?t=' + new Date().getTime(), { cache: 'no-store' }),
        fetch('/api/ratings?t=' + new Date().getTime(), { cache: 'no-store' })
      ]);

      if (resMembers.ok) {
        const dataMembers: Member[] = await resMembers.json();
        setMembers(dataMembers);
        
        // Auto-detect player yang menjabat sebagai Leader
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

  // Hitung Nilai Rata-Rata Rating Secara Dinamis
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

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden">
      
      {/* --- BACKGROUND IMAGE KUSTOM RESPONSIF (MOBILE & DESKTOP) --- */}
      {bgImgSrc && (
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-75 z-0 pointer-events-none"
          style={{ backgroundImage: `url(${bgImgSrc})` }}
        />
      )}
      {/* Lapisan gradasi gelap yang dikunci mengikuti layar agar kontras teks tetap aman */}
      <div className="fixed inset-0 bg-gradient-to-b from-[#050505]/10 via-[#050505]/45 to-[#050505] z-0 pointer-events-none" />

      <div className="relative z-10">
        
        {/* ======================================================== */}
        {/* 1. HERO SECTION */}
        {/* ======================================================== */}
        <header className="pt-20 pb-12 md:pt-32 md:pb-16 px-4 text-center flex flex-col items-center">
          <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
            <div className="flex items-center gap-2 mb-6 bg-black/50 px-4 py-2 rounded-full border border-orange-500/30 backdrop-blur-md">
              <img src={logoPnSrc} alt="PN Logo" className="h-4 w-4 md:h-5 md:w-5 object-contain" />
              <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-orange-500">
                ProwNetwork Official
              </span>
              <div className="w-px h-3 bg-white/20 mx-1" />
              <span className="text-[9px] md:text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Dibuat: 02-01-2023
              </span>
            </div>
            
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase text-white mb-4 drop-shadow-[0_0_40px_rgba(234,88,12,0.4)]">
              FREEDOM
            </h1>
            
            <p className="text-sm md:text-lg text-slate-300 max-w-xl mx-auto font-medium leading-relaxed mb-8 px-2">
              Welcome to the official website of Clan Freedom, the first clan in <span className="text-yellow-500 font-bold">ProwNetwork</span>.
            </p>
            
            <a href="https://discord.gg/2veK4TDWtF" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all uppercase tracking-widest text-xs md:text-sm">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 h-.946 2.4189-2.1568 2.4189z"/></svg>
              Join Server Discord
            </a>
          </div>
        </header>

        {/* ======================================================== */}
        {/* CHARACTER SHOWCASE WITH FALLBACK AND OVERHEAD NAMETAG */}
        {/* ======================================================== */}
        {leaderMember && (
          <section className="pb-20 px-4 w-full flex flex-col items-center animate-in fade-in zoom-in duration-300">
            {/* MENAMBAHKAN TRIGER KLIK POPUP PROFILE CARD LEADER */}
            <div 
              onClick={() => setSelectedMember(leaderMember)}
              className="bg-[#0a0a0a]/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl flex flex-col items-center w-full max-w-sm shadow-[0_0_50px_rgba(234,88,12,0.1)] group hover:border-orange-500/50 hover:shadow-[0_0_50px_rgba(234,88,12,0.25)] transition-all relative cursor-pointer"
              title="Klik untuk membuka Detail Profil Leader"
            >
              <span className="text-[9px] font-bold text-orange-400 uppercase tracking-widest border border-orange-500/20 bg-orange-500/5 px-2.5 py-1 rounded-full mb-4 group-hover:border-orange-500/50 transition-colors">
                Clan Leader
              </span>
              
              {/* MINECRAFT STYLE FLOATING OVERHEAD NAMETAG */}
              <div className="mb-4 bg-black/75 border border-neutral-800 px-3 py-1.5 rounded shadow-xl relative z-20 select-none animate-bounce duration-1000 group-hover:border-orange-500/40">
                <h3 className="text-xs font-black text-green-400 tracking-widest font-mono uppercase">
                  {leaderMember.name}
                </h3>
              </div>

              {/* RENDER MODEL KONTUR 3D */}
              <div className="h-48 flex items-end justify-center overflow-visible relative w-full transform group-hover:scale-105 transition-transform duration-300">
                <MinecraftSkin 
                  skinUrl={leaderMember.customSkinUrl ? leaderMember.customSkinUrl : getSrc(steveSkin)} 
                  width={140} 
                  height={180} 
                  isWalking={true} 
                />
              </div>

              <div className="mt-4 text-[10px] uppercase font-black tracking-widest text-slate-500 group-hover:text-orange-400 transition-colors">
                ✦ Click to view bio ✦
              </div>
            </div>
          </section>
        )}

        {/* ======================================================== */}
        {/* 2. SERVER INFO */}
        {/* ======================================================== */}
        <section id="server" className="py-16 md:py-24 border-y border-white/5 bg-black/50 backdrop-blur-md">
          <div className="max-w-5xl mx-auto px-4 text-center">
            <img src={mcProwSrc} alt="Minecraft ProwNetwork" className="w-full max-w-[250px] md:max-w-[400px] mx-auto object-contain mb-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-[#0f0f0f] border border-white/10 p-8 rounded-lg flex flex-col items-center justify-center group hover:border-orange-500 hover:bg-orange-500/5 transition-all">
                <svg className="w-8 h-8 text-orange-500 mb-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Bedrock IP Server</span>
                <span className="text-xl md:text-3xl font-black text-white tracking-widest group-hover:text-orange-400">
                  be.prownetwork.net
                </span>
              </div>
              
              <a href="https://discord.gg/8X4rz7eARM" target="_blank" rel="noreferrer" className="bg-[#0f0f0f] border border-white/10 p-8 rounded-lg flex flex-col items-center justify-center group hover:border-[#5865F2] hover:bg-[#5865F2]/5 transition-all">
                <svg className="w-8 h-8 text-[#5865F2] mb-4 fill-current" viewBox="0 0 24 24"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 h-.946 2.4189-2.1568 2.4189z"/></svg>
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">PN Official Community</span>
                <span className="text-xl md:text-3xl font-black text-white uppercase tracking-wider group-hover:text-[#5865F2]">
                  Join Prow Discord
                </span>
              </a>
            </div>
          </div>
        </section>

        {/* ======================================================== */}
        {/* 3. STATS GRID */}
        {/* ======================================================== */}
        <section className="py-12 md:py-20 px-4 w-full border-b border-white/5 bg-black/30 backdrop-blur-sm">
          <div className="max-w-5xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { value: "95%", label: "Win Rate", icon: <svg className="w-5 h-5 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> },
                { value: "S-Tier", label: "Clan Rank", icon: <svg className="w-5 h-5 mx-auto mb-2 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg> },
                { value: loadingStats ? "..." : `${members.length} Player`, label: "Active Members", icon: <svg className="w-5 h-5 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 0 0-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> },
                { value: "Full", label: "Kebebasan", icon: <svg className="w-5 h-5 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg> }
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

        {/* ======================================================== */}
        {/* PREMIUM DYNAMIC RATING & CHAT SYSTEM */}
        {/* ======================================================== */}
        <section className="py-16 md:py-24 px-4 w-full max-w-5xl mx-auto relative">
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 mb-8 gap-4">
            <div>
              <h2 className="text-3xl font-black uppercase tracking-tight">Evaluasi Kepuasan website</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Sistem Penilaian Global Real-Time</p>
            </div>
            
            <div className="flex items-center gap-4 bg-neutral-900/60 border border-white/10 px-5 py-3 rounded-xl backdrop-blur-md">
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

          <div className="bg-[#0a0a0a] border border-white/10 p-8 rounded-2xl flex flex-col items-center text-center max-w-xl mx-auto mb-12 shadow-xl">
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
                    className={`w-8 h-8 ${star <= (ratingHover || selectedStars) ? 'text-yellow-500 fill-current' : 'text-slate-700'}`} 
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
                    className="flex-shrink-0 w-72 bg-[#0f0f0f] border border-white/5 p-5 rounded-xl flex flex-col justify-between shadow-md relative group"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <h5 className="text-sm font-black text-white truncate max-w-[150px]">{item.name}</h5>
                        
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          {Array.from({ length: 5 }).map((_, idx) => (
                            <svg 
                              key={idx} 
                              className={`w-3 h-3 ${idx < item.stars ? 'text-yellow-500 fill-current' : 'text-neutral-800'}`} 
                              viewBox="0 0 24 24"
                            >
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
      {/* JENDELA POPUP MODAL PROFILE INTERACTIVE DISCORD CARD */}
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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRateModal(false)}></div>
          <div className="relative bg-[#0a0a0a] p-6 rounded-xl border border-white/10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
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
                  className="bg-black border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-orange-500"
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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAuthModal(false)}></div>
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
