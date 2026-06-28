"use client";

import React, { useState, useEffect } from 'react';
import backgroundImage from '../../../assets/background.png';

interface Member {
  _id?: string;
  name: string;
  role: string;
  specialRoles: string[];
  description?: string;
  customSkinUrl?: string | null;
  order?: number;
}

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

interface Submission {
  _id: string;
  name: string;
  answers: { [key: string]: string };
  createdAt: string;
}

export default function AdminPortal() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Tab Menu Navigation
  const [activeTab, setActiveTab] = useState<'roster' | 'formBuilder' | 'inbox'>('roster');

  // Members List States
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [orderChanged, setOrderChanged] = useState(false);
  const [savingOrder, setSavingOrder] = useState(false);

  // Form Member States
  const [isEditing, setIsEditing] = useState(false);
  const [currentMemberId, setCurrentMemberId] = useState<string | null>(null);
  const [gamertag, setGamertag] = useState('');
  const [role, setRole] = useState('Member');
  const [specialRolesInput, setSpecialRolesInput] = useState('');
  const [customSkinUrl, setCustomSkinUrl] = useState('');

  // Recruitment Form Config States
  const [formStatus, setFormStatus] = useState<'open' | 'closed'>('open');
  const [formSchedule, setFormSchedule] = useState('');
  const [formNote, setFormNote] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingConfig, setLoadingConfig] = useState(false);

  // Inbox Application States
  const [submissions, setSubmissions] = useState<Submission[]>([]);

  // Temp State for New Options in Radio Type
  const [newOptionTexts, setNewOptionTexts] = useState<{ [key: string]: string }>({});

  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');
  const bgImgSrc = getSrc(backgroundImage);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        setIsAuthenticated(true);
        fetchMembers();
        fetchConfigAndSubmissions();
      } else {
        setErrorMsg('Kredensial Password Keamanan Salah!');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung dengan sistem otentikasi.');
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch('/api/members');
      if (res.ok) {
        const data = await res.json();
        const sorted = data.sort((a: Member, b: Member) => (a.order || 0) - (b.order || 0));
        setMembers(sorted);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingMembers(false);
    }
  };

  const fetchConfigAndSubmissions = async () => {
    setLoadingConfig(true);
    try {
      const res = await fetch('/api/recruitment?admin=true');
      if (res.ok) {
        const data = await res.json();
        setFormStatus(data.config.status);
        setFormSchedule(data.config.schedule);
        setFormNote(data.config.note);
        setQuestions(data.config.questions || []);
        setSubmissions(data.submissions || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingConfig(false);
    }
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gamertag.trim()) return;

    const payload = {
      id: currentMemberId,
      name: gamertag.trim(),
      role,
      specialRoles: specialRolesInput.split(',').map(s => s.trim()).filter(Boolean),
      customSkinUrl: customSkinUrl.trim() || null,
      order: isEditing ? undefined : members.length
    };

    try {
      const res = await fetch('/api/members', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        resetMemberForm();
        fetchMembers();
      } else {
        alert('Gagal menyimpan data aliansi roster.');
      }
    } catch (err) {
      alert('Kesalahan jaringan terjadi.');
    }
  };

  const handleEditClick = (m: Member) => {
    setIsEditing(true);
    setCurrentMemberId(m._id || null);
    setGamertag(m.name);
    setRole(m.role);
    setSpecialRolesInput(m.specialRoles.join(', '));
    setCustomSkinUrl(m.customSkinUrl || '');
  };

  const handleDeleteMember = async (id: string) => {
    if (!confirm('Hapus anggota roster ini secara permanen?')) return;
    try {
      const res = await fetch('/api/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      if (res.ok) fetchMembers();
    } catch (err) {
      console.error(err);
    }
  };

  const moveRoster = (index: number, direction: 'up' | 'down') => {
    const updated = [...members];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= updated.length) return;

    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    const reordered = updated.map((m, idx) => ({ ...m, order: idx }));
    setMembers(reordered);
    setOrderChanged(true);
  };

  const saveRosterOrder = async () => {
    setSavingOrder(true);
    try {
      const res = await fetch('/api/members-order', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ members })
      });
      if (res.ok) {
        setOrderChanged(false);
        alert('Urutan struktur Roster berhasil disimpan!');
      }
    } catch (err) {
      alert('Gagal menyimpan urutan.');
    } finally {
      setSavingOrder(false);
    }
  };

  const resetMemberForm = () => {
    setIsEditing(false);
    setCurrentMemberId(null);
    setGamertag('');
    setRole('Member');
    setSpecialRolesInput('');
    setCustomSkinUrl('');
  };

  // ========================================================
  // FORM BUILDER & QUESTION REORDER ENGINE
  // ========================================================
  const handleAddQuestion = () => {
    const newId = 'q_' + Date.now();
    const newQ: Question = {
      id: newId,
      label: 'Pertanyaan Baru',
      type: 'text',
      placeholder: 'Masukkan tanggapan Anda...',
      required: true,
      options: ['Pilihan A', 'Pilihan B'],
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
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        return { ...q, options: [...(q.options || []), txt] };
      }
      return q;
    }));
    setNewOptionTexts({ ...newOptionTexts, [qId]: '' });
  };

  const handleDeleteRadioOption = (qId: string, optIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === qId) {
        const filtered = (q.options || []).filter((_, idx) => idx !== optIndex);
        return { ...q, options: filtered };
      }
      return q;
    }));
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

  const handleDeleteQuestion = (id: string) => {
    if (!confirm('Hapus soal ini dari struktur form?')) return;
    setQuestions(questions.filter(q => q.id !== id));
  };

  const handleSaveFormStructure = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/recruitment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          status: formStatus,
          schedule: formSchedule,
          note: formNote,
          questions
        })
      });
      if (res.ok) {
        alert('Struktur konfigurasi formulir pendaftaran berhasil dipublikasi!');
        fetchConfigAndSubmissions();
      } else {
        alert('Gagal memperbarui konfigurasi pendaftaran.');
      }
    } catch (err) {
      alert('Gangguan koneksi database.');
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Hapus permanen berkas lamaran pendaftar ini dari inbox?')) return;
    try {
      const res = await fetch('/api/recruitment', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
      });
      if (res.ok) fetchConfigAndSubmissions();
    } catch (err) {
      console.error(err);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030303] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
        {bgImgSrc && (
          <div className="absolute inset-0 bg-cover bg-center opacity-10 filter blur-[8px] z-0 pointer-events-none" style={{ backgroundImage: `url(${bgImgSrc})` }} />
        )}
        <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[150px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="w-full max-w-md bg-[#09090b] border border-white/5 p-8 rounded-2xl relative z-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] backdrop-blur-3xl">
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 mx-auto flex items-center justify-center font-black tracking-tighter text-xl text-white shadow-lg shadow-orange-500/20 mb-3">
              FN
            </div>
            <h1 className="text-xl font-black uppercase tracking-widest text-neutral-100">Portal Keamanan</h1>
            <p className="text-xs text-neutral-500 mt-1 uppercase tracking-wider font-semibold">Otentikasi Manajemen Aliansi</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Security Credentials</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password admin..."
                className="bg-[#121214] border border-white/5 p-3.5 rounded-xl text-center text-sm text-white font-bold tracking-widest focus:outline-none focus:border-orange-500/50 transition-all placeholder:text-neutral-600 placeholder:tracking-normal placeholder:font-normal"
                required
              />
            </div>

            {errorMsg && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 font-medium text-center">
                {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="bg-orange-600 hover:bg-orange-500 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all disabled:opacity-40 shadow-lg shadow-orange-600/10"
            >
              {loading ? 'Membuka Kunci...' : 'Otentikasi Masuk'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex flex-col">
      <header className="bg-[#0b0b0c] border-b border-white/5 py-4 px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center font-black text-xs text-white">F</div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest">Freedom Admin</h2>
            <p className="text-[9px] text-slate-500 font-bold uppercase">Dashboard Panel Kontrol</p>
          </div>
        </div>
        <nav className="flex gap-2 bg-black p-1 rounded-lg border border-white/5">
          {(['roster', 'formBuilder', 'inbox'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded transition-all ${activeTab === tab ? 'bg-orange-600 text-white shadow' : 'text-slate-400 hover:text-white'}`}
            >
              {tab === 'roster' ? 'Manajemen Roster' : tab === 'formBuilder' ? 'Form Builder' : 'Inbox Lamaran'}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 p-6 max-w-6xl w-full mx-auto">
        {/* ======================================================== */}
        {/* TAB 1: MANAJEMEN ROSTER */}
        {/* ======================================================== */}
        {activeTab === 'roster' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#0a0a0b] border border-white/5 p-6 rounded-xl h-fit">
              <h3 className="text-sm font-black uppercase tracking-wider mb-4 border-b border-white/5 pb-2 text-orange-500">
                {isEditing ? 'Edit Data Anggota' : 'Tambah Roster Aliansi'}
              </h3>
              <form onSubmit={handleSaveMember} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Gamertag / Nickname</label>
                  <input type="text" value={gamertag} onChange={e => setGamertag(e.target.value)} placeholder="Masukkan Nickname Minecraft..." className="bg-black border border-white/10 p-2.5 rounded text-xs text-white focus:outline-none focus:border-orange-500" required />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Jabatan Struktur</label>
                  <select value={role} onChange={e => setRole(e.target.value)} className="bg-black border border-white/10 p-2.5 rounded text-xs text-white focus:outline-none focus:border-orange-500">
                    <option value="Leader">Leader</option>
                    <option value="Co-Leader">Co-Leader</option>
                    <option value="Staff">Staff</option>
                    <option value="Core Team">Core Team</option>
                    <option value="Member">Member</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Special Roles (Pisahkan Koma)</label>
                  <input type="text" value={specialRolesInput} onChange={e => setSpecialRolesInput(e.target.value)} placeholder="Contoh: Rusher, Builder, Veteran..." className="bg-black border border-white/10 p-2.5 rounded text-xs text-white focus:outline-none focus:border-orange-500" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[10px] uppercase font-bold text-slate-400">Custom Skin Image URL (Opsional)</label>
                  <input type="text" value={customSkinUrl} onChange={e => setCustomSkinUrl(e.target.value)} placeholder="Kosongkan jika ingin default Steve..." className="bg-black border border-white/10 p-2.5 rounded text-xs text-white focus:outline-none focus:border-orange-500" />
                </div>
                <div className="flex gap-2 mt-2">
                  <button type="submit" className="flex-1 bg-orange-600 hover:bg-orange-500 font-bold py-2.5 rounded text-xs uppercase tracking-wider transition-colors">{isEditing ? 'Perbarui Data' : 'Simpan Roster'}</button>
                  {isEditing && <button type="button" onClick={resetMemberForm} className="bg-neutral-800 hover:bg-neutral-700 font-bold px-4 rounded text-xs uppercase transition-colors">Batal</button>}
                </div>
              </form>
            </div>

            <div className="lg:col-span-2 bg-[#0a0a0b] border border-white/5 p-6 rounded-xl">
              <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">Struktur Urutan Roster Aktif ({members.length})</h3>
                {orderChanged && <button onClick={saveRosterOrder} disabled={savingOrder} className="bg-green-600 hover:bg-green-500 text-white font-bold px-3 py-1.5 rounded text-[10px] uppercase tracking-wider transition-all">{savingOrder ? 'Menyimpan...' : 'Simpan Perubahan Posisi'}</button>}
              </div>

              {loadingMembers ? <p className="text-xs text-slate-500 uppercase tracking-widest text-center py-8">Memuat data database roster...</p> : members.length === 0 ? <p className="text-xs text-slate-600 text-center py-8">Belum ada roster aliansi terdaftar.</p> : (
                <div className="flex flex-col gap-2">
                  {members.map((m, idx) => (
                    <div key={m._id} className="bg-black/50 border border-white/5 p-3 rounded-lg flex items-center justify-between group">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col gap-0.5">
                          <button type="button" onClick={() => moveRoster(idx, 'up')} disabled={idx === 0} className="text-[10px] text-slate-500 hover:text-orange-500 disabled:opacity-20">▲</button>
                          <button type="button" onClick={() => moveRoster(idx, 'down')} disabled={idx === members.length - 1} className="text-[10px] text-slate-500 hover:text-orange-500 disabled:opacity-20">▼</button>
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-white uppercase tracking-wider">{m.name}</h4>
                          <p className="text-[9px] font-bold text-orange-400 mt-0.5 uppercase tracking-widest">{m.role} {m.specialRoles.length > 0 && `• [${m.specialRoles.join(', ')}]`}</p>
                        </div>
                      </div>
                      <div className="flex gap-2 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
                        <button type="button" onClick={() => handleEditClick(m)} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg></button>
                        <button type="button" onClick={() => handleDeleteMember(m._id!)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded"><svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* TAB 2: ADVANCED FORM BUILDER (INCLUDES REORDER & NEW TYPES) */}
        {/* ======================================================== */}
        {activeTab === 'formBuilder' && (
          <form onSubmit={handleSaveFormStructure} className="flex flex-col gap-6">
            <div className="bg-[#0a0a0b] border border-white/5 p-6 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Status Registrasi</label>
                <div className="flex gap-2 mt-1">
                  <button type="button" onClick={() => setFormStatus('open')} className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-all ${formStatus === 'open' ? 'bg-green-600 text-white' : 'bg-black text-slate-500 border border-white/5'}`}>BUKA (OPEN)</button>
                  <button type="button" onClick={() => setFormStatus('closed')} className={`flex-1 py-2 rounded text-xs font-bold uppercase transition-all ${formStatus === 'closed' ? 'bg-red-600 text-white' : 'bg-black text-slate-500 border border-white/5'}`}>TUTUP (CLOSED)</button>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Jadwal Operasional</label>
                <input type="text" value={formSchedule} onChange={e => setFormSchedule(e.target.value)} placeholder="Contoh: Setiap Hari 24 Jam..." className="bg-black border border-white/10 p-2.5 rounded text-xs text-white focus:outline-none focus:border-orange-500 mt-1" required />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Catatan Pengantar</label>
                <input type="text" value={formNote} onChange={e => setFormNote(e.target.value)} placeholder="Catatan di atas formulir..." className="bg-black border border-white/10 p-2.5 rounded text-xs text-white focus:outline-none focus:border-orange-500 mt-1" required />
              </div>
            </div>

            <div className="bg-[#0a0a0b] border border-white/5 p-6 rounded-xl flex flex-col gap-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h3 className="text-sm font-black uppercase tracking-wider text-slate-300">Struktur & Komposisi Pertanyaan</h3>
                <button type="button" onClick={handleAddQuestion} className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-4 py-2 rounded text-xs uppercase tracking-widest transition-colors">+ Tambah Soal Baru</button>
              </div>

              {loadingConfig ? <p className="text-xs text-slate-500 text-center py-6">Memuat struktur form...</p> : questions.length === 0 ? <p className="text-xs text-slate-600 text-center py-6">Belum ada pertanyaan di formulir ini.</p> : (
                <div className="flex flex-col gap-4">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="bg-black border border-white/5 p-4 rounded-xl relative flex flex-col gap-4 group">
                      
                      {/* Kontrol Urutan & Hapus Soal */}
                      <div className="flex justify-between items-center bg-white/[0.02] -mx-4 -mt-4 px-4 py-2 rounded-t-xl border-b border-white/5">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black font-mono px-2 py-0.5 bg-orange-600/20 text-orange-400 rounded">SOAL #{idx + 1}</span>
                          <div className="flex gap-1">
                            <button type="button" onClick={() => moveQuestion(idx, 'up')} disabled={idx === 0} className="w-6 h-6 flex items-center justify-center bg-black border border-white/10 rounded text-[10px] hover:text-orange-400 disabled:opacity-20" title="Naikkan Posisi">▲</button>
                            <button type="button" onClick={() => moveQuestion(idx, 'down')} disabled={idx === questions.length - 1} className="w-6 h-6 flex items-center justify-center bg-black border border-white/10 rounded text-[10px] hover:text-orange-400 disabled:opacity-20" title="Turunkan Posisi">▼</button>
                          </div>
                        </div>
                        <button type="button" onClick={() => handleDeleteQuestion(q.id)} className="text-red-400 hover:text-red-500 text-xs font-bold uppercase tracking-wider">Hapus Soal</button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                        <div className="md:col-span-6 flex flex-col gap-1">
                          <label className="text-[9px] uppercase font-bold text-slate-500">Label Pertanyaan / Judul Teks</label>
                          <input type="text" value={q.label} onChange={e => handleUpdateQuestion(q.id, 'label', e.target.value)} className="bg-black border border-white/10 p-2 rounded text-xs text-white focus:outline-none focus:border-orange-500" required />
                        </div>
                        <div className="md:col-span-3 flex flex-col gap-1">
                          <label className="text-[9px] uppercase font-bold text-slate-500">Tipe Input</label>
                          <select value={q.type} onChange={e => handleUpdateQuestion(q.id, 'type', e.target.value)} className="bg-black border border-white/10 p-2 rounded text-xs text-white focus:outline-none focus:border-orange-500">
                            <option value="text">Teks Pendek (Jawaban Singkat)</option>
                            <option value="textarea">Teks Panjang (Paragraph)</option>
                            <option value="radio">Bulat ABC (Radio Pilihan Ganda)</option>
                            <option value="file">Unggah Berkas/Foto (File Upload)</option>
                            <option value="paragraph">Teks Info / Deskripsi Bacaan (Bukan Soal)</option>
                          </select>
                        </div>
                        <div className="md:col-span-3 flex flex-col gap-1">
                          <label className="text-[9px] uppercase font-bold text-slate-500">Pengaturan Lapangan</label>
                          <div className="flex items-center gap-2 h-full">
                            <label className="text-xs text-slate-400 flex items-center gap-1.5 cursor-pointer">
                              <input type="checkbox" checked={q.required} onChange={e => handleUpdateQuestion(q.id, 'required', e.target.checked)} className="accent-orange-600" disabled={q.type === 'paragraph'} />
                              Wajib Diisi
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Kondisional Input Placeholder */}
                      {q.type !== 'radio' && q.type !== 'file' && q.type !== 'paragraph' && (
                        <div className="flex flex-col gap-1">
                          <label className="text-[9px] uppercase font-bold text-slate-500">Placeholder Text</label>
                          <input type="text" value={q.placeholder || ''} onChange={e => handleUpdateQuestion(q.id, 'placeholder', e.target.value)} className="bg-black border border-white/10 p-2 rounded text-xs text-slate-400 focus:outline-none focus:border-orange-500" placeholder="Masukkan placeholder teks bantuan..." />
                        </div>
                      )}

                      {/* Kondisional Tipe Bulat / Radio Options Builder */}
                      {q.type === 'radio' && (
                        <div className="bg-white/[0.02] border border-white/5 p-3 rounded-lg flex flex-col gap-2">
                          <label className="text-[9px] uppercase font-bold text-orange-400 tracking-wider">Opsi Pilihan Bulat (Radio Buttons)</label>
                          <div className="flex flex-col gap-1.5">
                            {(q.options || []).map((opt, oIdx) => (
                              <div key={oIdx} className="flex items-center justify-between bg-black px-2 py-1.5 rounded border border-white/5 text-xs">
                                <span className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-orange-500" /> {opt}</span>
                                <button type="button" onClick={() => handleDeleteRadioOption(q.id, oIdx)} className="text-red-400 hover:text-red-500 text-[10px]">Hapus</button>
                              </div>
                            ))}
                          </div>
                          <div className="flex gap-2 mt-2">
                            <input type="text" value={newOptionTexts[q.id] || ''} onChange={e => setNewOptionTexts({ ...newOptionTexts, [q.id]: e.target.value })} placeholder="Tulis opsi pilihan ganda baru..." className="bg-black border border-white/10 p-2 rounded text-xs flex-1 focus:outline-none" />
                            <button type="button" onClick={() => handleAddRadioOption(q.id)} className="bg-neutral-800 hover:bg-neutral-700 px-3 py-1 rounded text-xs font-bold uppercase">Tambah Opsi</button>
                          </div>
                        </div>
                      )}

                      {/* Kondisional Tipe File Size Limit */}
                      {q.type === 'file' && (
                        <div className="flex flex-col gap-1 max-w-xs">
                          <label className="text-[9px] uppercase font-bold text-slate-500">Batas Ukuran Maksimal File (MB)</label>
                          <input type="number" value={q.maxSizeMb || 5} onChange={e => handleUpdateQuestion(q.id, 'maxSizeMb', parseInt(e.target.value) || 5)} className="bg-black border border-white/10 p-2 rounded text-xs text-white focus:outline-none focus:border-orange-500" min="1" max="50" />
                        </div>
                      )}

                      {/* Input Link Foto Preview Soal */}
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase font-bold text-slate-500">Preview Foto / Gambar Soal URL (Opsional seperti Google Form)</label>
                        <input type="text" value={q.imageUrl || ''} onChange={e => handleUpdateQuestion(q.id, 'imageUrl', e.target.value)} placeholder="Tempel tautan gambar/foto pendukung..." className="bg-black border border-white/10 p-2 rounded text-xs text-white focus:outline-none focus:border-orange-500" />
                        {q.imageUrl && (
                          <img src={q.imageUrl} alt="Pratinjau Soal" className="mt-2 max-h-32 object-contain rounded border border-white/10 self-start" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
                        )}
                      </div>

                    </div>
                  ))}
                </div>
              )}

              <button type="submit" className="w-full bg-orange-600 hover:bg-orange-500 text-white font-black py-4 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-600/10 mt-4">
                Simpan & Publikasikan Struktur Formulir Baru
              </button>
            </div>
          </form>
        )}

        {/* ======================================================== */}
        {/* TAB 3: INBOX LAMARAN PENDAFTARAN */}
        {/* ======================================================== */}
        {activeTab === 'inbox' && (
          <div className="bg-[#0a0a0b] border border-white/5 p-6 rounded-xl">
            <h3 className="text-sm font-black uppercase tracking-wider mb-4 border-b border-white/5 pb-2 text-slate-300">Daftar Berkas Masuk ({submissions.length})</h3>
            
            {submissions.length === 0 ? <p className="text-xs text-slate-600 text-center py-8">Belum ada dokumen lamaran masuk di database aliansi.</p> : (
              <div className="flex flex-col gap-6">
                {submissions.map((sub) => (
                  <div key={sub._id} className="bg-black/40 border border-white/5 p-5 rounded-xl flex flex-col gap-4 shadow-md">
                    <div className="flex justify-between items-start border-b border-white/5 pb-3">
                      <div>
                        <h4 className="text-sm font-black text-orange-500 uppercase tracking-wide">{sub.name}</h4>
                        <span className="text-[9px] text-slate-500 font-bold uppercase mt-1 block">Masuk: {new Date(sub.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} WIB</span>
                      </div>
                      <button type="button" onClick={() => handleDeleteSubmission(sub._id)} className="p-2 text-red-400 hover:text-white bg-red-500/5 hover:bg-red-600 rounded-lg border border-red-500/10 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                    
                    <div className="grid grid-cols-1 gap-4 text-xs">
                      {questions.map((q) => {
                        if (q.type === 'paragraph') return null; // Abaikan teks info bacaan
                        const answerValue = sub.answers[q.id];
                        return (
                          <div key={q.id} className="bg-white/[0.01] p-3 rounded-lg border border-white/5 flex flex-col gap-1.5">
                            <span className="font-bold text-slate-400">{q.label}</span>
                            
                            {/* Rendering khusus tipe File Upload */}
                            {q.type === 'file' ? (
                              answerValue && answerValue.startsWith('data:image/') ? (
                                <div className="flex flex-col gap-2">
                                  <img src={answerValue} alt="Attachment" className="max-h-48 object-contain rounded border border-white/10 self-start" />
                                  <a href={answerValue} download={`file_${sub.name}_${q.id}.png`} className="text-[10px] text-orange-400 hover:underline font-bold uppercase tracking-wider">Unduh Lampiran Gambar</a>
                                </div>
                              ) : answerValue ? (
                                <a href={answerValue} download className="text-[10px] text-blue-400 hover:underline font-bold uppercase tracking-wider">Unduh Lampiran Dokumen</a>
                              ) : (
                                <span className="text-slate-600 italic">Tidak ada file terunggah</span>
                              )
                            ) : (
                              <p className="text-slate-200 whitespace-pre-wrap font-medium leading-relaxed">{answerValue || <span className="text-slate-600 italic">Kosong</span>}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
