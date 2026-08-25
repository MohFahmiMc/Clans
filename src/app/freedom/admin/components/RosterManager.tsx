"use client";

import React, { useState, useEffect } from 'react';
import Profile from '../../../../components/Profile';

// IMPORT ASSET ICON UNTUK PREVIEW MODAL
import redstonerAsset from '../../../../assets/redstoner.png';
import minerAsset from '../../../../assets/miner.png';
import builderAsset from '../../../../assets/builder.png';
import pvpAsset from '../../../../assets/pvp.png';
import farmerAsset from '../../../../assets/farmer.png';
import adventureAsset from '../../../../assets/adventure.png';
import minecraftAsset from '../../../../assets/Minecraft.png';

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

// Warna khusus berdasarkan pangkat (Rank Clan)
const ROLE_BADGES: Record<string, string> = {
  Leader: 'bg-red-500/15 text-red-400 border-red-500/30 shadow-red-500/10',
  'Co-Leader': 'bg-amber-500/15 text-amber-400 border-amber-500/30 shadow-amber-500/10',
  Admin: 'bg-purple-500/15 text-purple-400 border-purple-500/30 shadow-purple-500/10',
  Staff: 'bg-blue-500/15 text-blue-400 border-blue-500/30 shadow-blue-500/10',
  'Core Team': 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10',
  Member: 'bg-slate-500/15 text-slate-400 border-slate-500/30 shadow-slate-500/10',
};

