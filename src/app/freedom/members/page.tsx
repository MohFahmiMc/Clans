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

interface Member { 
  name: string; 
  role: string; 
  specialRoles: string[]; 
  description?: string; 
  customSkinUrl?: string | null; 
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

  // Mengambil data langsung dari endpoint API MongoDB Route
  useEffect(() => {
    fetch(`/api/members?t=${new Date().getTime()}`, { cache: 'no-store' })
      .then((res) => {
        if (!res.ok) throw new Error("Gagal membaca database");
        return res.json();
      })
      .then((data) => {
        setMembers(data);
        setLoadingMembers(false);
        setErrorMembers(false);
      })
      .catch((err) => {
        console.error(err);
        setErrorMembers(true);
        setLoadingMembers(false);
      });
  }, []);

  // Warna pangkat badge kontainer
  const getRoleColor = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'leader' || r === 'owner') return 'text-red-500 border-red-500/30 bg-red-500/10';
    if (r === 'admin' || r === 'co-leader') return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
    return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
  };

  // Ikon keahlian di samping nama gamertag
  const getSpecialIcon = (specialRole: string) => {
    switch (specialRole) {
      case 'redstoner': return redstonerSrc;
      case 'miner': return minerSrc;
      case 'builder': return builderSrc;
      case 'pvp': return pvpSrc;
      case 'farmer': return farmerSrc;
      case 'adventure': return adventureSrc;
      default: return minecraftSrc;
    }
  };

  // Latar belakang kontainer box member sesuai keahlian utama
  const getBannerImage = (specialRole: string | undefined) => {
    switch (specialRole) {
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
      <section className="max-w-5xl mx-auto py-16 md:py-24 px-4 w-full mb-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4">
          <div>
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
              CLAN <span className="text-orange-500">ROSTER</span>
            </h2>
            <p className="text-orange-400 mt-1 text-xs md:text-sm font-bold tracking-widest uppercase">The Faces of Freedom</p>
          </div>
          
          <div className="text-green-500 font-bold uppercase tracking-widest text-[9px] md:text-[10px] bg-[#0f0f0f] px-4 py-2 rounded-full border border-green-500/30 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${loadingMembers ? 'bg-orange-500 animate-pulse' : errorMembers ? 'bg-red-500' : 'bg-green-500 shadow-[0_0_8px_#22c55e]'}`}></span>
            {loadingMembers ? "Connecting..." : errorMembers ? "Error DB" : "MONGODB CLUSTER0 ONLINE"}
          </div>
        </div>

        {loadingMembers ? (
          <div className="text-center py-10 text-orange-500 font-bold text-sm uppercase tracking-widest animate-pulse">
            Menghubungkan ke Cluster0 Atlas...
          </div>
        ) : errorMembers ? (
          <div className="text-center py-10 bg-red-950/20 border border-red-900 rounded-lg">
            <h3 className="text-red-500 font-bold text-sm uppercase tracking-widest mb-1">Gagal Sinkronisasi Database</h3>
            <p className="text-slate-400 text-xs">Periksa kembali penulisan MONGODB_URI di dashboard Environment Variables Vercel kamu.</p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-10 bg-[#111] border border-white/5 rounded-lg">
            <h3 className="text-orange-500 font-bold text-sm uppercase tracking-widest mb-1">Roster Kosong</h3>
            <p className="text-slate-400 text-xs">Koleksi data member di cluster MongoDB masih kosong.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
            {members.map((member, index) => {
              const roleStyle = getRoleColor(member.role);
              const isLeader = member.role.toLowerCase() === 'leader';
              const bannerSrc = getBannerImage(member.specialRoles[0]);
              
              // URL Render Kepala 2D Minecraft Avatar otomatis berdasarkan Gamertag Player
              const headAvatarUrl = `https://mc-heads.net/avatar/${member.name}`;
              
              return (
                <div 
                  key={index} 
                  onClick={() => setSelectedMember(member)} 
                  className="relative overflow-hidden p-5 md:p-6 rounded-xl border border-white/10 hover:border-orange-500/50 hover:shadow-[0_0_25px_rgba(234,88,12,0.15)] transition-all flex items-center gap-5 group cursor-pointer"
                >
                  {/* --- BACKGROUND IMAGE DI DALAM KOTAK --- */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center opacity-30 group-hover:opacity-50 group-hover:scale-110 transition-all duration-500"
                    style={{ backgroundImage: `url(${bannerSrc})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/90 to-transparent" />

                  {/* --- KONTEN UTAMA KOTAK --- */}
                  <div className="relative z-10 flex items-center gap-5 w-full">
                    
                    {/* PERBAIKAN: Lingkaran inisial teks diubah menjadi render Kepala 2D Skin Minecraft */}
                    <div className={`w-14 h-14 md:w-16 md:h-16 flex-shrink-0 rounded-xl border-2 overflow-hidden shadow-lg transition-colors ${isLeader ? 'border-orange-500 bg-[#111]' : 'border-slate-700 bg-[#111] group-hover:border-orange-400'}`}>
                      <img 
                        src={headAvatarUrl} 
                        alt={`${member.name} avatar`} 
                        className="w-full h-full object-contain"
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'https://mc-heads.net/avatar/Steve';
                        }}
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                      <div className="mb-1">
                        <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest inline-block px-2 py-0.5 rounded border ${roleStyle}`}>
                          {member.role}
                        </span>
                      </div>
                      
                      <h3 className="text-lg md:text-xl font-black tracking-tight text-white truncate mb-1">
                        {member.name}
                      </h3>
                      
                      {/* --- ICON + TEKS BADGE ROLE --- */}
                      {member.specialRoles && member.specialRoles.length > 0 && (
                        <div className="flex flex-wrap items-center gap-2 mt-0.5">
                          {member.specialRoles.map((role, i) => {
                            const iconSrc = getSpecialIcon(role);
                            if (!iconSrc) return null;
                            return (
                              <div key={i} className="flex items-center gap-1.5 bg-black/60 px-2 py-1 rounded-md border border-white/10 backdrop-blur-sm">
                                <img 
                                  src={iconSrc} 
                                  alt={role} 
                                  className="w-3.5 h-3.5 object-contain" 
                                />
                                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest leading-none mt-px">
                                  {role}
                               </span>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* RENDER PROFILE MODAL JIKA DIKLIK */}
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
