"use client";

import React, { useState, useEffect } from 'react';
import bannerImage from '../../../assets/benner.png';

interface Question {
  id: string;
  label: string;
  type: 'text' | 'textarea';
  placeholder: string;
  required: boolean;
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
  const [primaryName, setPrimaryName] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');
  const bannerSrc = getSrc(bannerImage);

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
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!primaryName.trim()) return alert('Nama Utama / Gamertag wajib diisi!');
    
    setSubmitting(true);
    try {
      const res = await fetch('/api/recruitment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: primaryName, answers })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        setPrimaryName('');
        setAnswers({});
      } else {
        alert(data.error || 'Gagal mengirimkan berkas pendaftaran.');
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050505] text-white flex items-center justify-center font-bold uppercase tracking-widest animate-pulse text-xs">
        Membuka Formulir Pendaftaran Aliansi...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans py-12 px-4 relative overflow-x-hidden">
      <div className="max-w-2xl mx-auto bg-[#0a0a0a] border border-white/10 rounded-2xl shadow-2xl overflow-hidden relative z-10">
        
        {/* BANNER RECRUITMENT DARI ASSETS BANNER.PNG */}
        <div className="w-full h-44 md:h-56 bg-zinc-900 relative overflow-hidden border-b border-white/10">
          {bannerSrc ? (
            <img src={bannerSrc} alt="Banner" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-orange-600 to-amber-700 opacity-40" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />
        </div>

        {/* METADATA STATUS FORM OPERASIONAL */}
        <div className="p-6 md:p-8 border-b border-white/5 bg-black/40">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <h1 className="text-3xl font-black uppercase tracking-tight text-white">Pendaftaran Anggota</h1>
            <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md border ${config?.status === 'open' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-red-500/10 border-red-500/30 text-red-400'}`}>
              {config?.status === 'open' ? 'Terbuka' : 'Ditutup Admin'}
            </span>
          </div>

          <div className="flex flex-col gap-2 text-xs font-medium text-slate-400">
            <div className="flex gap-2 items-center">
              <svg className="w-3.5 h-3.5 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Jadwal Operasional: <strong className="text-slate-200">{config?.schedule}</strong></span>
            </div>
            {config?.note && (
              <div className="p-3 bg-white/[0.02] border border-white/5 rounded-lg text-slate-400 leading-relaxed mt-2">
                <span className="font-bold text-[10px] text-orange-400 uppercase tracking-widest block mb-0.5">Catatan Penting:</span>
                {config.note}
              </div>
            )}
          </div>
        </div>

        {config?.status === 'closed' ? (
          <div className="p-12 text-center flex flex-col items-center justify-center gap-3">
            <svg className="w-12 h-12 text-slate-600 mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
            <h3 className="text-lg font-bold text-slate-300 uppercase tracking-wide">Formulir Dikunci</h3>
            <p className="text-xs text-slate-500 max-w-sm leading-relaxed">Pendaftaran anggota baru clan Freedom saat ini sedang dinonaktifkan oleh administrasi.</p>
          </div>
        ) : (
          <form onSubmit={handleFormSubmit} className="p-6 md:p-8 flex flex-col gap-6">
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-1">
                Gamertag Player Utama / Nickname
                <span className="text-orange-500">*</span>
              </label>
              <input 
                type="text"
                value={primaryName}
                onChange={e => setPrimaryName(e.target.value)}
                placeholder="Masukkan Nickname Minecraft Anda..."
                className="bg-black border border-white/10 p-3 rounded-lg text-sm text-white focus:outline-none focus:border-orange-500 font-bold transition-all"
                required
              />
            </div>

            {config?.questions.map((q) => (
              <div key={q.id} className="flex flex-col gap-2 border-t border-white/5 pt-4">
                <label className="text-xs font-black uppercase tracking-widest text-slate-300 flex items-center gap-1">
                  {q.label}
                  {q.required && <span className="text-orange-500">*</span>}
                </label>
                
                {q.type === 'textarea' ? (
                  <textarea
                    value={answers[q.id] || ''}
                    onChange={e => handleInputChange(q.id, e.target.value)}
                    placeholder={q.placeholder}
                    className="bg-black border border-white/10 p-3 rounded-lg text-xs text-slate-200 h-28 resize-none focus:outline-none focus:border-orange-500 leading-relaxed transition-all"
                    required={q.required}
                  />
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
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
              </svg>
              {submitting ? "Mengirim Berkas..." : "Kirim Jawaban Pendaftaran"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
