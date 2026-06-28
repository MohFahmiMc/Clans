"use client";

import React, { useState } from 'react';
import backgroundImage from '../../../assets/background.png';

// Import Modul Manajemen Terpisah
import RosterManager from './components/RosterManager';
import FormBuilder from './components/FormBuilder';
import InboxManager from './components/InboxManager';

export default function AdminPortal() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'roster' | 'formBuilder' | 'inbox'>('roster');

  const bgImgSrc = backgroundImage?.src || (typeof backgroundImage === 'string' ? backgroundImage : '');

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
      } else {
        setErrorMsg('Kredensial Password Keamanan Salah!');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung dengan sistem otentikasi.');
    } finally {
      setLoading(false);
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
        {activeTab === 'roster' && <RosterManager />}
        {activeTab === 'formBuilder' && <FormBuilder adminPassword={password} />}
        {activeTab === 'inbox' && <InboxManager adminPassword={password} />}
      </main>
    </div>
  );
}
