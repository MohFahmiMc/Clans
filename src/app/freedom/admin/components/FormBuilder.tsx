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
        setFormStatus(data.config.status);
        setFormSchedule(data.config.schedule);
        setFormNote(data.config.note);
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
      label: 'Pertanyaan Formulir Baru',
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
      if (res.ok) alert('Konfigurasi soal formulir pendaftaran berhasil diperbarui!');
    } catch (err) {
      alert('Gagal menyimpan.');
    }
  };

  return (
    <form onSubmit={handleSaveFormStructure} className="flex flex-col gap-6">
      <div className="bg-[#0a0a0b] border border-white/5 p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status Registrasi</label>
          <div className="flex gap-2 mt-1">
            <button type="button" onClick={() => setFormStatus('open')} className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-all ${formStatus === 'open' ? 'bg-green-600 text-white' : 'bg-black text-slate-500 border border-white/5'}`}>BUKA</button>
            <button type="button" onClick={() => setFormStatus('closed')} className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-all ${formStatus === 'closed' ? 'bg-red-600 text-white' : 'bg-black text-slate-500 border border-white/5'}`}>TUTUP</button>
          </div>
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jadwal Operasional</label>
          <input type="text" value={formSchedule} onChange={e => setFormSchedule(e.target.value)} className="bg-black border border-white/10 p-2.5 rounded text-xs text-white focus:outline-none focus:border-orange-500 mt-1" required />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Catatan Pengantar</label>
          <input type="text" value={formNote} onChange={e => setFormNote(e.target.value)} className="bg-black border border-white/10 p-2.5 rounded text-xs text-white focus:outline-none focus:border-orange-500 mt-1" required />
        </div>
      </div>

      <div className="bg-[#0a0a0b] border border-white/5 p-6 rounded-xl flex flex-col gap-4">
        <div className="flex justify-between items-center border-b border-white/5 pb-2">
          <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">Struktur & Urutan Soal Form</h3>
          <button type="button" onClick={handleAddQuestion} className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded text-xs uppercase tracking-widest transition-colors">+ Tambah Soal</button>
        </div>

        {loadingConfig ? <p className="text-xs text-slate-500 text-center py-6">Memuat struktur...</p> : (
          <div className="flex flex-col gap-4">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-black border border-white/5 p-4 rounded-xl flex flex-col gap-4">
                <div className="flex justify-between items-center bg-white/[0.02] -mx-4 -mt-4 px-4 py-2 rounded-t-xl border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black bg-orange-600/20 text-orange-400 px-2 py-0.5 rounded">SOAL #{idx + 1}</span>
                    <button type="button" onClick={() => moveQuestion(idx, 'up')} disabled={idx === 0} className="text-xs hover:text-orange-500 disabled:opacity-20">▲</button>
                    <button type="button" onClick={() => moveQuestion(idx, 'down')} disabled={idx === questions.length - 1} className="text-xs hover:text-orange-500 disabled:opacity-20">▼</button>
                  </div>
                  <button type="button" onClick={() => setQuestions(questions.filter(item => item.id !== q.id))} className="text-red-400 hover:text-red-500 text-xs">Hapus Soal</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-6 flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-slate-500">Label Pertanyaan</label>
                    <input type="text" value={q.label} onChange={e => handleUpdateQuestion(q.id, 'label', e.target.value)} className="bg-black border border-white/10 p-2 rounded text-xs text-white focus:outline-none focus:border-orange-500" required />
                  </div>
                  <div className="md:col-span-3 flex flex-col gap-1">
                    <label className="text-[9px] uppercase font-bold text-slate-500">Tipe Konten</label>
                    <select value={q.type} onChange={e => handleUpdateQuestion(q.id, 'type', e.target.value)} className="bg-black border border-white/10 p-2 rounded text-xs text-white">
                      <option value="text">Teks Pendek</option>
                      <option value="textarea">Teks Panjang</option>
                      <option value="radio">Bulat Pilihan Ganda</option>
                      <option value="file">Unggah Berkas/File</option>
                      <option value="paragraph">Teks Info Deskripsi</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 flex items-center gap-2 pt-5">
                    <label className="text-xs text-slate-400 flex items-center gap-1.5 cursor-pointer">
                      <input type="checkbox" checked={q.required} onChange={e => handleUpdateQuestion(q.id, 'required', e.target.checked)} className="accent-orange-600" disabled={q.type === 'paragraph'} />
                      Wajib Diisi
                    </label>
                  </div>
                </div>

                {q.type === 'radio' && (
                  <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      {(q.options || []).map((opt, oIdx) => (
                        <div key={oIdx} className="flex justify-between items-center bg-black px-2 py-1 rounded border border-white/5 text-xs">
                          <span>• {opt}</span>
                          <button type="button" onClick={() => handleDeleteRadioOption(q.id, oIdx)} className="text-red-400 text-[10px]">Hapus</button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <input type="text" value={newOptionTexts[q.id] || ''} onChange={e => setNewOptionTexts({ ...newOptionTexts, [q.id]: e.target.value })} placeholder="Tulis opsi bulat..." className="bg-black border border-white/10 p-2 rounded text-xs flex-1" />
                      <button type="button" onClick={() => handleAddRadioOption(q.id)} className="bg-neutral-800 px-3 py-1 rounded text-xs font-bold">Tambah</button>
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-1">
                  <label className="text-[9px] uppercase font-bold text-slate-500">Link Foto Preview Soal URL (Opsional)</label>
                  <input type="text" value={q.imageUrl || ''} onChange={e => handleUpdateQuestion(q.id, 'imageUrl', e.target.value)} className="bg-black border border-white/10 p-2 rounded text-xs text-white" />
                </div>
              </div>
            ))}
          </div>
        )}

        <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all mt-4">
          Simpan Struktur Formulir Baru
        </button>
      </div>
    </form>
  );
}
