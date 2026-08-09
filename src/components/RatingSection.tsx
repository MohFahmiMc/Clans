"use client";

import React, { useState, useEffect } from 'react';

export interface RatingItem {
  _id: string;
  name: string;
  message: string;
  stars: number;
  createdAt: string;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
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

  // Custom UI Modals & Toast Notification States
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'info'
  });

  const triggerToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast((prev) => ({ ...prev, show: false }));
    }, 3500);
  };

  const fetchRatings = async () => {
    try {
      const res = await fetch('/api/ratings?t=' + new Date().getTime(), { cache: 'no-store' });
      if (res.ok) {
        const dataRatings: RatingItem[] = await res.json();
        setRatings(dataRatings);
      }
    } catch {
      // Quiet fail
    }
  };

  useEffect(() => {
    fetchRatings();
  }, []);

  const calculateAverageRating = () => {
    if (ratings.length === 0) return "0.0";
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
        triggerToast(data.message || 'Ulasan berhasil dikirim!', 'success');
        setShowRateModal(false);
        setReviewerName('');
        setReviewerMessage('');
        setSelectedStars(0);
        fetchRatings();
      } else {
        triggerToast(data.error || 'Gagal mengirimkan ulasan.', 'error');
      }
    } catch {
      triggerToast('Terjadi kesalahan koneksi jaringan.', 'error');
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
        triggerToast('Akses moderasi admin aktif.', 'success');
        if (targetDeleteId) {
          setConfirmDeleteId(targetDeleteId);
        }
      } else {
        triggerToast('Password administrasi salah!', 'error');
      }
    } catch {
      triggerToast('Gagal terhubung ke modul otentikasi.', 'error');
    }
  };

  const triggerDeleteRating = (id: string) => {
    if (isAdminMode) {
      setConfirmDeleteId(id);
    } else {
      setTargetDeleteId(id);
      setShowAuthModal(true);
    }
  };

  const executeDeleteRating = async () => {
    if (!confirmDeleteId) return;
    const idToDelete = confirmDeleteId;
    setConfirmDeleteId(null);

    try {
      const res = await fetch('/api/ratings', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: idToDelete, password: adminPassword })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(data.message || 'Ulasan berhasil dihapus.', 'success');
        setTargetDeleteId(null);
        fetchRatings();
      } else {
        triggerToast(data.error || 'Gagal menghapus ulasan.', 'error');
      }
    } catch {
      triggerToast('Terjadi gangguan koneksi sistem.', 'error');
    }
  };

  const handleMinusAdminToggle = () => {
    if (isAdminMode) {
      setIsAdminMode(false);
      setAdminPassword('');
      triggerToast('Mode otentikasi manajemen rating dinonaktifkan.', 'info');
    } else {
      setTargetDeleteId(null);
      setShowAuthModal(true);
    }
  };

  return (
    <>
      {/* FLOATING TOAST NOTIFICATION SYSTEM */}
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

      {/* EVALUASI KEPUASAN & RATING SYSTEM */}
      <section className="py-10 px-4 sm:px-6 bg-[#0a0a0d]/90 border border-white/10 rounded-3xl backdrop-blur-2xl p-6 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] relative overflow-hidden">
        
        {/* Glow Decor Background */}
        <div className="absolute -top-28 -right-28 w-80 h-80 bg-orange-500/15 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute -bottom-28 -left-28 w-80 h-80 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none" />

        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-6 mb-8 gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
              <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Live Feedback</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white flex items-center gap-2">
              Evaluasi Kepuasan Website
            </h2>
            <p className="text-xs text-slate-400 uppercase tracking-widest font-bold mt-1">
              Sistem Penilaian Ulasan Komunitas Real-Time
            </p>
          </div>
          
          <div className="flex items-center gap-5 bg-black/60 border border-white/10 px-6 py-3.5 rounded-2xl backdrop-blur-md shadow-2xl">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5">
                <span className="text-3xl font-black text-amber-400 leading-none drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]">
                  {calculateAverageRating()}
                </span>
                <svg className="w-5 h-5 text-amber-400 fill-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" viewBox="0 0 24 24">
                  <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z"/>
                </svg>
              </div>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Skor Rata-Rata</span>
            </div>
            <div className="w-px h-9 bg-white/10" />
            <div className="text-center">
              <span className="text-3xl font-black text-white leading-none">{ratings.length}</span>
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 block">Total Ulasan</span>
            </div>
          </div>
        </div>

        {/* STAR INPUT CARD */}
        <div className="bg-gradient-to-b from-white/[0.06] to-white/[0.02] border border-white/10 p-8 rounded-2xl flex flex-col items-center text-center max-w-xl mx-auto mb-10 shadow-2xl relative z-10 backdrop-blur-md">
          <h4 className="text-xs sm:text-sm font-black uppercase tracking-widest text-slate-200 mb-4">
            Berikan Penilaian Anda Terhadap Website
          </h4>
          
          <div className="flex items-center gap-2 sm:gap-3 mb-3">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleStarClick(star)}
                onMouseEnter={() => setRatingHover(star)}
                onMouseLeave={() => setRatingHover(0)}
                className="p-1.5 transition-all duration-200 hover:scale-125 active:scale-95 focus:outline-none group"
                aria-label={`Beri ${star} Bintang`}
              >
                <svg 
                  className={`w-9 h-9 sm:w-11 sm:h-11 ${
                    star <= (ratingHover || selectedStars) 
                      ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_18px_rgba(251,191,36,0.8)] scale-110' 
                      : 'text-neutral-700 fill-neutral-800 hover:text-neutral-500'
                  } transition-all duration-200`} 
                  viewBox="0 0 24 24" 
                  stroke="currentColor" 
                  strokeWidth="1.5"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.151-.312.596-.312.748 0l2.165 4.474 4.887.71c.343.05.48.474.231.719l-3.537 3.473.835 4.896c.059.344-.298.61-.606.44l-4.37-2.31-4.37 2.31c-.308.17-.665-.095-.606-.44l.835-4.896-3.537-3.473c-.249-.245-.113-.668.231-.72l4.888-.711 2.164-4.474z" />
                </svg>
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
            Klik bintang di atas untuk menulis ulasan pesan
          </p>
        </div>

        {/* ULASAN KOMENTAR */}
        <div className="w-full py-6 border-y border-white/10 bg-black/40 rounded-2xl mb-6 z-10">
          {ratings.length === 0 ? (
            <p className="text-center text-xs text-slate-500 uppercase font-bold tracking-widest py-10">
              Belum ada ulasan bintang yang terdaftar. Jadilah yang pertama memberi ulasan!
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 px-4">
              {ratings.map((item) => (
                <div 
                  key={item._id} 
                  className="w-full bg-gradient-to-b from-[#12121a]/90 to-[#0a0a0f]/90 border border-white/10 hover:border-orange-500/50 p-6 rounded-2xl flex flex-col justify-between shadow-xl relative group transition-all duration-300 hover:-translate-y-1 backdrop-blur-md"
                >
                  <div>
                    {/* Header Kartu: Avatar, Nama (Penuh), dan Bintang Horizontal Tanpa Kotak */}
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 border border-amber-300/40 flex items-center justify-center text-white font-black text-sm flex-shrink-0 uppercase shadow-[0_0_15px_rgba(234,88,12,0.4)]">
                          {item.name.charAt(0)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h5 className="text-xs font-black text-white tracking-wide break-words group-hover:text-orange-400 transition-colors">
                            {item.name}
                          </h5>
                          <span className="text-[9px] text-slate-400 font-mono font-semibold block mt-0.5">
                            {new Date(item.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        </div>
                      </div>

                      {/* Barisan Bintang Polos Berjajar Kesamping */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {[1, 2, 3, 4, 5].map((starIndex) => (
                          <svg
                            key={starIndex}
                            className={`w-4 h-4 ${
                              starIndex <= item.stars
                                ? 'text-amber-400 fill-amber-400 drop-shadow-[0_0_6px_rgba(251,191,36,0.8)]'
                                : 'text-neutral-700 fill-neutral-800'
                            }`}
                            viewBox="0 0 24 24"
                          >
                            <path d="M12 .587l3.668 7.431 8.2 1.191-5.934 5.787 1.4 8.168L12 18.896l-7.334 3.857 1.4-8.168L.132 9.209l8.2-1.191L12 .587z" />
                          </svg>
                        ))}
                      </div>
                    </div>

                    {/* Pesan Ulasan */}
                    <div className="relative bg-black/40 p-4 rounded-xl border border-white/5 shadow-inner">
                      <p className="text-xs text-slate-200 font-medium leading-relaxed break-words">
                        {item.message ? (
                          `"${item.message}"`
                        ) : (
                          <span className="italic text-slate-500 text-[11px]">Tanpa komentar tertulis.</span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Footer Kartu & Tombol Hapus */}
                  <div className="flex justify-between items-center mt-5 pt-3 border-t border-white/5">
                    <span className="text-[9px] text-slate-500 uppercase tracking-widest font-extrabold flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Terverifikasi
                    </span>

                    <button
                      type="button"
                      onClick={() => triggerDeleteRating(item._id)}
                      className={`p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-600 hover:text-white transition-all duration-200 ${
                        isAdminMode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                      }`}
                      title="Hapus Ulasan Ini"
                    >
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

        {/* Toggle Admin Panel Moderasi */}
        <div className="flex justify-between items-center px-2 z-10 relative">
          <p className="text-[10px] text-slate-500 font-semibold tracking-wider">
            * Daftar ulasan komunitas terverifikasi.
          </p>
          <button
            type="button"
            onClick={handleMinusAdminToggle}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center text-sm font-bold transition-all ${
              isAdminMode 
                ? 'bg-rose-600/20 border-rose-500 text-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.3)]' 
                : 'bg-white/5 border-white/10 text-slate-500 hover:text-white hover:border-white/20'
            }`}
            title={isAdminMode ? "Matikan Panel Moderasi" : "Aktifkan Panel Moderasi"}
          >
            －
          </button>
        </div>

      </section>

      {/* MODAL INPUT CHAT ULASAN BARU */}
      {showRateModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowRateModal(false)} />
          <div className="relative bg-[#0d0d12] border border-orange-500/40 p-6 md:p-8 rounded-2xl w-full max-w-md shadow-[0_0_60px_rgba(234,88,12,0.25)] animate-in zoom-in-95 duration-200">
            
            <div className="flex justify-between items-center mb-6 pb-3 border-b border-white/10">
              <div>
                <h3 className="text-base font-black uppercase tracking-wider text-white">Formulir Evaluasi</h3>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                  Rating Terpilih: <span className="text-amber-400 font-black">{selectedStars} Bintang</span>
                </p>
              </div>
              <button 
                type="button" 
                onClick={() => setShowRateModal(false)} 
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-all text-xs"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleRateSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">Nama / Gamertag</label>
                <input 
                  type="text"
                  value={reviewerName}
                  onChange={e => setReviewerName(e.target.value)}
                  placeholder="Masukkan nama Anda..."
                  className="bg-black/60 border border-white/10 px-4 py-3 rounded-xl text-sm text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-bold transition-all placeholder:text-slate-600"
                  required
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-widest text-slate-400 font-extrabold">Pesan Ulasan Umpan Balik</label>
                <textarea 
                  value={reviewerMessage}
                  onChange={e => setReviewerMessage(e.target.value)}
                  placeholder="Ketik impresi atau saran Anda..."
                  className="bg-black/60 border border-white/10 px-4 py-3 rounded-xl text-xs text-slate-200 h-28 resize-none focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 leading-relaxed transition-all placeholder:text-slate-600"
                />
              </div>

              <button 
                type="submit" 
                disabled={submittingRate}
                className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-[0_0_25px_rgba(234,88,12,0.4)] mt-2 active:scale-95"
              >
                {submittingRate ? "Menyimpan Data..." : "Kirim Ulasan Resmi"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VERIFIKASI ADMIN */}
      {showAuthModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowAuthModal(false)} />
          <div className="relative bg-[#0d0d12] border border-orange-500/40 p-6 rounded-2xl w-full max-w-sm shadow-[0_0_50px_rgba(234,88,12,0.25)] animate-in zoom-in-95 duration-200">
            
            <div className="text-center mb-5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-500 flex items-center justify-center mx-auto mb-3">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-white uppercase tracking-wider">Akses Otentikasi Admin</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-1">Masukkan kata sandi moderasi rating</p>
            </div>

            <form onSubmit={verifyAdminAction} className="flex flex-col gap-3">
              <input 
                type="password" 
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
                placeholder="Password Administrasi..."
                className="bg-black/60 border border-white/10 p-3 rounded-xl text-white focus:outline-none focus:border-orange-500 text-center font-bold tracking-widest text-xs transition-all"
                required
              />
              <button 
                type="submit" 
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95"
              >
                Buka Kunci Moderasi
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI HAPUS */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-[250] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setConfirmDeleteId(null)} />
          <div className="relative bg-[#0d0d12] border border-rose-500/40 p-6 rounded-2xl w-full max-w-sm text-center shadow-[0_0_60px_rgba(244,63,94,0.3)] animate-in zoom-in-95 duration-200">
            
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-500 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
              </svg>
            </div>

            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-2">Hapus Ulasan Ini?</h3>
            <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6">
              Apakah Anda yakin ingin memoderasi dan menghapus ulasan ini secara permanen dari database?
            </p>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setConfirmDeleteId(null)} 
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3 rounded-xl text-xs uppercase tracking-wider border border-white/10 transition-all"
              >
                Batal
              </button>
              <button 
                type="button" 
                onClick={executeDeleteRating} 
                className="flex-1 bg-rose-600 hover:bg-rose-500 text-white font-bold py-3 rounded-xl text-xs uppercase tracking-wider shadow-lg transition-all"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
