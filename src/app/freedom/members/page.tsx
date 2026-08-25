"use client";

import React, { useState, useEffect } from 'react';
import Profile from '../../../components/Profile';

// IMPORT ICON ROLE MINECRAFT
import redstonerAsset from '../../../assets/redstoner.png';
import minerAsset from '../../../assets/miner.png';
import builderAsset from '../../../assets/builder.png';
import pvpAsset from '../../../assets/pvp.png';
import farmerAsset from '../../../assets/farmer.png';
import adventureAsset from '../../../assets/adventure.png';
import minecraftAsset from '../../../assets/Minecraft.png';

// IMPORT BACKGROUND BANNER CARD DEFAULT / ROLE
import cardRedstoner from '../../../assets/cardRedstoner.png';
import cardMiner from '../../../assets/cardMiner.png';
import cardBuilder from '../../../assets/cardBuilder.png';
import cardPvp from '../../../assets/cardPvp.png';
import cardFarmer from '../../../assets/cardFarmer.png';
import cardAdventure from '../../../assets/cardAdventure.png';
import cardDefault from '../../../assets/cardMinecraft.png';

// IMPORT GAMBAR SKIN SEBAGAI FALLBACK DEFAULT
import steveSkin from '../../../assets/steve.png';

interface Member { 
  _id?: string;
  name: string; 
  role: string; 
  specialRoles: string[]; 
  description?: string; 
  customSkinUrl?: string | null;
  bannerUrl?: string | null;
  customBannerUrl?: string | null;
  customTheme?: string | null;
  themeColor?: string | null;
  accentColor?: string | null;
  order?: number;
}

// Sub-komponen ringan untuk menangani loading skin avatar dengan skeleton screen
function SkinAvatarItem({ currentSkinUrl, memberName }: { currentSkinUrl: string; memberName: string }) {
  const [isSkinLoaded, setIsSkinLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = currentSkinUrl;
    if (img.complete) {
      setIsSkinLoaded(true);
    } else {
      img.onload = () => setIsSkinLoaded(true);
      img.onerror = () => setIsSkinLoaded(true);
    }
  }, [currentSkinUrl]);

  return (
    <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-xl border-2 border-white/15 group-hover:border-orange-400 transition-colors shadow-lg overflow-hidden bg-neutral-900 relative">
      {!isSkinLoaded && (
        <div className="absolute inset-0 bg-neutral-900 animate-pulse z-10 flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800" />
        </div>
      )}
      <div 
        className={`w-full h-full relative transition-opacity duration-300 ${isSkinLoaded ? 'opacity-100' : 'opacity-0'}`}
        style={{ imageRendering: 'pixelated' }}
      >
        {/* Base Skin Layer */}
        <img 
          src={currentSkinUrl} 
          alt={memberName} 
          loading="lazy"
          decoding="async"
          className="absolute max-w-none"
          style={{ 
            width: '800%', 
            height: 'auto', 
            left: '-100%', 
            top: '-100%' 
          }} 
        />
        {/* Hat / Outer Skin Layer */}
        <img 
          src={currentSkinUrl} 
          alt="" 
          loading="lazy"
          decoding="async"
          className="absolute max-w-none"
          style={{ 
            width: '800%', 
            height: 'auto', 
            left: '-500%', 
            top: '-100%' 
          }} 
        />
      </div>
    </div>
  );
}

