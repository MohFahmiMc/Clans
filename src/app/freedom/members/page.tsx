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

// IMPORT BACKGROUND BANNER CARD 
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
  order?: number;
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
      return 'text-red-400 border-red-500/50 bg-red-950/80 shadow-[0_0_12px_rgba(239,68,68,0.3)]';
    }
    if (r === 'admin' || r === 'co-leader') {
      return 'text-orange-400 border-orange-500/50 bg-orange-950/80 shadow-[0_0_12px_rgba(249,115,22,0.3)]';
    }
    return 'text-amber-300 border-amber-500/40 bg-neutral-900/90 shadow-[0_0_10px_rgba(245,158,11,0.2)]';
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

  // Latar belakang banner card
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
      <section className="max-w-7xl mx-auto py-10 md:py-16 px-4 sm:px-6 lg:px-8 w-full mb-16">
        
        {/* HEADER & CONTROL BAR */}
        <div className="bg-neutral-950/80 border border-white/10 rounded-3xl p-6 md:p-8 mb-10 backdrop-blur-xl relative overflow-hidden shadow-2xl">
          {/* Subtle Glow Background Accent */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                <span className="text-orange-500 text-xs font-black tracking-widest uppercase">Official Clan Roster</span>
              </div>
              <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white">
                CLAN <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-500">ROSTER</span>
              </h2>
              <p className="text-neutral-400 text-xs sm:text-sm mt-1 max-w-xl">
                Daftar anggota resmi dan jajaran petinggi clan. Klik pada kartu member untuk melihat info detail profile.
              </p>
            </div>

            {/* Stats & Status Bar */}
            <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 shrink-0">
              <div className="bg-neutral-900/90 border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                <span className="text-neutral-400 text-[11px] font-bold uppercase tracking-wider">Total Roster</span>
                <span className="text-orange-400 font-mono font-black text-base">{members.length}</span>
              </div>

              <div className="bg-neutral-900/90 border border-white/10 px-4 py-2.5 rounded-2xl flex items-center gap-3">
                <span className={`w-2.5 h-2.5 rounded-full ${loadingMembers ? 'bg-orange-500 animate-pulse' : errorMembers ? 'bg-red-500' : 'bg-emerald-500 shadow-[0_0_10px_#10b981]'}`} />
                <span className="text-neutral-300 text-[11px] font-mono font-bold tracking-wider uppercase">
                  {loadingMembers ? "CONNECTING..." : errorMembers ? "DB ERROR" : "CLUSTER0 ONLINE"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LOADING STATE - SKELETON CARDS */}
        {loadingMembers ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-neutral-950 border border-white/5 rounded-2xl overflow-hidden animate-pulse h-80 flex flex-col justify-between p-4">
                <div className="h-28 bg-neutral-900 rounded-xl w-full" />
                <div className="space-y-3 mt-4">
                  <div className="h-5 bg-neutral-900 rounded w-3/4" />
                  <div className="h-4 bg-neutral-900 rounded w-1/2" />
                </div>
                <div className="h-8 bg-neutral-900 rounded-lg w-full mt-auto" />
              </div>
            ))}
          </div>
        ) : errorMembers ? (
          /* ERROR STATE */
          <div className="text-center py-16 px-6 bg-red-950/20 border border-red-500/30 rounded-3xl backdrop-blur-md max-w-xl mx-auto shadow-2xl">
            <div className="w-14 h-14 bg-red-500/10 border border-red-500/30 rounded-2xl flex items-center justify-center mx-auto mb-4 text-red-500 font-black text-2xl">
              !
            </div>
            <h3 className="text-red-400 font-black text-lg uppercase tracking-wider mb-2">Gagal Sinkronisasi Database</h3>
            <p className="text-neutral-400 text-xs sm:text-sm leading-relaxed">
              Koneksi ke database terputus. Pastikan variabel <code className="text-orange-400 bg-black/60 px-2 py-0.5 rounded font-mono">MONGODB_URI</code> diatur dengan benar di Vercel/Environment.
            </p>
          </div>
        ) : members.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-20 px-6 bg-neutral-950/60 border border-white/5 rounded-3xl backdrop-blur-md max-w-lg mx-auto">
            <h3 className="text-orange-500 font-black text-base uppercase tracking-widest mb-1">Roster Kosong</h3>
            <p className="text-neutral-400 text-xs">Belum ada anggota yang terdaftar di database clan.</p>
          </div>
        ) : (
          /* MEMBER GRID - HIGH RESOLUTION DESKTOP FRIENDLY */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {members.map((member, index) => {
              const roleStyle = getRoleColor(member.role);
              const bannerSrc = getBannerImage(member.specialRoles?.[0]);
              const currentSkinUrl = member.customSkinUrl ? member.customSkinUrl : getSrc(steveSkin);
              
              return (
                <div 
                  key={member._id || index} 
                  onClick={() => setSelectedMember(member)} 
                  className="group relative bg-neutral-950 border border-white/10 hover:border-orange-500/60 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_16px_36px_rgba(234,88,12,0.18)] cursor-pointer flex flex-col justify-between"
                >
                  {/* TOP BANNER SECTION */}
                  <div className="relative h-28 w-full overflow-hidden bg-neutral-900 shrink-0">
                    <div 
                      className="absolute inset-0 bg-cover bg-center opacity-50 group-hover:opacity-75 group-hover:scale-110 transition-all duration-500 ease-out"
                      style={{ backgroundImage: `url(${bannerSrc})` }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/20 to-black/40" />
                    
                    {/* Role Badge Pinned Top-Right */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border backdrop-blur-md ${roleStyle}`}>
                        {member.role}
                      </span>
                    </div>
                  </div>

                  {/* MAIN CARD BODY */}
                  <div className="px-5 pb-5 pt-0 relative flex-1 flex flex-col justify-between">
                    <div>
                      {/* Avatar Overlapping Banner */}
                      <div className="flex items-end justify-between -mt-10 mb-3 relative z-10">
                        <div className="w-16 h-16 rounded-2xl border-4 border-neutral-950 bg-neutral-900 overflow-hidden shadow-2xl group-hover:border-orange-500 transition-colors shrink-0 relative">
                          <div 
                            className="w-full h-full relative"
                            style={{ imageRendering: 'pixelated' }}
                          >
                            {/* Base Layer */}
                            <img 
                              src={currentSkinUrl} 
                              alt={member.name} 
                              className="absolute max-w-none"
                              style={{ 
                                width: '800%', 
                                height: 'auto', 
                                left: '-100%', 
                                top: '-100%' 
                              }} 
                            />
                            {/* Hat/Outer Layer */}
                            <img 
                              src={currentSkinUrl} 
                              alt="" 
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
                      </div>

                      {/* Gamertag Name */}
                      <h3 className="text-lg font-black tracking-tight text-white group-hover:text-orange-400 transition-colors truncate mb-1">
                        {member.name}
                      </h3>
                    </div>

                    {/* Special Roles Badges */}
                    <div className="pt-3 border-t border-white/5 mt-4">
                      {member.specialRoles && member.specialRoles.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {member.specialRoles.map((role, i) => {
                            const iconSrc = getSpecialIcon(role);
                            if (!iconSrc) return null;
                            return (
                              <div 
                                key={i} 
                                className="flex items-center gap-1.5 bg-neutral-900/90 px-2.5 py-1 rounded-lg border border-white/10 backdrop-blur-md group-hover:border-white/20 transition-colors"
                                title={role}
                              >
                                <img 
                                  src={iconSrc} 
                                  alt={role} 
                                  className="w-3.5 h-3.5 object-contain" 
                                />
                                <span className="text-[10px] text-neutral-300 font-bold uppercase tracking-wider leading-none">
                                  {role}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <span className="text-[10px] text-neutral-600 uppercase tracking-widest font-bold">Standard Member</span>
                      )}
                    </div>
                  </div>

                  {/* Bottom Hover Glow Bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-transparent via-orange-500/0 to-transparent group-hover:via-orange-500 transition-all duration-500" />
                </div>
              );
            })}
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
