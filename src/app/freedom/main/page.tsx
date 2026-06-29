"use client";

import React, { useState, useEffect } from 'react';
import logoPnAsset from '../../../assets/logo_pn.png';
import mcProwAsset from '../../../assets/mc_prow.png';
import backgroundImage from '../../../assets/background.png';
import MinecraftSkin from '../../../components/MinecraftSkin';
import Profile from '../../../components/Profile'; // IMPORT MODAL PROFILE UTAMA

// IMPORT GAMBAR SKIN SEBAGAI FALLBACK DEFAULT JIKA BELUM SET SKIN
import steveSkin from '../../../assets/steve.png';

// IMPORT ICON ROLE PERAN MINECRAFT UNTUK SINKRONISASI MODAL PROFILE
import redstonerAsset from '../../../assets/redstoner.png';
import minerAsset from '../../../assets/miner.png';
import builderAsset from '../../../assets/builder.png';
import pvpAsset from '../../../assets/pvp.png';
import farmerAsset from '../../../assets/farmer.png';
import adventureAsset from '../../../assets/adventure.png';

interface Member {
  _id?: string;
  name: string;
  role: string;
  specialRoles: string[];
  description?: string;
  customSkinUrl?: string | null;
  order?: number;
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

  // System States & Modal Profile Interactive
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [leaderMember, setLeaderMember] = useState<Member | null>(null);
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

  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');
  const bgImgSrc = getSrc(backgroundImage);

  // HELPER UNTUK MENYESUAIKAN WARNA JABATAN PADA MODAL PROFILE
  const getRoleColor = (role: string) => {
    switch (role) {
      case 'Leader': return 'border-red-500/30 bg-red-500/5 text-red-400';
      case 'Co-Leader': return 'border-orange-500/30 bg-orange-500/5 text-orange-400';
      case 'Admin': return 'border-purple-500/30 bg-purple-500/5 text-purple-400';
      case 'Staff': return 'border-blue-500/30 bg-blue-500/5 text-blue-400';
      case 'Core Team': return 'border-green-500/30 bg-green-500/5 text-green-400';
      default: return 'border-white/10 bg-white/5 text-slate-400';
    }
  };

  // HELPER UNTUK SINKRONISASI ICON DI DALAM POPUP CARD INDIVIDU
  const getSpecialIcon = (specialRole: string) => {
    const roleKey = specialRole.toLowerCase().trim();
    if (roleKey === 'redstoner') return getSrc(redstonerAsset);
    if (roleKey === 'miner') return getSrc(minerAsset);
    if (roleKey === 'builder') return getSrc(builderAsset);
    if (roleKey === 'pvp') return getSrc(pvpAsset);
    if (roleKey === 'farmer') return getSrc(farmerAsset);
    if (roleKey === 'adventure') return getSrc(adventureAsset);
    return null;
  };

