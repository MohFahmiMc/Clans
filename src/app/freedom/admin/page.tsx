"use client";

import React, { useState, useEffect } from 'react';
import backgroundImage from '../../../assets/background.png';

interface Member {
  _id?: string;
  name: string;
  role: string;
  specialRoles: string[];
  description?: string;
  customSkinUrl?: string | null;
  order?: number;
}

export default function AdminPortal() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Members List State
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [gamertag, setGamertag] = useState('');
  const [role, setRole] = useState('Member');
  const [specialRoleInput, setSpecialRoleInput] = useState('');
  const [desc, setDesc] = useState('');
  
  // Skin Input Mode States ('link' atau 'file')
  const [skinInputMode, setSkinInputMode] = useState<'link' | 'file'>('link');
  const [skinUrl, setSkinUrl] = useState('');

  // Helper fungsi gambar background
  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');
  const bgImgSrc = getSrc(backgroundImage);

  // 1. FUNGSI AMBIL DATA DARI MONGODB (READ)
  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch('/api/members?t=' + new Date().getTime(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        // Urutkan data berdasarkan properti 'order' dari nilai terkecil ke terbesar
        const sortedData = data.sort((a: Member, b: Member) => (a.order || 0) - (b.order || 0));
        setMembers(sortedData);
      }
    } catch (err) {
      console.error("Gagal mengambil data database:", err);
    } finally {
      setLoadingMembers(false);
    }
  };

  // Ambil data otomatis saat berhasil login admin
  useEffect(() => {
    if (isAuthenticated) {
      fetchMembers();
    }
  }, [isAuthenticated]);

  // 2. FUNGSI LOGIN VERIFIKASI ENV PASSWORD
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
        setErrorMsg('Password salah atau tidak terkonfigurasi di Vercel env!');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke sistem verifikasi.');
    }
  };

  // Konversi file gambar local skin menjadi string Base64 Data URL
  const handleSkinFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "image/png") {
      alert("Validasi Gagal: File skin Minecraft harus berformat .PNG!");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setSkinUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // 3. FUNGSI SIMPAN DATA (CREATE / UPDATE)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const specialRolesArray = specialRoleInput
      ? specialRoleInput.split(',').map(r => r.trim().toLowerCase()).filter(Boolean)
      : [];

    // Tentukan bobot urutan: Jika baru letakkan di posisi paling akhir roster
    const currentMemberOrder = isEditing 
      ? (members.find(m => m._id === currentMemberId)?.order ?? members.length)
      : members.length;

    const memberData = {
      id: currentMemberId,
      name: gamertag,
      role: role,
      specialRoles: specialRolesArray,
      description: desc,
      customSkinUrl: skinUrl || null,
      order: currentMemberOrder
    };

    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/members', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
      });
      
      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Transaksi data berhasil diproses.');
        resetForm();
        fetchMembers();
      } else {
        alert(data.error || 'Gagal memproses data ke database.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  // 4. FUNGSI HAPUS DATA MEMBER (DELETE)
  const handleDelete = async (member: Member) => {
    if (!confirm(`Apakah kamu yakin ingin menghapus ${member.name} dari clan Freedom secara permanen?`)) return;

    try {
      const res = await fetch('/api/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: member._id, name: member.name })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message || 'Data berhasil dihapus.');
        fetchMembers();
        if (currentMemberId === member._id) resetForm();
      } else {
        alert(data.error || 'Gagal menghapus data dari database.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi gangguan koneksi internet.');
    }
  };

  // 5. FUNGSI MENGATUR POSISI URUTAN MEMBER (MOVE UP / DOWN)
  const handleMoveOrder = async (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;

    const updatedList = [...members];
    
    // Ambil nilai bobot urutan lama atau gunakan index sebagai fallback dasar
    const currentOrder1 = updatedList[index].order ?? index;
    const currentOrder2 = updatedList[targetIndex].order ?? targetIndex;

    // Tukar nilai properti urutan posisi order
    updatedList[index].order = currentOrder2;
    updatedList[targetIndex].order = currentOrder1;

    // Tukar posisi elemen di dalam array lokal state untuk manipulasi visual cepat
    const temp = updatedList[index];
    updatedList[index] = updatedList[targetIndex];
    updatedList[targetIndex] = temp;

    setMembers(updatedList);

    // Kirim pembaruan posisi urutan kedua pihak yang bertukar tempat ke basis data MongoDB via API Route
    try {
      await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updatedList[index]._id,
          name: updatedList[index].name,
          role: updatedList[index].role,
          specialRoles: updatedList[index].specialRoles,
          description: updatedList[index].description,
          customSkinUrl: updatedList[index].customSkinUrl,
          order: updatedList[index].order
        })
      });

      await fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: updatedList[targetIndex]._id,
          name: updatedList[targetIndex].name,
          role: updatedList[targetIndex].role,
          specialRoles: updatedList[targetIndex].specialRoles,
          description: updatedList[targetIndex].description,
          customSkinUrl: updatedList[targetIndex].customSkinUrl,
          order: updatedList[targetIndex].order
        })
      });
    } catch (err) {
      console.error("Gagal melakukan enkripsi sinkronisasi urutan posisi database:", err);
    }
  };

  // 6. FUNGSI SAAT TOMBOL EDIT DIKLIK (POPULATE FORM)
  const handleEditClick = (member: Member) => {
    setIsEditing(true);
    setCurrentMemberId(member._id || null);
    setGamertag(member.name);
    setRole(member.role);
    setSpecialRoleInput(member.specialRoles ? member.specialRoles.join(', ') : '');
    setDesc(member.description || '');
    
    if (member.customSkinUrl) {
      setSkinUrl(member.customSkinUrl);
      if (member.customSkinUrl.startsWith('data:image')) {
        setSkinInputMode('file');
      } else {
        setSkinInputMode('link');
      }
    } else {
      setSkinUrl('');
      setSkinInputMode('link');
    }
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Reset form kembali ke semula (mode Tambah Member)
  const resetForm = () => {
    setIsEditing(false);
    setCurrentMemberId(null);
    setGamertag('');
    setRole('Member');
    setSpecialRoleInput('');
    setDesc('');
    setSkinUrl('');
    setSkinInputMode('link');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 font-sans text-white relative">
        {bgImgSrc && (
          <div className="absolute inset-0 bg-cover bg-center opacity-10 z-0 pointer-events-none mix-blend-lighten" style={{ backgroundImage: `url(${bgImgSrc})` }} />
        )}
        <div className="bg-[#0a0a0a] p-8 rounded-xl border border-white/10 shadow-2xl w-full max-w-md relative z-10">
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
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 font-sans relative overflow-x-hidden">
      
      {/* --- BACKGROUND IMAGE INTEGRATION --- */}
      {bgImgSrc && (
        <div className="absolute inset-0 bg-cover bg-center opacity-20 z-0 pointer-events-none mix-blend-lighten" style={{ backgroundImage: `url(${bgImgSrc})` }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/30 via-[#050505]/95 to-[#050505] z-0 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-orange-500 tracking-tight drop-shadow-[0_0_30px_rgba(234,88,12,0.2)]">COMMAND CENTER</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Database Sync: MongoDB Atlas Cluster0</p>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="w-full sm:w-auto text-xs font-bold border border-white/10 bg-white/5 px-5 py-3 rounded-lg hover:bg-red-500/20 hover:text-red-500 transition-colors uppercase tracking-wider">
            Keluar Sistem
          </button>
        </div>
        
        {/* Grid Management System */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: FORM CONTROL KUSTOM DATA */}
          <div className="bg-[#0a0a0a]/90 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-xl h-fit">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-lg font-bold text-white uppercase tracking-tight">
                {isEditing ? "Edit Profil Member" : "Tambah Member Baru"}
              </h2>
              {isEditing && (
                <button onClick={resetForm} className="text-[10px] bg-white/10 text-slate-300 px-2.5 py-1 rounded hover:bg-white/20 transition-all font-bold uppercase tracking-wider">
                  Batal
                </button>
              )}
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gamertag Player</label>
                <input type="text" value={gamertag} onChange={e => setGamertag(e.target.value)} className="bg-black border border-white/10 p-3 rounded text-white focus:border-orange-500 focus:outline-none font-bold text-sm" placeholder="Contoh: MohFahmiMc" required />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pangkat / Role Clan</label>
                <select value={role} onChange={e => setRole(e.target.value)} className="bg-black border border-white/10 p-3 rounded text-white focus:border-orange-500 focus:outline-none font-bold text-sm">
                  <option value="Leader">Leader</option>
                  <option value="Admin">Admin</option>
                  <option value="Member">Member</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Keahlian (Pisahkan dengan koma `,` jika multi-role)</label>
                <input type="text" value={specialRoleInput} onChange={e => setSpecialRoleInput(e.target.value)} className="bg-black border border-white/10 p-3 rounded text-white focus:border-orange-500 focus:outline-none text-sm text-slate-300" placeholder="Contoh: redstoner, pvp, builder" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Deskripsi Ringkas / Bio Profil</label>
                <textarea value={desc} onChange={e => setDesc(e.target.value)} className="bg-black border border-white/10 p-3 rounded h-24 focus:border-orange-500 focus:outline-none resize-none text-xs text-slate-300 leading-relaxed" placeholder="Ketik quote atau info detail kontribusi player di sini..."></textarea>
              </div>

              {/* INTERACTIVE DUAL SYSTEM FOR CUSTOM SKIN */}
              <div className="flex flex-col gap-2 border-t border-white/5 pt-4">
                <label className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Custom Skin Data (.PNG)</label>
                
                <div className="grid grid-cols-2 gap-1 bg-black p-1 rounded-lg border border-white/5 text-center text-[10px] font-bold uppercase tracking-wider">
                  <button type="button" onClick={() => setSkinInputMode('link')} className={`py-1.5 rounded-md transition-all ${skinInputMode === 'link' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}>Direct Link</button>
                  <button type="button" onClick={() => setSkinInputMode('file')} className={`py-1.5 rounded-md transition-all ${skinInputMode === 'file' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'}`}>Upload File</button>
                </div>

                {skinInputMode === 'link' ? (
                  <input type="text" value={skinUrl.startsWith('data:image') ? '' : skinUrl} onChange={e => setSkinUrl(e.target.value)} className="bg-black border border-white/10 p-3 rounded text-white focus:border-orange-500 focus:outline-none text-xs text-slate-400 font-mono" placeholder="Contoh: https://i.imgur.com/xxx.png" />
                ) : (
                  <div className="bg-black border border-dashed border-white/10 p-4 rounded text-center cursor-pointer relative hover:border-orange-500/30 transition-colors">
                    <input type="file" accept="image/png" onChange={handleSkinFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <span className="text-[11px] text-slate-400 font-medium block truncate px-2">
                      {skinUrl.startsWith('data:image') ? "Berkas Skin Siap Sinkronisasi" : "Pilih File Gambar Skin PNG"}
                    </span>
                  </div>
                )}
                <p className="text-[9px] text-slate-500 leading-normal">Kosongkan jika ingin menggunakan berkas skin standar aliansi secara otomatis.</p>
              </div>

              <button type="submit" disabled={loading} className={`w-full font-black p-4 rounded-lg mt-2 uppercase tracking-widest transition-all text-xs text-white disabled:opacity-50 ${isEditing ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-orange-600 hover:bg-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.3)]'}`}>
                {loading ? "Sinkronisasi..." : isEditing ? "Update Data Member" : "Simpan Member Baru"}
              </button>
            </form>
          </div>

          {/* KOLOM KANAN: DAFTAR KONTROL ROSTER AKTIF */}
          <div className="lg:col-span-2 bg-[#0a0a0a]/90 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-xl h-fit">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">Roster Terdaftar di MongoDB</h2>
              <span className="text-xs bg-orange-500/10 text-orange-400 font-bold px-2.5 py-1 rounded-full border border-orange-500/20">
                Total: {members.length} Player
              </span>
            </div>

            {loadingMembers ? (
              <div className="text-center py-20 text-slate-500 text-sm uppercase tracking-widest animate-pulse font-bold">
                Memindai Koleksi MongoDB Atlas...
              </div>
            ) : members.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/5 rounded-lg text-slate-500 text-xs">
                Tidak ada data player yang terdeteksi di Cluster0. Gunakan form kiri untuk menambahkan.
              </div>
            ) : (
              <div className="flex flex-col gap-3 max-h-[650px] overflow-y-auto pr-1">
                {members.map((member, i) => (
                  <div key={i} className="bg-black/40 border border-white/5 rounded-lg p-4 flex items-center justify-between gap-4 hover:border-white/10 transition-colors">
                    
                    {/* TATA LETAK SISI KIRI: DATA UTAMA PROFIL */}
                    <div className="flex items-center gap-4 min-w-0">
                      
                      {/* PANAL SINKRONISASI REORDER POSISI (UP / DOWN ICONS) */}
                      <div className="flex flex-col gap-1 flex-shrink-0 bg-black/60 p-1.5 rounded-lg border border-white/5">
                        <button 
                          type="button"
                          disabled={i === 0}
                          onClick={() => handleMoveOrder(i, 'up')}
                          className="text-slate-500 hover:text-orange-500 disabled:opacity-20 disabled:hover:text-slate-500 transition-colors p-0.5"
                          title="Naikkan Posisi"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" />
                          </svg>
                        </button>
                        <button 
                          type="button"
                          disabled={i === members.length - 1}
                          onClick={() => handleMoveOrder(i, 'down')}
                          className="text-slate-500 hover:text-orange-500 disabled:opacity-20 disabled:hover:text-slate-500 transition-colors p-0.5"
                          title="Turunkan Posisi"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                          </svg>
                        </button>
                      </div>

                      <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-black flex items-center justify-center text-sm uppercase flex-shrink-0">
                        {member.name.charAt(0)}
                      </div>
                      
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-black text-white truncate">{member.name}</h4>
                          <span className="text-[8px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-slate-400">
                            {member.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate max-w-[200px] sm:max-w-md">
                          {member.specialRoles && member.specialRoles.length > 0 ? `Roles: ${member.specialRoles.join(', ')}` : 'Tidak ada keahlian khusus'}
                        </p>
                      </div>
                    </div>

                    {/* PANEL SISI KANAN: ACTION BUTTONS CONTROL */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleEditClick(member)} title="Edit Data" className="p-2 text-blue-400 hover:text-white bg-blue-500/5 hover:bg-blue-600 rounded-lg border border-blue-500/10 transition-all">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button onClick={() => handleDelete(member)} title="Hapus Data" className="p-2 text-red-400 hover:text-white bg-red-500/5 hover:bg-red-600 rounded-lg border border-red-500/10 transition-all">
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
      </div>
    </div>
  );
}
