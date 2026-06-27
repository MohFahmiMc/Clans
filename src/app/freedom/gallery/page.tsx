"use client";

import React, { useState, useEffect } from 'react';

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
  const [password, setPassword] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<string | null>(null);

  // Lightbox View State
  const [lightboxItem, setLightboxItem] = useState<GalleryItem | null>(null);

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

  // Verifikasi login admin galeri
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

  // Mengirim data gambar baru ke MongoDB
  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!imageFile) return alert('Silakan pilih berkas gambar terlebih dahulu!');
    
    setUploading(true);
    try {
      const res = await fetch('/api/gallery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          title,
          description,
          imageData: imageFile
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        setTitle('');
        setDescription('');
        setImageFile(null);
        fetchGallery(); // Refresh data grid galeri
      } else {
        alert(data.error || 'Gagal mengunggah gambar.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan saat proses upload.');
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

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans p-4 md:p-12 relative">
      <div className="max-w-6xl mx-auto">
        
        {/* Header Galeri */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white">
              CLAN <span className="text-orange-500">GALLERY</span>
            </h1>
            <p className="text-orange-400 mt-1 text-xs md:text-sm font-bold tracking-widest uppercase">Dokumentasi & Momentum Kejayaan</p>
          </div>
          
          {/* Tombol Akses Dashboard Panel Admin Upload */}
          {!isAdmin ? (
            <button 
              onClick={() => setShowAdminPanel(true)} 
              className="text-xs font-bold border border-white/10 bg-white/5 px-4 py-2.5 rounded hover:bg-orange-500/20 hover:text-orange-400 transition-colors uppercase tracking-wider"
            >
              Mode Manajemen
            </button>
          ) : (
            <div className="flex items-center gap-4">
              <span className="text-[10px] text-green-400 font-bold tracking-widest border border-green-500/20 bg-green-500/10 px-3 py-1.5 rounded-full uppercase">Mode Admin Aktif</span>
              <button onClick={() => setIsAdmin(false)} className="text-xs text-slate-400 hover:text-red-400 font-bold underline">Keluar</button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* 1. AREA FORM UPLOAD FOTO BARU (HANYA MUNCUL JIKA LOGGED IN) */}
        {/* ======================================================== */}
        {isAdmin && (
          <div className="bg-[#0a0a0a] p-6 rounded-xl border border-white/10 shadow-xl max-w-2xl mx-auto mb-12 animate-in fade-in slide-in-from-top-4 duration-300">
            <h3 className="text-lg font-black text-white uppercase tracking-tight mb-4 pb-2 border-b border-white/10">💾 Unggah Arsip Dokumentasi Baru</h3>
            <form onSubmit={handleUploadSubmit} className="flex flex-col gap-4">
              <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                placeholder="Judul atau Momentum Gambar..."
                className="bg-black border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-orange-500"
                required
              />
              <textarea 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                placeholder="Deskripsi singkat dokumentasi (Opsional)..."
                className="bg-black border border-white/10 p-3 rounded text-xs text-slate-300 h-20 resize-none focus:outline-none focus:border-orange-500"
              />
              <div className="bg-black border border-dashed border-white/20 p-4 rounded text-center cursor-pointer relative hover:border-orange-500/50 transition-colors">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
                <span className="text-xs text-slate-400 font-medium">
                  {imageFile ? "Gambar Terpilih & Siap Di-upload" : "Pilih atau Seret Berkas Gambar Clan Sini (.PNG, .JPG)"}
                </span>
              </div>
              <button 
                type="submit" 
                disabled={uploading}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold p-3.5 rounded text-xs uppercase tracking-widest transition-colors disabled:opacity-50 shadow-lg shadow-orange-600/20"
              >
                {uploading ? "Mengirim Data Berkas..." : "Unggah Gambar ke Basis Data"}
              </button>
            </form>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. AREA GRID DAFTAR FOTO GALERI (DIAMBIL DARI MONGODB ATLAS) */}
        {/* ======================================================== */}
        {loading ? (
          <div className="text-center py-20 text-slate-500 text-sm uppercase tracking-widest font-black animate-pulse">
            Memindai Koleksi Galeri Dokumentasi...
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-red-950/10 border border-red-900/30 rounded-xl text-red-400 text-sm font-bold">
            Gagal menyinkronkan data galeri dari Klaster MongoDB Atlas.
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/5 rounded-xl text-slate-500 text-xs">
            Belum ada dokumentasi momentum foto yang diunggah di dalam galeri clan Freedom.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, index) => (
              <div 
                key={index}
                className="bg-[#0a0a0a] rounded-xl border border-white/5 overflow-hidden group shadow-md hover:border-white/10 transition-all flex flex-col relative"
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
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="text-xs bg-black/60 px-3 py-1.5 rounded-full uppercase tracking-wider font-bold border border-white/10 text-slate-200">Perbesar</span>
                  </div>
                </div>

                {/* Info Text */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-base font-black text-white tracking-tight mb-1 truncate">{item.title}</h3>
                    <p className="text-xs text-slate-400 font-medium line-clamp-2 leading-relaxed">{item.description || 'Tidak ada deskripsi berkas.'}</p>
                  </div>
                  <span className="text-[9px] text-slate-600 uppercase tracking-widest font-bold mt-4 block">
                    {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                </div>

                {/* Tombol Hapus Rahasia (Hanya Admin) */}
                {isAdmin && (
                  <button 
                    onClick={() => handleDeleteItem(item._id!)}
                    className="absolute top-3 right-3 bg-red-600/90 hover:bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1.5 rounded shadow-md border border-red-700 transition-colors"
                  >
                    Hapus
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

      </div>

      {/* ======================================================== */}
      {/* 3. MODAL POPUP JENDELA VERIFIKASI LOGIN ADMIN */}
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
      {/* 4. PREMIUM LIGHTBOX ZOOM VIEW POPUP */}
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
              className="max-w-full max-h-[70vh] object-contain rounded-lg border border-white/10 shadow-2xl"
            />
            <div className="text-center mt-4 max-w-xl">
              <h3 className="text-lg font-black text-white">{lightboxItem.title}</h3>
              <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">{lightboxItem.description}</p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
