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

  // Konversi file gambar lokal dari input browser menjadi string Base64 Data URL
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageFile(reader.result as string);
    };
    reader.readAsDataURL(file);
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
      } else {
        alert('Password verifikasi salah!');
      }
    } catch (err) {
      alert('Gagal terhubung ke server otentikasi.');
    }
  };

  // Mengirim data gambar baru (POST) atau memperbarui data (PUT) ke MongoDB
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isEditing && !imageFile) {
      return alert('Silakan pilih berkas gambar terlebih dahulu!');
    }
    
    setUploading(true);
    
    const payload = {
      password,
      id: editingItemId,
      title,
      description,
      imageData: imageFile // Bisa null saat edit jika tidak ingin mengganti gambar
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
        alert(data.message);
        closeUploadModal();
        fetchGallery(); // Refresh data grid galeri
      } else {
        alert(data.error || 'Gagal memproses berkas dokumentasi.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan saat memproses data.');
    } finally {
      setUploading(false);
    }
  };

  // Menghapus gambar dokumentasi galeri clan
  const handleDeleteItem = async (id: string) => {
    if (!confirm('Apakah kamu yakin ingin menghapus dokumentasi foto ini secara permanen?')) return;

    try {
      const res = await fetch('/api/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        fetchGallery();
      } else {
        alert(data.error || 'Gagal menghapus gambar.');
      }
    } catch (err) {
      alert('Gagal memproses permintaan hapus.');
    }
  };

  // Membuka modal form dalam mode edit
  const handleEditClick = (item: GalleryItem) => {
    setIsEditing(true);
    setEditingItemId(item._id || null);
    setTitle(item.title);
    setDescription(item.description || '');
    setImageFile(item.imageUrl); // Set gambar lama sebagai pratinjau
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

  // Fungsi toggle tombol minus (-) untuk login / logout admin
  const handleMinusClick = () => {
    if (isAdmin) {
      setIsAdmin(false);
      setPassword('');
      alert('Mode manajemen admin dinonaktifkan.');
    } else {
      setShowAdminPanel(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans relative overflow-x-hidden">
      
      {/* --- BACKGROUND IMAGE KUSTOM (DIAMBIL DARI ASSETS) --- */}
      {bgImgSrc && (
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-25 z-0 pointer-events-none mix-blend-lighten"
          style={{ backgroundImage: `url(${bgImgSrc})` }}
        />
      )}
      {/* Overlay gradien hitam untuk menjaga kontras teks */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/50 via-[#050505]/95 to-[#050505] z-0 pointer-events-none" />

      {/* SECTION FRAME UTAMA */}
      <section className="max-w-6xl mx-auto py-16 md:py-24 px-4 w-full relative z-10">
        
        {/* Header Galeri */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white drop-shadow-[0_0_30px_rgba(234,88,12,0.3)]">
              CLAN <span className="text-orange-500">GALLERY</span>
            </h1>
            <p className="text-orange-400 mt-1 text-xs md:text-sm font-bold tracking-widest uppercase">Dokumentasi & Momentum Kejayaan</p>
          </div>
          
          {isAdmin && (
            <div className="flex items-center gap-4 bg-black/60 border border-green-500/20 px-4 py-2 rounded-lg backdrop-blur-md animate-in fade-in duration-200">
              <span className="text-[10px] text-green-400 font-bold tracking-widest uppercase">Mode Admin Aktif</span>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* AREA GRID DAFTAR FOTO GALERI */}
        {/* ======================================================== */}
        <div className="py-12 px-4 border border-white/5 bg-black/60 backdrop-blur-md rounded-2xl shadow-2xl">
          {loading ? (
            <div className="text-center py-20 text-slate-500 text-sm uppercase tracking-widest font-black animate-pulse">
              Memindai Koleksi Galeri Dokumentasi...
            </div>
          ) : error ? (
            <div className="text-center py-20 bg-red-950/10 border border-red-900/30 rounded-xl text-red-400 text-sm font-bold">
              Gagal menyinkronkan data galeri dari Klaster MongoDB Atlas.
            </div>
          ) : items.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-white/5 rounded-xl text-slate-500 text-xs uppercase tracking-wider font-bold">
              Belum ada arsip dokumentasi foto di dalam basis data clan.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {items.map((item, index) => (
                <div 
                  key={index}
                  className="bg-[#0f0f0f]/80 backdrop-blur-sm rounded-xl border border-white/5 overflow-hidden group shadow-lg hover:border-orange-500/30 transition-all flex flex-col relative"
                >
                  {/* Frame Foto */}
                  <div 
                    onClick={() => setLightboxItem(item)}
                    className="w-full aspect-video bg-neutral-900 overflow-hidden cursor-zoom-in relative"
                  >
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs bg-black/60 px-3 py-1.5 rounded-full uppercase tracking-wider font-bold border border-white/10 text-slate-200">Perbesar</span>
                    </div>
                  </div>

                  {/* Info Text */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-black text-white tracking-tight mb-1 truncate">{item.title}</h3>
                      <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">{item.description || 'Tidak ada deskripsi berkas.'}</p>
                    </div>
                    <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold mt-4 block border-t border-white/5 pt-3">
                      {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                  </div>

                  {/* TOMBOL KONTROL EDIT & HAPUS RAHASIA (HANYA MUNCUL JIKA MODE ADMIN AKTIF) */}
                  {isAdmin && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-black/70 p-1 rounded-lg border border-white/10 backdrop-blur-md animate-in fade-in duration-200">
                      <button 
                        onClick={() => handleEditClick(item)}
                        title="Edit Data"
                        className="p-1.5 text-blue-400 hover:text-white hover:bg-blue-600 rounded transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <div className="w-px h-3 bg-white/10" />
                      <button 
                        onClick={() => handleDeleteItem(item._id!)}
                        title="Hapus Gambar"
                        className="p-1.5 text-red-400 hover:text-white hover:bg-red-600 rounded transition-colors"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ======================================================== */}
      {/* INTERACTIVE FLOATING BUTTON SYSTEM (PLUS & MINUS) */}
      {/* ======================================================== */}
      <div className="fixed bottom-6 right-6 flex items-center gap-3 z-50">
        {/* Tombol Minus (`-`): Pemicu Otentikasi Password & Logout Admin */}
        <button
          onClick={handleMinusClick}
          title={isAdmin ? "Nonaktifkan Mode Admin" : "Otentikasi Akses Admin"}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-3xl font-light shadow-2xl hover:scale-110 transition-all border border-white/20 ${isAdmin ? 'bg-red-600 hover:bg-red-500' : 'bg-zinc-800 hover:bg-zinc-700'}`}
        >
          －
        </button>

        {/* Tombol Plus (`+`): Ditampilkan Hanya Saat Admin Berhasil Terverifikasi */}
        {isAdmin && (
          <button
            onClick={() => setShowUploadModal(true)}
            title="Tambah Arsip Foto Baru"
            className="w-14 h-14 bg-orange-600 hover:bg-orange-500 rounded-full flex items-center justify-center text-white text-3xl font-light shadow-[0_0_25px_rgba(234,88,12,0.4)] hover:scale-110 transition-all border border-white/20 animate-in zoom-in duration-200"
          >
            ＋
          </button>
        )}
      </div>

      {/* ======================================================== */}
      {/* MODAL POPUP FORM MANAGEMENT (UPLOAD / EDIT) */}
      {/* ======================================================== */}
      {showUploadModal && isAdmin && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={closeUploadModal}></div>
          <div className="relative bg-[#0a0a0a] p-6 rounded-xl border border-white/10 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-white/10">
              <h3 className="text-lg font-black text-white uppercase tracking-tight">
                {isEditing ? "Pembaruan Berkas" : "Unggah Dokumentasi"}
              </h3>
              <button onClick={closeUploadModal} className="text-slate-400 hover:text-white text-sm">✕</button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Judul Arsip / Momentum</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Contoh: Keseruan Event Base Defense..."
                  className="bg-black border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-orange-500 font-medium"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Deskripsi Tambahan</label>
                <textarea 
                  value={description} 
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ketik keterangan detail momentum foto dokumentasi..."
                  className="bg-black border border-white/10 p-3 rounded text-xs text-slate-300 h-24 resize-none focus:outline-none focus:border-orange-500 leading-relaxed"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                  {isEditing ? "Ganti File Gambar (Opsional)" : "File Gambar (.PNG / .JPG)"}
                </label>
                <div className="bg-black border border-dashed border-white/20 p-5 rounded text-center cursor-pointer relative hover:border-orange-500/50 transition-colors">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleFileChange}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <span className="text-xs text-slate-400 font-medium block truncate px-2">
                    {imageFile && !isEditing ? "✅ Berkas Gambar Terkunci & Siap" : imageFile && isEditing ? "✅ Berkas Gambar Diperbarui" : "Klik atau Seret Gambar ke Sini"}
                  </span>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={uploading}
                className="bg-orange-600 hover:bg-orange-500 text-white font-black p-4 rounded-lg text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg shadow-orange-600/10 mt-2"
              >
                {uploading ? "Sinkronisasi Cloud..." : isEditing ? "Simpan Perubahan" : "Unggah Gambar ke MongoDB"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL POPUP JENDELA VERIFIKASI LOGIN ADMIN (MINUS `-`) */}
      {/* ======================================================== */}
      {showAdminPanel && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setShowAdminPanel(false)}></div>
          <div className="relative bg-[#0a0a0a] p-6 rounded-xl border border-white/10 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-md font-black text-orange-500 uppercase tracking-wider text-center mb-4">Akses Otentikasi Galeri</h3>
            <form onSubmit={handleAdminVerify} className="flex flex-col gap-3">
              <input 
                type="password" 
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan Password..."
                className="bg-black border border-white/10 p-3 rounded text-white focus:outline-none text-center font-bold tracking-widest text-sm"
                required
              />
              <button type="submit" className="bg-orange-600 hover:bg-orange-500 text-white font-bold p-3 rounded text-xs uppercase tracking-widest transition-colors">
                Buka Kunci Akses
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PREMIUM LIGHTBOX ZOOM VIEW POPUP */}
      {/* ======================================================== */}
      {lightboxItem && (
        <div className="fixed inset-0 z-[250] flex flex-col items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-md cursor-zoom-out" onClick={() => setLightboxItem(null)}></div>
          <div className="relative max-w-4xl w-full max-h-[80vh] flex flex-col items-center animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setLightboxItem(null)} 
              className="absolute -top-12 right-0 text-slate-400 hover:text-white bg-white/5 border border-white/10 w-9 h-9 rounded-full flex items-center justify-center text-sm transition-colors z-50 backdrop-blur-md"
            >
              ✕
            </button>
            <img 
              src={lightboxItem.imageUrl} 
              alt={lightboxItem.title} 
              className="max-w-full max-h-
