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

  // Engine Pengubah File Menjadi Base64 String untuk Pengiriman Aman ke API MongoDB
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

    // Otomatis mengambil jawaban pertama dari form pendaftar sebagai 'name' identitas utama
    const firstQuestionId = config.questions && config.questions[0]?.id;
    const primaryPlayerName = answers[firstQuestionId] || 'Pendaftar Baru';

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
        alert(data.message);
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
    <div className="min-h-screen bg-[#050505] text-white font-sans pb-20 relative overflow-x-hidden">
      
      {/* --- BACKGROUND 2 UTAMA (MENGISI AREA KOSONG DI BAWAH BANNER) --- */}
      {bg2ImgSrc && (
        <div 
          className="fixed inset-0 bg-cover bg-center bg-no-repeat opacity-60 z-0 pointer-events-none"
          style={{ backgroundImage: `url(${bg2ImgSrc})` }}
        />
      )}
      {/* Lapisan gradasi gelap tambahan untuk menjaga keterbacaan teks soal */}
      <div className="fixed inset-0 bg-gradient-to-b from-transparent via-[#050505]/40 to-[#050505] z-0 pointer-events-none" />

      {/* --- TOP BANNER IMAGE --- */}
      {bannerSrc && (
        <div className="w-full h-48 md:h-64 relative overflow-hidden border-b border-white/5 bg-neutral-900 z-10">
          <img src={bannerSrc} alt="Freedom Registration Banner" className="w-full h-full object-cover opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] to-transparent" />
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
        
        {/* INFO STATUS SEKSI */}
        <div className="bg-[#0a0a0b]/90 backdrop-blur-md border border-white/10 p-6 md:p-8 rounded-2xl shadow-2xl mb-8 flex flex-col gap-2">
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${config.status === 'open' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-orange-500">Official Recruitment</span>
          </div>
          <h1 className="text-2xl md:text-4xl font-black uppercase tracking-tight text-white mt-1">Registrasi Clan Freedom</h1>
          <p className="text-xs text-slate-400 font-medium leading-relaxed mt-2 border-l-2 border-orange-500 pl-3 italic">
            {config.note}
          </p>
          <div className="mt-4 pt-4 border-t border-white/5 flex flex-wrap justify-between gap-2 text-[10px] uppercase tracking-wider font-bold text-slate-500">
            <span>Status: <span className={config.status === 'open' ? 'text-green-400' : 'text-red-400'}>{config.status === 'open' ? 'DIBUKA' : 'DITUTUP'}</span></span>
            <span>Jadwal: <span className="text-slate-300">{config.schedule}</span></span>
          </div>
        </div>

        {config.status === 'closed' ? (
          <div className="bg-red-600/10 border border-red-500/20 rounded-xl p-8 text-center text-xs uppercase font-black tracking-widest text-red-400">
            Pendaftaran Saat Ini Sedang Ditutup Sementara Waktu.
          </div>
        ) : (
          <form onSubmit={handleSubmitForm} className="bg-[#0a0a0b]/80 backdrop-blur-sm border border-white/5 p-6 md:p-8 rounded-2xl flex flex-col gap-6 shadow-xl">
            
            {/* RENDER PERTANYAAN SECARA FULLY DINAMIS */}
            {config.questions && config.questions.map((q) => (
              <div key={q.id} className="flex flex-col gap-2 bg-black/40 border border-white/[0.03] p-4 rounded-xl">
                
                {/* Judul / Atribut Soal */}
                <label className="text-xs font-bold text-slate-300 flex items-center gap-1 flex-wrap">
                  {q.label}
                  {q.required && q.type !== 'paragraph' && <span className="text-red-500 font-black text-sm leading-none">*</span>}
                </label>

                {/* Preview Gambar Soal Seperti Google Form */}
                {q.imageUrl && (
                  <img src={q.imageUrl} alt="Pendukung Soal" className="max-h-60 rounded-lg object-contain bg-neutral-900 border border-white/5 mb-2 mt-1 self-start" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                )}

                {/* Logika Input Per Tipe Data */}
                {q.type === 'paragraph' ? (
                  <p className="text-xs text-slate-400 leading-relaxed font-medium whitespace-pre-wrap bg-white/[0.02] p-3 rounded border border-white/5 mt-1">
                    {q.placeholder || 'Silakan baca informasi teks pengantar di atas.'}
                  </p>
                ) : q.type === 'textarea' ? (
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={e => handleInputChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    className="bg-black border border-white/10 p-3 rounded-lg text-xs text-slate-200 h-28 resize-none focus:outline-none focus:border-orange-500 leading-relaxed transition-all"
                    required={q.required}
                  />
                ) : q.type === 'radio' ? (
                  <div className="flex flex-col gap-2 mt-1">
                    {(q.options || []).map((opt, oIdx) => (
                      <label key={oIdx} className="flex items-center gap-3 bg-black/60 border border-white/5 px-3 py-2.5 rounded-lg cursor-pointer text-xs font-medium text-slate-300 hover:bg-neutral-900 transition-colors">
                        <input
                          type="radio"
                          name={q.id}
                          value={opt}
                          checked={answers[q.id] === opt}
                          onChange={e => handleInputChange(q.id, e.target.value)}
                          className="w-4 h-4 accent-orange-600 cursor-pointer"
                          required={q.required}
                        />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : q.type === 'file' ? (
                  <div className="flex flex-col gap-2 mt-1">
                    <input
                      type="file"
                      accept="image/*,application/pdf,.doc,.docx"
                      onChange={e => handleFileUpload(q.id, e, q.maxSizeMb || 5)}
                      className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-bold file:bg-orange-600/20 file:text-orange-400 file:cursor-pointer hover:file:bg-orange-600/30"
                      required={q.required && !answers[q.id]}
                    />
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">Maksimal Ukuran Berkas: {q.maxSizeMb || 5} MB</span>
                    {answers[q.id] && answers[q.id].startsWith('data:image/') && (
                      <div className="mt-2 p-2 bg-black border border-white/5 rounded-lg self-start">
                        <img src={answers[q.id]} alt="Pratinjau Unggahan" className="max-h-32 object-contain rounded" />
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    value={answers[q.id] || ''}
                    onChange={e => handleInputChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    className="bg-black border border-white/10 p-3 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-orange-500 transition-all"
                    required={q.required}
                  />
                )}
              </div>
            ))}

            <button
              type="submit"
              disabled={submitting}
              className="bg-orange-600 hover:bg-orange-500 text-white font-black p-4 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-50 mt-4 shadow-lg flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 0118 19.333L6 12z" />
              </svg>
              {submitting ? "Mengirim Berkas..." : "Kirim Dokumen Lamaran"}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}
