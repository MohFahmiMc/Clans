"use client";

import React, { useState, useEffect } from 'react';

interface Member {
  _id?: string;
  name: string;
  role: string;
  specialRoles: string[];
  customSkinUrl?: string | null;
  order?: number;
}

export default function RosterManager() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [gamertag, setGamertag] = useState('');
  const [role, setRole] = useState('Member');
  const [specialRolesInput, setSpecialRolesInput] = useState('');
  const [customSkinUrl, setCustomSkinUrl] = useState('');

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch('/api/members');
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a: Member, b: Member) => (a.order || 0) - (b.order || 0));
        setMembers(sorted);
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
      setCustomSkinUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gamertag.trim()) return;

    const payload = {
      id: currentMemberId,
      name: gamertag.trim(),
      role,
      specialRoles: specialRolesInput.split(',').map(s => s.trim()).filter(Boolean),
      customSkinUrl: customSkinUrl.trim() || null,
      order: isEditing ? undefined : members.length
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
        alert('Gagal menyimpan data aliansi roster.');
      }
    } catch (err) {
      alert('Kesalahan jaringan terjadi.');
    }
  };

  const handleEditClick = (m: Member) => {
    setIsEditing(true);
    setCurrentMemberId(m._id || null);
    setGamertag(m.name);
    setRole(m.role);
    setSpecialRolesInput(m.specialRoles.join(', '));
    setCustomSkinUrl(m.customSkinUrl || '');
  };

  const handleDeleteMember = async (id: string, name: string) => {
    if (!confirm(`Hapus ${name} dari roster secara permanen?`)) return;
    try {
      const res = await fetch('/api/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, name })
      });
      if (res.ok) fetchMembers();
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

  // Memperbaiki fungsi penyimpanan urutan sekuensial langsung menembak API utama Anda
  const saveRosterOrder = async () => {
    setSavingOrder(true);
    try {
      for (const m of members) {
        await fetch('/api/members', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: m._id,
            name: m.name,
            role: m.role,
            specialRoles: m.specialRoles,
            customSkinUrl: m.customSkinUrl,
            order: m.order
          })
        });
      }
      setOrderChanged(false);
      alert('Urutan susunan posisi posisi Roster berhasil disinkronisasi ke MongoDB Atlas!');
    } catch (err) {
      alert('Gagal menyimpan posisi.');
    } finally {
      setSavingOrder(false);
    }
  };

  const resetMemberForm = () => {
    setIsEditing(false);
    setCurrentMemberId(null);
    setGamertag('');
    setRole('Member');
    setSpecialRolesInput('');
    setCustomSkinUrl('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="bg-[#0a0a0b] border border-white/5 p-6 rounded-xl h-fit">
        <h3 className="text-sm font-black uppercase tracking-wider mb-4 border-b border-white/5 pb-2 text-orange-500">
          {isEditing ? 'Edit Data Anggota' : 'Tambah Roster Aliansi'}
        </h3>
        <form onSubmit={handleSaveMember} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Gamertag / Nickname</label>
            <input type="text" value={gamertag} onChange={e => setGamertag(e.target.value)} placeholder="Nickname Minecraft..." className="bg-black border border-white/10 p-2.5 rounded text-xs text-white focus:outline-none focus:border-orange-500" required />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Jabatan Utama</label>
            <select value={role} onChange={e => setRole(e.target.value)} className="bg-black border border-white/10 p-2.5 rounded text-xs text-white focus:outline-none focus:border-orange-500">
              <option value="Leader">Leader</option>
              <option value="Co-Leader">Co-Leader</option>
              <option value="Staff">Staff</option>
              <option value="Core Team">Core Team</option>
              <option value="Member">Member</option>
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Keahlian Peran / Klasifikasi (Pisahkan Koma)</label>
            <input type="text" value={specialRolesInput} onChange={e => setSpecialRolesInput(e.target.value)} placeholder="Contoh: PvP, Builder, Redstoner, Veteran..." className="bg-black border border-white/10 p-2.5 rounded text-xs text-white focus:outline-none focus:border-orange-500" />
          </div>
          
          {/* Mengembalikan File Input Skin Minecraft */}
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold text-slate-400">Unggah File Gambar Skin (.png)</label>
            <input type="file" accept="image/png" onChange={handleSkinUpload} className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-orange-500/20 file:text-orange-400 file:cursor-pointer hover:file:bg-orange-500/30" />
            {customSkinUrl && (
              <div className="mt-2 p-2 bg-black border border-white/5 rounded flex flex-col items-center">
                <img src={customSkinUrl} alt="Skin Preview" className="max-h-24 object-contain" />
                <button type="button" onClick={() => setCustomSkinUrl('')} className="text-[10px] text-red-400 mt-1 hover:underline">Hapus Berkas</button>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-2">
            <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-500 font-bold py-2.5 rounded text-xs uppercase tracking-wider transition-colors">{isEditing ? 'Perbarui Data' : 'Simpan Roster'}</button>
            {isEditing && <button type="button" onClick={resetMemberForm} className="bg-neutral-800 hover:bg-neutral-700 font-bold px-4 rounded text-xs uppercase transition-colors">Batal</button>}
          </div>
        </form>
      </div>

      <div className="lg:col-span-2 bg-[#0a0a0b] border border-white/5 p-6 rounded-xl">
        <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">Struktur Urutan Roster Aktif ({members.length})</h3>
          {orderChanged && (
            <button onClick={saveRosterOrder} disabled={savingOrder} className="bg-green-600 hover:bg-green-500 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all shadow">
              {savingOrder ? 'Sinkronisasi...' : 'Simpan Urutan Posisi'}
            </button>
          )}
        </div>

        {loadingMembers ? <p className="text-xs text-slate-500 uppercase tracking-widest text-center py-8">Memuat data database roster...</p> : members.length === 0 ? <p className="text-xs text-slate-600 text-center py-8">Belum ada roster aliansi terdaftar.</p> : (
          <div className="flex flex-col gap-2">
            {members.map((m, idx) => (
              <div key={m._id} className="bg-black/50 border border-white/5 p-3 rounded-lg flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button type="button" onClick={() => moveRoster(idx, 'up')} disabled={idx === 0} className="text-[10px] text-slate-500 hover:text-orange-500 disabled:opacity-20">▲</button>
                    <button type="button" onClick={() => moveRoster(idx, 'down')} disabled={idx === members.length - 1} className="text-[10px] text-slate-500 hover:text-orange-500 disabled:opacity-20">▼</button>
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">{m.name}</h4>
                    <p className="text-[9px] font-bold text-orange-400 mt-0.5 uppercase tracking-widest">{m.role} {m.specialRoles?.length > 0 && `• [${m.specialRoles.join(', ')}]`}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleEditClick(m)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                  <button type="button" onClick={() => handleDeleteMember(m._id!, m.name)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
