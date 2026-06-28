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
  type: 'text' | 'textarea';
  placeholder: string;
  required: boolean;
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
  const [specialRoleInput, setSpecialRoleInput] = useState('');
  const [desc, setDesc] = useState('');
  const [skinInputMode, setSkinInputMode] = useState<'link' | 'file'>('link');
  const [skinUrl, setSkinUrl] = useState('');

  // Recruitment Dynamic Config States
  const [formStatus, setFormStatus] = useState<'open' | 'closed'>('open');
  const [formSchedule, setFormSchedule] = useState('');
  const [formNote, setFormNote] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loadingRecruitment, setLoadingRecruitment] = useState(false);

  const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');
  const bgImgSrc = getSrc(backgroundImage);

  // PERSISTENT LOGIN STORAGE CHECKER
  useEffect(() => {
    const savedPassword = localStorage.getItem('freedom_admin_password');
    if (savedPassword) {
      setPassword(savedPassword);
      fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: savedPassword })
      }).then((res) => {
        if (res.ok) setIsAuthenticated(true);
        else localStorage.removeItem('freedom_admin_password');
      }).catch((err) => console.error(err));
    }
  }, []);

  const fetchMembers = async () => {
    setLoadingMembers(true);
    try {
      const res = await fetch('/api/members?t=' + new Date().getTime(), { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        const sortedData = data.sort((a: Member, b: Member) => (a.order || 0) - (b.order || 0));
        setMembers(sortedData);
        setOrderChanged(false);
      }
    } catch (err) {
      console.error(err);
    } filter: { setLoadingMembers(false); }
  };

  const fetchRecruitmentData = async () => {
    setLoadingRecruitment(true);
    try {
      const res = await fetch('/api/recruitment?admin=true&t=' + new Date().getTime(), { cache: 'no-store' });
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
      setLoadingRecruitment(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchMembers();
      fetchRecruitmentData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const res = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      if (res.ok) {
        setIsAuthenticated(true);
        localStorage.setItem('freedom_admin_password', password);
      } else {
        setErrorMsg('Password salah atau tidak terkonfigurasi di Vercel env!');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke sistem verifikasi.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('freedom_admin_password');
    setIsAuthenticated(false);
    setPassword('');
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const specialRolesArray = specialRoleInput ? specialRoleInput.split(',').map(r => r.trim().toLowerCase()).filter(Boolean) : [];
    const currentMemberOrder = isEditing ? (members.find(m => m._id === currentMemberId)?.order ?? members.length) : members.length;

    try {
      const res = await fetch('/api/members', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: currentMemberId, password, name: gamertag, role, specialRoles: specialRolesArray, description: desc, customSkinUrl: skinUrl || null, order: currentMemberOrder })
      });
      if (res.ok) {
        alert('Data member berhasil disinkronisasi.');
        resetForm();
        fetchMembers();
      }
    } catch (err) {
      alert('Gagal memproses data.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMember = async (member: Member) => {
    if (!confirm(`Hapus ${member.name}?`)) return;
    try {
      const res = await fetch('/api/members', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: member._id, password, name: member.name })
      });
      if (res.ok) { fetchMembers(); resetForm(); }
    } catch (err) { console.error(err); }
  };

  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= members.length) return;
    const updatedList = members.map(m => ({ ...m }));
    const temp = updatedList[index];
    updatedList[index] = updatedList[targetIndex];
    updatedList[targetIndex] = temp;
    setMembers(updatedList.map((item, idx) => ({ ...item, order: idx })));
    setOrderChanged(true);
  };

  const handleSaveOrder = async () => {
    setSavingOrder(true);
    try {
      await Promise.all(members.map((member, idx) => fetch('/api/members', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: member._id, password, name: member.name, role: member.role, specialRoles: member.specialRoles, description: member.description, customSkinUrl: member.customSkinUrl, order: idx })
      })));
      alert('Urutan roster berhasil disimpan.');
      setOrderChanged(false);
      fetchMembers();
    } catch (err) { alert('Gagal menyimpan urutan.'); } finally { setSavingOrder(false); }
  };

  const handleUpdateQuestion = (index: number, key: keyof Question, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [key]: value };
    setQuestions(updated);
  };

  const handleSaveFormBuilder = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/recruitment', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, status: formStatus, schedule: formSchedule, note: formNote, questions })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert(data.message);
        fetchRecruitmentData();
      }
    } catch (err) {
      alert('Terjadi kesalahan jaringan.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSubmission = async (id: string) => {
    if (!confirm('Hapus lembar ulasan pendaftaran ini?')) return;
    try {
      const res = await fetch('/api/recruitment', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, password })
      });
      if (res.ok) fetchRecruitmentData();
    } catch (err) { console.error(err); }
  };

  const handleEditClick = (member: Member) => {
    setIsEditing(true); setCurrentMemberId(member._id || null); setGamertag(member.name); setRole(member.role); setSpecialRoleInput(member.specialRoles ? member.specialRoles.join(', ') : ''); setDesc(member.description || ''); setSkinUrl(member.customSkinUrl || ''); window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setIsEditing(false); setCurrentMemberId(null); setGamertag(''); setRole('Member'); setSpecialRoleInput(''); setDesc(''); setSkinUrl(''); setSkinInputMode('link');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center px-4 font-sans text-white relative">
        {bgImgSrc && <div className="fixed inset-0 bg-cover bg-center opacity-10 z-0 pointer-events-none mix-blend-lighten" style={{ backgroundImage: `url(${bgImgSrc})` }} />}
        <div className="bg-[#0a0a0a]/90 backdrop-blur-sm p-8 rounded-xl border border-white/10 shadow-2xl w-full max-w-md relative z-10">
          <h1 className="text-3xl font-black text-orange-500 tracking-tighter mb-2 text-center">PORTAL KONTROL</h1>
          <form onSubmit={handleLogin} className="flex flex-col gap-4 mt-6">
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Masukkan Password Akses..." className="bg-black border border-white/10 p-4 rounded text-white focus:outline-none focus:border-orange-500 text-center font-bold tracking-widest" />
            {errorMsg && <p className="text-red-500 text-xs font-bold text-center">{errorMsg}</p>}
            <button type="submit" className="bg-orange-600 hover:bg-orange-500 font-bold p-4 rounded uppercase tracking-widest transition-colors text-sm">Verifikasi Log In</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-12 font-sans relative overflow-x-hidden">
      {bgImgSrc && <div className="fixed inset-0 bg-cover bg-center opacity-25 z-0 pointer-events-none mix-blend-lighten" style={{ backgroundImage: `url(${bgImgSrc})` }} />}
      <div className="fixed inset-0 bg-gradient-to-b from-[#050505]/30 via-[#050505]/95 to-[#050505] z-0 pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4 border-b border-white/5 pb-6">
          <div>
            <h1 className="text-4xl font-black text-orange-500 tracking-tight">COMMAND CENTER</h1>
            <p className="text-xs text-slate-400 uppercase tracking-widest mt-1">Sesi Autentikasi Aktif</p>
          </div>
          <button onClick={handleLogout} className="w-full sm:w-auto text-xs font-bold border border-white/10 bg-white/5 px-5 py-3 rounded-lg hover:bg-red-500/20 hover:text-red-500 transition-colors uppercase tracking-wider">Keluar Sistem</button>
        </div>

        {/* TAB NAVIGATION PANEL BUTTONS */}
        <div className="grid grid-cols-3 gap-2 bg-black p-1 rounded-xl border border-white/10 mb-8 max-w-xl text-center text-xs font-bold uppercase tracking-widest">
          <button onClick={() => setActiveTab('roster')} className={`py-3 rounded-lg transition-all ${activeTab === 'roster' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Manajemen Roster</button>
          <button onClick={() => setActiveTab('formBuilder')} className={`py-3 rounded-lg transition-all ${activeTab === 'formBuilder' ? 'bg-orange-600 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}>Builder Soal</button>
          <button onClick={() => setActiveTab('inbox')} className={`py-3 rounded-lg transition-all ${activeTab === 'inbox' ? 'bg-orange-600 text-white shadow-lg relative' : 'text-slate-400 hover:text-white'}`}>
            Inbox {submissions.length > 0 && <span className="absolute -top-1 -right-1 bg-red-600 text-[9px] text-white w-4 h-4 rounded-full flex items-center justify-center border border-black animate-pulse">{submissions.length}</span>}
          </button>
        </div>

        {/* VIEW TAB 1: MANAJEMEN ROSTER MEMBER */}
        {activeTab === 'roster' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-[#0a0a0a]/90 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-xl h-fit">
              <h2 className="text-lg font-bold text-white uppercase tracking-tight mb-4 border-b border-white/5 pb-2">{isEditing ? "Edit Profil Member" : "Tambah Member Baru"}</h2>
              <form onSubmit={handleSaveMember} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1"><label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Gamertag Player</label><input type="text" value={gamertag} onChange={e => setGamertag(e.target.value)} className="bg-black border border-white/10 p-3 rounded text-white focus:border-orange-500 focus:outline-none font-bold text-sm" placeholder="Contoh: MohFahmiMc" required /></div>
                <div className="flex flex-col gap-1"><label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Pangkat Clan</label><select value={role} onChange={e => setRole(e.target.value)} className="bg-black border border-white/10 p-3 rounded text-white focus:border-orange-500 focus:outline-none font-bold text-sm"><option value="Leader">Leader</option><option value="Admin">Admin</option><option value="Member">Member</option></select></div>
                <div className="flex flex-col gap-1"><label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Keahlian (Pisahkan dengan koma)</label><input type="text" value={specialRoleInput} onChange={e => setSpecialRoleInput(e.target.value)} className="bg-black border border-white/10 p-3 rounded text-white focus:border-orange-500 focus:outline-none text-sm text-slate-300" placeholder="pvp, builder, redstoner" /></div>
                <div className="flex flex-col gap-1"><label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Bio Profil</label><textarea value={desc} onChange={e => setDesc(e.target.value)} className="bg-black border border-white/10 p-3 rounded h-20 focus:border-orange-500 focus:outline-none resize-none text-xs text-slate-300 leading-relaxed" placeholder="Quote atau info kontribusi..."></textarea></div>
                <button type="submit" disabled={loading} className="w-full font-black p-4 rounded-lg mt-2 uppercase tracking-widest transition-all text-xs text-white bg-orange-600 hover:bg-orange-500">{loading ? "Sinkronisasi..." : "Simpan Member"}</button>
              </form>
            </div>

            <div className="lg:col-span-2 bg-[#0a0a0a]/90 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-xl h-fit">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 border-b border-white/10 pb-4 gap-3">
                <h2 className="text-xl font-bold text-white uppercase tracking-tight">Roster Terdaftar di MongoDB</h2>
                <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                  {orderChanged && (
                    <button type="button" onClick={handleSaveOrder} disabled={savingOrder} className="bg-emerald-600 hover:bg-emerald-500 text-white text-[11px] font-black uppercase tracking-widest px-3 py-2 rounded-lg transition-all flex items-center gap-1 animate-pulse shadow-lg">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                      Simpan Urutan
                    </button>
                  )}
                  <span className="text-xs bg-orange-500/10 text-orange-400 font-bold px-2.5 py-1 rounded-full border border-orange-500/20 whitespace-nowrap">Total: {members.length} Player</span>
                </div>
              </div>

              <div className="flex flex-col gap-3 max-h-[650px] overflow-y-auto pr-1">
                {members.map((member, i) => (
                  <div key={member._id || i} className="bg-black/40 border border-white/5 rounded-lg p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-white/10 transition-colors">
                    <div className="flex items-center gap-3 min-w-0 w-full sm:w-auto">
                      <div className="flex flex-col gap-1 bg-black/80 p-1 rounded-md border border-white/5">
                        <button type="button" disabled={i === 0} onClick={() => handleMoveOrder(i, 'up')} className="text-slate-500 hover:text-orange-500 disabled:opacity-20 transition-colors p-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg></button>
                        <button type="button" disabled={i === members.length - 1} onClick={() => handleMoveOrder(i, 'down')} className="text-slate-500 hover:text-orange-500 disabled:opacity-20 transition-colors p-0.5"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg></button>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-0.5">
                          <h4 className="text-sm font-black text-white break-all whitespace-normal">{member.name}</h4>
                          <span className="text-[8px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded border border-white/10 text-slate-400">{member.role}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t border-white/5 sm:border-t-0 flex-shrink-0 w-full sm:w-auto">
                      <button onClick={() => handleEditClick(member)} className="p-2 text-blue-400 hover:text-white bg-blue-500/5 hover:bg-blue-600 rounded-lg border border-blue-500/10"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                      <button onClick={() => handleDeleteMember(member)} className="p-2 text-red-400 hover:text-white bg-red-500/5 hover:bg-red-600 rounded-lg border border-red-500/10"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW TAB 2: BUILDER SOAL FORM GOOGLE FORM STYLE */}
        {activeTab === 'formBuilder' && (
          <div className="bg-[#0a0a0a]/90 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-xl">
            <div className="border-b border-white/5 pb-4 mb-6">
              <h2 className="text-xl font-black uppercase tracking-tight text-white">Layout Soal Formulir</h2>
            </div>
            <form onSubmit={handleSaveFormBuilder} className="flex flex-col gap-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Status Gerbang Pendaftaran</label>
                  <select value={formStatus} onChange={e => setFormStatus(e.target.value as any)} className="bg-black border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-orange-500 font-bold">
                    <option value="open">Buka Pendaftaran (Open)</option>
                    <option value="closed">Tutup Pendaftaran (Closed)</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Jadwal Operasional</label>
                  <input type="text" value={formSchedule} onChange={e => setFormSchedule(e.target.value)} className="bg-black border border-white/10 p-3 rounded text-sm text-white focus:outline-none focus:border-orange-500 font-bold" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Teks Catatan Penting Formulir</label>
                <textarea value={formNote} onChange={e => setFormNote(e.target.value)} className="bg-black border border-white/10 p-3 rounded h-20 text-xs text-slate-300 focus:outline-none focus:border-orange-500 leading-relaxed" />
              </div>

              <div className="border-t border-white/5 pt-6 flex flex-col gap-4">
                <h3 className="text-sm font-black uppercase tracking-wider text-orange-400">Komponen Pertanyaan Kustom</h3>
                {questions.map((q, index) => (
                  <div key={q.id} className="bg-black/50 p-4 rounded-xl border border-white/5 flex flex-col gap-3 relative animate-in fade-in duration-150">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="flex flex-col gap-1 sm:col-span-2">
                        <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Teks Pertanyaan / Judul Soal</label>
                        <input type="text" value={q.label} onChange={e => handleUpdateQuestion(index, 'label', e.target.value)} className="bg-black border border-white/10 p-2 rounded text-xs text-white focus:outline-none" required />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Tipe Input Lapisan</label>
                        <select value={q.type} onChange={e => handleUpdateQuestion(index, 'type', e.target.value)} className="bg-black border border-white/10 p-2 rounded text-xs text-white focus:outline-none">
                          <option value="text">Teks Pendek (Text Input)</option>
                          <option value="textarea">Esai Panjang (Textarea Box)</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <label className="text-[9px] uppercase tracking-widest text-slate-500 font-bold">Teks Petunjuk (Placeholder)</label>
                        <input type="text" value={q.placeholder} onChange={e => handleUpdateQuestion(index, 'placeholder', e.target.value)} className="bg-black border border-white/10 p-2 rounded text-xs text-slate-400 focus:outline-none" />
                      </div>
                      <div className="flex items-end gap-4 pb-1">
                        <label className="flex items-center gap-2 text-[10px] uppercase font-black tracking-widest text-slate-400 select-none cursor-pointer">
                          <input type="checkbox" checked={q.required} onChange={e => handleUpdateQuestion(index, 'required', e.target.checked)} className="accent-orange-500 w-3.5 h-3.5 bg-black border border-white/20 rounded" />
                          Wajib Diisi
                        </label>
                        <button type="button" onClick={() => setQuestions(questions.filter((_, idx) => idx !== index))} className="ml-auto text-xs font-bold text-red-400 hover:text-white transition-colors bg-red-500/10 border border-red-500/20 px-2.5 py-1.5 rounded-md uppercase tracking-wider">Hapus Soal</button>
                      </div>
                    </div>
                  </div>
                ))}
                <button type="button" onClick={() => setQuestions([...questions, { id: 'q_' + Date.now(), label: 'Pertanyaan Baru', type: 'text', placeholder: 'Ketik petunjuk...', required: true }])} className="border border-dashed border-white/15 bg-white/[0.01] hover:bg-white/[0.03] text-slate-400 hover:text-white font-bold p-3 rounded-lg text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-1">Tambah Soal Baru</button>
              </div>
              <button type="submit" disabled={loading} className="w-full font-black p-4 rounded-xl text-xs uppercase tracking-widest text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg mt-4">{loading ? "Menyinkronkan Cloud..." : "Simpan Config Soal"}</button>
            </form>
          </div>
        )}

        {/* VIEW TAB 3: INBOX JAWABAN SUBMISSION PENDAFTAR */}
        {activeTab === 'inbox' && (
          <div className="bg-[#0a0a0a]/90 backdrop-blur-sm p-6 rounded-xl border border-white/10 shadow-xl">
            <div className="border-b border-white/5 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h2 className="text-xl font-black uppercase tracking-tight text-white">Kotak Masuk Lembar Pendaftaran</h2>
              </div>
              <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 font-bold px-3 py-1.5 rounded-full whitespace-nowrap">Total Masuk: {submissions.length} Dokumen</span>
            </div>

            {loadingRecruitment ? (
              <div className="text-center py-20 text-slate-500 uppercase tracking-widest font-black animate-pulse text-xs">Memasang Jaringan Sinkronisasi Kotak Masuk...</div>
            ) : submissions.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-white/5 rounded-xl text-slate-500 text-xs font-bold uppercase tracking-wider">Belum ada lembar berkas pendaftaran yang masuk.</div>
            ) : (
              <div className="flex flex-col gap-4">
                {submissions.map((sub) => (
                  <div key={sub._id} className="bg-black/50 p-6 rounded-xl border border-white/15 shadow-md flex flex-col justify-between relative group">
                    <div className="flex justify-between items-start border-b border-white/5 pb-3 mb-4 gap-3">
                      <div>
                        <h4 className="text-base font-black text-white break-all whitespace-normal">Pendaftar: <span className="text-orange-500">{sub.name}</span></h4>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest font-mono font-bold block mt-0.5">Masuk: {new Date(sub.createdAt).toLocaleString('id-ID', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })} WIB</span>
                      </div>
                      <button type="button" onClick={() => handleDeleteSubmission(sub._id)} className="p-2 text-red-400 hover:text-white bg-red-500/5 hover:bg-red-600 rounded-lg border border-red-500/10 transition-colors"><svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-4v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                    </div>
                    <div className="grid grid-cols-1 gap-4 text-xs">
                      {questions.map((q) => (
                        <div key={q.id} className="bg-white/[0.01] p-3 rounded-lg border border-white/5 flex flex-col gap-1">
                          <span className="font-bold uppercase tracking-wider text-slate-400 text-[10px]">{q.label}:</span>
                          <p className="text-slate-200 font-medium break-words leading-relaxed whitespace-normal">{sub.answers[q.id] || <em className="text-slate-600">Tidak diisi / Kosong</em>}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
