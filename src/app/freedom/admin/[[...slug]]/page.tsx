"use client";

import React, { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, usePathname, useParams } from 'next/navigation';
// Naik 4 tingkat ke folder assets
import backgroundImage from '../../../../assets/background.png';

// Loading Placeholder saat komponen dinamis dimuat
function ComponentLoader({ name }: { name: string }) {
  return (
    <div className="w-full p-16 border border-white/5 rounded-2xl bg-[#0a0a0d]/80 backdrop-blur-xl flex flex-col items-center justify-center gap-3 shadow-2xl">
      <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
      <p className="text-xs font-bold text-slate-400 animate-pulse uppercase tracking-widest">
        Memuat Modul {name}...
      </p>
    </div>
  );
}

// REGISTRY KOMPONEN DINAMIS (Import naik 1 tingkat menggunakan ../components)
const TAB_REGISTRY: Record<
  string, 
  { label: string; slug: string; component: React.ComponentType<any> }
> = {
  member: {
    label: 'Manajemen Roster',
    slug: 'member',
    component: dynamic(() => import('../components/RosterManager'), {
      loading: () => <ComponentLoader name="Roster Manager" />,
    }),
  },
  'form-builder': {
    label: 'Form Builder',
    slug: 'form-builder',
    component: dynamic(() => import('../components/FormBuilder'), {
      loading: () => <ComponentLoader name="Form Builder" />,
    }),
  },
  inbox: {
    label: 'Inbox Lamaran',
    slug: 'inbox',
    component: dynamic(() => import('../components/InboxManager'), {
      loading: () => <ComponentLoader name="Inbox Manager" />,
    }),
  },
  alliance: {
    label: 'Manajemen Aliansi',
    slug: 'alliance',
    component: dynamic(() => import('../components/AllianceManager'), {
      loading: () => <ComponentLoader name="Alliance Manager" />,
    }),
  },
};