  const fetchDashboardData = async () => {
    setLoadingStats(true);
    try {
      // Ambil Data Roster Member
      const resMembers = await fetch('/api/members?t=' + new Date().getTime());
      if (resMembers.ok) {
        const dataMembers: Member[] = await resMembers.json();
        const sorted = dataMembers.sort((a, b) => (a.order || 0) - (b.order || 0));
        setMembers(sorted);
        
        // Cari Leader untuk di-showcase di barisan depan banner utama
        const foundLeader = sorted.find(m => m.role === 'Leader');
        if (foundLeader) setLeaderMember(foundLeader);
      }

      // Ambil Data Ulasan / Rating Review
      const resRates = await fetch('/api/ratings?t=' + new Date().getTime());
      if (resRates.ok) {
        const dataRates = await resRates.json();
        setRatings(dataRates);
      }
    } catch (err) {
      console.error("Gagal melakukan penarikan data Cloud MongoDB:", err);
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleAddRating = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStars === 0 || !reviewerName.trim() || !reviewerMessage.trim()) {
      alert("Harap pilih bintang dan isi semua kolom ulasan!");
      return;
    }
    setSubmittingRate(true);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reviewerName.trim(),
          message: reviewerMessage.trim(),
          stars: selectedStars
        })
      });
      if (res.ok) {
        setShowRateModal(false);
        setReviewerName('');
        setReviewerMessage('');
        setSelectedStars(0);
        fetchDashboardData();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingRate(false);
    }
  };

  const handleDeleteRating = async (id: string) => {
    if (!confirm("Hapus ulasan review ini secara permanen?")) return;
    try {
      const res = await fetch('/api/ratings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: adminPassword })
      });
      if (res.ok) {
        fetchDashboardData();
      } else {
        alert("Gagal menghapus! Password otentikasi salah.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const verifyAdminAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPassword.trim()) {
      setShowAuthModal(false);
      alert("Sesi otentikasi aktif. Anda sekarang dapat mengelola kolom rating ulasan.");
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative pb-20 overflow-x-hidden">
      {/* Background Wallpaper Efek Blend */}
      {bgImgSrc && (
        <div className="fixed inset-0 bg-cover bg-center opacity-[0.12] z-0 pointer-events-none mix-blend-lighten filter blur-[2px]" style={{ backgroundImage: `url(${bgImgSrc})` }} />
      )}
      <div className="fixed inset-0 bg-gradient-to-b from-[#050505]/40 via-[#050505]/90 to-[#050505] z-0 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 pt-12 relative z-10">
        
        {/* ======================================================== */}
        {/* HERO HEADER SECTION BANNER */}
        {/* ======================================================== */}
        <header className="flex flex-col md:flex-row items-center justify-between gap-8 border-b border-white/5 pb-12 mb-16">
          <div className="flex flex-col gap-4 max-w-2xl text-center md:text-left">
            <div className="flex items-center gap-3 justify-center md:justify-start">
              <img src={getSrc(logoPnAsset)} alt="ProwNetwork" className="w-6 h-6 object-contain" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">Official Core Clan</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none text-white">
              FREEDOM <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-red-600">CLAN</span>
            </h1>
            <p className="text-slate-400 text-sm md:text-base leading-relaxed font-medium">
              Selamat datang di markas pusat pangkalan data resmi Freedom Clan. Kami adalah perserikatan klan Minecraft berdaulat tinggi yang berfokus pada pengembangan taktik perang PvP, rekayasa struktur arsitektur megah, serta perancangan sistem mekanika redstone otomatis.
            </p>
            <div className="flex items-center gap-2 bg-black/60 p-3 rounded-xl border border-white/5 w-fit mx-auto md:mx-0 shadow-inner backdrop-blur-sm">
              <img src={getSrc(mcProwAsset)} alt="Minecraft Server" className="w-5 h-5 object-contain" />
              <span className="text-xs font-mono font-bold tracking-wider text-slate-300 select-all">Server IP: play.prownetwork.net</span>
            </div>
          </div>

          {/* SHOWCASE UTAMA CHARACTER 3D LEADER (BISA DIKLIK) */}
          {leaderMember && (
            <div 
              onClick={() => setSelectedMember(leaderMember)}
              className="flex flex-col items-center bg-gradient-to-b from-orange-500/10 via-transparent to-transparent border border-white/10 p-6 rounded-2xl relative group cursor-pointer transition-all hover:border-orange-500/40 hover:shadow-[0_0_40px_rgba(234,88,12,0.15)] hover:scale-[1.03]"
              title={`Klik untuk melihat detail profil lengkap ${leaderMember.name}`}
            >
              <div className="absolute top-3 right-3 text-[9px] uppercase font-black text-orange-400 bg-orange-500/10 border border-orange-500/20 px-2 py-0.5 rounded-md tracking-widest opacity-60 group-hover:opacity-100 transition-opacity">
                Klik View Profile
              </div>
              <div className="w-40 h-52 flex items-end drop-shadow-[0_0_25px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_0_30px_rgba(234,88,12,0.4)] transition-all">
                <MinecraftSkin 
                  skinUrl={leaderMember.customSkinUrl ? leaderMember.customSkinUrl : getSrc(steveSkin)} 
                  width={160} 
                  height={200} 
                  isWalking={true} 
                />
              </div>
              <h2 className="text-base font-black text-white mt-4 uppercase tracking-wider">{leaderMember.name}</h2>
              <span className="text-[10px] font-black text-red-500 uppercase tracking-widest mt-0.5">Clan Leader</span>
            </div>
          )}
        </header>

        {/* ======================================================== */}
        {/* CORE INTERACTIVE ROSTER FEATURING 3D MODELS SCREEN */}
        {/* ======================================================== */}
        <section className="mb-20">
          <div className="flex justify-between items-end mb-8 border-b border-white/5 pb-3">
            <div>
              <h2 className="text-xl md:text-2xl font-black uppercase tracking-tight text-white">Struktur Elit Anggota</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest mt-0.5">Klik pada model karakter untuk membuka berkas data profil</p>
            </div>
            <span className="text-xs font-bold text-orange-400 bg-orange-500/5 px-3 py-1 rounded-full border border-orange-500/10">
              {members.length} Player Terdaftar
            </span>
          </div>

          {loadingStats ? (
            <div className="text-center py-20 text-xs text-slate-500 uppercase tracking-widest font-bold animate-pulse">
              Sinkronisasi data visualisasi 3D MongoDB...
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-16 text-xs text-slate-600 border border-dashed border-white/5 rounded-xl">
              Belum ada data roster player yang dimasukkan ke database admin.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {members.map((member) => (
                <div
                  key={member._id}
                  onClick={() => setSelectedMember(member)}
                  className="bg-black/40 border border-white/5 hover:border-orange-500/30 p-4 rounded-xl flex flex-col items-center justify-between relative group cursor-pointer transition-all hover:bg-black/80 hover:scale-[1.03] shadow-md hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)]"
                  title={`Lihat Profil ${member.name}`}
                >
                  {/* Penanda Hover Minimalis */}
                  <div className="absolute inset-0 border border-orange-500 opacity-0 group-hover:opacity-10 rounded-xl transition-opacity pointer-events-none" />
                  
                  {/* 3D Skin Renderer Model */}
                  <div className="w-24 h-36 flex items-end drop-shadow-md group-hover:drop-shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all transform group-hover:scale-105 duration-300">
                    <MinecraftSkin 
                      skinUrl={member.customSkinUrl ? member.customSkinUrl : getSrc(steveSkin)} 
                      width={100} 
                      height={140} 
                      isWalking={false} 
                    />
                  </div>

                  {/* Detail Teks Identitas Singkat */}
                  <div className="text-center mt-3 w-full border-t border-white/5 pt-2.5">
                    <h4 className="text-xs font-black text-white uppercase tracking-wider truncate group-hover:text-orange-400 transition-colors">
                      {member.name}
                    </h4>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* ======================================================== */}
        {/* FEEDBACK REVIEW & RATING SYSTEM SECTION */}
        {/* ======================================================== */}
        <section className="bg-[#0a0a0b]/80 border border-white/5 p-6 md:p-8 rounded-2xl shadow-xl backdrop-blur-md">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-black uppercase tracking-wider text-slate-100">Ulasan & Rating Komunitas</h2>
              <p className="text-xs text-slate-500 mt-0.5">Pesan testimonial dan tingkat kepuasan pelayanan operasional klan</p>
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <button onClick={() => setShowRateModal(true)} className="flex-1 sm:flex-none text-xs font-black uppercase tracking-widest bg-orange-600 hover:bg-orange-500 px-4 py-2.5 rounded-lg transition-colors shadow shadow-orange-600/10">
                Berikan Rating
              </button>
              <button onClick={() => setShowAuthModal(true)} className="text-xs font-bold border border-white/10 bg-white/5 hover:bg-white/10 px-3 py-2.5 rounded-lg transition-colors text-slate-400 hover:text-white">
                ⚙️ Admin Auth
              </button>
            </div>
          </div>

          {ratings.length === 0 ? (
            <p className="text-center py-10 text-xs text-slate-600 uppercase tracking-widest">Belum ada ulasan bintang yang dikirimkan.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2">
              {ratings.map((rate) => (
                <div key={rate._id} className="bg-black/50 border border-white/5 p-4 rounded-xl relative group flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-black text-orange-400 uppercase tracking-wider break-all">{rate.name}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-xs ${i < rate.stars ? 'text-yellow-500' : 'text-neutral-700'}`}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-slate-300 text-xs leading-relaxed font-medium">"{rate.message}"</p>
                  </div>
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-white/[0.03]">
                    <span className="text-[9px] text-neutral-600 font-mono">{new Date(rate.createdAt).toLocaleDateString('id-ID')}</span>
                    {adminPassword && (
                      <button onClick={() => handleDeleteRating(rate._id)} className="text-[9px] text-red-400 hover:underline uppercase font-bold tracking-wider">
                        Hapus Ulasan
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
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
      {/* MODAL INPUT RATING / BERIKAN RATE BARU */}
      {/* ======================================================== */}
      {showRateModal && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowRateModal(false)}></div>
          <div className="relative bg-[#0a0a0b] p-6 rounded-2xl border border-white/10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-150">
            <h3 className="text-sm font-black text-white uppercase tracking-wider border-b border-white/5 pb-2 mb-4">Berikan Ulasan Clan</h3>
            <form onSubmit={handleAddRating} className="flex flex-col gap-4">
              
              {/* Star Picker Selection */}
              <div className="flex flex-col gap-1 items-center py-2 bg-black/40 rounded-xl border border-white/5">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tingkat Kepuasan</label>
                <div className="flex gap-1.5 mt-1">
                  {Array.from({ length: 5 }).map((_, i) => {
                    const starVal = i + 1;
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedStars(starVal)}
                        onMouseEnter={() => setRatingHover(starVal)}
                        onMouseLeave={() => setRatingHover(0)}
                        className="text-2xl transition-transform active:scale-95 focus:outline-none"
                      >
                        <span className={(ratingHover || selectedStars) >= starVal ? 'text-yellow-500' : 'text-neutral-700'}>★</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Nama Pengulas</label>
                <input type="text" value={reviewerName} onChange={e => setReviewerName(e.target.value)} placeholder="Masukkan nama atau nickname anda..." className="bg-black border border-white/10 p-3 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500 font-bold" required />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400">Isi Pesan Testimoni</label>
                <textarea value={reviewerMessage} onChange={e => setReviewerMessage(e.target.value)} placeholder="Tulis kritik, saran, atau testimonial unik anda..." className="bg-black border border-white/10 p-3 rounded-lg h-24 text-xs text-slate-300 leading-relaxed focus:outline-none focus:border-orange-500 resize-none" required />
              </div>

              <div className="flex gap-2 mt-2">
                <button type="submit" disabled={submittingRate} className="flex-1 bg-orange-600 hover:bg-orange-500 font-black py-3 rounded-lg text-xs uppercase tracking-widest transition-all">
                  {submittingRate ? 'Mengirimkan...' : 'Kirim Ulasan'}
                </button>
                <button type="button" onClick={() => setShowRateModal(false)} className="bg-neutral-800 hover:bg-neutral-700 font-bold px-4 rounded-lg text-xs uppercase transition-colors">
                  Batal
                </button>
              </div>
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
