"use client";

import React, { useState } from 'react';

export default function AdminPortal() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Form States
  const [gamertag, setGamertag] = useState('');
  const [role, setRole] = useState('Member');
  const [specialRoleInput, setSpecialRoleInput] = useState('');
  const [desc, setDesc] = useState('');
  const [skinUrl, setSkinUrl] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        setIsAuthenticated(true);
      } else {
        setErrorMsg('Password salah atau tidak terkonfigurasi!');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke sistem verifikasi.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const specialRolesArray = specialRoleInput
      ? specialRoleInput.split(',').map(r => r.trim().toLowerCase()).filter(Boolean)
      : [];

    const memberData = {
      name: gamertag,
      role: role,
      specialRoles: specialRolesArray,
      description: desc,
      customSkinUrl: skinUrl || null
    };

    try {
      const res = await fetch('/api/members', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
      });
      if (res.ok) {
        alert(`Sukses! ${gamertag} Berhasil disimpan ke MongoDB Atlas.`);
        setGamertag('');
        setSpecialRoleInput('');
        setDesc('');
        setSkinUrl('');
      } else {
        alert('Gagal menyimpan ke database.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 font-sans text-white">
        <div className="bg-[#0a0a0a] p-8 rounded-xl border border-white/10 shadow-2xl w-full max-w-md">
          <h1 className="text-3xl font-black text-orange-500 tracking-tighter mb-2 text-center">PORTAL KONTROL</h1>
          <p className="text-slate-500 text-[10px] text-center mb-8 uppercase tracking-widest">Freedom Database Center</p>
          
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Masukkan Password Akses..."
              className="bg-black border border-white/10 p-4 rounded text-white focus:outline-none focus:border-orange-500 text-center font-bold tracking-widest"
            />
            {errorMsg && <p className="text-red-500 text-xs font-bold text-center">{errorMsg}</p>}
            <button type="submit" className="bg-orange-600 hover:bg-orange-500 font-bold p-4 rounded uppercase tracking-widest transition-colors text-sm">
              Verifikasi Log In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-orange-500 tracking-tight">PORTAL ADMIN</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Database Mode: MongoDB Atlas</p>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-xs font-bold border border-white/10 bg-white/5 px-4 py-2 rounded hover:bg-red-500/20 hover:text-red-500 transition-colors uppercase tracking-wider">
            Log Out
          </button>
        </div>
        
        <div className="bg-[#0a0a0a] p-6 md:p-8 rounded-xl border border-white/10 shadow-xl">
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Gamertag Player</label>
              <input type="text" value={gamertag} onChange={e => setGamertag(e.target.value)} className="bg-black border border-white/10 p-3 rounded text-white focus:border-orange-500 focus:outline-none font-bold" placeholder="Contoh: MohFahmiMc" required />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Pangkat / Role Clan Utama</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="bg-black border border-white/10 p-3 rounded text-white focus:border-orange-500 focus:outline-none font-bold">
                <option value="Leader">Leader</option>
                <option value="Admin">Admin</option>
                <option value="Member">Member</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Keahlian Minecraft (Pisahkan dengan koma jika lebih dari 1)</label>
              <input type="text" value={specialRoleInput} onChange={e => setSpecialRoleInput(e.target.value)} className="bg-black border border-white/10 p-3 rounded text-white focus:border-orange-500 focus:outline-none" placeholder="Contoh: redstoner, pvp, builder" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-slate-400">Deskripsi / Bio Profil</label>
              <textarea value={desc} onChange={e => setDesc(e.target.value)} className="bg-black border border-white/10 p-3 rounded h-24 focus:border-orange-500 focus:outline-none resize-none text-sm text-slate-300" placeholder="Masukkan bio ringkas player..."></textarea>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold uppercase tracking-widest text-orange-400">URL Gambar Skin Kustom (Opsional)</label>
              <input type="text" value={skinUrl} onChange={e => setSkinUrl(e.target.value)} className="bg-black border border-white/10 p-3 rounded text-white focus:border-orange-500 focus:outline-none text-xs text-slate-400" placeholder="Masukkan link .png skin jika ada (Kosongkan untuk pakai default Steve)" />
            </div>

            <button type="submit" disabled={loading} className="bg-orange-600 hover:bg-orange-500 text-white font-black p-4 rounded mt-2 uppercase tracking-widest transition-all text-sm shadow-[0_0_20px_rgba(234,88,12,0.3)] disabled:opacity-50">
              {loading ? "Menyimpan ke Cluster0..." : "Simpan Perubahan Data"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
