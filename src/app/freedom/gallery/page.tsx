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

// Fungsi helper kompresi gambar otomatis menggunakan HTML Canvas
const compressImage = (file: File, maxWidth = 1200, maxHeight = 1200, quality = 0.75): Promise<string> => {
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
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } else {
          reject(new Error('Gagal memproses kanvas gambar'));
        }
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
};

export default function GalleryPage() {
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
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

  // Form states (Untuk Tambah & Edit)
  const [isEditing, setIsEditing] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<string | null>(null);

  // Lightbox View State
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

  // Helper fungsi gambar
  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');
  const bgImgSrc = getSrc(backgroundImage);

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  // Ambil semua data galeri dari MongoDB
  const fetchGallery = async () => {
    try {
      const res = await fetch('/api/gallery?t=' + new Date().getTime(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      } else {
        setError(true);
      }
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Konversi & kompresi file gambar lokal dari input browser menjadi string Base64 ringan
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      triggerToast('Ukuran file maksimal 20 MB!', 'error');
      return;
    }

    try {
      triggerToast('Mengompresi gambar...', 'info');
      const compressedDataUrl = await compressImage(file, 1200, 1200, 0.75);
      setImageFile(compressedDataUrl);
      triggerToast('Gambar berhasil dimuat dan dikompresi', 'success');
    } catch (err) {
      console.error(err);
      triggerToast('Gagal memproses dan mengompresi gambar', 'error');
    }
  };

  // Verifikasi login admin galeri via tombol minus (-)
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
        triggerToast('Akses Admin Berhasil Diverifikasi!', 'success');
      } else {
        triggerToast('Password verifikasi salah!', 'error');
      }
    } catch {
      triggerToast('Gagal terhubung ke server otentikasi.', 'error');
    }
  };

  // Mengirim data gambar baru (POST) atau memperbarui data (PUT) ke MongoDB
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditing && !imageFile) {
      return triggerToast('Silakan pilih berkas gambar terlebih dahulu!', 'info');
    }
    
    setUploading(true);
    
    const payload = {
      password,
      id: editingItemId,
      title,
      description,
      imageData: imageFile
    };

    const endpoint = '/api/gallery';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(data.message || 'Dokumentasi berhasil disimpan!', 'success');
        closeUploadModal();
        fetchGallery();
      } else {
        triggerToast(data.error || 'Gagal memproses berkas dokumentasi.', 'error');
      }
    } catch {
      triggerToast('Terjadi kesalahan jaringan saat memproses data.', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Eksekusi Hapus Gambar
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
        triggerToast(data.message || 'Dokumentasi berhasil dihapus.', 'success');
        fetchGallery();
      } else {
        triggerToast(data.error || 'Gagal menghapus gambar.', 'error');
      }
    } catch {
      triggerToast('Gagal memproses permintaan hapus.', 'error');
    } finally {
      setItemToDelete(null);
    }
  };

  // Membuka modal form dalam mode edit
  const handleEditClick = (item: GalleryItem) => {
    setIsEditing(true);
    setEditingItemId(item._id || null);
    setTitle(item.title);
    setDescription(item.description || '');
    setImageFile(item.imageUrl);
    setShowUploadModal(true);
  };

  const closeUploadModal = () => {
    setShowUploadModal(false);
    setIsEditing(false);
    setEditingItemId(null);
    setTitle('');
    setDescription('');
    setImageFile(null);
  };

  // Toggle tombol minus (-)
  const handleMinusClick = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setPassword('');
      triggerToast('Mode manajemen admin dinonaktifkan.', 'info');
    } else {
      setShowAdminPanel(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden selection:bg-orange-500 selection:text-white">
      
      {/* FLOATING TOAST NOTIFICATION */}
      {toast.show && (
        <div className="fixed top-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-xl border backdrop-blur-xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] animate-in slide-in-from-top-5 duration-300 max-w-md border-white/10 bg-[#0d0d11]/90">
          {toast.type === 'success' && (
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center flex-shrink-0 text-emerald-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
          )}
          {toast.type === 'error' && (
            <div className="w-7 h-7 rounded-full bg-rose-500/20 border border-rose-500/40 flex items-center justify-center flex-shrink-0 text-rose-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
          )}
          {toast.type === 'info' && (
            <div className="w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/40 flex items-center justify-center flex-shrink-0 text-orange-400">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12v-.008z" />
              </svg>
            </div>
          )}
          <span className="text-xs font-bold text-slate-200 tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* BACKGROUND IMAGE KUSTOM */}
      {bgImgSrc && (
        <div 
          className="fixed inset-0 bg-cover bg-center opacity-20 z-0 pointer-events-none mix-blend-lighten"
          style={{ backgroundImage: `url(${bgImgSrc})` }}
        />
      )}
      <div className="fixed inset-0 bg-gradient-to-b from-[#050505]/70 via-[#050505]/95 to-[#050505] z-0 pointer-events-none" />

      {/* SECTION FRAME UTAMA */}
      <section className="max-w-7xl mx-auto py-12 md:py-20 px-4 sm:px-6 w-full relative z-10">
        
        {/* Header Galeri */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 border-b border-white/10 pb-8">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Official Documentation</span>
            </div>
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black uppercase tracking-tight text-white">
              CLAN <span className="bg-gradient-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent">GALLERY</span>
            </h1>
            <p className="text-slate-400 mt-2 text-xs md:text-sm font-medium tracking-wide">
              Dokumentasi, Momen Berharga & Rekam Jejak Perjalanan Clan Freedom
            </p>
          </div>
          
          {isAdmin && (
            <div className="flex items-center gap-2.5 bg-emerald-950/40 border border-emerald-500/30 px-4 py-2 rounded-xl backdrop-blur-md animate-in fade-in duration-300 shadow-[0_0_20px_rgba(16,185,129,0.15)]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span className="text-[11px] text-emerald-400 font-black tracking-wider uppercase">Mode Admin Aktif</span>
            </div>
          )}
        </div>

        {/* AREA GRID DAFTAR FOTO GALERI */}
        <div className="p-4 sm:p-6 md:p-8 border border-white/10 bg-[#0a0a0e]/70 backdrop-blur-xl rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4">
              <div className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-slate-400 text-xs font-bold uppercase tracking-widest animate-pulse">
                Memuat Koleksi Galeri Dokumentasi...
              </span>
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-rose-950/20 border border-rose-500/30 rounded-2xl text-rose-400 text-xs font-bold tracking-wide p-6">
              Gagal menyinkronkan data galeri dari database server.
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-24 border border-dashed border-white/10 rounded-2xl text-slate-500 text-xs uppercase tracking-wider font-bold">
              Belum ada arsip dokumentasi foto di dalam sistem galeri.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, index) => {
                return (
                  <div 
                    key={item._id || index}
                    className="bg-[#0f0f14]/80 backdrop-blur-md rounded-2xl border border-white/10 overflow-hidden group shadow-xl hover:border-orange-500/50 hover:shadow-[0_10px_30px_rgba(234,88,12,0.15)] transition-all duration-300 flex flex-col relative"
                  >
                    {/* Frame Foto */}
                    <div 
                      onClick={() => setLightboxItem(item)}
                      className="w-full aspect-video bg-neutral-900/90 overflow-hidden cursor-zoom-in relative group/img"
                    >
                      <img 
                        src={item.imageUrl} 
                        alt={item.title} 
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover group-hover/img:scale-110 transition-transform duration-700 ease-out" 
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover/img:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <span className="text-xs bg-orange-600/90 hover:bg-orange-500 px-4 py-2 rounded-xl font-bold border border-orange-400/30 text-white shadow-lg backdrop-blur-md transform translate-y-2 group-hover/img:translate-y-0 transition-all duration-300 flex items-center gap-1.5">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                          </svg>
                          Perbesar Foto
                        </span>
                      </div>
                    </div>

                    {/* Info Text */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="text-base font-black text-white tracking-tight mb-1.5 truncate group-hover:text-orange-400 transition-colors">
                          {item.title}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">
                          {item.description || 'Tidak ada deskripsi tambahan.'}
                        </p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                          {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </span>
                      </div>
                    </div>

                    {/* TOMBOL EDIT & HAPUS ADMIN */}
                    {isAdmin && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/80 p-1.5 rounded-xl border border-white/10 backdrop-blur-md opacity-90 hover:opacity-100 transition-opacity z-10 shadow-lg">
                        <button 
                          onClick={(e) => { e.stopPropagation(); handleEditClick(item); }}
                          title="Edit Data"
                          className="p-1.5 text-slate-300 hover:text-white hover:bg-blue-600/80 rounded-lg transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        <div className="w-px h-3.5 bg-white/10" />
                        <button 
                          onClick={(e) => { e.stopPropagation(); setItemToDelete(item._id || null); }}
                          title="Hapus Gambar"
                          className="p-1.5 text-rose-400 hover:text-white hover:bg-rose-600/80 rounded-lg transition-colors"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* FLOATING BUTTON ACTION SYSTEM (MINUS & PLUS) */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50">
        <button
          onClick={handleMinusClick}
          title={isAdmin ? "Nonaktifkan Mode Admin" : "Otentikasi Akses Admin"}
          className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-2xl hover:scale-105 active:scale-95 transition-all border border-white/20 ${isAdmin ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/30' : 'bg-neutral-800/90 hover:bg-neutral-700 backdrop-blur-md'}`}
        >
          －
        </button>

        {isAdmin && (
          <button
            onClick={() => setShowUploadModal(true)}
            title="Tambah Arsip Foto Baru"
            className="w-14 h-14 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-[0_0_25px_rgba(234,88,12,0.4)] hover:scale-105 active:scale-95 transition-all border border-orange-400/30 animate-in zoom-in duration-200"
          >
            ＋
          </button>
        )}
      </div>

      {/* MODAL FORM UPLOAD / EDIT */}
      {showUploadModal && isAdmin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={closeUploadModal} />
          <div className="relative bg-[#0d0d12] p-6 md:p-8 rounded-3xl border border-orange-500/30 w-full max-w-lg shadow-[0_0_50px_rgba(234,88,12,0.2)] animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                <h3 className="text-base font-black text-white uppercase tracking-wider">
                  {isEditing ? "Pembaruan Berkas" : "Unggah Dokumentasi Baru"}
                </h3>
              </div>
              <button onClick={closeUploadModal} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Judul Arsip / Momen</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Keseruan Event Clan War..."
                  className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-medium placeholder:text-slate-600 transition-all"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Deskripsi Tambahan</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ketik keterangan detail momen foto dokumentasi..."
                  className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-xs text-slate-300 h-24 resize-none focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 leading-relaxed placeholder:text-slate-600 transition-all"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  {isEditing ? "Ganti Berkas Gambar (Opsional)" : "Pilih File Gambar (.PNG / .JPG)"}
                </label>
                <div className="bg-black/60 border border-dashed border-white/20 p-5 rounded-xl text-center cursor-pointer relative hover:border-orange-500/50 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center gap-1 pointer-events-none">
                    <svg className="w-6 h-6 text-orange-500 mb-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                    </svg>
                    <span className="text-xs text-slate-300 font-bold flex items-center justify-center gap-1.5">
                      {imageFile ? (
                        <>
                          <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                          </svg>
                          {isEditing ? "Gambar Diperbarui" : "Gambar Terpilih & Terkompresi"}
                        </>
                      ) : (
                        "Klik untuk Pilih Gambar"
                      )}
                    </span>
                    <span className="text-[10px] text-slate-500 font-semibold">Otomatis dikompresi agar cepat dimuat</span>
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black p-4 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-[0_0_20px_rgba(234,88,12,0.3)] mt-2 active:scale-95"
              >
                {uploading ? "Menyimpan Ke Database..." : isEditing ? "Simpan Perubahan" : "Unggah Ke Galeri"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL LOGIN ADMIN (MINUS `-`) */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowAdminPanel(false)} />
          <div className="relative bg-[#0d0d12] p-6 md:p-8 rounded-3xl border border-orange-500/30 w-full max-w-sm shadow-[0_0_50px_rgba(234,88,12,0.2)] animate-in zoom-in-95 duration-200 text-center">
            
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            </div>

            <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">Akses Admin Galeri</h3>
            <p className="text-xs text-slate-400 font-medium mb-5">Masukkan kata sandi otentikasi pengelola.</p>

            <form onSubmit={handleAdminVerify} className="flex flex-col gap-3">
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Kata Sandi..."
                className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-white focus:outline-none focus:border-orange-500 text-center font-bold tracking-widest text-sm placeholder:tracking-normal placeholder:text-slate-600 placeholder:font-normal"
                required
              />
              <button 
                type="submit" 
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all active:scale-95 shadow-[0_0_20px_rgba(234,88,12,0.3)]"
              >
                Verifikasi Akses
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {itemToDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setItemToDelete(null)} />
          <div className="relative bg-[#0d0d12] p-6 md:p-8 rounded-3xl border border-rose-500/30 w-full max-w-sm shadow-[0_0_50px_rgba(244,63,94,0.2)] animate-in zoom-in-95 duration-200 text-center">
            
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>

            <h3 className="text-base font-black text-white uppercase tracking-wider mb-1">Hapus Dokumentasi?</h3>
            <p className="text-xs text-slate-400 font-medium mb-6">Tindakan ini permanen dan foto akan dihapus dari server.</p>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setItemToDelete(null)} 
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider border border-white/10 transition-all active:scale-95"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={confirmDelete} 
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-lg shadow-rose-600/30 transition-all active:scale-95"
              >
                Ya, Hapus
              </button>
            </div>

          </div>
        </div>
      )}

      {/* PREMIUM LIGHTBOX ZOOM VIEW POPUP */}
      {lightboxItem && (
        <div className="fixed inset-0 z-[250] flex flex-col items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200" onClick={() => setLightboxItem(null)} />
          <div className="relative max-w-5xl w-full max-h-[85vh] flex flex-col items-center animate-in zoom-in-95 duration-200 z-10">
            <button 
              onClick={() => setLightboxItem(null)} 
              className="absolute -top-12 right-0 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 border border-white/10 w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors backdrop-blur-md"
            >
              ✕
            </button>
            <div className="rounded-2xl overflow-hidden border border-white/10 shadow-[0_0_50px_rgba(0,0,0,0.9)] bg-black/80 flex items-center justify-center p-2">
              <img 
                src={lightboxItem.imageUrl} 
                alt={lightboxItem.title} 
                loading="lazy"
                decoding="async"
                className="max-w-full max-h-[70vh] object-contain rounded-xl"
              />
            </div>
            <div className="text-center mt-5 max-w-2xl px-4">
              <h3 className="text-lg font-black text-white tracking-tight">{lightboxItem.title}</h3>
              {lightboxItem.description && (
                <p className="text-xs text-slate-400 mt-1.5 font-medium leading-relaxed">{lightboxItem.description}</p>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
