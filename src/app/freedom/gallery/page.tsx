"use client";

import React, { useState, useEffect } from 'react';
import backgroundImage from '../../../assets/background.png';

interface GalleryItem {
  _id?: string;
  title: string;
  description?: string;
  imageUrl: string;
  createdAt: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

const CACHE_KEY = 'freedom_gallery_cache_v1';

// Helper kompresi gambar HTML Canvas (800px & quality 0.6)
const compressImage = (file: File, maxWidth = 800, maxHeight = 800, quality = 0.6): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          reject(new Error('Gagal memproses kanvas gambar'));
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

// Helper otomatis konversi URL Imgur biasa/album ke Direct CDN Image
const parseImgurUrl = (url: string): string => {
  const trimmed = url.trim();
  if (!trimmed) return '';
  
  // Jika URL berupa Imgur biasa / album (contoh: https://imgur.com/a/XXXXX atau https://imgur.com/XXXXX)
  const imgurMatch = trimmed.match(/https?:\/\/(?:www\.)?imgur\.com\/(?:a\/|gallery\/)?([a-zA-Z0-9]+)/);
  if (imgurMatch && !trimmed.includes('i.imgur.com')) {
    const id = imgurMatch[1];
    return `https://i.imgur.com/${id}.png`;
  }
  return trimmed;
};

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>(() => {
    if (typeof window !== 'undefined') {
      const cached = localStorage.getItem(CACHE_KEY);
      if (cached) {
        try {
          return JSON.parse(cached);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  const [loading, setLoading] = useState<boolean>(() => items.length === 0);
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState(false);

  // Admin states
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Modal Hapus & Toast State
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info'
  });

  // Form & Upload Source states
  const [uploadSource, setUploadSource] = useState<'file' | 'url'>('file');
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<string | null>(null);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');

  // Lightbox View State
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');
  const bgImgSrc = getSrc(backgroundImage);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  // Stale-While-Revalidate Fetcher
  const fetchGallery = async () => {
    if (items.length > 0) {
      setIsSyncing(true);
    } else {
      setLoading(true);
    }

    try {
      const res = await fetch('/api/gallery?t=' + new Date().getTime(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setItems(data);
          localStorage.setItem(CACHE_KEY, JSON.stringify(data));
          setError(false);
        } else {
          if (items.length === 0) setError(true);
        }
      } else {
        if (items.length === 0) setError(true);
      }
    } catch (err) {
      console.error(err);
      if (items.length === 0) setError(true);
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      triggerToast('Ukuran file maksimal 20 MB!', 'error');
      return;
    }

    try {
      triggerToast('Mengompresi gambar...', 'info');
      const compressedDataUrl = await compressImage(file, 800, 800, 0.6);
      setImageFile(compressedDataUrl);
      triggerToast('Gambar siap diunggah', 'success');
    } catch {
      triggerToast('Gagal memproses gambar', 'error');
    }
  };

  const handleAdminVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        setIsAdmin(true);
        setShowAdminPanel(false);
        triggerToast('Mode Admin Aktif', 'success');
      } else {
        triggerToast('Password salah!', 'error');
      }
    } catch {
      triggerToast('Gagal terhubung ke server auth.', 'error');
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    let finalImageUrl = uploadSource === 'file' ? imageFile : parseImgurUrl(imageUrlInput);

    if (!isEditing && !finalImageUrl) {
      return triggerToast('Pilih file gambar atau masukkan URL gambar/Imgur!', 'info');
    }

    setUploading(true);
    const payload = { 
      password, 
      id: editingItemId, 
      title, 
      description, 
      imageData: finalImageUrl,
      imageUrl: finalImageUrl
    };
    const endpoint = '/api/gallery';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(data.message || 'Berhasil disimpan!', 'success');
        closeUploadModal();
        fetchGallery();
      } else {
        triggerToast(data.error || 'Gagal menyimpan data.', 'error');
      }
    } catch {
      triggerToast('Terjadi kesalahan jaringan.', 'error');
    } finally {
      setUploading(false);
    }
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      const res = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: itemToDelete, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(data.message || 'Foto dihapus.', 'success');
        fetchGallery();
      } else {
        triggerToast(data.error || 'Gagal menghapus.', 'error');
      }
    } catch {
      triggerToast('Gagal memproses hapus.', 'error');
    } finally {
      setItemToDelete(null);
    }
  };

  const handleEditClick = (item: GalleryItem) => {
    setIsEditing(true);
    setEditingItemId(item._id || null);
    setTitle(item.title);
    setDescription(item.description || '');
    setImageUrlInput(item.imageUrl);
    setImageFile(item.imageUrl);
    setUploadSource('url');
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setIsEditing(false);
    setEditingItemId(null);
    setTitle('');
    setDescription('');
    setImageFile(null);
    setImageUrlInput('');
  };

  const handleMinusClick = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setPassword('');
      triggerToast('Mode admin dinonaktifkan.', 'info');
    } else {
      setShowAdminPanel(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#030305] text-slate-100 font-sans relative overflow-x-hidden selection:bg-orange-500 selection:text-white">

      {/* TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl border border-white/10 bg-[#0c0c12]/90 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8)] animate-in slide-in-from-top-4 duration-300 max-w-sm">
          <span className={`w-2.5 h-2.5 rounded-full ${toast.type === 'success' ? 'bg-emerald-400 shadow-[0_0_10px_#34d399]' : toast.type === 'error' ? 'bg-rose-500 shadow-[0_0_10px_#f43f5e]' : 'bg-orange-400 shadow-[0_0_10px_#fb923c]'}`} />
          <span className="text-xs font-semibold text-slate-200">{toast.message}</span>
        </div>
      )}

      {/* BACKGROUND AMBIENT */}
      <div className="fixed inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(234,88,12,0.15),rgba(255,255,255,0))] pointer-events-none z-0" />
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#1f1f2e15_1px,transparent_1px),linear-gradient(to_bottom,#1f1f2e15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none z-0" />
      
      {bgImgSrc && (
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-20 filter blur-[2px] pointer-events-none z-0"
          style={{ backgroundImage: `url(${bgImgSrc})` }}
        />
      )}

      {/* MAIN CONTAINER */}
      <section className="max-w-7xl mx-auto py-10 md:py-16 px-4 sm:px-6 relative z-10">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6 pb-8 border-b border-white/10 relative">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[11px] font-bold tracking-widest uppercase mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-ping" />
              Freedom Clan Archives
            </div>
            <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-tight text-white flex items-center gap-3">
              GALLERY <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 via-amber-400 to-yellow-500">VAULT</span>
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-2 font-medium max-w-xl">
              Dokumentasi eksklusif, momen kemenangan, dan jejak sejarah perjalanan Clan.
            </p>
          </div>

          {/* STATUS SYNC & ADMIN BADGE */}
          <div className="flex items-center gap-3">
            {isSyncing && (
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 text-[11px] font-medium backdrop-blur-md">
                <svg className="w-3.5 h-3.5 animate-spin text-orange-400" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Menyinkronkan...
              </div>
            )}
            {isAdmin && (
              <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-emerald-400 text-xs font-bold tracking-wide uppercase shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Mode Admin
              </div>
            )}
          </div>
        </div>

        {/* GALLERY GRID / SKELETON / ERROR DISPLAY */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-72 rounded-3xl bg-white/5 border border-white/10 animate-pulse overflow-hidden p-4 flex flex-col justify-end">
                <div className="h-4 w-1/2 bg-white/10 rounded-md mb-2" />
                <div className="h-3 w-3/4 bg-white/5 rounded-md" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-16 bg-rose-950/20 border border-rose-500/20 rounded-3xl text-rose-400 text-xs font-semibold p-6 max-w-xl mx-auto flex flex-col items-center gap-3">
            <span>Gagal menyinkronkan server. Memuat arsip dari penyimpanan internal.</span>
            <button 
              onClick={fetchGallery}
              className="px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/30 text-rose-200 text-xs font-bold transition-all"
            >
              ↻ Coba Muat Ulang
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-28 border border-dashed border-white/10 rounded-3xl text-slate-500 text-xs uppercase tracking-widest font-bold">
            Belum ada dokumentasi tersimpan.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <div 
                key={item._id || index}
                className="group relative rounded-3xl bg-[#0c0c12]/80 border border-white/10 hover:border-orange-500/40 overflow-hidden transition-all duration-500 hover:shadow-[0_15px_35px_rgba(234,88,12,0.15)] flex flex-col"
              >
                <div 
                  onClick={() => setLightboxItem(item)}
                  className="w-full aspect-[16/10] bg-neutral-900 relative overflow-hidden cursor-zoom-in"
                >
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c12] via-transparent to-black/30 opacity-60 group-hover:opacity-40 transition-opacity" />

                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/40 backdrop-blur-[2px]">
                    <span className="px-4 py-2 rounded-2xl bg-orange-500 text-white text-xs font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                      Lihat Foto
                    </span>
                  </div>

                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-black/60 border border-white/10 text-[10px] font-bold text-slate-300 backdrop-blur-md">
                    {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>

                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white tracking-tight group-hover:text-orange-400 transition-colors line-clamp-1">
                      {item.title}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 line-clamp-2 leading-relaxed">
                      {item.description || 'Tidak ada deskripsi.'}
                    </p>
                  </div>
                </div>

                {isAdmin && (
                  <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 p-1.5 rounded-2xl border border-white/10 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button 
                      onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                      className="p-1.5 text-slate-300 hover:text-white hover:bg-orange-500/20 rounded-xl transition-colors"
                      title="Edit"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                      </svg>
                    </button>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setItemToDelete(item._id || null); }}
                      className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-500/20 rounded-xl transition-colors"
                      title="Hapus"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* FLOATING ADMIN CONTROLS CAPSULE */}
      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 p-1.5 rounded-2xl bg-black/70 border border-white/10 backdrop-blur-2xl shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
        <button
          onClick={handleMinusClick}
          title={isAdmin ? "Matikan Mode Admin" : "Akses Admin"}
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white text-xl font-bold transition-all ${isAdmin ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'hover:bg-white/10 text-slate-300'}`}
        >
          －
        </button>

        {isAdmin && (
          <button
            onClick={() => setShowUploadModal(true)}
            title="Tambah Dokumentasi"
            className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white text-xl font-bold flex items-center justify-center shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all"
          >
            ＋
          </button>
        )}
      </div>

      {/* MODAL UPLOAD / EDIT (DENGAN SUPPORT DUA OPSIONAL: FILE & LINK / IMGUR) */}
      {showUploadModal && isAdmin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={closeUploadModal} />
          <div className="relative bg-[#0c0c12] p-6 sm:p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl z-10">
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/10">
              <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                {isEditing ? "Edit Dokumentasi" : "Unggah Dokumentasi Baru"}
              </h3>
              <button onClick={closeUploadModal} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">Judul Momen</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Match Kemenangan Season 4"
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-1">Deskripsi</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Keterangan singkat..."
                  className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-slate-300 h-20 resize-none focus:outline-none focus:border-orange-500"
                />
              </div>

              {/* TABS METODE GAMBAR */}
              <div>
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold block mb-2">Metode Gambar</label>
                <div className="grid grid-cols-2 gap-2 mb-3 bg-white/5 p-1 rounded-xl border border-white/10">
                  <button
                    type="button"
                    onClick={() => setUploadSource('file')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${uploadSource === 'file' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    Unggah File
                  </button>
                  <button
                    type="button"
                    onClick={() => setUploadSource('url')}
                    className={`py-2 rounded-lg text-xs font-bold transition-all ${uploadSource === 'url' ? 'bg-orange-500 text-white shadow' : 'text-slate-400 hover:text-white'}`}
                  >
                    URL / Imgur
                  </button>
                </div>

                {uploadSource === 'file' ? (
                  <div className="border border-dashed border-white/20 p-4 rounded-xl text-center relative hover:border-orange-500/50 transition-colors">
                    <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer" />
                    <span className="text-xs text-slate-300 font-semibold block">
                      {imageFile ? "✓ Gambar Terkompresi Siap" : "Klik untuk Pilih Gambar"}
                    </span>
                  </div>
                ) : (
                  <div>
                    <input 
                      type="url" 
                      value={imageUrlInput} 
                      onChange={e => setImageUrlInput(e.target.value)}
                      placeholder="Tempelkan link gambar (Imgur, Imgur Album, CDN)..."
                      className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500"
                      required={uploadSource === 'url'}
                    />
                    <p className="text-[10px] text-slate-500 mt-1">
                      *Mendukung link Imgur album/single (`https://imgur.com/a/...` atau direct `.jpg/.png`).
                    </p>
                  </div>
                )}
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold p-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-600/30"
              >
                {uploading ? "Menyimpan..." : "Simpan"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ADMIN AUTH */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setShowAdminPanel(false)} />
          <div className="relative bg-[#0c0c12] p-6 rounded-3xl border border-white/10 w-full max-w-xs text-center shadow-2xl z-10">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-2">Akses Verifikasi Admin</h3>
            <form onSubmit={handleAdminVerify} className="space-y-3 mt-4">
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Kata Sandi..."
                className="w-full bg-white/5 border border-white/10 p-3 rounded-xl text-center text-xs text-white focus:outline-none focus:border-orange-500"
                required
              />
              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider">
                Verifikasi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL HAPUS */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={() => setItemToDelete(null)} />
          <div className="relative bg-[#0c0c12] p-6 rounded-3xl border border-rose-500/20 w-full max-w-xs text-center shadow-2xl z-10">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">Hapus Foto Ini?</h3>
            <p className="text-xs text-slate-400 mb-5">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-2">
              <button onClick={() => setItemToDelete(null)} className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-2.5 rounded-xl text-xs">
                Batal
              </button>
              <button onClick={confirmDelete} className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-2.5 rounded-xl text-xs">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIGHTBOX POPUP */}
      {lightboxItem && (
        <div className="fixed inset-0 z-[250] flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-2xl" onClick={() => setLightboxItem(null)} />
          <div className="relative max-w-5xl w-full flex flex-col items-center z-10">
            <button 
              onClick={() => setLightboxItem(null)} 
              className="absolute -top-12 right-0 text-slate-300 hover:text-white bg-white/10 w-8 h-8 rounded-full flex items-center justify-center text-xs"
            >
              ✕
            </button>
            <div className="rounded-3xl overflow-hidden border border-white/10 bg-black/60 p-2 shadow-2xl">
              <img 
                src={lightboxItem.imageUrl} 
                alt={lightboxItem.title} 
                className="max-w-full max-h-[75vh] object-contain rounded-2xl"
              />
            </div>
            <div className="text-center mt-4 max-w-lg">
              <h3 className="text-base font-bold text-white">{lightboxItem.title}</h3>
              {lightboxItem.description && (
                <p className="text-xs text-slate-400 mt-1 font-medium">{lightboxItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
