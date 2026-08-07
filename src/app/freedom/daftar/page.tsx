"use client";

import React, { useState, useEffect } from 'react';
import bannerImage from '../../../assets/benner.png';
import background2Image from '../../../assets/background2.png';

interface Question {
  id: string;
  label: string;
  type: 'text' | 'textarea' | 'radio' | 'file' | 'paragraph';
  placeholder?: string;
  required: boolean;
  options?: string[];
  maxSizeMb?: number;
  imageUrl?: string;
}

interface FormConfig {
  status: 'open' | 'closed';
  schedule: string;
  note: string;
  questions: Question[];
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error' | 'info';
}

export default function JoinPage() {
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

  // Modal Confirm & Custom Toast State
  const [showConfirmModal, setShowConfirmModal] = useState(false);
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

  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');
  const bannerSrc = getSrc(bannerImage);
  const bg2ImgSrc = getSrc(background2Image);

  const fetchFormStructure = async () => {
    try {
      const res = await fetch('/api/recruitment?t=' + new Date().getTime(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
      }
    } catch {
      // Quiet fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormStructure();
  }, []);

  const handleInputChange = (questionId: string, value: string) => {
    setAnswers({ ...answers, [questionId]: value });
  };

  const handleFileUpload = (questionId: string, e: React.ChangeEvent<HTMLInputElement>, maxMb: number = 5) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSizeByte = maxMb * 1024 * 1024;
    if (file.size > maxSizeByte) {
      triggerToast(`Ukuran file terlalu besar! Maksimal ${maxMb} MB.`, 'error');
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAnswers({ ...answers, [questionId]: reader.result as string });
      triggerToast('Berkas berhasil terlampir', 'success');
    };
    reader.readAsDataURL(file);
  };

  // Triggered on form submit event to prompt user confirmation
  const handlePreSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;
    setShowConfirmModal(true);
  };

  // Actual execution after user presses "Ya, Kirim Sekarang"
  const executeFinalSubmit = async () => {
    if (!config) return;
    setShowConfirmModal(false);
    setSubmitting(true);

    // Ambil jawaban pertanyaan pertama bertipe input sebagai nama utama
    const validFirstQuestion = config.questions?.find(q => q.type !== 'paragraph');
    const primaryPlayerName = validFirstQuestion ? (answers[validFirstQuestion.id] || 'Pendaftar Baru') : 'Pendaftar Baru';

    try {
      const res = await fetch('/api/recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: primaryPlayerName,
          answers: answers
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        triggerToast(data.message || 'Pendaftaran berhasil terkirim!', 'success');
        setAnswers({});
      } else {
        triggerToast(data.error || 'Gagal mengirim pendaftaran.', 'error');
      }
    } catch {
      triggerToast('Gagal terhubung ke server. Coba lagi nanti.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center gap-3 font-sans uppercase tracking-widest text-xs">
        <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
        <span>Memuat Formulir Pendaftaran...</span>
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-sans text-xs uppercase tracking-widest p-4 text-center">
        Formulir pendaftaran tidak dapat dimuat. Silakan muat ulang halaman.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 relative overflow-x-hidden">
      
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

      {/* BACKGROUND LATAR BELAKANG */}
      {bg2ImgSrc && (
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-40 z-0 pointer-events-none"
          style={{ backgroundImage: `url(${bg2ImgSrc})` }}
        />
      )}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-[#050505]/70 to-[#050505] z-0 pointer-events-none" />

      {/* TOP BANNER */}
      {bannerSrc && (
        <div className="w-full h-48 md:h-64 relative overflow-hidden border-b border-white/10 bg-neutral-900 z-10">
          <img src={bannerSrc} alt="Banner Freedom" className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
        
        {/* KARTU HEADER FORMULIR */}
        <div className="bg-[#0f0f14]/90 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] mb-6 border-t-4 border-t-orange-500">
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2.5 h-2.5 rounded-full ${config.status === 'open' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Pendaftaran Clan Freedom</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">{config.note || "Pendaftaran Member Freedom"}</h1>
          
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap justify-between gap-3 text-[11px] font-bold tracking-wider text-slate-400">
            <span>STATUS: <span className={config.status === 'open' ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'}>{config.status === 'open' ? 'DIBUKA' : 'DITUTUP'}</span></span>
            <span>JADWAL: <span className="text-slate-200">{config.schedule}</span></span>
          </div>
        </div>

        {config.status === 'closed' ? (
          <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-10 text-center text-xs font-bold tracking-wider text-rose-300 backdrop-blur-md shadow-2xl">
            Pendaftaran saat ini sedang ditutup sementara. Silakan cek kembali nanti.
          </div>
        ) : (
          <form onSubmit={handlePreSubmit} className="flex flex-col gap-4">
            
            {/* RENDER KARTU-KARTU SOAL */}
            {config.questions && config.questions.map((q) => (
              <div 
                key={q.id} 
                className="bg-[#0f0f14]/80 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col gap-3 transition-all hover:border-white/20"
              >
                
                {/* JUDUL / ISI TEKS SOAL */}
                <div className="text-sm font-bold text-slate-100 leading-relaxed whitespace-pre-wrap break-words">
                  {q.label}
                  {q.required && q.type !== 'paragraph' && (
                    <span className="text-orange-500 font-black text-sm ml-1 inline-block" title="Wajib Diisi">*</span>
                  )}
                </div>

                {/* PREVIEW GAMBAR SOAL JIKA ADA */}
                {q.imageUrl && (
                  <img 
                    src={q.imageUrl} 
                    alt="Lampiran" 
                    className="max-h-64 rounded-xl object-contain bg-black/60 border border-white/10 my-2 self-start" 
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
                  />
                )}

                {/* PARAGRAPH (INFO SAJA) */}
                {q.type === 'paragraph' ? null : 

                /* TEXTAREA */
                q.type === 'textarea' ? (
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={e => handleInputChange(q.id, e.target.value)}
                    placeholder={q.placeholder || 'Ketik jawaban kamu...'}
                    className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-xs text-slate-100 h-28 resize-y focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 leading-relaxed transition-all mt-1 placeholder:text-slate-600"
                    required={q.required}
                  />
                ) : 

                /* RADIO */
                q.type === 'radio' ? (
                  <div className="flex flex-col gap-2.5 mt-1">
                    {(q.options || []).map((opt, oIdx) => (
                      <label 
                        key={oIdx} 
                        className={`flex items-center gap-3 bg-black/40 border p-3.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${answers[q.id] === opt ? 'border-orange-500 bg-orange-500/10 text-white shadow-[0_0_15px_rgba(234,88,12,0.15)]' : 'border-white/5 text-slate-300 hover:bg-neutral-900/60 hover:border-white/20'}`}
                      >
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={e => handleInputChange(q.id, e.target.value)}
                          className="w-4 h-4 accent-orange-600 cursor-pointer"
                          required={q.required}
                        />
                        <span className="break-words">{opt}</span>
                      </label>
                    ))}
                  </div>
                ) : 

                /* FILE UPLOAD */
                q.type === 'file' ? (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="file"
                      accept="image/*,application/pdf,.doc,.docx"
                      onChange={e => handleFileUpload(q.id, e, q.maxSizeMb || 5)}
                      className="text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-orange-600/20 file:text-orange-400 file:cursor-pointer hover:file:bg-orange-600/30 transition-all"
                      required={q.required && !answers[q.id]}
                    />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Batas Maksimal File: {q.maxSizeMb || 5} MB</span>
                    {answers[q.id] && answers[q.id].startsWith('data:image/') && (
                      <div className="mt-2 p-2 bg-black/60 border border-white/10 rounded-xl self-start">
                        <img src={answers[q.id]} alt="Pratinjau" className="max-h-36 object-contain rounded-lg" />
                      </div>
                    )}
                  </div>
                ) : 

                /* TEXT INPUT */
                (
                  <input
                    type="text"
                    value={answers[q.id] || ''}
                    onChange={e => handleInputChange(q.id, e.target.value)}
                    placeholder={q.placeholder || 'Ketik jawaban kamu...'}
                    className="bg-black/60 border border-white/10 p-3.5 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all mt-1 placeholder:text-slate-600"
                    required={q.required}
                  />
                )}

              </div>
            ))}

            {/* TOMBOL SUBMIT */}
            <div className="sticky bottom-4 z-20 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black p-4 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-[0_0_25px_rgba(234,88,12,0.4)] flex items-center justify-center gap-2 cursor-pointer border border-orange-400/30 active:scale-95"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 0118 19.333L6 12z" />
                </svg>
                {submitting ? "Mengirim Pendaftaran..." : "Kirim Formulir Pendaftaran"}
              </button>
            </div>

          </form>
        )}

      </div>

      {/* ======================================================== */}
      {/* MODAL KONFIRMASI KEBENARAN DATA */}
      {/* ======================================================== */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200" onClick={() => setShowConfirmModal(false)} />
          
          <div className="relative bg-[#0d0d12] border border-orange-500/30 p-6 md:p-8 rounded-2xl w-full max-w-md text-center shadow-[0_0_50px_rgba(234,88,12,0.25)] animate-in zoom-in-95 duration-200">
            
            <div className="w-12 h-12 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>

            <h3 className="text-base font-black text-white uppercase tracking-wider mb-2">Cek Kembali Data Anda</h3>
            <p className="text-xs text-slate-300 font-medium leading-relaxed mb-6">
              Apakah semua isian formulir pendaftaran kamu sudah benar dan sesuai?
            </p>

            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowConfirmModal(false)} 
                className="flex-1 bg-white/5 hover:bg-white/10 text-slate-300 font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider border border-white/10 transition-all active:scale-95"
              >
                Cek Lagi
              </button>
              <button 
                type="button" 
                onClick={executeFinalSubmit} 
                className="flex-1 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-wider shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all active:scale-95"
              >
                Ya, Kirim Sekarang
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