export default function RosterManager() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Member States
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [gamertag, setGamertag] = useState('');
  const [role, setRole] = useState('Member');
  const [specialRoleInput, setSpecialRoleInput] = useState('');
  const [desc, setDesc] = useState('');
  const [skinUrl, setSkinUrl] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [customTheme, setCustomTheme] = useState('');

  // VISUAL THEME BUILDER STATES
  const [themeMode, setThemeMode] = useState<'gradient' | 'solid' | 'manual'>('gradient');
  const [gradientAngle, setGradientAngle] = useState(180);
  const [color1, setColor1] = useState('#f472b6');
  const [stop1, setStop1] = useState(0);
  const [color2, setColor2] = useState('#1e1b4b');
  const [stop2, setStop2] = useState(50);
  const [color3, setColor3] = useState('#09090d');
  const [stop3, setStop3] = useState(100);
  const [solidColor, setSolidColor] = useState('#991b1b');

  // Preview Modal State
  const [showPreview, setShowPreview] = useState(false);

  // Sync Visual Builder -> customTheme CSS string
  useEffect(() => {
    if (themeMode === 'gradient') {
      const css = `linear-gradient(${gradientAngle}deg, ${color1} ${stop1}%, ${color2} ${stop2}%, ${color3} ${stop3}%)`;
      setCustomTheme(css);
    } else if (themeMode === 'solid') {
      setCustomTheme(solidColor);
    }
  }, [themeMode, gradientAngle, color1, stop1, color2, stop2, color3, stop3, solidColor]);

  // Helper asset image resolution
  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');

  const getAdminPassword = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('freedom_admin_password') || '';
    }
    return '';
  };

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch('/api/members?t=' + new Date().getTime(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const sortedData = data.sort((a: Member, b: Member) => (a.order || 0) - (b.order || 0));
        setMembers(sortedData);
        setOrderChanged(false);
      }
    } catch (err) {
      // Catch block
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Helper fungsi untuk modal Profile
  const getRoleColor = (roleName: string) => {
    const r = roleName.toLowerCase();
    if (r === 'leader' || r === 'owner') {
      return 'text-red-400 border-red-500/40 bg-red-500/10 shadow-[0_0_10px_rgba(239,68,68,0.2)]';
    }
    if (r === 'admin' || r === 'co-leader') {
      return 'text-orange-400 border-orange-500/40 bg-orange-500/10 shadow-[0_0_10px_rgba(249,115,22,0.2)]';
    }
    return 'text-yellow-400 border-yellow-500/40 bg-yellow-500/10 shadow-[0_0_10px_rgba(234,179,8,0.15)]';
  };

  const getSpecialIcon = (specialRole: string) => {
    switch (specialRole?.toLowerCase()) {
      case 'redstoner': return getSrc(redstonerAsset);
      case 'miner': return getSrc(minerAsset);
      case 'builder': return getSrc(builderAsset);
      case 'pvp': return getSrc(pvpAsset);
      case 'farmer': return getSrc(farmerAsset);
      case 'adventure': return getSrc(adventureAsset);
      default: return getSrc(minecraftAsset);
    }
  };

  const handleSkinUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Berkas skin terlalu besar! Maksimal ukuran adalah 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSkinUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleBannerUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      alert("Berkas banner terlalu besar! Disarankan memasukkan URL Gambar atau menggunakan file < 1.5 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setBannerUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gamertag.trim()) return;
    setLoading(true);

    const password = getAdminPassword();
    const specialRolesArray = specialRoleInput 
      ? specialRoleInput.split(',').map(r => r.trim().toLowerCase()).filter(Boolean) 
      : [];
    
    const currentMemberOrder = isEditing 
      ? (members.find(m => m._id === currentMemberId)?.order ?? members.length) 
      : members.length;

    const bannerValue = bannerUrl.trim() || null;
    const themeValue = customTheme.trim() || null;

    const payload = {
      id: currentMemberId,
      password,
      name: gamertag.trim(),
      role,
      specialRoles: specialRolesArray,
      description: desc.trim(),
      customSkinUrl: skinUrl.trim() || null,
      bannerUrl: bannerValue,
      customBannerUrl: bannerValue,
      customTheme: themeValue,
      themeColor: themeValue,
      order: currentMemberOrder
    };

    try {
      const res = await fetch('/api/members', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        resetMemberForm();
        fetchMembers();
      } else {
        alert('Gagal menyimpan data clan roster. Ukuran gambar mungkin terlalu besar untuk database.');
      }
    } catch (err) {
      alert('Kesalahan jaringan terjadi.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (m: Member) => {
    setIsEditing(true);
    setCurrentMemberId(m._id || null);
    setGamertag(m.name);
    setRole(m.role);
    setSpecialRoleInput(m.specialRoles ? m.specialRoles.join(', ') : '');
    setDesc(m.description || '');
    setSkinUrl(m.customSkinUrl || '');
    setBannerUrl(m.bannerUrl || m.customBannerUrl || '');
    
    const themeVal = m.customTheme || m.themeColor || '';
    setCustomTheme(themeVal);

    if (themeVal.includes('gradient')) {
      setThemeMode('manual');
    } else if (themeVal.startsWith('#')) {
      setThemeMode('solid');
      setSolidColor(themeVal);
    } else {
      setThemeMode('gradient');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Hapus ${name} dari roster secara permanen?`)) return;
    const password = getAdminPassword();
    try {
      const res = await fetch('/api/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password, name })
      });
      if (res.ok) {
        fetchMembers();
        resetMemberForm();
      }
    } catch (err) {
      // Catch block
    }
  };

  const moveRoster = (index: number, direction: 'up' | 'down') => {
    const updated = [...members];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;

    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((m, idx) => ({ ...m, order: idx }));
    setMembers(reordered);
    setOrderChanged(true);
  };

  const saveRosterOrder = async () => {
    setSavingOrder(true);
    const password = getAdminPassword();
    try {
      await Promise.all(members.map((m, idx) => {
        const bannerVal = m.bannerUrl || m.customBannerUrl || null;
        const themeVal = m.customTheme || m.themeColor || null;
        return fetch('/api/members', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: m._id,
            password,
            name: m.name,
            role: m.role,
            specialRoles: m.specialRoles,
            description: m.description,
            customSkinUrl: m.customSkinUrl,
            bannerUrl: bannerVal,
            customBannerUrl: bannerVal,
            customTheme: themeVal,
            themeColor: themeVal,
            order: idx
          })
        });
      }));
      setOrderChanged(false);
      fetchMembers();
    } catch (err) {
      alert('Gagal menyimpan posisi urutan.');
    } finally {
      setSavingOrder(false);
    }
  };

  const resetMemberForm = () => {
    setIsEditing(false);
    setCurrentMemberId(null);
    setGamertag('');
    setRole('Member');
    setSpecialRoleInput('');
    setDesc('');
    setSkinUrl('');
    setBannerUrl('');
    setCustomTheme('');
    setThemeMode('gradient');
    setGradientAngle(180);
    setColor1('#f472b6');
    setStop1(0);
    setColor2('#1e1b4b');
    setStop2(50);
    setColor3('#09090d');
    setStop3(100);
    setSolidColor('#991b1b');
  };

  // Preset Gradient Cepat
  const applyPreset = (c1: string, s1: number, c2: string, s2: number, c3: string, s3: number, angle: number = 180) => {
    setThemeMode('gradient');
    setColor1(c1); setStop1(s1);
    setColor2(c2); setStop2(s2);
    setColor3(c3); setStop3(s3);
    setGradientAngle(angle);
  };

  // Draft Data untuk Pratinjau Profil
  const draftMemberData: Member = {
    name: gamertag.trim() || 'Player Name',
    role: role,
    specialRoles: specialRoleInput ? specialRoleInput.split(',').map(r => r.trim().toLowerCase()).filter(Boolean) : [],
    description: desc.trim(),
    customSkinUrl: skinUrl.trim() || null,
    bannerUrl: bannerUrl.trim() || null,
    customBannerUrl: bannerUrl.trim() || null,
    customTheme: customTheme.trim() || null,
    themeColor: customTheme.trim() || null,
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* SEKSI FORM INPUT */}
      <div className="lg:col-span-5 bg-[#09090d]/90 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-white/10 shadow-2xl h-fit">
        
        {/* Header Form */}
        <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <div className={`w-2 h-6 rounded-full ${isEditing ? 'bg-amber-500' : 'bg-orange-500'}`} />
            <h3 className="text-sm font-black uppercase tracking-wider text-white">
              {isEditing ? 'Edit Profil Member' : 'Tambah Member Baru'}
            </h3>
          </div>
          {isEditing && (
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
              Editing Mode
            </span>
          )}
        </div>

        <form onSubmit={handleSaveMember} className="flex flex-col gap-4">
          
          {/* Nickname */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
              Gamertag Player <span className="text-orange-500">*</span>
            </label>
            <input 
              type="text" 
              value={gamertag} 
              onChange={e => setGamertag(e.target.value)} 
              placeholder="Contoh: MohFahmiMc" 
              className="bg-black/60 border border-white/10 p-3 rounded-xl text-sm text-white font-bold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-600" 
              required 
            />
          </div>

          {/* Jabatan / Role */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Pangkat Clan</label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)} 
              className="bg-black/60 border border-white/10 p-3 rounded-xl text-sm text-white font-bold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all cursor-pointer"
            >
              <option value="Leader">Leader</option>
              <option value="Co-Leader">Co-Leader</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Core Team">Core Team</option>
              <option value="Member">Member</option>
            </select>
          </div>

          {/* Klasifikasi Keahlian */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center justify-between">
              <span>Keahlian / Tag</span>
              <span className="text-[9px] text-slate-500">Pisahkan koma</span>
            </label>
            <input 
              type="text" 
              value={specialRoleInput} 
              onChange={e => setSpecialRoleInput(e.target.value)} 
              placeholder="pvp, builder, redstoner" 
              className="bg-black/60 border border-white/10 p-3 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-600" 
            />
          </div>

          {/* Bio Profil */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Bio Profil / Catatan</label>
            <textarea 
              value={desc} 
              onChange={e => setDesc(e.target.value)} 
              placeholder="Info kontribusi atau kata mutiara..." 
              className="bg-black/60 border border-white/10 p-3 rounded-xl h-20 text-xs text-slate-300 leading-relaxed focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-none placeholder:text-slate-600" 
            />
          </div>

          {/* ================= VISUAL GRADIENT & THEME BUILDER ================= */}
          <div className="flex flex-col gap-2.5 bg-black/40 border border-white/10 p-3.5 rounded-2xl">
            <div className="flex items-center justify-between">
              <label className="text-[10px] uppercase font-bold tracking-widest text-amber-400 flex items-center gap-1.5">
                <span>🎨 Visual Theme Builder (Nitro Style)</span>
              </label>
              
              {/* Mode Switcher */}
              <div className="flex items-center bg-black/80 p-0.5 rounded-lg border border-white/10 text-[9px] font-bold uppercase">
                <button
                  type="button"
                  onClick={() => setThemeMode('gradient')}
                  className={`px-2 py-1 rounded-md transition-all ${themeMode === 'gradient' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Gradient
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('solid')}
                  className={`px-2 py-1 rounded-md transition-all ${themeMode === 'solid' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Solid
                </button>
                <button
                  type="button"
                  onClick={() => setThemeMode('manual')}
                  className={`px-2 py-1 rounded-md transition-all ${themeMode === 'manual' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Ketik CSS
                </button>
              </div>
            </div>

            {/* CONTROLS UNTUK GRADIENT */}
            {themeMode === 'gradient' && (
              <div className="flex flex-col gap-3 mt-1">
                {/* Arah / Sudut Gradient */}
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] text-slate-400 font-bold uppercase">Arah Gradient:</span>
                  <div className="flex items-center gap-1">
                    {[0, 45, 90, 135, 180].map((deg) => (
                      <button
                        key={deg}
                        type="button"
                        onClick={() => setGradientAngle(deg)}
                        className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded border ${
                          gradientAngle === deg 
                            ? 'bg-amber-500/20 text-amber-400 border-amber-500/50' 
                            : 'bg-black/60 text-slate-400 border-white/10 hover:text-white'
                        }`}
                      >
                        {deg}°
                      </button>
                    ))}
                  </div>
                </div>

                {/* Warna 1 & Stop % */}
                <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/5">
                  <input
                    type="color"
                    value={color1}
                    onChange={e => setColor1(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className="flex justify-between text-[9px] font-bold text-slate-300">
                      <span>Warna Atas / Awal</span>
                      <span className="font-mono text-amber-400">{color1} ({stop1}%)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stop1}
                      onChange={e => setStop1(Number(e.target.value))}
                      className="w-full accent-orange-500 h-1 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Warna 2 & Stop % */}
                <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/5">
                  <input
                    type="color"
                    value={color2}
                    onChange={e => setColor2(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className="flex justify-between text-[9px] font-bold text-slate-300">
                      <span>Warna Tengah</span>
                      <span className="font-mono text-amber-400">{color2} ({stop2}%)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stop2}
                      onChange={e => setStop2(Number(e.target.value))}
                      className="w-full accent-orange-500 h-1 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Warna 3 & Stop % */}
                <div className="flex items-center gap-2 bg-black/60 p-2 rounded-xl border border-white/5">
                  <input
                    type="color"
                    value={color3}
                    onChange={e => setColor3(e.target.value)}
                    className="w-7 h-7 rounded cursor-pointer bg-transparent border-0"
                  />
                  <div className="flex-1 flex flex-col gap-0.5">
                    <div className="flex justify-between text-[9px] font-bold text-slate-300">
                      <span>Warna Dasar / Bawah</span>
                      <span className="font-mono text-amber-400">{color3} ({stop3}%)</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={stop3}
                      onChange={e => setStop3(Number(e.target.value))}
                      className="w-full accent-orange-500 h-1 bg-neutral-800 rounded-lg cursor-pointer"
                    />
                  </div>
                </div>

                {/* Preset Cepat Nitro */}
                <div className="flex flex-col gap-1">
                  <span className="text-[9px] text-slate-400 font-bold uppercase">Preset Cepat:</span>
                  <div className="flex flex-wrap items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => applyPreset('#f472b6', 0, '#1e1b4b', 50, '#09090d', 100)}
                      className="px-2 py-1 rounded bg-gradient-to-r from-pink-400 via-indigo-900 to-black text-[9px] font-bold text-white border border-white/20 hover:scale-105 transition-transform"
                    >
                      Pink Indigo
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('#f97316', 0, '#dc2626', 50, '#09090d', 100)}
                      className="px-2 py-1 rounded bg-gradient-to-r from-orange-500 via-red-600 to-black text-[9px] font-bold text-white border border-white/20 hover:scale-105 transition-transform"
                    >
                      Fire Red
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('#10b981', 0, '#064e3b', 50, '#09090d', 100)}
                      className="px-2 py-1 rounded bg-gradient-to-r from-emerald-500 via-emerald-900 to-black text-[9px] font-bold text-white border border-white/20 hover:scale-105 transition-transform"
                    >
                      Emerald
                    </button>
                    <button
                      type="button"
                      onClick={() => applyPreset('#3b82f6', 0, '#1e1b4b', 50, '#09090d', 100)}
                      className="px-2 py-1 rounded bg-gradient-to-r from-blue-500 via-indigo-950 to-black text-[9px] font-bold text-white border border-white/20 hover:scale-105 transition-transform"
                    >
                      Cyber Blue
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* CONTROLS UNTUK SOLID COLOR */}
            {themeMode === 'solid' && (
              <div className="flex items-center gap-3 bg-black/60 p-2.5 rounded-xl border border-white/5 mt-1">
                <input
                  type="color"
                  value={solidColor}
                  onChange={e => setSolidColor(e.target.value)}
                  className="w-8 h-8 rounded cursor-pointer bg-transparent border-0"
                />
                <div className="flex-1">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Pilih Warna Solid (HEX):</span>
                  <input
                    type="text"
                    value={solidColor}
                    onChange={e => setSolidColor(e.target.value)}
                    className="bg-black border border-white/10 px-2 py-1 rounded text-xs text-white font-mono w-28 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>
            )}

            {/* CONTROLS MANUAL INPUT */}
            {themeMode === 'manual' && (
              <div className="mt-1">
                <input 
                  type="text" 
                  value={customTheme} 
                  onChange={e => setCustomTheme(e.target.value)} 
                  placeholder="linear-gradient(180deg, #f472b6 0%, #1e1b4b 50%, #09090d 100%)" 
                  className="w-full bg-black/60 border border-white/10 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 font-mono" 
                />
              </div>
            )}

            {/* Kotak Preview Output CSS String */}
            <div className="mt-1 p-2 bg-black/90 rounded-lg border border-white/10 flex flex-col gap-1">
              <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold">Hasil String CSS Terbaca:</span>
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-full border border-white/20 shrink-0" 
                  style={{ background: customTheme || '#0d0d0e' }} 
                />
                <code className="text-[10px] text-amber-300 font-mono truncate flex-1">
                  {customTheme || 'Belum diatur'}
                </code>
              </div>
            </div>

          </div>
          {/* ================= AKHIR VISUAL THEME BUILDER ================= */}
          
          {/* Input Link Skin PNG */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">URL Gambar Skin (.png)</label>
            <input 
              type="text" 
              value={skinUrl} 
              onChange={e => setSkinUrl(e.target.value)} 
              placeholder="https://.../skin.png" 
              className="bg-black/60 border border-white/10 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-600" 
            />
          </div>

          {/* Upload File Skin & Preview Box */}
          <div className="flex flex-col gap-1.5 mb-2">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Upload File Skin PNG</label>
            <input 
              type="file" 
              accept="image/png" 
              onChange={handleSkinUpload} 
              className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-orange-500/10 file:text-orange-400 file:border file:border-orange-500/20 hover:file:bg-orange-500/20 file:cursor-pointer transition-all" 
            />
            
            {/* Skin Preview Container */}
            {skinUrl && (
              <div className="mt-2 p-3 bg-black/80 border border-white/10 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-[#141419] border border-white/10 flex items-center justify-center p-1 overflow-hidden">
                    <img 
                      src={skinUrl} 
                      alt="Skin Preview" 
                      className="max-h-full max-w-full object-contain" 
                      style={{ imageRendering: 'pixelated' }} 
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-300">Custom Skin Terdeteksi</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setSkinUrl('')} 
                  className="text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 rounded-lg border border-rose-500/20 transition-all uppercase"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>

          <hr className="border-white/5" />

          {/* Input Link Banner */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">URL Gambar Banner</label>
            <input 
              type="text" 
              value={bannerUrl} 
              onChange={e => setBannerUrl(e.target.value)} 
              placeholder="https://.../banner.png" 
              className="bg-black/60 border border-white/10 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-600" 
            />
          </div>

          {/* Upload File Banner & Preview Box */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Upload File Banner</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleBannerUpload} 
              className="text-xs text-slate-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-blue-500/10 file:text-blue-400 file:border file:border-blue-500/20 hover:file:bg-blue-500/20 file:cursor-pointer transition-all" 
            />
            
            {/* Banner Preview Container */}
            {bannerUrl && (
              <div className="mt-2 p-3 bg-black/80 border border-white/10 rounded-xl flex items-center justify-between gap-3 relative overflow-hidden">
                <div 
                  className="absolute inset-0 z-0 opacity-30 bg-cover bg-center"
                  style={{ backgroundImage: `url(${bannerUrl})` }}
                />
                <div className="absolute inset-0 z-0 bg-gradient-to-r from-black/90 to-black/40" />
                
                <div className="relative z-10 flex items-center gap-3">
                  <span className="text-xs font-semibold text-slate-300">Custom Banner Terdeteksi</span>
                </div>
                <button 
                  type="button" 
                  onClick={() => setBannerUrl('')} 
                  className="relative z-10 text-[10px] font-bold text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 px-2.5 py-1.5 rounded-lg border border-rose-500/20 transition-all uppercase"
                >
                  Hapus
                </button>
              </div>
            )}
          </div>

          {/* TOMBOL PREVIEW PROFILE */}
          <div className="mt-2">
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="w-full bg-neutral-800 hover:bg-neutral-700 active:scale-[0.99] border border-white/15 text-slate-200 font-extrabold py-2.5 rounded-xl text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md group"
            >
              <svg className="w-4 h-4 text-orange-400 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Pratinjau / Preview Profile</span>
            </button>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 mt-1 pt-2 border-t border-white/5">
            <button 
              type="submit" 
              disabled={loading} 
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 active:scale-[0.99] font-black py-3 rounded-xl text-xs uppercase tracking-widest text-white transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Menyimpan...</span>
                </>
              ) : (
                <span>{isEditing ? 'Perbarui Roster' : 'Simpan Member'}</span>
              )}
            </button>
            
            {isEditing && (
              <button 
                type="button" 
                onClick={resetMemberForm} 
                className="bg-white/5 hover:bg-white/10 border border-white/10 font-bold px-4 rounded-xl text-xs uppercase text-slate-300 transition-all"
              >
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SEKSI DAFTAR ROSTER */}
      <div className="lg:col-span-7 bg-[#09090d]/90 backdrop-blur-xl p-5 sm:p-6 rounded-2xl border border-white/10 shadow-2xl h-fit">
        
        {/* Header List Roster */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 border-b border-white/10 pb-4 gap-3">
          <div>
            <h2 className="text-base font-black text-white uppercase tracking-wider flex items-center gap-2">
              <span>Roster Clan</span>
              <span className="text-xs bg-orange-500/10 text-orange-400 font-bold px-2.5 py-0.5 rounded-full border border-orange-500/20">
                {members.length} Player
              </span>
            </h2>
            <p className="text-[11px] text-slate-400 font-medium mt-0.5">Kelola posisi, pangkat, dan profil roster clan</p>
          </div>

          {orderChanged && (
            <button 
              type="button" 
              onClick={saveRosterOrder} 
              disabled={savingOrder} 
              className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 animate-pulse"
            >
              {savingOrder ? (
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
              <span>Simpan Urutan Baru</span>
            </button>
          )}
        </div>

        {/* State Loading & Kosong */}
        {loadingMembers ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest animate-pulse">
              Memuat Roster Clan...
            </p>
          </div>
        ) : members.length === 0 ? (
          <div className="text-center py-16 bg-black/40 border border-white/5 rounded-2xl p-6">
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Belum Ada Roster Terdaftar</p>
            <p className="text-[11px] text-slate-600 mt-1">Gunakan formulir di samping untuk menambahkan player pertama.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3 max-h-[600px] sm:max-h-[680px] overflow-y-auto pr-1 custom-scrollbar">
            {members.map((m, idx) => {
              const badgeStyle = ROLE_BADGES[m.role] || ROLE_BADGES['Member'];
              const avatarUrl = m.customSkinUrl || `https://mc-heads.net/avatar/${m.name}/48`;
              const memberBanner = m.bannerUrl || m.customBannerUrl;

              return (
                <div 
                  key={m._id || idx} 
                  className="relative bg-black/50 border border-white/10 hover:border-white/20 rounded-xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 transition-all group overflow-hidden shrink-0"
                >
                  {/* Efek Background Banner */}
                  {memberBanner && (
                    <>
                      <div 
                        className="absolute inset-0 z-0 opacity-20 group-hover:opacity-30 transition-opacity duration-500 bg-cover bg-center"
                        style={{ backgroundImage: `url(${memberBanner})` }}
                      />
                      <div className="absolute inset-0 z-0 bg-gradient-to-r from-[#09090d] via-[#09090d]/80 to-transparent" />
                    </>
                  )}

                  {/* Bagian Utama: Controls, Avatar & Detail Info */}
                  <div className="relative z-10 flex items-start sm:items-center gap-3 min-w-0 flex-1">
                    
                    {/* Controls Urutan Posisi (Up/Down) */}
                    <div className="flex flex-col gap-0.5 bg-white/5 p-1 rounded-lg border border-white/5 shrink-0 backdrop-blur-sm mt-0.5 sm:mt-0">
                      <button 
                        type="button" 
                        onClick={() => moveRoster(idx, 'up')} 
                        disabled={idx === 0} 
                        className="text-slate-400 hover:text-orange-400 disabled:opacity-20 transition-colors p-0.5"
                        title="Naikkan Posisi"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => moveRoster(idx, 'down')} 
                        disabled={idx === members.length - 1} 
                        className="text-slate-400 hover:text-orange-400 disabled:opacity-20 transition-colors p-0.5"
                        title="Turunkan Posisi"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                      </button>
                    </div>

                    {/* Avatar Head Preview Minecraft */}
                    <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg bg-[#141419] border border-white/10 p-1 shrink-0 flex items-center justify-center relative shadow-md">
                      <img 
                        src={avatarUrl} 
                        alt={m.name} 
                        className="w-full h-full object-contain rounded" 
                        style={{ imageRendering: 'pixelated' }}
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    </div>
                    
                    {/* Detail Information Member */}
                    <div className="min-w-0 flex-1">
                      {/* Name & Rank Badge */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-1">
                        <h4 className="text-sm font-black text-white truncate max-w-full drop-shadow-md">
                          {m.name}
                        </h4>
                        
                        <span className={`text-[9px] uppercase font-extrabold tracking-wider px-2 py-0.5 rounded border whitespace-nowrap backdrop-blur-sm ${badgeStyle}`}>
                          {m.role}
                        </span>
                      </div>

                      {/* Special Role Tags */}
                      {m.specialRoles && m.specialRoles.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1 mb-1">
                          {m.specialRoles.map((sRole, sIdx) => (
                            <span 
                              key={sIdx} 
                              className="text-[8px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded border border-white/10 bg-[#141416]/80 text-slate-300 backdrop-blur-sm"
                            >
                              {sRole}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Bio Description */}
                      {m.description ? (
                        <p className="text-[11px] text-slate-300 line-clamp-2 italic leading-tight drop-shadow">
                          "{m.description}"
                        </p>
                      ) : (
                        <p className="text-[10px] text-slate-500 italic drop-shadow">Tidak ada deskripsi profil.</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Action Buttons (Edit & Hapus) */}
                  <div className="relative z-10 flex items-center justify-end gap-2 pt-2.5 sm:pt-0 border-t border-white/5 sm:border-t-0 shrink-0 w-full sm:w-auto">
                    <button 
                      type="button" 
                      onClick={() => handleEditClick(m)} 
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-amber-400 bg-white/5 hover:bg-amber-500/20 rounded-lg border border-white/10 hover:border-amber-500/30 transition-all text-[11px] font-bold uppercase tracking-wider backdrop-blur-md"
                      title="Edit Member"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span>Edit</span>
                    </button>
                    <button 
                      type="button" 
                      onClick={() => handleDeleteMember(m._id!, m.name)} 
                      className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-3 py-1.5 text-slate-300 hover:text-rose-400 bg-white/5 hover:bg-rose-500/20 rounded-lg border border-white/10 hover:border-rose-500/30 transition-all text-[11px] font-bold uppercase tracking-wider backdrop-blur-md"
                      title="Hapus Member"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Hapus</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL PRATINJAU / PREVIEW PROFIL */}
      {showPreview && (
        <Profile 
          member={draftMemberData} 
          onClose={() => setShowPreview(false)} 
          getRoleColor={getRoleColor}
          getSpecialIcon={getSpecialIcon}
        />
      )}

    </div>
  );
}
