"use client";

import React, { useState, useEffect } from 'react';

// IMPORT ICON ROLE MINECRAFT KAMU
import redstonerAsset from '../../../assets/redstoner.png';
import builderAsset from '../../../assets/builder.png';
import pvpAsset from '../../../assets/pvp.png';
import farmerAsset from '../../../assets/farmer.png';
import adventureAsset from '../../../assets/adventure.png';
import minecraftAsset from '../../../assets/Minecraft.png';

interface Member { name: string; role: string; specialRole: string | null; }

export default function MembersPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [errorMembers, setErrorMembers] = useState(false);

  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');

  const redstonerSrc = getSrc(redstonerAsset);
  const builderSrc = getSrc(builderAsset);
  const pvpSrc = getSrc(pvpAsset);
  const farmerSrc = getSrc(farmerAsset);
  const adventureSrc = getSrc(adventureAsset);
  const minecraftSrc = getSrc(minecraftAsset);

  useEffect(() => {
    fetch(`/listmember.txt?t=${new Date().getTime()}`)
      .then((res) => {
        if (!res.ok) throw new Error("Gagall");
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
              const match = tag.match(/(.*?)\s*\((.*?)\)/);
              
              if (match) {
                parsedMembers.push({ 
                  name: match[1].trim(), 
                  role: currentRole, 
                  specialRole: match[2].trim().toLowerCase() 
                });
              } else {
                parsedMembers.push({ 
                  name: tag, 
                  role: currentRole, 
                  specialRole: null 
                });
              }
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

  const getSpecialIcon = (specialRole: string | null) => {
    if (!specialRole) return null;
    switch (specialRole) {
      case 'redstoner': return redstonerSrc;
      case 'builder': return builderSrc;
      case 'pvp': return pvpSrc;
      case 'farmer': return farmerSrc;
      case 'adventure': return adventureSrc;
      default: return minecraftSrc;
    }
  };

  return (
    <section className="max-w-5xl mx-auto py-16 md:py-24 px-4 w-full mb-10">
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
            const specialIcon = getSpecialIcon(member.specialRole);
            
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
                  <h3 className="text-base md:text-xl font-black tracking-tight text-white truncate flex items-center gap-2">
                    {member.name}
                    {specialIcon && (
                      <img 
                        src={specialIcon} 
                        alt={member.specialRole || 'role'} 
                        title={`Role: ${member.specialRole}`} 
                        className="w-5 h-5 object-contain opacity-80 group-hover:opacity-100 transition-opacity" 
                      />
                    )}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
