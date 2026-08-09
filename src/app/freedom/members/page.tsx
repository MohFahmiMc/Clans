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

  // Warna pangkat badge (Dibuat solid tanpa shadow GPU berat)
  const getRoleColor = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'leader' || r === 'owner') {
      return 'text-red-400 border-red-500/40 bg-red-950/60';
    }
    if (r === 'admin' || r === 'co-leader') {
      return 'text-orange-400 border-orange-500/40 bg-orange-950/60';
    }
    return 'text-amber-300 border-amber-500/30 bg-neutral-900';
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
      <section className="max-w-6xl mx-auto py-8 md:py-14 px-3 sm:px-6 w-full mb-12">
        
        {/* HEADER SECTION (Ringan & Clean) */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-5 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-orange-500" />
              <span className="text-orange-400 text-[11px] font-extrabold tracking-widest uppercase">The Faces of Freedom</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tight text-white">
              CLAN <span className="text-orange-500">ROSTER</span>
            </h2>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-neutral-400 font-mono">Total: <strong className="text-orange-400 font-bold">{members.length}</strong></span>
            <div className="text-emerald-400 font-mono font-bold uppercase text-[10px] bg-neutral-900 px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${loadingMembers ? 'bg-orange-500' : errorMembers ? 'bg-red-500' : 'bg-emerald-500'}`} />
              {loadingMembers ? "CONNECTING..." : errorMembers ? "DB ERROR" : "CLUSTER0 ONLINE"}
            </div>
          </div>
        </div>

        {/* LOADING STATE - SKELETON CARDS */}
        {loadingMembers ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-20 bg-neutral-900/80 rounded-xl border border-white/5 p-3 flex items-center gap-3 animate-pulse">
                <div className="w-12 h-12 bg-neutral-800 rounded-lg shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-16 h-3 bg-neutral-800 rounded" />
                  <div className="w-28 h-4 bg-neutral-800 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : errorMembers ? (
          /* ERROR STATE */
          <div className="text-center py-10 px-4 bg-red-950/20 border border-red-500/30 rounded-xl max-w-lg mx-auto">
            <h3 className="text-red-400 font-bold text-sm uppercase mb-1">Gagal Sinkronisasi Database</h3>
            <p className="text-neutral-400 text-xs">
              Periksa variabel <code className="text-orange-400 bg-black px-1 rounded">MONGODB_URI</code> di dashboard Vercel kamu.
            </p>
          </div>
        ) : members.length === 0 ? (
          /* EMPTY STATE */
          <div className="text-center py-12 px-4 bg-neutral-900 border border-white/5 rounded-xl">
            <h3 className="text-orange-500 font-bold text-sm uppercase mb-1">Roster Kosong</h3>
            <p className="text-neutral-400 text-xs">Belum ada anggota yang terdaftar di database clan.</p>
          </div>
        ) : (
          /* MEMBER GRID - SIMPLICITY & MAXIMUM PERFORMANCE */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            {members.map((member, index) => {
              const roleStyle = getRoleColor(member.role);
              const bannerSrc = getBannerImage(member.specialRoles?.[0]);
              const currentSkinUrl = member.customSkinUrl ? member.customSkinUrl : getSrc(steveSkin);
              
              return (
                <div 
                  key={member._id || index} 
                  onClick={() => setSelectedMember(member)} 
                  className="group relative bg-neutral-900 border border-white/10 hover:border-orange-500/70 rounded-xl p-3 sm:p-4 cursor-pointer transition-colors duration-150 overflow-hidden flex items-center gap-3.5"
                >
                  {/* Subtle Background Banner (Dibuat ringan tanpa blur) */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-15 group-hover:opacity-25 transition-opacity duration-200 pointer-events-none"
                    style={{ backgroundImage: `url(${bannerSrc})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-900/90 to-transparent pointer-events-none" />

                  {/* Minecraft Skin Avatar (Pixel Art Render) */}
                  <div className="w-13 h-13 sm:w-14 sm:h-14 shrink-0 rounded-lg border border-white/20 group-hover:border-orange-400 transition-colors bg-neutral-950 overflow-hidden relative z-10">
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
                      {/* Hat Layer */}
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

                  {/* Details Content */}
                  <div className="flex-1 min-w-0 relative z-10 flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-[9px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded border ${roleStyle}`}>
                        {member.role}
                      </span>
                    </div>

                    <h3 className="text-base font-black tracking-tight text-white group-hover:text-orange-400 transition-colors truncate">
                      {member.name}
                    </h3>

                    {/* Special Roles Badges */}
                    {member.specialRoles && member.specialRoles.length > 0 && (
                      <div className="flex flex-wrap items-center gap-1 mt-1.5">
                        {member.specialRoles.map((role, i) => {
                          const iconSrc = getSpecialIcon(role);
                          if (!iconSrc) return null;
                          return (
                            <div 
                              key={i} 
                              className="flex items-center gap-1 bg-black/80 px-2 py-0.5 rounded border border-white/10"
                            >
                              <img 
                                src={iconSrc} 
                                alt={role} 
                                className="w-3 h-3 object-contain" 
                              />
                              <span className="text-[9px] text-neutral-300 font-bold uppercase tracking-wider leading-none">
                                {role}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
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
