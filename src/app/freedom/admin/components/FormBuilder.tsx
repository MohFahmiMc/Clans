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

interface ModalState {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
}

interface ToastState {
  show: boolean;
  message: string;
  type: 'success' | 'error';
}

export default function FormBuilder({ adminPassword }: { adminPassword: string }) {
  const [formStatus, setFormStatus] = useState<'open' | 'closed'>('open');
  const [formSchedule, setFormSchedule] = useState('');
  const [formNote, setFormNote] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newOptionTexts, setNewOptionTexts] = useState<{ [key: string]: string }>({});

  // Custom Modal & Toast States
  const [modal, setModal] = useState<ModalState>({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Ya, Hapus',
    cancelText: 'Batal',
    onConfirm: () => {},
  });

  const [toast, setToast] = useState<ToastState>({
    show: false,
    message: '',
    type: 'success',
  });

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast(prev => ({ ...prev, show: false }));
    }, 4000);
  };

  const closeModal = () => {
    setModal(prev => ({ ...prev, isOpen: false }));
  };

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
      showToast('Gagal memuat konfigurasi formulir', 'error');
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
    showToast('Kartu soal baru berhasil ditambahkan', 'success');
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
    const targetQ = questions.find(q => q.id === qId);
    const optionName = targetQ?.options?.[optIndex] || 'opsi ini';

    setModal({
      isOpen: true,
      title: 'Hapus Opsi Pilihan?',
      message: `Apakah Anda yakin ingin menghapus "${optionName}"?`,
      confirmText: 'Hapus Opsi',
      cancelText: 'Batal',
      onConfirm: () => {
        setQuestions(questions.map(q => q.id === qId ? { ...q, options: (q.options || []).filter((_, idx) => idx !== optIndex) } : q));
        closeModal();
        showToast('Opsi berhasil dihapus', 'success');
      }
    });
  };

  const handleDeleteQuestion = (qId: string, label: string) => {
    setModal({
      isOpen: true,
      title: 'Hapus Kartu Formulir?',
      message: `Kartu "${label.slice(0, 35)}${label.length > 35 ? '...' : ''}" akan dihapus permanen dari formulir ini.`,
      confirmText: 'Ya, Hapus Kartu',
      cancelText: 'Batal',
      onConfirm: () => {
        setQuestions(questions.filter(item => item.id !== qId));
        closeModal();
        showToast('Kartu formulir berhasil dihapus', 'success');
      }
    });
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
    setSaving(true);
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
      if (res.ok) {
        showToast('Konfigurasi formulir berhasil disimpan!', 'success');
      } else {
        showToast('Gagal menyimpan formulir. Periksa akses Anda.', 'error');
      }
    } catch (err) {
      showToast('Terjadi kesalahan jaringan saat menyimpan formulir.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative">
      
      {/* TOAST NOTIFICATION CUSTOM */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3.5 rounded-xl border shadow-2xl backdrop-blur-xl transition-all animate-bounce ${
          toast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/30 text-emerald-300' 
            : 'bg-rose-950/90 border-rose-500/30 text-rose-300'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )}
          <span className="text-xs font-semibold tracking-wide">{toast.message}</span>
        </div>
      )}

      {/* MODAL DIALOG KONFIRMASI CUSTOM (YES / NO) */}
      {modal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#121217] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4 transform transition-all scale-100">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">{modal.title}</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{modal.message}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end pt-3 border-t border-white/5 mt-2">
              <button
                type="button"
                onClick={closeModal}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                {modal.cancelText || 'Batal'}
              </button>
              <button
                type="button"
                onClick={modal.onConfirm}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition-all"
              >
                {modal.confirmText || 'Ya, Lanjutkan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FORM BUILDER MAIN CONTENT */}
      <form onSubmit={handleSaveFormStructure} className="flex flex-col gap-6 max-w-4xl mx-auto">
        
        {/* KARTU KONTROL UTAMA */}
        <div className="bg-[#0f0f12] border border-white/10 p-6 rounded-2xl shadow-xl grid grid-cols-1 md:grid-cols-3 gap-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 rounded-full blur-3xl pointer-events-none" />

          {/* STATUS PENDAFTARAN */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              Status Pendaftaran
            </label>
            <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-xl border border-white/5">
              <button 
                type="button" 
                onClick={() => setFormStatus('open')} 
                className={`py-2 rounded-lg text-xs font-bold uppercase transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  formStatus === 'open' 
                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30 font-black' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${formStatus === 'open' ? 'bg-white animate-pulse' : 'bg-emerald-500/50'}`} />
                BUKA
              </button>
              <button 
                type="button" 
                onClick={() => setFormStatus('closed')} 
                className={`py-2 rounded-lg text-xs font-bold uppercase transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  formStatus === 'closed' 
                    ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30 font-black' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${formStatus === 'closed' ? 'bg-white animate-pulse' : 'bg-rose-500/50'}`} />
                TUTUP
              </button>
            </div>
          </div>

          {/* JADWAL OPERASIONAL */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              Jadwal Operasional
            </label>
            <input 
              type="text" 
              value={formSchedule} 
              onChange={e => setFormSchedule(e.target.value)} 
              placeholder="Contoh: Season Depan / Setiap Hari"
              className="bg-black/70 border border-white/10 p-2.5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all" 
              required 
            />
          </div>

          {/* CATATAN PENGANTAR */}
          <div className="flex flex-col gap-2">
            <label className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500"></span>
              Catatan Pengantar
            </label>
            <textarea 
              rows={2}
              value={formNote} 
              onChange={e => setFormNote(e.target.value)} 
              placeholder="Tulis catatan singkat pengantar form..."
              className="bg-black/70 border border-white/10 p-2.5 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all resize-y" 
              required 
            />
          </div>
        </div>

        {/* STRUKTUR KARTU SOAL BUILDER */}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#0f0f12] border border-white/10 p-4 rounded-2xl gap-3">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-white flex items-center gap-2">
                <span>Struktur & Urutan Kartu Formulir</span>
                <span className="text-[10px] bg-white/10 text-slate-300 font-semibold px-2 py-0.5 rounded-full border border-white/10">
                  {questions.length} Kartu
                </span>
              </h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Kelola pertanyaan, teks informasi, dan urutan kartu secara dinamis</p>
            </div>
            <button 
              type="button" 
              onClick={handleAddQuestion} 
              className="bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-2 shadow-lg shadow-orange-600/20"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              <span>Tambah Kartu Soal</span>
            </button>
          </div>

          {loadingConfig ? (
            <div className="bg-[#0f0f12] border border-white/5 p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-xs text-slate-400 animate-pulse">Memuat konfigurasi formulir...</p>
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-[#0f0f12] border border-dashed border-white/10 p-12 text-center rounded-2xl flex flex-col items-center justify-center gap-3">
              <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-500">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-slate-400">Belum ada kartu pertanyaan.</p>
              <button 
                type="button"
                onClick={handleAddQuestion}
                className="text-xs text-orange-400 hover:text-orange-300 font-bold underline cursor-pointer"
              >
                Klik di sini untuk membuat kartu pertama
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {questions.map((q, idx) => (
                <div key={q.id} className="bg-[#0f0f12] border border-white/10 hover:border-white/20 transition-all rounded-2xl overflow-hidden shadow-xl border-l-4 border-l-orange-500">
                  
                  {/* HEAD KARTU & NAVIGASI POSISI */}
                  <div className="bg-black/50 px-5 py-3 border-b border-white/5 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                      <span className="text-[10px] font-black bg-orange-600/20 text-orange-400 border border-orange-500/30 px-2.5 py-1 rounded-md tracking-wider">
                        KARTU #{idx + 1}
                      </span>
                      <div className="flex items-center gap-1 bg-black/60 p-1 rounded-lg border border-white/5">
                        <button 
                          type="button" 
                          onClick={() => moveQuestion(idx, 'up')} 
                          disabled={idx === 0} 
                          title="Pindahkan ke atas"
                          className="p-1 text-slate-400 hover:text-orange-400 hover:bg-white/10 rounded disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => moveQuestion(idx, 'down')} 
                          disabled={idx === questions.length - 1} 
                          title="Pindahkan ke bawah"
                          className="p-1 text-slate-400 hover:text-orange-400 hover:bg-white/10 rounded disabled:opacity-20 disabled:hover:bg-transparent disabled:hover:text-slate-400 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    <button 
                      type="button" 
                      onClick={() => handleDeleteQuestion(q.id, q.label)} 
                      className="text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      <span>Hapus Kartu</span>
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
                          className="bg-black/70 border border-white/10 p-2.5 rounded-xl text-xs text-white focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer"
                        >
                          <option value="text">Teks Pendek (Jawaban Singkat)</option>
                          <option value="textarea">Teks Panjang (Jawaban Paragraf)</option>
                          <option value="radio">Pilihan Ganda (Bulat Opsi)</option>
                          <option value="file">Unggah Berkas / File Document</option>
                          <option value="paragraph">Teks Info Deskripsi / Peraturan (Tanpa Input Jawaban)</option>
                        </select>
                      </div>

                      <div className="md:col-span-4 flex items-center md:justify-end pt-2 md:pt-6">
                        <label className={`text-xs font-bold flex items-center gap-2.5 cursor-pointer select-none px-3.5 py-2.5 rounded-xl border transition-all ${
                          q.type === 'paragraph' 
                            ? 'opacity-40 border-transparent cursor-not-allowed' 
                            : 'border-white/10 bg-black/40 hover:bg-black/60 text-slate-300'
                        }`}>
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

                    {/* LABEL / TEXT JUDUL SOAL */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[10px] uppercase font-bold text-slate-400 flex justify-between">
                        <span>{q.type === 'paragraph' ? 'Isi Teks Deskripsi / Peraturan' : 'Judul Pertanyaan / Soal'}</span>
                        <span className="text-[9px] text-slate-500 font-normal">Bisa menggunakan Enter untuk baris baru</span>
                      </label>
                      <textarea 
                        rows={q.type === 'paragraph' ? 5 : 2}
                        value={q.label} 
                        onChange={e => handleUpdateQuestion(q.id, 'label', e.target.value)} 
                        placeholder={q.type === 'paragraph' ? 'Tulis isi teks peraturan, syarat, atau pengumuman di sini...' : 'Tulis pertanyaan soal di sini...'}
                        className="bg-black/80 border border-white/10 p-3 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 font-sans leading-relaxed resize-y" 
                        required 
                      />
                    </div>

                    {/* DESKRIPSI TAMBAHAN / PLACEHOLDER */}
                    {q.type !== 'paragraph' && (
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Petunjuk / Text Hint Input (Opsional)</label>
                        <input 
                          type="text" 
                          value={q.placeholder || ''} 
                          onChange={e => handleUpdateQuestion(q.id, 'placeholder', e.target.value)} 
                          placeholder="Contoh: Ketik tanggapan..."
                          className="bg-black/60 border border-white/10 p-2.5 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-orange-500" 
                        />
                      </div>
                    )}

                    {/* PENGATURAN KHUSUS PILIHAN GANDA */}
                    {q.type === 'radio' && (
                      <div className="bg-black/60 border border-white/10 p-4 rounded-xl flex flex-col gap-3 mt-1">
                        <span className="text-[10px] uppercase font-bold text-orange-400 tracking-wider flex items-center gap-1.5">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          Daftar Opsi Pilihan Ganda:
                        </span>
                        
                        <div className="flex flex-col gap-2">
                          {(q.options || []).map((opt, oIdx) => (
                            <div key={oIdx} className="flex justify-between items-center bg-[#0f0f12] px-3.5 py-2.5 rounded-xl border border-white/5 text-xs group hover:border-white/20 transition-all">
                              <span className="text-slate-200 flex items-center gap-2.5">
                                <span className="w-3 h-3 rounded-full border-2 border-orange-500 inline-block shrink-0"></span>
                                {opt}
                              </span>
                              <button 
                                type="button" 
                                onClick={() => handleDeleteRadioOption(q.id, oIdx)} 
                                className="text-rose-400 hover:text-rose-300 text-[11px] font-bold px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
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
                            onKeyDown={e => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                handleAddRadioOption(q.id);
                              }
                            }}
                            placeholder="Tulis opsi baru..." 
                            className="bg-black border border-white/10 p-2.5 rounded-xl text-xs flex-1 text-white placeholder-slate-600 focus:outline-none focus:border-orange-500" 
                          />
                          <button 
                            type="button" 
                            onClick={() => handleAddRadioOption(q.id)} 
                            className="bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1 shrink-0"
                          >
                            <span>+ Opsi</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {/* PREVIEW GAMBAR SOAL */}
                    <div className="flex flex-col gap-1.5 border-t border-white/5 pt-3">
                      <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Link URL Foto Lampiran Soal (Opsional)
                      </label>
                      <input 
                        type="text" 
                        value={q.imageUrl || ''} 
                        onChange={e => handleUpdateQuestion(q.id, 'imageUrl', e.target.value)} 
                        placeholder="https://i.imgur.com/example.png"
                        className="bg-black/60 border border-white/10 p-2.5 rounded-xl text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-orange-500" 
                      />
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

          <button 
            type="submit" 
            disabled={saving}
            className="w-full bg-orange-600 hover:bg-orange-500 active:scale-[0.99] text-white font-black py-4 rounded-2xl text-xs uppercase tracking-widest transition-all shadow-xl shadow-orange-600/20 mt-4 cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Menyimpan Formulir...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                <span>Simpan Seluruh Struktur Formulir</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
