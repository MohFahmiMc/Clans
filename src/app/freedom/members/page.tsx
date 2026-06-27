"use client";

import React, { useState, useEffect, useRef } from 'react';
import Profile from '../../../components/Profile';

// IMPORT ICON ROLE MINECRAFT KAMU
import redstonerAsset from '../../../assets/redstoner.png';
import minerAsset from '../../../assets/miner.png';
import builderAsset from '../../../assets/builder.png';
import pvpAsset from '../../../assets/pvp.png';
import farmerAsset from '../../../assets/farmer.png';
import adventureAsset from '../../../assets/adventure.png';
import minecraftAsset from '../../../assets/Minecraft.png';

interface Member { name: string; role: string; specialRoles: string[]; }

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errorMembers, setErrorMembers] = useState(false);
  
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  
  // Referensi timer untuk mendeteksi Hold / Tahan Teken
  const pressTimer = useRef<NodeJS.Timeout | null>(null);

  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');

  const redstonerSrc = getSrc(redstonerAsset);
  const minerSrc = getSrc(minerAsset);
  const builderSrc = getSrc(builderAsset);
  const pvpSrc = getSrc(pvpAsset);
  const farmerSrc = getSrc(farmerAsset);
  const adventureSrc = getSrc(adventureAsset);
  const minecraftSrc = getSrc(minecraftAsset);

  useEffect(() => {
    fetch(`/listmember.txt?t=${new Date().getTime()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagal membaca txt");
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
              const matches = tag.match(/\((.*?)\)/g);
              let rolesList: string[] = [];
              
              if (matches) {
                rolesList = matches.map(m => m.replace(/[\(\)]/g, '').toLowerCase().trim());
              }
              
              const cleanName = tag.replace(/\(.*?\)/g, '').trim();

              parsedMembers.push({ 
                name: cleanName, 
                role: currentRole, 
                specialRoles: rolesList 
              });
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

  const getRoleColor = (role: string) => {
    const r = role.toLowerCase();
    if (r === 'leader' || r === 'owner') return 'text-red-500 border-red-500/30 bg-red-500/10';
    if (r === 'admin' || r === 'co-leader') return 'text-orange-500 border-orange-500/30 bg-orange-500/10';
    return 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10';
  };

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

  // --- FUNGSI UNTUK MENDETEKSI TAHAN (LONG PRESS) ---
  const handlePointerDown = (member: Member) => {
    pressTimer.current = setTimeout(() => {
      setSelectedMember(member);
    }, 400); // 400ms ditahan akan membuka profil
  };

  const handlePointerUp = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
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
            {loadingMembers ? "Syncing..." : errorMembers ? "Error Load" : "LIVE ROSTER"}
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
              const isLeader = member.role.toLowerCase() === 'leader';
              
              return (
                <div 
                  key={index} 
                  onClick={() => setSelectedMember(member)} 
                  onPointerDown={() => handlePointerDown(member)}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerUp}
                  onContextMenu={(e) => e.preventDefault()} // Mencegah klik kanan/menu popup di HP agar modal bisa muncul mulus
                  className="bg-[#111111] p-5 rounded-lg border border-white/5 hover:border-orange-500/50 hover:bg-[#151515] transition-all flex items-center gap-5 group cursor-pointer shadow-md select-none"
                >
                  {/* Warna avatar dinamis: Oranye untuk Leader, Biru gelap untuk yang lain */}
                  <div className={`w-14 h-14 flex-shrink-0 rounded-full flex items-center justify-center text-white font-black text-2xl transition-colors ${isLeader ? 'bg-[#ea580c]' : 'bg-[#1e293b] group-hover:bg-[#334155]'}`}>
                    {member.name.charAt(0).toUpperCase()}
                  </div>
                  
                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="mb-1">
                      <span className={`text-[9px] md:text-[10px] font-black uppercase tracking-widest inline-block px-2 py-0.5 rounded border ${roleStyle}`}>
                        {member.role}
                      </span>
                    </div>
                    
                    <h3 className="text-base md:text-lg font-black tracking-tight text-white truncate flex items-center gap-1.5">
                      {member.name}
                      
                      {member.specialRoles.length > 0 && (
                        <div className="flex items-center gap-1 ml-1">
                          {member.specialRoles.map((role, i) => {
                            const iconSrc = getSpecialIcon(role);
                            if (!iconSrc) return null;
                            return (
                              <img 
                                key={i}
                                src={iconSrc} 
                                alt={role} 
                                title={`Role: ${role}`} 
                                className="w-[18px] h-[18px] object-contain opacity-90 drop-shadow-md" 
                              />
                            )
                          })}
                        </div>
                      )}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* RENDER PROFILE MODAL */}
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
