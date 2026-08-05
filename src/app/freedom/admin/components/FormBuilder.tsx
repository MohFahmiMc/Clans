"use client";

import React, { useState, useEffect } from 'react';

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

export default function FormBuilder({ adminPassword }: { adminPassword: string }) {
  const [formStatus, setFormStatus] = useState<'open' | 'closed'>('open');
  const [formSchedule, setFormSchedule] = useState('');
  const [formNote, setFormNote] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [newOptionTexts, setNewOptionTexts] = useState<{ [key: string]: string }>({});

  const fetchConfig = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/recruitment?admin=true');
      if (res.ok) {
        const data = await res.json();
        setFormStatus(data.config.status || 'open');
        setFormSchedule(data.config.schedule || '');
        setFormNote(data.config.note || '');
        setQuestions(data.config.questions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConfig(false);
    }
  };

  useEffect(() => {
    fetchConfig();
  }, []);

  const handleAddQuestion = () => {
    const newId = 'q_' + Date.now();
    const newQ: Question = {
      id: newId,
      label: 'Pertanyaan atau Informasi Baru',
      type: 'text',
      placeholder: 'Ketik tanggapan...',
      required: true,
      options: ['Pilihan Opsi 1'],
      maxSizeMb: 5,
      imageUrl: ''
    };
    setQuestions([...questions, newQ]);
  };

  const handleUpdateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, [field]: value } : q));
  };

  const handleAddRadioOption = (qId: string) => {
    const txt = newOptionTexts[qId]?.trim();
    if (!txt) return;
    setQuestions(questions.map(q => q.id === qId ? { ...q, options: [...(q.options || []), txt] } : q));
    setNewOptionTexts({ ...newOptionTexts, [qId]: '' });
  };

  const handleDeleteRadioOption = (qId: string, optIndex: number) => {
    setQuestions(questions.map(q => q.id === qId ? { ...q, options: (q.options || []).filter((_, idx) => idx !== optIndex) } : q));
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= questions.length) return;
    const updated = [...questions];
    const temp = updated[index];
    updated[index] = updated[nextIndex];
    updated[nextIndex] = temp;
    setQuestions(updated);
  };

  const handleSaveFormStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/recruitment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: adminPassword,
          status: formStatus,
          schedule: formSchedule,
          note: formNote,
          questions
        })
      });
      if (res.ok) alert('Konfigurasi formulir berhasil disimpan!');
    } catch (err) {
      alert('Gagal menyimpan formulir.');
    }
  };

  return (
    <form onSubmit={handleSaveFormStructure} className="flex flex-col gap-6 max-w-4xl mx-auto">
      
      {/* CARD KONTROL UTAMA */}
      <div className="bg-[#0f0f12] border border-white/10 p-6 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Status Pendaftaran</label>
          <div className="flex gap-2">
            <button 
              type="button" 
              onClick={() => setFormStatus('open')} 
              className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${formStatus === 'open' ? 'bg-green-600 text-white shadow-lg shadow-green-600/30' : 'bg-black/50 text-slate-500 border border-white/5 hover:text-white'}`}
            >
              BUKA
            </button>
            <button 
              type="button" 
              onClick={() => setFormStatus('closed')} 
              className={`flex-1 py-2.5 rounded-lg text-xs font-black uppercase transition-all ${formStatus === 'closed' ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-black/50 text-slate-500 border border-white/5 hover:text-white'}`}
            >
              TUTUP
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Jadwal Operasional</label>
          <input 
            type="text" 
            value={formSchedule} 
            onChange={e => setFormSchedule(e.target.value)} 
            placeholder="Contoh: Season Depan / Setiap Hari"
            className="bg-black/70 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500 transition-colors" 
            required 
          />
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">Catatan Pengantar</label>
          <textarea 
            rows={2}
            value={formNote} 
            onChange={e => setFormNote(e.target.value)} 
            placeholder="Tulis catatan singkat pengantar form..."
            className="bg-black/70 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500 transition-colors resize-y" 
            required 
          />
        </div>
      </div>

      {/* STRUKTUR KARTU SOAL (GOOGLE FORM BUILDER STYLE) */}
      <div className="flex flex-col gap-4">
        <div className="flex justify-between items-center bg-[#0f0f12] border border-white/10 p-4 rounded-xl">
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white">Struktur & Urutan Kartu Formulir</h3>
            <p className="text-[11px] text-slate-400 mt-0.5">Kelola pertanyaan, teks informasi, dan urutan kartu seperti di Google Form</p>
          </div>
          <button 
            type="button" 
            onClick={handleAddQuestion} 
            className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-orange-600/20"
          >
            <span>+</span> Tambah Kartu Soal
          </button>
        </div>

        {loadingConfig ? (
          <div className="bg-[#0f0f12] border border-white/5 p-12 text-center rounded-2xl">
            <p className="text-xs text-slate-400 animate-pulse">Memuat konfigurasi formulir...</p>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-[#0f0f12] border border-white/10 hover:border-white/20 transition-all rounded-2xl overflow-hidden shadow-lg border-l-4 border-l-orange-500">
                
                {/* HEAD KARTU & NAVIGASI POSISI */}
                <div className="bg-black/40 px-5 py-3 border-b border-white/5 flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-black bg-orange-600/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-md">
                      KARTU #{idx + 1}
                    </span>
                    <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/5">
                      <button 
                        type="button" 
                        onClick={() => moveQuestion(idx, 'up')} 
                        disabled={idx === 0} 
                        title="Pindahkan ke atas"
                        className="px-2 py-0.5 text-xs text-slate-300 hover:text-orange-400 hover:bg-white/10 rounded disabled:opacity-20 transition-all"
                      >
                        ▲
                      </button>
                      <button 
                        type="button" 
                        onClick={() => moveQuestion(idx, 'down')} 
                        disabled={idx === questions.length - 1} 
                        title="Pindahkan ke bawah"
                        className="px-2 py-0.5 text-xs text-slate-300 hover:text-orange-400 hover:bg-white/10 rounded disabled:opacity-20 transition-all"
                      >
                        ▼
                      </button>
                    </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={() => setQuestions(questions.filter(item => item.id !== q.id))} 
                    className="text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                  >
                    Hapus Kartu
                  </button>
                </div>

                {/* ISI FORM KARTU */}
                <div className="p-5 flex flex-col gap-4">
                  
                  {/* BARIS TIPE & WAJIB DIISI */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-8 flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Pilih Tipe Tampilan / Konten</label>
                      <select 
                        value={q.type} 
                        onChange={e => handleUpdateQuestion(q.id, 'type', e.target.value)} 
                        className="bg-black/70 border border-white/10 p-2.5 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500 cursor-pointer"
                      >
                        <option value="text">Teks Pendek (Jawaban Singkat)</option>
                        <option value="textarea">Teks Panjang (Jawaban Paragraf)</option>
                        <option value="radio">Pilihan Ganda (Bulat Opsi)</option>
                        <option value="file">Unggah Berkas / File Document</option>
                        <option value="paragraph">Teks Info Deskripsi / Peraturan (Tanpa Input Jawaban)</option>
                      </select>
                    </div>

                    <div className="md:col-span-4 flex items-center md:justify-end pt-2 md:pt-6">
                      <label className={`text-xs font-bold flex items-center gap-2 cursor-pointer select-none p-2 rounded-lg border ${q.type === 'paragraph' ? 'opacity-40 border-transparent' : 'border-white/5 bg-black/40 hover:bg-black/60 text-slate-300'}`}>
                        <input 
                          type="checkbox" 
                          checked={q.required} 
                          onChange={e => handleUpdateQuestion(q.id, 'required', e.target.checked)} 
                          className="w-4 h-4 accent-orange-600 rounded cursor-pointer" 
                          disabled={q.type === 'paragraph'} 
                        />
                        Wajib Diisi
                      </label>
                    </div>
                  </div>

                  {/* LABEL / TEXT JUDUL SOAL (TEXTAREA AGAR BISA ENTER & BANYAK BARIS) */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[10px] uppercase font-bold text-slate-400 flex justify-between">
                      <span>{q.type === 'paragraph' ? 'Isi Teks Deskripsi / Peraturan' : 'Judul Pertanyaan / Soal'}</span>
                      <span className="text-[9px] text-slate-500 font-normal">Bisa menggunakan tombol Enter untuk baris baru</span>
                    </label>
                    <textarea 
                      rows={q.type === 'paragraph' ? 5 : 2}
                      value={q.label} 
                      onChange={e => handleUpdateQuestion(q.id, 'label', e.target.value)} 
                      placeholder={q.type === 'paragraph' ? 'Tulis isi teks peraturan, syarat, atau pengumuman di sini...' : 'Tulis pertanyaan soal di sini...'}
                      className="bg-black/80 border border-white/10 p-3 rounded-lg text-xs text-white focus:outline-none focus:border-orange-500 font-sans leading-relaxed resize-y" 
                      required 
                    />
                  </div>

                  {/* DESKRIPSI TAMBAHAN / PLACEHOLDER (DAPAT DIISI BILA BUKAN PARAGRAPH) */}
                  {q.type !== 'paragraph' && (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400">Petunjuk / Text Hint Input (Opsional)</label>
                      <input 
                        type="text" 
                        value={q.placeholder || ''} 
                        onChange={e => handleUpdateQuestion(q.id, 'placeholder', e.target.value)} 
                        placeholder="Contoh: Ketik tanggapan..."
                        className="bg-black/60 border border-white/10 p-2.5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-orange-500" 
                      />
                    </div>
                  )}

                  {/* PENGATURAN KHUSUS PILIHAN GANDA */}
                  {q.type === 'radio' && (
                    <div className="bg-black/50 border border-white/10 p-4 rounded-xl flex flex-col gap-3 mt-1">
                      <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider">Daftar Opsi Pilihan Ganda:</span>
                      <div className="flex flex-col gap-2">
                        {(q.options || []).map((opt, oIdx) => (
                          <div key={oIdx} className="flex justify-between items-center bg-[#0f0f12] px-3 py-2 rounded-lg border border-white/5 text-xs">
                            <span className="text-slate-200 flex items-center gap-2">
                              <span className="w-3 h-3 rounded-full border border-orange-500 inline-block"></span>
                              {opt}
                            </span>
                            <button 
                              type="button" 
                              onClick={() => handleDeleteRadioOption(q.id, oIdx)} 
                              className="text-red-400 hover:text-red-300 text-[11px] font-bold px-2 py-0.5 rounded hover:bg-red-500/10 transition-colors"
                            >
                              Hapus
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2 mt-1">
                        <input 
                          type="text" 
                          value={newOptionTexts[q.id] || ''} 
                          onChange={e => setNewOptionTexts({ ...newOptionTexts, [q.id]: e.target.value })} 
                          placeholder="Tulis opsi baru..." 
                          className="bg-black border border-white/10 p-2 rounded-lg text-xs flex-1 text-white focus:outline-none focus:border-orange-500" 
                        />
                        <button 
                          type="button" 
                          onClick={() => handleAddRadioOption(q.id)} 
                          className="bg-neutral-800 hover:bg-neutral-700 text-white px-4 py-2 rounded-lg text-xs font-bold transition-all"
                        >
                          + Tambah Opsi
                        </button>
                      </div>
                    </div>
                  )}

                  {/* PREVIEW GAMBAR SOAL */}
                  <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                    <label className="text-[10px] uppercase font-bold text-slate-400">Link URL Foto Lampiran Soal (Opsional)</label>
                    <input 
                      type="text" 
                      value={q.imageUrl || ''} 
                      onChange={e => handleUpdateQuestion(q.id, 'imageUrl', e.target.value)} 
                      placeholder="https://i.imgur.com/example.png"
                      className="bg-black/60 border border-white/10 p-2.5 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-orange-500" 
                    />
                  </div>

                </div>
              </div>
            ))}
          </div>
        )}

        <button 
          type="submit" 
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-600/20 mt-4 cursor-pointer"
        >
          Simpan Seluruh Struktur Formulir
        </button>
      </div>
    </form>
  );
}
