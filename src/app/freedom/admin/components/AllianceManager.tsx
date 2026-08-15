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

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
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
  const [network, setNetwork] = useState('Official Network Clan');
  const [createdDate, setCreatedDate] = useState('');
  const [philosophy, setPhilosophy] = useState('');
  const [slogan, setSlogan] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  // Custom Modal & Toast States
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    onConfirm: () => {},
  });

  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

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
      showToast('Gagal memuat data aliansi', 'error');
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
      showToast('Logo terlalu besar! Maksimal ukuran adalah 2 MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoUrl(reader.result as string);
      showToast('Berhasil memuat gambar preview logo.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAlliance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clanName.trim() || !owner.trim()) {
      showToast('Nama Clan dan Owner wajib diisi!', 'error');
      return;
    }
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
        showToast(isEditing ? 'Data aliansi berhasil diperbarui.' : 'Aliansi klan baru berhasil ditambahkan.', 'success');
        resetForm();
        fetchAlliances();
      } else {
        showToast('Gagal memproses data aliansi klan.', 'error');
      }
    } catch (err) {
      showToast('Kesalahan jaringan terjadi.', 'error');
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
    showToast(`Mode edit aktif: ${a.name}`, 'success');
  };

  const handleDeleteAlliance = (id: string, name: string) => {
    setModal({
      isOpen: true,
      title: 'Hapus Aliansi Clan?',
      message: `Apakah Anda yakin ingin menghapus klan aliansi "${name}" secara permanen? Data yang dihapus tidak dapat dikembalikan.`,
      confirmText: 'Ya, Hapus Permanen',
      cancelText: 'Batal',
      onConfirm: async () => {
        closeModal();
        const password = getAdminPassword();
        try {
          const res = await fetch('/api/alliances', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, password })
          });
          if (res.ok) {
            showToast(`Klan ${name} berhasil dihapus.`, 'success');
            fetchAlliances();
            resetForm();
          } else {
            showToast('Gagal menghapus aliansi.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Terjadi kesalahan jaringan.', 'error');
        }
      }
    });
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
      showToast('Struktur posisi urutan Aliansi klan diperbarui di Cloud!', 'success');
      fetchAlliances();
    } catch (err) {
      showToast('Gagal mengamankan urutan aliansi.', 'error');
    } finally {
      setSavingOrder(false);
    }
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentAllianceId(null);
    setClanName('');
    setOwner('');
    setNetwork('Official Network Clan');
    setCreatedDate('');
    setPhilosophy('');
    setSlogan('');
    setLogoUrl('');
  };

  return (
    <div className="relative">
      
      {/* TOAST NOTIFICATION CUSTOM */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-xl transition-all animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-xs font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* MODAL DIALOG KONFIRMASI CUSTOM (YES / NO) */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121217] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{modal.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{modal.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end pt-3 border-t border-white/5 mt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                {modal.cancelText || 'Batal'}
              </button>
              <button
                type="button"
                onClick={modal.onConfirm}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition-all"
              >
                {modal.confirmText || 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTAINER GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* SEKSI FORM INPUT */}
        <div className="bg-[#0f0f12] p-6 rounded-2xl border border-white/10 shadow-xl h-fit relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-3">
            <h3 className="text-sm font-black uppercase tracking-wider text-orange-500 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
              {isEditing ? 'Edit Data Aliansi' : 'Tambah Aliansi Clan'}
            </h3>
            {isEditing && (
              <span className="text-[10px] font-bold bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20">
                Mode Edit
              </span>
            )}
          </div>

          <form onSubmit={handleSaveAlliance} className="flex flex-col gap-4">
            
            {/* NAMA CLAN */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
                <span>Nama Clan Aliansi</span>
                <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                value={clanName} 
                onChange={e => setClanName(e.target.value)} 
                placeholder="Contoh: Nama Clan / Aliansi Utama" 
                className="bg-black/70 border border-white/10 p-3 rounded-xl text-xs text-white placeholder-slate-600 font-bold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                required 
              />
            </div>

            {/* OWNER LEADER */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
                <span>Nama Leader / Owner Clan</span>
                <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                value={owner} 
                onChange={e => setOwner(e.target.value)} 
                placeholder="Contoh: Nama Leader / Founder" 
                className="bg-black/70 border border-white/10 p-3 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                required 
              />
            </div>

            {/* AFILIASI JARINGAN */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Afiliasi Jaringan (Network)</label>
              <input 
                type="text" 
                value={network} 
                onChange={e => setNetwork(e.target.value)} 
                placeholder="Contoh: Official Main Network / Branch Clan" 
                className="bg-black/70 border border-white/10 p-3 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
              />
            </div>

            {/* TANGGAL BERDIRI */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
                <span>Kapan Aliansi Dimulai (Created On)</span>
                <span className="text-rose-500">*</span>
              </label>
              <input 
                type="text" 
                value={createdDate} 
                onChange={e => setCreatedDate(e.target.value)} 
                placeholder="Contoh: 15 Januari 2024 / Season 1" 
                className="bg-black/70 border border-white/10 p-3 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                required 
              />
            </div>

            {/* FILOSOFI CLAN */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Filosofi Clan</label>
              <textarea 
                value={philosophy} 
                onChange={e => setPhilosophy(e.target.value)} 
                placeholder="Tuliskan landasan filosofi, visi, dan nilai utama klan aliansi..." 
                className="bg-black/70 border border-white/10 p-3 rounded-xl h-20 text-xs text-slate-300 placeholder-slate-600 leading-relaxed focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-y" 
              />
            </div>

            {/* SLOGAN CLAN */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Slogan / Motto Clan</label>
              <textarea 
                value={slogan} 
                onChange={e => setSlogan(e.target.value)} 
                placeholder="Tuliskan motto, slogan, atau seruan perang klan..." 
                className="bg-black/70 border border-white/10 p-3 rounded-xl h-16 text-xs text-slate-300 placeholder-slate-600 leading-relaxed focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-y" 
              />
            </div>

            {/* LINK LOGO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Link URL Logo Clan</label>
              <input 
                type="text" 
                value={logoUrl} 
                onChange={e => setLogoUrl(e.target.value)} 
                placeholder="https://link-gambar-logo.com/logo.png" 
                className="bg-black/70 border border-white/10 p-3 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
              />
            </div>

            {/* UNGGAH LOGO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Atau Unggah File Logo Clan</label>
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleLogoUpload} 
                className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-500/10 file:text-orange-400 file:cursor-pointer hover:file:bg-orange-500/20 transition-all" 
              />
              {logoUrl && (
                <div className="mt-2 p-3 bg-black/60 border border-white/10 rounded-xl flex flex-col items-center gap-2 group relative">
                  <img src={logoUrl} alt="Logo Preview" className="max-h-24 object-contain rounded" />
                  <button 
                    type="button" 
                    onClick={() => setLogoUrl('')} 
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold hover:underline flex items-center gap-1"
                  >
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus Logo
                  </button>
                </div>
              )}
            </div>

            {/* BUTTON SUBMIT */}
            <div className="flex gap-2 mt-3">
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-orange-600 hover:bg-orange-500 active:scale-[0.99] font-black py-3.5 rounded-xl text-xs uppercase tracking-widest text-white transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Menyimpan...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{isEditing ? 'Perbarui Aliansi' : 'Simpan Aliansi'}</span>
                  </>
                )}
              </button>
              {isEditing && (
                <button 
                  type="button" 
                  onClick={resetForm} 
                  className="bg-white/5 hover:bg-white/10 border border-white/10 font-bold px-4 rounded-xl text-xs uppercase text-slate-300 transition-all"
                >
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>

        {/* SEKSI DAFTAR UTAMA ALIANSI */}
        <div className="lg:col-span-2 bg-[#0f0f12] p-6 rounded-2xl border border-white/10 shadow-xl h-fit">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-white/10 pb-4 gap-3">
            <div>
              <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                <span>Hub Aliansi Terdaftar</span>
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">Kelola daftar klan, urutan posisi tampilan, dan informasi aliansi</p>
            </div>
            
            <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
              {orderChanged && (
                <button 
                  type="button" 
                  onClick={saveAllianceOrder} 
                  disabled={savingOrder} 
                  className="bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-[11px] font-black uppercase tracking-widest px-3.5 py-2 rounded-xl transition-all flex items-center gap-1.5 shadow-lg shadow-emerald-600/20"
                >
                  {savingOrder ? (
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                    </svg>
                  )}
                  <span>Simpan Urutan</span>
                </button>
              )}
              <span className="text-xs bg-orange-500/10 text-orange-400 font-bold px-3 py-1.5 rounded-full border border-orange-500/20 whitespace-nowrap">
                Total: {alliances.length} Klan
              </span>
            </div>
          </div>

          {loadingAlliances ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 animate-pulse">Memuat struktur database aliansi...</p>
            </div>
          ) : alliances.length === 0 ? (
            <div className="border border-dashed border-white/10 p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-400">Belum ada klan aliansi yang terdaftar.</p>
              <p className="text-[11px] text-slate-500">Gunakan formulir di sebelah kiri untuk menambah klan baru.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 max-h-[680px] overflow-y-auto pr-1 custom-scrollbar">
              {alliances.map((a, idx) => (
                <div key={a._id || idx} className="bg-black/50 border border-white/10 hover:border-white/20 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all shadow-md group">
                  
                  {/* INFORMASI UTAMA & ORDER BUTTONS */}
                  <div className="flex items-center gap-3.5 min-w-0 w-full sm:w-auto">
                    {/* NAVIGASI URUTAN */}
                    <div className="flex flex-col gap-1 bg-black/80 p-1 rounded-lg border border-white/5 shrink-0">
                      <button 
                        type="button" 
                        onClick={() => moveAlliance(idx, 'up')} 
                        disabled={idx === 0} 
                        title="Pindahkan ke atas"
                        className="p-1 text-slate-400 hover:text-orange-400 hover:bg-white/10 rounded disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                        </svg>
                      </button>
                      <button 
                        type="button" 
                        onClick={() => moveAlliance(idx, 'down')} 
                        disabled={idx === alliances.length - 1} 
                        title="Pindahkan ke bawah"
                        className="p-1 text-slate-400 hover:text-orange-400 hover:bg-white/10 rounded disabled:opacity-20 disabled:hover:bg-transparent transition-all"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* LOGO & KLON DETAIL */}
                    <div className="flex items-center gap-3 min-w-0">
                      {a.logoUrl ? (
                        <img src={a.logoUrl} alt={a.name} className="w-11 h-11 object-contain bg-black/70 p-1.5 rounded-xl border border-white/10 shrink-0" />
                      ) : (
                        <div className="w-11 h-11 bg-white/5 border border-white/10 rounded-xl flex items-center justify-center text-slate-500 font-bold text-xs shrink-0">
                          {a.name.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      
                      <div className="min-w-0 flex flex-col gap-0.5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black bg-orange-600/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded">
                            #{idx + 1}
                          </span>
                          <h4 className="text-sm font-black text-white truncate">{a.name}</h4>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium truncate">
                          Leader: <span className="text-white font-semibold">{a.owner}</span>
                          <span className="text-slate-600 mx-1 border-r border-white/10"></span>
                          <span className="text-[10px] text-slate-500">{a.createdDate}</span>
                        </p>
                        {a.slogan && (
                          <p className="text-[10px] text-orange-400/80 italic truncate mt-0.5">
                            "{a.slogan}"
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0 shrink-0 w-full sm:w-auto">
                    <button 
                      type="button" 
                      onClick={() => handleEditClick(a)} 
                      title="Edit Klan"
                      className="p-2 text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-600 rounded-xl border border-sky-500/20 transition-all flex items-center gap-1.5 text-xs font-semibold px-3"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      <span className="hidden sm:inline">Edit</span>
                    </button>

                    <button 
                      type="button" 
                      onClick={() => handleDeleteAlliance(a._id!, a.name)} 
                      title="Hapus Klan"
                      className="p-2 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-xl border border-rose-500/20 transition-all flex items-center gap-1.5 text-xs font-semibold px-3"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span className="hidden sm:inline">Hapus</span>
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
