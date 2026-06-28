"use client";

import React, { useState, useEffect } from 'react';

interface Member {
  _id?: string;
  name: string;
  role: string;
  specialRoles: string[];
  description?: string;
  customSkinUrl?: string | null;
  order?: number;
}

export default function RosterManager() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form Member States (Sinkron dengan cara AdminPortal)
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [gamertag, setGamertag] = useState('');
  const [role, setRole] = useState('Member');
  const [specialRoleInput, setSpecialRoleInput] = useState('');
  const [desc, setDesc] = useState('');
  const [skinUrl, setSkinUrl] = useState('');

  // Mengambil password otomatis dari localStorage agar lolos validasi API Route
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
      console.error(err);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

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

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gamertag.trim()) return;
    setLoading(true);

    const password = getAdminPassword();
    // Konversi ke lowercase agar pembacaan banner di Profile.tsx 100% sinkron & akurat
    const specialRolesArray = specialRoleInput 
      ? specialRoleInput.split(',').map(r => r.trim().toLowerCase()).filter(Boolean) 
      : [];
    
    const currentMemberOrder = isEditing 
      ? (members.find(m => m._id === currentMemberId)?.order ?? members.length) 
      : members.length;

    const payload = {
      id: currentMemberId,
      password,
      name: gamertag.trim(),
      role,
      specialRoles: specialRolesArray,
      description: desc.trim(),
      customSkinUrl: skinUrl.trim() || null,
      order: currentMemberOrder
    };

    try {
      const res = await fetch('/api/members', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Data member berhasil disinkronisasi ke MongoDB.');
        resetMemberForm();
        fetchMembers();
      } else {
        alert('Gagal menyimpan data clan roster.');
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
      console.error(err);
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
      // Menyinkronkan urutan struktur tanpa menghilangkan isi deskripsi atau data skin lama
      await Promise.all(members.map((m, idx) => 
        fetch('/api/members', {
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
            order: idx
          })
        })
      ));
      setOrderChanged(false);
      alert('Urutan susunan posisi Roster berhasil disinkronisasi ke MongoDB Atlas!');
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
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* SEKSI FORM INPUT */}
      <div className="bg-[#0a0a0b]/90 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-xl h-fit">
        <h3 className="text-sm font-black uppercase tracking-wider mb-4 border-b border-white/5 pb-2 text-orange-500">
          {isEditing ? 'Edit Profil Member' : 'Tambah Member Baru'}
        </h3>
        <form onSubmit={handleSaveMember} className="flex flex-col gap-4">
          
          {/* Nickname */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Gamertag Player</label>
            <input type="text" value={gamertag} onChange={e => setGamertag(e.target.value)} placeholder="Contoh: MohFahmiMc" className="bg-black border border-white/10 p-3 rounded text-sm text-white font-bold focus:outline-none focus:border-orange-500" required />
          </div>

          {/* Jabatan */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Pangkat Clan</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="bg-black border border-white/10 p-3 rounded text-sm text-white font-bold focus:outline-none focus:border-orange-500">
              <option value="Leader">Leader</option>
              <option value="Co-Leader">Co-Leader</option>
              <option value="Admin">Admin</option>
              <option value="Staff">Staff</option>
              <option value="Core Team">Core Team</option>
              <option value="Member">Member</option>
            </select>
          </div>

          {/* Klasifikasi Peran */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Keahlian (Pisahkan dengan koma)</label>
            <input type="text" value={specialRoleInput} onChange={e => setSpecialRoleInput(e.target.value)} placeholder="pvp, builder, redstoner, miner" className="bg-black border border-white/10 p-3 rounded text-sm text-slate-300 focus:outline-none focus:border-orange-500" />
          </div>

          {/* Deskripsi Member */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Bio Profil / Deskripsi</label>
            <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Quote atau info kontribusi player..." className="bg-black border border-white/10 p-3 rounded h-20 text-xs text-slate-300 leading-relaxed focus:outline-none focus:border-orange-500 resize-none" />
          </div>
          
          {/* Input Link Skin URL */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Link URL Skin PNG</label>
            <input type="text" value={skinUrl} onChange={e => setSkinUrl(e.target.value)} placeholder="https://link-gambar-skin.com/skin.png" className="bg-black border border-white/10 p-3 rounded text-xs text-white focus:outline-none focus:border-orange-500" />
          </div>

          {/* Upload File Skin */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Atau Unggah Berkas Skin (.png)</label>
            <input type="file" accept="image/png" onChange={handleSkinUpload} className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-orange-500/20 file:text-orange-400 file:cursor-pointer hover:file:bg-orange-500/30" />
            
            {skinUrl && (
              <div className="mt-2 p-2 bg-black border border-white/5 rounded flex flex-col items-center">
                <img src={skinUrl} alt="Skin Preview" className="max-h-24 object-contain" style={{ imageRendering: 'pixelated' }} />
                <button type="button" onClick={() => setSkinUrl('')} className="text-[10px] text-red-400 mt-1 hover:underline">Hapus Skin</button>
              </div>
            )}
          </div>

          {/* Tombol Aksi */}
          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-orange-600 hover:bg-orange-500 font-black py-3 rounded-lg text-xs uppercase tracking-widest text-white transition-all">
              {loading ? "Sinkronisasi..." : (isEditing ? 'Perbarui Data' : 'Simpan Member')}
            </button>
            {isEditing && (
              <button type="button" onClick={resetMemberForm} className="bg-neutral-800 hover:bg-neutral-700 font-bold px-4 rounded-lg text-xs uppercase transition-colors">
                Batal
              </button>
            )}
          </div>
        </form>
      </div>

      {/* SEKSI DAFTAR ROSTER */}
      <div className="lg:col-span-2 bg-[#0a0a0b]/90 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-xl h-fit">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-white/10 pb-4 gap-3">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Roster Terdaftar di MongoDB</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {orderChanged && (
              <button type="button" onClick={saveRosterOrder} disabled={savingOrder} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all flex items-center gap-1 shadow-lg">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                Simpan Urutan
              </button>
            )}
            <span className="text-xs bg-orange-500/10 text-orange-400 font-bold px-2.5 py-1 rounded-full border border-orange-500/20 whitespace-nowrap">Total: {members.length} Player</span>
          </div>
        </div>

        {loadingMembers ? (
          <p className="text-xs text-slate-500 uppercase tracking-widest text-center py-8 animate-pulse">Memasang jaringan sinkronisasi database roster...</p>
        ) : members.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-8">Belum ada roster clan terdaftar.</p>
        ) : (
          <div className="flex flex-col gap-3 max-h-[650px] overflow-y-auto pr-1">
            {members.map((m, idx) => (
              <div key={m._id || idx} className="bg-black/40 border border-white/5 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                  {/* Navigasi Posisi Urutan */}
                  <div className="flex flex-col gap-1 bg-black/80 p-1 rounded-md border border-white/5">
                    <button type="button" onClick={() => moveRoster(idx, 'up')} disabled={idx === 0} className="text-slate-500 hover:text-orange-500 disabled:opacity-20 transition-colors p-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>
                    </button>
                    <button type="button" onClick={() => moveRoster(idx, 'down')} disabled={idx === members.length - 1} className="text-slate-500 hover:text-orange-500 disabled:opacity-20 transition-colors p-0.5">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                    </button>
                  </div>
                  
                  {/* Detail Member */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-0.5">
                      <h4 className="text-sm font-black text-white break-all whitespace-normal">{m.name}</h4>
                      <span className="text-[8px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border border-white/10 text-slate-400">{m.role}</span>
                      {m.specialRoles?.length > 0 && (
                        <span className="text-[8px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border border-orange-500/20 bg-orange-500/5 text-orange-400">
                          {m.specialRoles.join(', ')}
                        </span>
                      )}
                    </div>
                    {m.description && (
                      <p className="text-[11px] text-slate-400 mt-1 max-w-md line-clamp-1 italic">
                        "{m.description}"
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Tombol Manajemen (Edit & Delete) */}
                <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0 flex-shrink-0 w-full sm:w-auto">
                  <button type="button" onClick={() => handleEditClick(m)} className="p-2 text-blue-400 hover:text-white bg-blue-500/5 hover:bg-blue-600 rounded-lg border border-blue-500/10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                  </button>
                  <button type="button" onClick={() => handleDeleteMember(m._id!, m.name)} className="p-2 text-red-400 hover:text-white bg-red-500/5 hover:bg-red-600 rounded-lg border border-red-500/10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
