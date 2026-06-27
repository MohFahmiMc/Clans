"use client";

import React, { useState, useEffect } from 'react';

interface Member {
  _id?: string; // MongoDB ID otomatis
  name: string;
  role: string;
  specialRoles: string[];
  description?: string;
  customSkinUrl?: string | null;
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
  const [skinUrl, setSkinUrl] = useState('');

  // 1. FUNGSI AMBIL DATA DARI MONGODB (READ)
  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch('/api/members?t=' + new Date().getTime(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setMembers(data);
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

  // 3. FUNGSI SIMPAN DATA (CREATE / UPDATE)
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const specialRolesArray = specialRoleInput
      ? specialRoleInput.split(',').map(r => r.trim().toLowerCase()).filter(Boolean)
      : [];

    const memberData = {
      id: currentMemberId, // Akan diolah di API route jika melakukan update
      name: gamertag,
      role: role,
      specialRoles: specialRolesArray,
      description: desc,
      customSkinUrl: skinUrl || null
    };

    // Tentukan method API: PUT jika sedang mengedit data lama, POST jika membuat data baru
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch('/api/members', {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(memberData)
      });
      
      if (res.ok) {
        alert(isEditing ? `Sukses! Data profil ${gamertag} berhasil di-update.` : `Sukses! ${gamertag} berhasil dimasukkan ke MongoDB.`);
        resetForm();
        fetchMembers(); // Muat ulang daftar nama roster terbaru
      } else {
        alert('Gagal memproses data ke database. Periksa kestabilan server api.');
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

      if (res.ok) {
        alert(`${member.name} telah dikeluarkan dari database clan.`);
        fetchMembers();
        if (currentMemberId === member._id) resetForm();
      } else {
        alert('Gagal menghapus data dari database.');
      }
    } catch (err) {
      console.error(err);
      alert('Terjadi gangguan koneksi internet.');
    }
  };

  // 5. FUNGSI SAAT TOMBOL EDIT DIKLIK (POPULATE FORM)
  const handleEditClick = (member: Member) => {
    setIsEditing(true);
    setCurrentMemberId(member._id || null);
    setGamertag(member.name);
    setRole(member.role);
    setSpecialRoleInput(member.specialRoles ? member.specialRoles.join(', ') : '');
    setDesc(member.description || '');
    setSkinUrl(member.customSkinUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Scroll otomatis ke atas ke area form
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
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
          <div>
            <h1 className="text-4xl md:text-5xl font-black text-orange-500 tracking-tight">COMMAND CENTER</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Database Sync: MongoDB Atlas Cluster0</p>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="w-full sm:w-auto text-xs font-bold border border-white/10 bg-white/5 px-5 py-3 rounded-lg hover:bg-red-500/20 hover:text-red-500 transition-colors uppercase tracking-wider">
            Keluar Sistem
          </button>
        </div>
        
        {/* Grid Management System */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* KOLOM KIRI: FORM CONTROL KUSTOM DATA (INPUT AREA) */}
          <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/10 shadow-xl h-fit">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">
                {isEditing ? "⚙️ Edit Profil Member" : "➕ Tambah Member Baru"}
              </h2>
              {isEditing && (
                <button onClick={resetForm} className="text-[10px] bg-white/10 text-slate-300 px-2 py-1 rounded hover:bg-white/20 transition-all font-bold uppercase tracking-wider">
                  Batal
                </button>
              )}
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gamertag Player</label>
                <input 
                  type="text" 
                  value={gamertag} 
                  onChange={e => setGamertag(e.target.value)} 
                  className="bg-black border border-white/10 p-3 rounded text-white focus:border-orange-500 focus:outline-none font-bold text-sm" 
                  placeholder="Contoh: MohFahmiMc" 
                  required 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pangkat / Role Clan</label>
                <select 
                  value={role} 
                  onChange={e => setRole(e.target.value)} 
                  className="bg-black border border-white/10 p-3 rounded text-white focus:border-orange-500 focus:outline-none font-bold text-sm"
                >
                  <option value="Leader">Leader</option>
                  <option value="Admin">Admin</option>
                  <option value="Member">Member</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Keahlian (Pisahkan dengan koma `,` jika multi-role)</label>
                <input 
                  type="text" 
                  value={specialRoleInput} 
                  onChange={e => setSpecialRoleInput(e.target.value)} 
                  className="bg-black border border-white/10 p-3 rounded text-white focus:border-orange-500 focus:outline-none text-sm text-slate-300" 
                  placeholder="Contoh: redstoner, pvp, builder" 
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Deskripsi Ringkas / Bio Profil</label>
                <textarea 
                  value={desc} 
                  onChange={e => setDesc(e.target.value)} 
                  className="bg-black border border-white/10 p-3 rounded h-24 focus:border-orange-500 focus:outline-none resize-none text-xs text-slate-300 leading-relaxed" 
                  placeholder="Ketik quote atau info detail kontribusi player di sini..."
                ></textarea>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-orange-400">Custom Skin PNG Link (Direct URL)</label>
                <input 
                  type="text" 
                  value={skinUrl} 
                  onChange={e => setSkinUrl(e.target.value)} 
                  className="bg-black border border-white/10 p-3 rounded text-white focus:border-orange-500 focus:outline-none text-xs text-slate-400 font-mono" 
                  placeholder="Contoh: https://i.imgur.com/xxx.png" 
                />
                <p className="text-[9px] text-slate-500 leading-normal">Tempel direct link skin kustom jika ada. Kosongkan jika ingin sistem memuat skin standar secara otomatis.</p>
              </div>

              <button 
                type="submit" 
                disabled={loading} 
                className={`w-full font-black p-4 rounded-lg mt-2 uppercase tracking-widest transition-all text-xs text-white disabled:opacity-50 ${isEditing ? 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,0.3)]' : 'bg-orange-600 hover:bg-orange-500 shadow-[0_0_15px_rgba(234,88,12,0.3)]'}`}
              >
                {loading ? "Sinkronisasi..." : isEditing ? "Update Data Member" : "Simpan Member Baru"}
              </button>
            </form>
          </div>

          {/* KOLOM KANAN: DAFTAR KONTROL ROSTER AKTIF (DATABASE CONTROL VIEW) */}
          <div className="lg:col-span-2 bg-[#0a0a0a] p-6 rounded-xl border border-white/10 shadow-xl h-fit">
            <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-white uppercase tracking-tight">📋 Roster Terdaftar di MongoDB</h2>
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
              <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                {members.map((member, i) => (
                  <div 
                    key={i} 
                    className="bg-black/40 border border-white/5 rounded-lg p-4 flex items-center justify-between gap-4 hover:border-white/10 transition-colors"
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-slate-800 text-white font-black flex items-center justify-center text-sm uppercase">
                        {member.name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-black text-white truncate">{member.name}</h4>
                          <span className="text-[8px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border border-white/10 bg-white/5 text-slate-400">
                            {member.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate max-w-[250px] sm:max-w-md">
                          {member.specialRoles && member.specialRoles.length > 0 
                            ? `Roles: ${member.specialRoles.join(', ')}` 
                            : 'Tidak ada keahlian khusus'}
                        </p>
                      </div>
                    </div>

                    {/* ACTION CONTROL BUTTONS */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button 
                        onClick={() => handleEditClick(member)}
                        className="text-[10px] font-bold uppercase tracking-wider bg-blue-600/10 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded hover:bg-blue-600 hover:text-white transition-colors"
                      >
                        Edit
                      </button>
                      <button 
                        onClick={() => handleDelete(member)}
                        className="text-[10px] font-bold uppercase tracking-wider bg-red-600/10 border border-red-500/30 text-red-400 px-3 py-1.5 rounded hover:bg-red-600 hover:text-white transition-colors"
                      >
                        Hapus
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
