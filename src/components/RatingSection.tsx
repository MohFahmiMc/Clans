"use client";

import React, { useState, useEffect } from 'react';

export interface RatingItem {
  _id: string;
  name: string;
  message: string;
  stars: number;
  createdAt: string;
}

export default function RatingSection() {
  const [ratings, setRatings] = useState<RatingItem[]>([]);
  const [ratingHover, setRatingHover] = useState<number>(0);
  const [selectedStars, setSelectedStars] = useState<number>(0);
  const [showRateModal, setShowRateModal] = useState(false);
  
  // Form Review States
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerMessage, setReviewerMessage] = useState('');
  const [submittingRate, setSubmittingRate] = useState(false);

  // Password Verification Admin States
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [targetDeleteId, setTargetDeleteId] = useState<string | null>(null);

  const fetchRatings = async () => {
    try {
      const res = await fetch('/api/ratings?t=' + new Date().getTime(), { cache: 'no-store' });
      if (res.ok) {
        const dataRatings: RatingItem[] = await res.json();
        setRatings(dataRatings);
      }
    } catch (err) {
      console.error("Gagal mengambil data rating:", err);
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const calculateAverageRating = () => {
    if (ratings.length === 0) return 0;
    const totalStars = ratings.reduce((acc, curr) => acc + curr.stars, 0);
    return (totalStars / ratings.length).toFixed(1);
  };

  const handleStarClick = (starValue: number) => {
    setSelectedStars(starValue);
    setShowRateModal(true);
  };

  const handleRateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewerName.trim() || selectedStars === 0) return;

    setSubmittingRate(true);
    try {
      const res = await fetch('/api/ratings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: reviewerName,
          message: reviewerMessage,
          stars: selectedStars
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        setShowRateModal(false);
        setReviewerName('');
        setReviewerMessage('');
        setSelectedStars(0);
        fetchRatings();
      } else {
        alert(data.error || 'Gagal mengirimkan ulasan.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSubmittingRate(false);
    }
  };

  const verifyAdminAction = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: adminPassword })
      });
      if (res.ok) {
        setIsAdminMode(true);
        setShowAuthModal(false);
        if (targetDeleteId) {
          executeDeleteRating(targetDeleteId);
        }
      } else {
        alert('Password administrasi salah!');
      }
    } catch (err) {
      alert('Gagal terhubung ke modul otentikasi.');
    }
  };

  const triggerDeleteRating = (id: string) => {
    if (isAdminMode) {
      executeDeleteRating(id);
    } else {
      setTargetDeleteId(id);
      setShowAuthModal(true);
    }
  };

  const executeDeleteRating = async (id: string) => {
    if (!confirm('Apakah Anda yakin ingin memoderasi dan menghapus ulasan ini secara permanen?')) return;
    try {
      const res = await fetch('/api/ratings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password: adminPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        setTargetDeleteId(null);
        fetchRatings();
      } else {
        alert(data.error || 'Gagal menghapus ulasan.');
      }
    } catch (err) {
      alert('Terjadi gangguan koneksi sistem.');
    }
  };

  const handleMinusAdminToggle = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      setAdminPassword('');
      alert('Mode otentikasi manajemen rating dinonaktifkan.');
    } else {
      setTargetDeleteId(null);
      setShowAuthModal(true);
    }
  };

  return (
    <>
      {/* ======================================================== */}
      {/* EVALUASI KEPUASAN & RATING SYSTEM */}
      {/* ======================================================== */}
      <section className="py-10 px-6 bg-[#0a0a0b]/60 border border-white/5 rounded-2xl backdrop-blur-md p-6 md:p-8 animate-in fade-in duration-1000 shadow-2xl">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/5 pb-6 mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-tight">Evaluasi Kepuasan Website</h2>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mt-1">Sistem Penilaian Global Real-Time</p>
          </div>
          
          <div className="flex items-center gap-4 bg-neutral-900/40 border border-white/5 px-5 py-3 rounded-xl backdrop-blur-md">
            <div className="text-center">
              <span className="text-2xl font-black text-yellow-500 block leading-none">{calculateAverageRating()}</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Skor Rata-Rata</span>
            </div>
            <div className="w-px h-8 bg-white/10" />
            <div className="text-center">
              <span className="text-2xl font-black text-white block leading-none">{ratings.length}</span>
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Total Ulasan</span>
            </div>
          </div>
        </div>

        <div className="bg-black/30 border border-white/5 p-8 rounded-2xl flex flex-col items-center text-center max-w-xl mx-auto mb-12 shadow-inner">
          <h4 className="text-sm font-bold uppercase tracking-widest text-slate-400 mb-3">Berikan Penilaian Anda terhadap Website</h4>
          
          <div className="flex items-center gap-2 mb-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setRatingHover(star)}
                onMouseLeave={() => setRatingHover(0)}
                className="text-2xl transition-transform hover:scale-125 focus:outline-none"
              >
                <svg 
                  className={`w-8 h-8 ${star <= (ratingHover || selectedStars) ? 'text-yellow-500 fill-current' : 'text-slate-700'} transition-colors duration-150`} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.151-.312.596-.312.748 0l2.165 4.474 4.887.71c.343.05.48.474.231.719l-3.537 3.473.835 4.896c.059.344-.298.61-.606.44l-4.37-2.31-4.37 2.31c-.308.17-.665-.095-.606-.44l.835-4.896-3.537-3.473c-.249-.245-.113-.668.231-.72l4.888-.711 2.164-4.474z" />
                </svg>
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-500 uppercase tracking-wider">Klik bintang untuk melampirkan ulasan pesan tertulis</p>
        </div>

        <div className="w-full overflow-hidden relative py-4 border-y border-white/5 bg-black/20 rounded-xl mb-6">
          {ratings.length === 0 ? (
            <p className="text-center text-xs text-slate-600 uppercase font-bold tracking-wider py-6">Belum ada obrolan ulasan bintang terdaftar.</p>
          ) : (
            <div className="flex gap-6 overflow-x-auto pb-3 px-4 scrollbar-thin scrollbar-thumb-white/10">
              {ratings.map((item) => (
                <div 
                  key={item._id} 
                  className="flex-shrink-0 w-72 bg-[#0f0f0f] border border-white/5 p-5 rounded-xl flex flex-col justify-between shadow-md relative group hover:border-white/10 transition-colors"
                >
                  <div>
                    <div className="flex justify-between items-start mb-2 gap-2">
                      <h5 className="text-sm font-black text-white truncate max-w-[150px]">{item.name}</h5>
                      <div className="flex items-center gap-0.5 flex-shrink-0">
                        {Array.from({ length: 5 }).map((_, idx) => (
                          <svg key={idx} className={`w-3 h-3 ${idx < item.stars ? 'text-yellow-500 fill-current' : 'text-neutral-800'}`} viewBox="0 0 24 24">
                            <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z"/>
                          </svg>
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 font-medium line-clamp-3 leading-relaxed break-words">
                      {item.message}
                    </p>
                  </div>

                  <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest mt-4 block">
                    {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                  </span>

                  <button
                    type="button"
                    onClick={() => triggerDeleteRating(item._id)}
                    className={`absolute bottom-4 right-4 p-1.5 rounded-md border border-red-500/20 bg-red-500/5 text-red-400 hover:bg-red-600 hover:text-white transition-all ${isAdminMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
                    title="Hapus Ulasan Chat"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end px-2">
          <button
            type="button"
            onClick={handleMinusAdminToggle}
            className={`w-7 h-7 rounded-md border flex items-center justify-center text-sm font-bold transition-all ${isAdminMode ? 'bg-red-600/20 border-red-500 text-red-400' : 'bg-white/5 border-white/10 text-slate-500 hover:text-white'}`}
            title={isAdminMode ? "Matikan Panel Moderasi" : "Aktifkan Panel Moderasi"}
          >
            －
          </button>
        </div>

      </section>

      {/* ======================================================== */}
      {/* JENDELA MODAL OVERLAY INPUT CHAT ULASAN BARU */}
      {/* ======================================================== */}
      {showRateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowRateModal(false)}></div>
          <div className="relative bg-[#0a0a0b] p-6 rounded-xl border border-white/10 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6 pb-2 border-b border-white/10">
              <h3 className="text-md font-black uppercase tracking-wider text-white">Formulir Komentar Evaluasi</h3>
              <button type="button" onClick={() => setShowRateModal(false)} className="text-slate-500 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRateSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Nama / Gamertag</label>
                <input 
                  type="text"
                  value={reviewerName}
                  onChange={e => setReviewerName(e.target.value)}
                  placeholder="Masukkan nama identitas Anda..."
                  className="bg-black border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-orange-500 font-bold"
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Pesan Ulasan Umpan Balik</label>
                <textarea 
                  value={reviewerMessage}
                  onChange={e => setReviewerMessage(e.target.value)}
                  placeholder="Ketik impresi atau saran Anda untuk kemajuan clan Freedom..."
                  className="bg-black border border-white/10 p-3 rounded text-xs text-slate-300 h-24 resize-none focus:outline-none focus:border-orange-500 leading-relaxed"
                />
              </div>

              <button 
                type="submit" 
                disabled={submittingRate}
                className="bg-orange-600 hover:bg-orange-500 text-white font-black p-4 rounded-lg text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-lg mt-2"
              >
                {submittingRate ? "Menyimpan Data..." : "Kirim Ulasan Resmi"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* JENDELA MODAL OVERLAY AKSES VERIFIKASI ADMIN */}
      {/* ======================================================== */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setShowAuthModal(false)}></div>
          <div className="relative bg-[#0a0a0a] p-6 rounded-xl border border-white/10 w-full max-w-sm shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-md font-black text-orange-500 uppercase tracking-wider text-center mb-4">Akses Otentikasi Rating</h3>
            <form onSubmit={verifyAdminAction} className="flex flex-col gap-3">
              <input 
                type="password" 
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
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
    </>
  );
}
