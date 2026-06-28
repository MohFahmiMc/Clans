"use client";

import React, { useState, useEffect } from 'react';

interface Alliance {
  _id?: string;
  name: string;
  owner: string;
  network: string;
  createdDate: string;
  philosophy: string;
  slogan: string;
  logoUrl?: string | null;
  order?: number;
}

export default function AllianceManager() {
  const [alliances, setAlliances] = useState<Alliance[]>([]);
  const [loadingAlliances, setLoadingAlliances] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [currentAllianceId, setCurrentAllianceId] = useState<string | null>(null);
  const [clanName, setClanName] = useState('');
  const [owner, setOwner] = useState('');
  const [network, setNetwork] = useState('Official ProwNetwork Clan');
  const [createdDate, setCreatedDate] = useState('');
  const [philosophy, setPhilosophy] = useState('');
  const [slogan, setSlogan] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const getAdminPassword = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('freedom_admin_password') || '';
    }
    return '';
  };

  const fetchAlliances = async () => {
    setLoadingAlliances(true);
    try {
      const res = await fetch('/api/alliances?t=' + new Date().getTime(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a: Alliance, b: Alliance) => (a.order || 0) - (b.order || 0));
        setAlliances(sorted);
        setOrderChanged(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAlliances(false);
    }
  };

  useEffect(() => {
    fetchAlliances();
  }, []);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Logo terlalu besar! Maksimal ukuran adalah 2 MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAlliance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clanName.trim() || !owner.trim()) return;
    setLoading(true);

    const password = getAdminPassword();
    const currentOrder = isEditing 
      ? (alliances.find(a => a._id === currentAllianceId)?.order ?? alliances.length)
      : alliances.length;

    const payload = {
      id: currentAllianceId,
      password,
      name: clanName.trim(),
      owner: owner.trim(),
      network: network.trim(),
      createdDate: createdDate.trim(),
      philosophy: philosophy.trim(),
      slogan: slogan.trim(),
      logoUrl: logoUrl.trim() || null,
      order: currentOrder
    };

    try {
      const res = await fetch('/api/alliances', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Data aliansi klan berhasil disinkronisasi.');
        resetForm();
        fetchAlliances();
      } else {
        alert('Gagal memproses data aliansi klan.');
      }
    } catch (err) {
      alert('Kesalahan jaringan terjadi.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (a: Alliance) => {
    setIsEditing(true);
    setCurrentAllianceId(a._id || null);
    setClanName(a.name);
    setOwner(a.owner);
    setNetwork(a.network);
    setCreatedDate(a.createdDate);
    setPhilosophy(a.philosophy);
    setSlogan(a.slogan);
    setLogoUrl(a.logoUrl || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteAlliance = async (id: string, name: string) => {
    if (!confirm(`Hapus klan aliansi ${name} secara permanen?`)) return;
    const password = getAdminPassword();
    try {
      const res = await fetch('/api/alliances', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
      });
      if (res.ok) {
        fetchAlliances();
        resetForm();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const moveAlliance = (index: number, direction: 'up' | 'down') => {
    const updated = [...alliances];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;

    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    setAlliances(updated.map((item, idx) => ({ ...item, order: idx })));
    setOrderChanged(true);
  };

  const saveAllianceOrder = async () => {
    setSavingOrder(true);
    const password = getAdminPassword();
    try {
      await Promise.all(alliances.map((a, idx) => 
        fetch('/api/alliances', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: a._id,
            password,
            name: a.name,
            owner: a.owner,
            network: a.network,
            createdDate: a.createdDate,
            philosophy: a.philosophy,
            slogan: a.slogan,
            logoUrl: a.logoUrl,
            order: idx
          })
        })
      ));
      setOrderChanged(false);
      alert('Struktur posisi urutan Aliansi klan diperbarui di Cloud!');
      fetchAlliances();
    } catch (err) {
      alert('Gagal mengamankan urutan aliansi.');
    } finally {
      setSavingOrder(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentAllianceId(null);
    setClanName('');
    setOwner('');
    setNetwork('Official ProwNetwork Clan');
    setCreatedDate('');
    setPhilosophy('');
    setSlogan('');
    setLogoUrl('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* SEKSI FORM INPUT */}
      <div className="bg-[#0a0a0b]/90 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-xl h-fit">
        <h3 className="text-sm font-black uppercase tracking-wider mb-4 border-b border-white/5 pb-2 text-orange-500">
          {isEditing ? 'Edit Data Aliansi' : 'Tambah Aliansi Clan'}
        </h3>
        <form onSubmit={handleSaveAlliance} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Nama Clan Aliansi</label>
            <input type="text" value={clanName} onChange={e => setClanName(e.target.value)} placeholder="Contoh: OWL NeverDie" className="bg-black border border-white/10 p-3 rounded text-sm text-white font-bold focus:outline-none focus:border-orange-500" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Nama Owner (Owned By)</label>
            <input type="text" value={owner} onChange={e => setOwner(e.target.value)} placeholder="Contoh: Gedthen" className="bg-black border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-orange-500" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Afiliasi Jaringan (Network)</label>
            <input type="text" value={network} onChange={e => setNetwork(e.target.value)} placeholder="Official ProwNetwork Clan" className="bg-black border border-white/10 p-3 rounded text-sm text-slate-300 focus:outline-none focus:border-orange-500" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Kapan Aliansi Dimulai (Created On)</label>
            <input type="text" value={createdDate} onChange={e => setCreatedDate(e.target.value)} placeholder="Contoh: 11/20/2023 atau 20 November 2023" className="bg-black border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-orange-500" required />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Filosofi Clan</label>
            <textarea value={philosophy} onChange={e => setPhilosophy(e.target.value)} placeholder="Tulis esai landasan filosofi klan aliansi..." className="bg-black border border-white/10 p-3 rounded h-20 text-xs text-slate-300 leading-relaxed focus:outline-none focus:border-orange-500 resize-none" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Slogan Clan</label>
            <textarea value={slogan} onChange={e => setSlogan(e.target.value)} placeholder="Motto atau jargon seruan perang klan..." className="bg-black border border-white/10 p-3 rounded h-16 text-xs text-slate-300 leading-relaxed focus:outline-none focus:border-orange-500 resize-none" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Link URL Logo Clan</label>
            <input type="text" value={logoUrl} onChange={e => setLogoUrl(e.target.value)} placeholder="https://link-gambar-logo.com/logo.png" className="bg-black border border-white/10 p-3 rounded text-xs text-white focus:outline-none focus:border-orange-500" />
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Atau Unggah File Logo Clan</label>
            <input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-bold file:bg-orange-500/20 file:text-orange-400 file:cursor-pointer hover:file:bg-orange-500/30" />
            {logoUrl && (
              <div className="mt-2 p-2 bg-black border border-white/5 rounded flex flex-col items-center">
                <img src={logoUrl} alt="Logo Preview" className="max-h-20 object-contain" />
                <button type="button" onClick={() => setLogoUrl('')} className="text-[10px] text-red-400 mt-1 hover:underline">Hapus Logo</button>
              </div>
            )}
          </div>

          <div className="flex gap-2 mt-2">
            <button type="submit" disabled={loading} className="flex-1 bg-orange-600 hover:bg-orange-500 font-black py-3 rounded-lg text-xs uppercase tracking-widest text-white transition-all">
              {loading ? "Menyimpan..." : (isEditing ? 'Perbarui Aliansi' : 'Simpan Aliansi')}
            </button>
            {isEditing && (
              <button type="button" onClick={resetForm} className="bg-neutral-800 hover:bg-neutral-700 font-bold px-4 rounded-lg text-xs uppercase transition-colors">Batal</button>
            )}
          </div>
        </form>
      </div>

      {/* SEKSI DAFTAR UTAMA ALIANSI */}
      <div className="lg:col-span-2 bg-[#0a0a0b]/90 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-xl h-fit">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-white/10 pb-4 gap-3">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Hub Aliansi Terdaftar</h2>
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
            {orderChanged && (
              <button type="button" onClick={saveAllianceOrder} disabled={savingOrder} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all flex items-center gap-1 shadow-lg">
                Simpan Urutan Struktur
              </button>
            )}
            <span className="text-xs bg-orange-500/10 text-orange-400 font-bold px-2.5 py-1 rounded-full border border-orange-500/20 whitespace-nowrap">Total: {alliances.length} Klan</span>
          </div>
        </div>

        {loadingAlliances ? (
          <p className="text-xs text-slate-500 uppercase tracking-widest text-center py-8 animate-pulse">Memuat struktur database aliansi...</p>
        ) : alliances.length === 0 ? (
          <p className="text-xs text-slate-600 text-center py-8">Belum ada klan aliansi yang terdaftar.</p>
        ) : (
          <div className="flex flex-col gap-3 max-h-[650px] overflow-y-auto pr-1">
            {alliances.map((a, idx) => (
              <div key={a._id || idx} className="bg-black/40 border border-white/5 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition-colors">
                <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                  <div className="flex flex-col gap-1 bg-black/80 p-1 rounded-md border border-white/5">
                    <button type="button" onClick={() => moveAlliance(idx, 'up')} disabled={idx === 0} className="text-slate-500 hover:text-orange-500 disabled:opacity-20 transition-colors p-0.5">▲</button>
                    <button type="button" onClick={() => moveAlliance(idx, 'down')} disabled={idx === alliances.length - 1} className="text-slate-500 hover:text-orange-500 disabled:opacity-20 transition-colors p-0.5">▼</button>
                  </div>
                  
                  <div className="flex items-center gap-3 min-w-0">
                    {a.logoUrl && <img src={a.logoUrl} alt="" className="w-10 h-10 object-contain bg-black/50 p-1 rounded border border-white/10 flex-shrink-0" />}
                    <div className="min-w-0">
                      <h4 className="text-sm font-black text-white break-all">#{idx + 1} {a.name}</h4>
                      <p className="text-[10px] text-orange-400 font-bold uppercase tracking-wider">Owner: {a.owner} • <span className="text-slate-400 text-[9px]">{a.createdDate}</span></p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0 flex-shrink-0 w-full sm:w-auto">
                  <button type="button" onClick={() => handleEditClick(a)} className="p-2 text-blue-400 hover:text-white bg-blue-500/5 hover:bg-blue-600 rounded-lg border border-blue-500/10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                  </button>
                  <button type="button" onClick={() => handleDeleteAlliance(a._id!, a.name)} className="p-2 text-red-400 hover:text-white bg-red-500/5 hover:bg-red-600 rounded-lg border border-red-500/10">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
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
