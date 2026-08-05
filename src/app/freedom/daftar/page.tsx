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

export default function JoinPage() {
  const [config, setConfig] = useState<FormConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState(false);

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
    } catch (err) {
      console.error(err);
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
      alert(`Berkas ditolak! Ukuran maksimal file adalah ${maxMb} MB.`);
      e.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setAnswers({ ...answers, [questionId]: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config) return;

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
        alert(data.message || 'Pendaftaran berhasil dikirim!');
        setAnswers({});
      } else {
        alert(data.error || 'Terjadi kesalahan sistem.');
      }
    } catch (err) {
      alert('Gagal terhubung ke server pendaftaran.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-sans uppercase tracking-widest text-xs">
        Memuat Struktur Berkas Rekrutmen...
      </div>
    );
  }

  if (!config) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-sans uppercase tracking-widest text-xs">
        Konfigurasi Sistem Aliansi Rusak.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-24 relative overflow-x-hidden">
      
      {/* BACKGROUND LATAR BELAKANG */}
      {bg2ImgSrc && (
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-50 z-0 pointer-events-none"
          style={{ backgroundImage: `url(${bg2ImgSrc})` }}
        />
      )}
      <div className="fixed inset-0 bg-gradient-to-b from-black/80 via-[#050505]/60 to-[#050505] z-0 pointer-events-none" />

      {/* TOP BANNER */}
      {bannerSrc && (
        <div className="w-full h-48 md:h-64 relative overflow-hidden border-b border-white/10 bg-neutral-900 z-10">
          <img src={bannerSrc} alt="Freedom Registration Banner" className="w-full h-full object-cover opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-transparent to-transparent" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
        
        {/* KARTU HEADER FORMULIR */}
        <div className="bg-[#0f0f12]/90 backdrop-blur-xl border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl mb-6 border-t-8 border-t-orange-500">
          <div className="flex items-center gap-2 mb-2">
            <span className={`w-2.5 h-2.5 rounded-full ${config.status === 'open' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-400">Official Recruitment</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-white">{config.note || "Registrasi Clan Freedom"}</h1>
          
          <div className="mt-5 pt-4 border-t border-white/10 flex flex-wrap justify-between gap-3 text-[11px] font-bold tracking-wider text-slate-400">
            <span>STATUS: <span className={config.status === 'open' ? 'text-green-400 font-black' : 'text-red-400 font-black'}>{config.status === 'open' ? 'DIBUKA' : 'DITUTUP'}</span></span>
            <span>JADWAL: <span className="text-slate-200">{config.schedule}</span></span>
          </div>
        </div>

        {config.status === 'closed' ? (
          <div className="bg-red-950/40 border border-red-500/30 rounded-2xl p-10 text-center text-xs uppercase font-black tracking-widest text-red-400 backdrop-blur-md shadow-2xl">
            Pendaftaran Saat Ini Sedang Ditutup Sementara Waktu.
          </div>
        ) : (
          <form onSubmit={handleSubmitForm} className="flex flex-col gap-4">
            
            {/* RENDER KARTU-KARTU SOAL (GOOGLE FORM STYLE) */}
            {config.questions && config.questions.map((q) => (
              <div 
                key={q.id} 
                className="bg-[#0f0f12]/90 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col gap-3 transition-all hover:border-white/20"
              >
                
                {/* JUDUL / ISI TEKS SOAL (MENDUKUNG ENTER BANYAK BARIS) */}
                <div className="text-sm font-bold text-slate-100 leading-relaxed whitespace-pre-wrap break-words">
                  {q.label}
                  {q.required && q.type !== 'paragraph' && (
                    <span className="text-red-500 font-black text-sm ml-1 inline-block" title="Wajib Diisi">*</span>
                  )}
                </div>

                {/* PREVIEW GAMBAR SOAL JIKA ADA */}
                {q.imageUrl && (
                  <img 
                    src={q.imageUrl} 
                    alt="Lampiran Soal" 
                    className="max-h-64 rounded-xl object-contain bg-black/60 border border-white/10 my-2 self-start" 
                    onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} 
                  />
                )}

                {/* LOGIKA PARAGRAPH (INFO SAJA - TANPA INPUT JAWABAN) */}
                {q.type === 'paragraph' ? null : 

                /* LOGIKA TEKS PANJANG (TEXTAREA) */
                q.type === 'textarea' ? (
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={e => handleInputChange(q.id, e.target.value)}
                    placeholder={q.placeholder || 'Ketik tanggapan...'}
                    className="bg-black/70 border border-white/10 p-3.5 rounded-xl text-xs text-slate-100 h-28 resize-y focus:outline-none focus:border-orange-500 leading-relaxed transition-all mt-1"
                    required={q.required}
                  />
                ) : 

                /* LOGIKA PILIHAN GANDA (RADIO) */
                q.type === 'radio' ? (
                  <div className="flex flex-col gap-2.5 mt-1">
                    {(q.options || []).map((opt, oIdx) => (
                      <label 
                        key={oIdx} 
                        className={`flex items-center gap-3 bg-black/50 border p-3.5 rounded-xl cursor-pointer text-xs font-medium transition-all ${answers[q.id] === opt ? 'border-orange-500 bg-orange-500/10 text-white' : 'border-white/5 text-slate-300 hover:bg-neutral-900/80 hover:border-white/20'}`}
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

                /* LOGIKA UPLOAD FILE */
                q.type === 'file' ? (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="file"
                      accept="image/*,application/pdf,.doc,.docx"
                      onChange={e => handleFileUpload(q.id, e, q.maxSizeMb || 5)}
                      className="text-xs text-slate-400 file:mr-4 file:py-2.5 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-orange-600/20 file:text-orange-400 file:cursor-pointer hover:file:bg-orange-600/30 transition-all"
                      required={q.required && !answers[q.id]}
                    />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Maksimal Ukuran Berkas: {q.maxSizeMb || 5} MB</span>
                    {answers[q.id] && answers[q.id].startsWith('data:image/') && (
                      <div className="mt-2 p-2 bg-black border border-white/10 rounded-xl self-start">
                        <img src={answers[q.id]} alt="Pratinjau Unggahan" className="max-h-36 object-contain rounded-lg" />
                      </div>
                    )}
                  </div>
                ) : 

                /* LOGIKA TEKS PENDEK (TEXT biasa) */
                (
                  <input
                    type="text"
                    value={answers[q.id] || ''}
                    onChange={e => handleInputChange(q.id, e.target.value)}
                    placeholder={q.placeholder || 'Ketik tanggapan...'}
                    className="bg-black/70 border border-white/10 p-3 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-orange-500 transition-all mt-1"
                    required={q.required}
                  />
                )}

              </div>
            ))}

            {/* TOMBOL SUBMIT ALA GOOGLE FORM */}
            <div className="sticky bottom-4 z-20 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black p-4 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 shadow-2xl shadow-orange-600/30 flex items-center justify-center gap-2 cursor-pointer border border-orange-400/30"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 0118 19.333L6 12z" />
                </svg>
                {submitting ? "Mengirim Berkas..." : "Kirim Dokumen Lamaran"}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
}
