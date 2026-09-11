"use client";

import React, { useState, useEffect, useMemo } from 'react';

interface GalleryItem {
  _id?: string;
  title: string;
  description: string;
  imageUrl: string;
  createdAt?: string;
  updatedAt?: string;
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

export default function GalleryManager() {
  const [galleryList, setGalleryList] = useState<GalleryItem[]>([]);
  const [loadingItems, setLoadingItems] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form States
  const [isEditing, setIsEditing] = useState(false);
  const [currentItemId, setCurrentItemId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [inputMode, setInputMode] = useState<'upload' | 'url'>('url');

  // New Features States: Search, Sort, View, and Lightbox Preview
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [previewModalItem, setPreviewModalItem] = useState<GalleryItem | null>(null);

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

  const fetchGallery = async () => {
    setLoadingItems(true);
    try {
      const res = await fetch('/api/gallery?t=' + new Date().getTime(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setGalleryList(data);
      } else {
        showToast('Gagal memuat arsip galeri.', 'error');
      }
    } catch (err) {
      console.error(err);
      showToast('Gagal terhubung ke server galeri.', 'error');
    } finally {
      setLoadingItems(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Format otomatis URL Imgur biasa agar langsung merujuk ke gambar mentah
  const processImageUrl = (url: string): string => {
    let clean = url.trim();
    if (clean.includes('imgur.com/') && !clean.includes('i.imgur.com/')) {
      const match = clean.match(/imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]+)/);
      if (match && match[1] && !clean.includes('/a/') && !clean.includes('/gallery/')) {
        return `https://i.imgur.com/${match[1]}.png`;
      }
    }
    return clean;
  };

  // Upload handler dengan batas maksimal 1 MB
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const MAX_SIZE = 1 * 1024 * 1024; // 1 MB
    if (file.size > MAX_SIZE) {
      showToast('Ukuran berkas terlalu besar! Maksimal 1 MB. Gunakan opsi Link / Imgur jika berkas > 1 MB.', 'error');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageUrl(reader.result as string);
      showToast('Berhasil memuat preview gambar berkas.', 'success');
    };
    reader.readAsDataURL(file);
  };

  const handleUrlChange = (val: string) => {
    const formatted = processImageUrl(val);
    if (val.includes('imgur.com/a/') || val.includes('imgur.com/gallery/')) {
      showToast('Link Album Imgur terdeteksi. Gunakan URL gambar langsung jika thumbnail tidak tampil.', 'success');
    }
    setImageUrl(formatted);
  };

  const handleSaveGallery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageUrl.trim()) {
      showToast('Berkas gambar atau Link URL wajib diisi!', 'error');
      return;
    }

    setLoading(true);
    const password = getAdminPassword();

    const payload = {
      id: currentItemId,
      password,
      title: title.trim(),
      description: description.trim(),
      imageUrl: imageUrl.trim()
    };

    try {
      const res = await fetch('/api/gallery', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();

      if (res.ok && result.success) {
        showToast(isEditing ? 'Dokumentasi galeri diperbarui.' : 'Foto baru berhasil diabadikan ke galeri.', 'success');
        resetForm();
        fetchGallery();
      } else {
        showToast(result.error || 'Gagal menyimpan data galeri.', 'error');
      }
    } catch (err) {
      showToast('Kesalahan jaringan terjadi.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (item: GalleryItem) => {
    setIsEditing(true);
    setCurrentItemId(item._id || null);
    setTitle(item.title || '');
    setDescription(item.description || '');
    setImageUrl(item.imageUrl || '');
    
    if (item.imageUrl?.startsWith('data:image')) {
      setInputMode('upload');
    } else {
      setInputMode('url');
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    showToast(`Mode edit aktif: ${item.title || 'Dokumentasi'}`, 'success');
  };

  const handleDeleteClick = (id: string, itemTitle: string) => {
    setModal({
      isOpen: true,
      title: 'Hapus Gambar Galeri?',
      message: `Apakah Anda yakin ingin menghapus foto "${itemTitle || 'Dokumentasi'}" dari basis data galeri?`,
      confirmText: 'Ya, Hapus Permanen',
      cancelText: 'Batal',
      onConfirm: async () => {
        closeModal();
        const password = getAdminPassword();
        try {
          const res = await fetch('/api/gallery', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, password })
          });

          const result = await res.json();
          if (res.ok && result.success) {
            showToast('Berkas gambar galeri berhasil dihapus.', 'success');
            fetchGallery();
            if (currentItemId === id) resetForm();
          } else {
            showToast(result.error || 'Gagal menghapus gambar.', 'error');
          }
        } catch (err) {
          console.error(err);
          showToast('Terjadi kesalahan jaringan.', 'error');
        }
      }
    });
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Tautan gambar berhasil disalin ke clipboard!', 'success');
  };

  const resetForm = () => {
    setIsEditing(false);
    setCurrentItemId(null);
    setTitle('');
    setDescription('');
    setImageUrl('');
    setInputMode('url');
  };

  // Filter & Sorting Logic
  const filteredGallery = useMemo(() => {
    return galleryList
      .filter(item => {
        const q = searchQuery.toLowerCase();
        return (
          (item.title || '').toLowerCase().includes(q) ||
          (item.description || '').toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        const timeA = new Date(a.createdAt || 0).getTime();
        const timeB = new Date(b.createdAt || 0).getTime();
        return sortBy === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [galleryList, searchQuery, sortBy]);

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

      {/* MODAL DIALOG KONFIRMASI CUSTOM */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#121217] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
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

      {/* LIGHTBOX PREVIEW MODAL */}
      {previewModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md transition-all">
          <div className="relative max-w-4xl w-full bg-[#121217] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-black/40">
              <h3 className="text-sm font-bold text-white truncate pr-4">
                {previewModalItem.title || 'Preview Dokumentasi'}
              </h3>
              <button
                type="button"
                onClick={() => setPreviewModalItem(null)}
                className="p-1.5 text-slate-400 hover:text-white bg-white/5 rounded-lg border border-white/10 transition-all text-xs"
              >
                ✕ Tutup
              </button>
            </div>

            <div className="p-4 overflow-y-auto flex-1 flex flex-col items-center justify-center bg-black/60">
              <img
                src={previewModalItem.imageUrl}
                alt={previewModalItem.title}
                className="max-h-[60vh] object-contain rounded-xl border border-white/10 shadow-xl"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/800x500/121217/FFF?text=Imgur+Album+/+Preview+Tidak+Tersedia';
                }}
              />
              {previewModalItem.description && (
                <p className="mt-4 text-xs text-slate-300 text-center max-w-xl leading-relaxed bg-black/40 p-3 rounded-xl border border-white/5">
                  {previewModalItem.description}
                </p>
              )}
            </div>

            <div className="p-4 border-t border-white/10 flex items-center justify-between bg-black/40 text-xs">
              <span className="text-slate-500">
                {previewModalItem.createdAt ? new Date(previewModalItem.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Tanggal tidak diketahui'}
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(previewModalItem.imageUrl)}
                  className="px-3 py-1.5 bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 border border-orange-500/30 rounded-lg font-semibold transition-all"
                >
                  Salin URL
                </button>
                <a
                  href={previewModalItem.imageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10 rounded-lg font-semibold transition-all"
                >
                  Buka Asli ↗
                </a>
              </div>
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
              {isEditing ? 'Edit Dokumentasi' : 'Upload Galeri Baru'}
            </h3>
            {isEditing && (
              <span className="text-[10px] font-bold bg-orange-500/10 text-orange-400 px-2 py-0.5 rounded border border-orange-500/20">
                Mode Edit
              </span>
            )}
          </div>

          <form onSubmit={handleSaveGallery} className="flex flex-col gap-4">
            
            {/* JUDUL FOTO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Judul Dokumentasi
              </label>
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Contoh: Momen Kemenangan War Clan" 
                className="bg-black/70 border border-white/10 p-3 rounded-xl text-xs text-white placeholder-slate-600 font-bold focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
              />
            </div>

            {/* DESKRIPSI FOTO */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">
                Deskripsi / Catatan Momen
              </label>
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)} 
                placeholder="Tuliskan keterangan singkat dokumentasi..." 
                className="bg-black/70 border border-white/10 p-3 rounded-xl h-20 text-xs text-slate-300 placeholder-slate-600 leading-relaxed focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-y" 
              />
            </div>

            {/* TIPE INPUT SUMBER GAMBAR */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center justify-between">
                <span>Sumber Berkas Gambar</span>
                <span className="text-orange-400 font-normal">Maks 1 MB File</span>
              </label>

              <div className="grid grid-cols-2 gap-2 bg-black/50 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setInputMode('url')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    inputMode === 'url'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Link / Imgur Album
                </button>
                <button
                  type="button"
                  onClick={() => setInputMode('upload')}
                  className={`py-2 text-xs font-bold rounded-lg transition-all ${
                    inputMode === 'upload'
                      ? 'bg-orange-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Upload File (&le; 1MB)
                </button>
              </div>
            </div>

            {/* OPSI INPUT: LINK URL / ALBUM IMGUR */}
            {inputMode === 'url' ? (
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
                  <span>URL Gambar / Link Album Imgur</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="text" 
                  value={imageUrl} 
                  onChange={e => handleUrlChange(e.target.value)} 
                  placeholder="https://i.imgur.com/... atau https://imgur.com/a/..." 
                  className="bg-black/70 border border-white/10 p-3 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
                />
                <p className="text-[10px] text-slate-500 italic">
                  Dukungan otomatis untuk konversi URL Imgur biasa ke direktori file.
                </p>
              </div>
            ) : (
              /* OPSI INPUT: FILE UPLOAD */
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400 flex items-center gap-1.5">
                  <span>Pilih Berkas Gambar (&le; 1 MB)</span>
                  <span className="text-rose-500">*</span>
                </label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleImageUpload} 
                  className="text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-500/10 file:text-orange-400 file:cursor-pointer hover:file:bg-orange-500/20 transition-all border border-white/10 rounded-xl bg-black/70 p-1.5" 
                />
              </div>
            )}

            {/* PREVIEW GAMBAR LIVE */}
            {imageUrl && (
              <div className="p-3 bg-black/60 border border-white/10 rounded-xl flex flex-col items-center gap-2 group relative">
                <img 
                  src={imageUrl} 
                  alt="Preview Documentation" 
                  className="max-h-40 w-full object-cover rounded-lg border border-white/5" 
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/600x400/121217/FFF?text=Preview+Album+/+Pratinjau+Link';
                  }}
                />
                <div className="flex items-center justify-between w-full pt-1">
                  <span className="text-[10px] text-slate-400 truncate max-w-[180px]">{imageUrl}</span>
                  <button 
                    type="button" 
                    onClick={() => setImageUrl('')} 
                    className="text-[10px] text-rose-400 hover:text-rose-300 font-bold hover:underline flex items-center gap-1 shrink-0"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            )}

            {/* BUTTON SUBMIT */}
            <div className="flex gap-2 mt-2">
              <button 
                type="submit" 
                disabled={loading} 
                className="flex-1 bg-orange-600 hover:bg-orange-500 active:scale-[0.99] font-black py-3.5 rounded-xl text-xs uppercase tracking-widest text-white transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Memproses...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{isEditing ? 'Perbarui Foto' : 'Abadikan ke Galeri'}</span>
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

        {/* SEKSI DAFTAR GALERI FOTO */}
        <div className="lg:col-span-2 bg-[#0f0f12] p-6 rounded-2xl border border-white/10 shadow-xl h-fit">
          
          {/* HEADER & FILTER BAR */}
          <div className="flex flex-col gap-4 mb-6 border-b border-white/10 pb-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-tight flex items-center gap-2">
                  <span>Arsip Dokumentasi Galeri</span>
                </h2>
                <p className="text-[11px] text-slate-400 mt-0.5">Kelola foto dokumentasi, album, serta informasi momen klan</p>
              </div>
              
              <span className="text-xs bg-orange-500/10 text-orange-400 font-bold px-3 py-1.5 rounded-full border border-orange-500/20 whitespace-nowrap">
                {filteredGallery.length} / {galleryList.length} Foto
              </span>
            </div>

            {/* TOOLBAR PENCARIAN & TAMPILAN */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 pt-2">
              <div className="sm:col-span-6 relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari berdasarkan judul / deskripsi..."
                  className="w-full bg-black/70 border border-white/10 px-3.5 py-2 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </div>

              <div className="sm:col-span-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest')}
                  className="w-full bg-black/70 border border-white/10 px-3 py-2 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-orange-500 transition-all"
                >
                  <option value="newest">Terbaru</option>
                  <option value="oldest">Terlama</option>
                </select>
              </div>

              <div className="sm:col-span-3 flex bg-black/50 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                    viewMode === 'grid' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('list')}
                  className={`flex-1 py-1 text-xs font-bold rounded-lg transition-all ${
                    viewMode === 'list' ? 'bg-orange-600 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  List
                </button>
              </div>
            </div>
          </div>

          {loadingItems ? (
            <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 animate-pulse">Memuat arsip berkas galeri...</p>
            </div>
          ) : filteredGallery.length === 0 ? (
            <div className="border border-dashed border-white/10 p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-400">
                {searchQuery ? 'Tidak ada hasil foto yang cocok.' : 'Belum ada foto galeri terdaftar.'}
              </p>
              <p className="text-[11px] text-slate-500">Gunakan formulir di sebelah kiri untuk mengunggah foto baru.</p>
            </div>
          ) : (
            <div className={`max-h-[680px] overflow-y-auto pr-1 custom-scrollbar ${
              viewMode === 'grid' 
                ? 'grid grid-cols-1 sm:grid-cols-2 gap-4' 
                : 'flex flex-col gap-3'
            }`}>
              {filteredGallery.map((item, idx) => (
                <div 
                  key={item._id || idx} 
                  className={`bg-black/50 border border-white/10 hover:border-white/20 rounded-xl overflow-hidden flex transition-all shadow-md group ${
                    viewMode === 'grid' ? 'flex-col justify-between' : 'flex-row items-center p-3 justify-between gap-4'
                  }`}
                >
                  
                  <div className={viewMode === 'grid' ? '' : 'flex items-center gap-3 overflow-hidden flex-1'}>
                    {/* GAMBAR PREVIEW */}
                    <div 
                      onClick={() => setPreviewModalItem(item)}
                      className={`relative cursor-pointer overflow-hidden border-white/10 group-hover:opacity-90 transition-all ${
                        viewMode === 'grid' ? 'h-44 bg-black/80 border-b w-full' : 'w-20 h-20 rounded-lg shrink-0 border'
                      }`}
                    >
                      <img 
                        src={item.imageUrl} 
                        alt={item.title || 'Galeri'} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = 'https://placehold.co/600x400/121217/FFF?text=Imgur+Album+/+Preview';
                        }}
                      />
                      {viewMode === 'grid' && (
                        <div className="absolute top-2 right-2 bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded text-[10px] font-bold text-orange-400">
                          #{idx + 1}
                        </div>
                      )}
                    </div>

                    {/* DETAIL DESKRIPSI */}
                    <div className={viewMode === 'grid' ? 'p-4 flex flex-col gap-1' : 'flex flex-col gap-0.5 overflow-hidden'}>
                      <h4 
                        onClick={() => setPreviewModalItem(item)}
                        className="text-xs font-black text-white truncate cursor-pointer hover:text-orange-400 transition-colors"
                      >
                        {item.title || 'Dokumentasi Freedom'}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                        {item.description || 'Tidak ada deskripsi.'}
                      </p>
                    </div>
                  </div>

                  {/* FOOTER & BUTTON ACTION */}
                  <div className={`p-3 bg-black/40 border-white/5 flex items-center justify-between gap-2 ${
                    viewMode === 'grid' ? 'border-t w-full' : 'border-0 shrink-0'
                  }`}>
                    {viewMode === 'grid' && (
                      <span className="text-[10px] text-slate-500 font-medium">
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Baru saja'}
                      </span>
                    )}

                    <div className="flex items-center gap-1.5">
                      <button 
                        type="button" 
                        onClick={() => copyToClipboard(item.imageUrl)} 
                        title="Salin Tautan Gambar"
                        className="p-1.5 text-orange-400 hover:text-white bg-orange-500/10 hover:bg-orange-600 rounded-lg border border-orange-500/20 transition-all text-xs font-semibold px-2 flex items-center gap-1"
                      >
                        🔗
                      </button>

                      <button 
                        type="button" 
                        onClick={() => handleEditClick(item)} 
                        title="Edit Foto"
                        className="p-1.5 text-sky-400 hover:text-white bg-sky-500/10 hover:bg-sky-600 rounded-lg border border-sky-500/20 transition-all text-xs font-semibold px-2.5 flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                        <span>Edit</span>
                      </button>

                      <button 
                        type="button" 
                        onClick={() => handleDeleteClick(item._id!, item.title)} 
                        title="Hapus Foto"
                        className="p-1.5 text-rose-400 hover:text-white bg-rose-500/10 hover:bg-rose-600 rounded-lg border border-rose-500/20 transition-all text-xs font-semibold px-2.5 flex items-center gap-1"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Hapus</span>
                      </button>
                    </div>
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