// Sub-komponen ringan untuk kartu member dengan skeleton banner & tema kustom
function MemberCardItem({ 
  member, 
  index, 
  setSelectedMember, 
  getRoleColor, 
  getBannerImage, 
  getSrc, 
  getSpecialIcon 
}: {
  member: Member;
  index: number;
  setSelectedMember: (member: Member) => void;
  getRoleColor: (role: string) => string;
  getBannerImage: (specialRole: string | undefined) => string;
  getSrc: (asset: any) => string;
  getSpecialIcon: (specialRole: string) => string;
}) {
  const [isBannerLoaded, setIsBannerLoaded] = useState(false);
  const roleStyle = getRoleColor(member.role);

  // LOGIKA TEMA KUSTOM SAMA SEPERTI DI PROFILE.TSX
  const userTheme = member.customTheme || member.themeColor || member.accentColor;
  
  const getCustomBackgroundStyle = () => {
    if (!userTheme || userTheme.trim() === '') {
      return { background: '#0a0a0c' };
    }
    
    const theme = userTheme.trim();
    if (theme.includes('gradient')) {
      return { background: theme };
    }
    
    return {
      background: `linear-gradient(135deg, ${theme} 0%, #0a0a0c 85%)`
    };
  };

  // Prioritaskan banner custom player jika ada, jika tidak ada baru gunakan banner bawaan role
  const bannerSrc = member.bannerUrl || member.customBannerUrl || getBannerImage(member.specialRoles?.[0]);
  const currentSkinUrl = member.customSkinUrl ? member.customSkinUrl : getSrc(steveSkin);

  useEffect(() => {
    if (bannerSrc) {
      const img = new Image();
      img.src = bannerSrc;
      if (img.complete) {
        setIsBannerLoaded(true);
      } else {
        img.onload = () => setIsBannerLoaded(true);
        img.onerror = () => setIsBannerLoaded(true);
      }
    } else {
      setIsBannerLoaded(true);
    }
  }, [bannerSrc]);

  return (
    <div 
      key={member._id || index} 
      onClick={() => setSelectedMember(member)} 
      className="group relative overflow-hidden p-4 md:p-5 rounded-2xl border border-white/10 hover:border-orange-500/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(234,88,12,0.2)] cursor-pointer flex items-center gap-4"
      style={getCustomBackgroundStyle()}
    >
      {/* Skeleton Banner Background saat asset belum selesai terdownload */}
      {!isBannerLoaded && (
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-900 via-neutral-800 to-neutral-900 animate-pulse opacity-40" />
      )}

      {/* Banner Image Background Overlay */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-all duration-500 ease-out ${
          isBannerLoaded ? 'opacity-25 group-hover:opacity-45 group-hover:scale-105' : 'opacity-0'
        }`}
        style={{ backgroundImage: `url(${bannerSrc})` }}
      />
      
      {/* Dynamic Gradient Mask agar teks tetap terbaca dengan jelas di atas tema kustom */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent" />

      {/* Card Content */}
      <div className="relative z-10 flex items-center gap-4 w-full min-w-0">
        
        {/* Minecraft Skin Avatar dengan skeleton handler */}
        <SkinAvatarItem currentSkinUrl={currentSkinUrl} memberName={member.name} />
        
        {/* Details Column */}
        <div className="flex-1 min-w-0 flex flex-col justify-center">
          <div className="mb-1">
            <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest inline-block px-2 py-0.5 rounded-md border ${roleStyle}`}>
              {member.role}
            </span>
          </div>
          
          <h3 className="text-base md:text-lg font-black tracking-tight text-white group-hover:text-orange-400 transition-colors truncate">
            {member.name}
          </h3>
          
          {/* Special Roles / Skills Icons */}
          {member.specialRoles && member.specialRoles.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              {member.specialRoles.map((role, i) => {
                const iconSrc = getSpecialIcon(role);
                if (!iconSrc) return null;
                return (
                  <div 
                    key={i} 
                    className="flex items-center gap-1 bg-black/60 px-2 py-0.5 rounded-md border border-white/10 backdrop-blur-md"
                    title={role}
                  >
                    <img 
                      src={iconSrc} 
                      alt={role} 
                      loading="lazy"
                      decoding="async"
                      className="w-3.5 h-3.5 object-contain" 
                    />
                    <span className="text-[9px] text-slate-300 font-semibold uppercase tracking-wider leading-none">
                      {role}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errorMembers, setErrorMembers] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  // Helper fungsi gambar
  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');

  const redstonerSrc = getSrc(redstonerAsset);
  const minerSrc = getSrc(minerAsset);
  const builderSrc = getSrc(builderAsset);
  const pvpSrc = getSrc(pvpAsset);
  const farmerSrc = getSrc(farmerAsset);
  const adventureSrc = getSrc(adventureAsset);
  const minecraftSrc = getSrc(minecraftAsset);

  // Fetch Data
  useEffect(() => {
    fetch(`/api/members?t=${new Date().getTime()}`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal membaca database");
        return res.json();
      })
      .then((data: Member[]) => {
        const sortedData = data.sort((a, b) => (a.order || 0) - (b.order || 0));
        setMembers(sortedData);
        setLoadingMembers(false);
        setErrorMembers(false);
      })
      .catch((err) => {
        console.error(err);
        setErrorMembers(true);
        setLoadingMembers(false);
      });
  }, []);

  // Warna pangkat badge
  const getRoleColor = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'leader' || r === 'owner') {
      return 'text-red-400 border-red-500/40 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
    }
    if (r === 'admin' || r === 'co-leader') {
      return 'text-orange-400 border-orange-500/40 bg-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
    }
    return 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10 shadow-[0_0_10px_rgba(234,179,8,0.15)]';
  };

  // Ikon keahlian
  const getSpecialIcon = (specialRole: string) => {
    switch (specialRole?.toLowerCase()) {
      case 'redstoner': return redstonerSrc;
      case 'miner': return minerSrc;
      case 'builder': return builderSrc;
      case 'pvp': return pvpSrc;
      case 'farmer': return farmerSrc;
      case 'adventure': return adventureSrc;
      default: return minecraftSrc;
    }
  };

  // Latar belakang banner card fallback
  const getBannerImage = (specialRole: string | undefined) => {
    switch (specialRole?.toLowerCase()) {
      case 'redstoner': return getSrc(cardRedstoner);
      case 'miner': return getSrc(cardMiner);
      case 'builder': return getSrc(cardBuilder);
      case 'pvp': return getSrc(cardPvp);
      case 'farmer': return getSrc(cardFarmer);
      case 'adventure': return getSrc(cardAdventure);
      default: return getSrc(cardDefault);
    }
  };

  return (
    <>
      <section className="max-w-7xl mx-auto py-12 md:py-20 px-4 sm:px-6 lg:px-8 w-full mb-12">
        {/* HEADER SECTION */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-8 md:mb-12 gap-4 pb-6 border-b border-white/10">
          <div>
            <span className="text-orange-500 text-xs md:text-sm font-black tracking-widest uppercase flex items-center gap-2 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 inline-block animate-ping" />
              The Faces of Freedom
            </span>
            <h2 className="text-3xl sm:text-5xl md:text-6xl font-black uppercase tracking-tight text-white drop-shadow-md">
              CLAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-400">ROSTER</span>
            </h2>
          </div>
          
          {/* Status Indicator */}
          <div className="text-green-400 font-bold uppercase tracking-widest text-[10px] md:text-xs bg-neutral-900/80 backdrop-blur-md px-3.5 py-2 rounded-full border border-white/10 flex items-center gap-2.5 shadow-inner">
            <span className={`w-2.5 h-2.5 rounded-full ${loadingMembers ? 'bg-orange-500 animate-pulse' : errorMembers ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
            <span className="font-mono">{loadingMembers ? "CONNECTING..." : errorMembers ? "DB ERROR" : "MONGODB ONLINE"}</span>
          </div>
        </div>

        {/* LOADING STATE */}
        {loadingMembers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {[...Array(8)].map((_, i) => (
              <div 
                key={i} 
                className="relative overflow-hidden p-4 md:p-5 rounded-2xl border border-white/10 bg-neutral-950/90 shadow-xl flex items-center gap-4"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent animate-pulse" />
                <div className="w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-xl border border-white/15 bg-neutral-900 relative overflow-hidden animate-pulse">
                  <div className="w-full h-full bg-gradient-to-br from-neutral-800 via-neutral-900 to-neutral-800" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-center gap-2 relative z-10">
                  <div className="w-16 h-3.5 rounded-md bg-neutral-800/80 border border-white/5 animate-pulse" />
                  <div className="w-28 md:w-36 h-5 rounded-md bg-neutral-800 animate-pulse" />
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-16 h-4 rounded-md bg-neutral-900 border border-white/10 animate-pulse" />
                    <div className="w-12 h-4 rounded-md bg-neutral-900 border border-white/10 animate-pulse" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : errorMembers ? (
          /* ERROR STATE */
          <div className="text-center py-12 px-4 bg-red-950/30 border border-red-500/30 rounded-2xl backdrop-blur-sm max-w-2xl mx-auto">
            <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-full flex items-center justify-center mx-auto mb-3 text-red-500 font-bold text-xl">
              !
            </div>
            <h3 className="text-red-400 font-bold text-base uppercase tracking-wider mb-2">Gagal Sinkronisasi Database</h3>
            <p className="text-slate-400 text-xs md:text-sm leading-relaxed max-w-md mx-auto">
              Periksa kembali string koneksi <code className="text-orange-400 bg-black/50 px-1.5 py-0.5 rounded font-mono">MONGODB_URI</code> di environment variables project kamu.
            </p>
          </div>
        ) : members.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-16 px-4 bg-neutral-900/40 border border-white/5 rounded-2xl backdrop-blur-sm">
            <h3 className="text-orange-500 font-bold text-sm uppercase tracking-widest mb-1">Roster Kosong</h3>
            <p className="text-slate-400 text-xs">Belum ada data member yang terdaftar di database.</p>
          </div>
        ) : (
          /* MEMBER GRID */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 md:gap-6">
            {members.map((member, index) => (
              <MemberCardItem
                key={member._id || index}
                member={member}
                index={index}
                setSelectedMember={setSelectedMember}
                getRoleColor={getRoleColor}
                getBannerImage={getBannerImage}
                getSrc={getSrc}
                getSpecialIcon={getSpecialIcon}
              />
            ))}
          </div>
        )}
      </section>

      {/* MODAL PROFILE */}
      {selectedMember && (
        <Profile 
          member={selectedMember} 
          onClose={() => setSelectedMember(null)} 
          getRoleColor={getRoleColor}
          getSpecialIcon={getSpecialIcon}
        />
      )}
    </>
  );
}