export default function AdminPortal() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();

  // Auth States
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Logout Modal Confirmation State
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const bgImgSrc = backgroundImage?.src || (typeof backgroundImage === 'string' ? backgroundImage : '');

  // Ekstraksi Slug Aktif dari URL secara Dinamis via useParams
  const activeSlug = useMemo(() => {
    const rawSlug = params?.slug;
    const currentSlug = Array.isArray(rawSlug) ? rawSlug[0] : rawSlug;
    
    if (currentSlug && TAB_REGISTRY[currentSlug]) {
      return currentSlug;
    }

    const parts = pathname.split('/').filter(Boolean);
    const lastPart = parts[parts.length - 1];
    return TAB_REGISTRY[lastPart] ? lastPart : 'member';
  }, [params, pathname]);

  // PERSISTENT LOGIN CHECKER
  useEffect(() => {
    const savedPassword = localStorage.getItem('freedom_admin_password');
    if (savedPassword) {
      fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: savedPassword }),
      })
        .then((res) => {
          if (res.ok) {
            setPassword(savedPassword);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('freedom_admin_password');
          }
        })
        .catch((err) => console.error(err))
        .finally(() => setIsCheckingSession(false));
    } else {
      setIsCheckingSession(false);
    }
  }, []);

  // Handler Navigasi Tab
  const handleTabChange = (slug: string) => {
    router.push(`/freedom/admin/${slug}`);
  };

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
        localStorage.setItem('freedom_admin_password', password);
        setIsAuthenticated(true);
      } else {
        setErrorMsg('Kredensial keamanan tidak valid!');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung dengan server otentikasi.');
    } finally {
      setLoading(false);
    }
  };

  const confirmLogout = () => {
    localStorage.removeItem('freedom_admin_password');
    setIsAuthenticated(false);
    setPassword('');
    setShowLogoutModal(false);
  };

  // 1. LOADING SCREEN
  if (isCheckingSession) {
    return (
      <div className="min-h-screen bg-[#040406] text-white font-sans flex items-center justify-center p-4">
        <div className="text-center flex flex-col items-center gap-4 bg-[#0a0a0d] p-8 rounded-2xl border border-white/5 shadow-2xl">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 border-2 border-orange-500/20 rounded-full" />
            <div className="w-12 h-12 border-2 border-orange-500 border-t-transparent rounded-full animate-spin absolute" />
          </div>
          <p className="text-xs text-slate-400 uppercase font-black tracking-widest animate-pulse">
            Memverifikasi Sesi Akses...
          </p>
        </div>
      </div>
    );
  }

  // 2. GERBANG LOGIN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#030305] text-white font-sans flex items-center justify-center p-4 relative overflow-hidden select-none">
        {bgImgSrc && (
          <div 
            className="absolute inset-0 bg-cover bg-center opacity-10 filter blur-md z-0 pointer-events-none scale-105" 
            style={{ backgroundImage: `url(${bgImgSrc})` }} 
          />
        )}
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-red-600/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute inset-0 bg-[linear-[#ffffff03]_1px,transparent_1px] bg-[size:32px_32px] pointer-events-none opacity-20" />

        <div className="w-full max-w-md bg-[#0a0a0d]/90 border border-white/10 p-8 rounded-3xl relative z-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-500 p-0.5 shadow-xl shadow-orange-600/20 mb-4 group transition-all duration-300 hover:scale-105">
              <div className="w-full h-full bg-[#0a0a0d] rounded-[14px] flex items-center justify-center">
                <svg className="w-7 h-7 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
            </div>

            <span className="inline-block text-[10px] font-black uppercase tracking-[0.25em] bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full border border-orange-500/20 mb-2">
              Security Gateway
            </span>
            <h1 className="text-2xl font-black uppercase tracking-wider text-white">Portal Admin</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">Otentikasi Enkripsi Panel Kontrol Clan</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center justify-between">
                <span>Passcode Akses</span>
                <span className="text-orange-500/80 text-[9px]">Encrypted</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Masukkan password admin..."
                  className="w-full bg-black/60 border border-white/10 pl-4 pr-11 py-3.5 rounded-xl text-sm text-white font-medium focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 transition-all placeholder:text-slate-600"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors p-1"
                  title={showPassword ? "Sembunyikan Password" : "Tampilkan Password"}
                >
                  {showPassword ? (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.03 10.03 0 013.682-.733c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m-3.32-2.197a3 3 0 11-4.243-4.243m4.243 4.243L3 3l18 18" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2.5">
                <svg className="w-4 h-4 text-rose-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 active:scale-[0.99] text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-orange-600/20 flex items-center justify-center gap-2 disabled:opacity-50 mt-1"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Membuka Gerbang...</span>
                </>
              ) : (
                <>
                  <span>Verifikasi Security</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="mt-8 text-center border-t border-white/5 pt-4">
            <p className="text-[10px] text-slate-500 font-medium">Protected System &bull; Freedom Clan Control Center</p>
          </div>
        </div>
      </div>
    );
  }

  // Objek Komponen Aktif Terpilih secara Dinamis
  const ActiveTabConfig = TAB_REGISTRY[activeSlug] || TAB_REGISTRY['member'];
  const DynamicActiveComponent = ActiveTabConfig.component;

  // 3. DASHBOARD UTAMA
  return (
    <div className="min-h-screen bg-[#050507] text-white font-sans flex flex-col">
      <header className="bg-[#09090c]/90 backdrop-blur-md border-b border-white/10 py-3.5 px-6 flex flex-col lg:flex-row justify-between items-center gap-4 sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-600 flex items-center justify-center font-black text-sm text-white shadow-lg shadow-orange-600/20">
            F
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-wider text-white">Freedom Admin Panel</h2>
            <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
              Aktif: <span className="text-orange-400">{ActiveTabConfig.label}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto justify-end">
          <nav className="flex flex-wrap gap-1.5 bg-black/60 p-1 rounded-xl border border-white/10 w-full sm:w-auto justify-center">
            {Object.values(TAB_REGISTRY).map((tab) => {
              const isActive = activeSlug === tab.slug;
              return (
                <button
                  key={tab.slug}
                  onClick={() => handleTabChange(tab.slug)}
                  className={`px-3.5 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all ${
                    isActive
                      ? 'bg-orange-600 text-white shadow-md shadow-orange-600/20'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </nav>

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full sm:w-auto text-[11px] font-bold border border-rose-500/20 bg-rose-500/10 text-rose-300 px-4 py-2 rounded-xl hover:bg-rose-600 hover:text-white transition-all uppercase tracking-wider flex items-center justify-center gap-1.5"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            <span>Keluar</span>
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-7xl w-full mx-auto animate-in fade-in duration-200">
        <DynamicActiveComponent adminPassword={password} />
      </main>

      {/* MODAL POP-UP LOGOUT */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f0f13] border border-white/10 w-full max-w-md rounded-2xl p-6 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <div>
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Konfirmasi Sesi Keluar</h3>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  Apakah Anda yakin ingin mengakhiri sesi otentikasi admin panel ini?
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 justify-end pt-3 border-t border-white/5 mt-2">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={confirmLogout}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 shadow-lg shadow-rose-600/20 transition-all"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
