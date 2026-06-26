"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function Navbar({ logoSrc }: { logoSrc: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* TOP NAVIGATION BAR */}
      <nav className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* KIRI: Tombol Dua Garis (Gemini Style) & Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-slate-300 hover:text-white transition-colors focus:outline-none"
              aria-label="Open Menu"
            >
              {/* Ikon 2 Garis Kustom */}
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
              </svg>
            </button>
            
            <div className="flex items-center gap-3">
              <img src={logoSrc} alt="Freedom" className="h-8 w-8 md:h-10 md:w-10 object-contain drop-shadow-lg" />
              <span className="text-xl md:text-2xl font-black tracking-tighter text-white">FREEDOM</span>
            </div>
          </div>

          {/* KANAN: Menu Desktop (Disembunyikan di layar kecil) */}
          <div className="hidden md:flex gap-8 text-xs font-bold text-slate-300 uppercase tracking-widest">
            <Link href="/freedom/main" className="hover:text-orange-500 transition-colors">Base</Link>
            <Link href="/freedom/members" className="hover:text-orange-500 transition-colors">Members</Link>
          </div>
        </div>
      </nav>

      {/* OVERLAY GELAP (Muncul saat sidebar terbuka) */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* SIDEBAR MENU TERSEMBUNYI */}
      <div className={`fixed top-0 left-0 h-full w-64 bg-[#0a0a0a] border-r border-white/10 z-[70] transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-5 flex flex-col h-full">
          
          {/* Header Sidebar (Tombol X untuk tutup) */}
          <div className="flex justify-between items-center mb-10">
            <span className="text-lg font-black tracking-tighter text-orange-500">MENU</span>
            <button 
              onClick={() => setIsSidebarOpen(false)}
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          {/* List Menu Laci */}
          <div className="flex flex-col gap-2">
            <Link 
              href="/main" 
              onClick={() => setIsSidebarOpen(false)}
              className="text-slate-300 hover:text-orange-400 hover:bg-white/5 px-4 py-4 rounded-lg font-bold uppercase tracking-widest text-sm transition-all flex items-center gap-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
              Base / Home
            </Link>
            <Link 
              href="/members" 
              onClick={() => setIsSidebarOpen(false)}
              className="text-slate-300 hover:text-orange-400 hover:bg-white/5 px-4 py-4 rounded-lg font-bold uppercase tracking-widest text-sm transition-all flex items-center gap-3"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>
              Roster Members
            </Link>
          </div>

          {/* Footer Sidebar */}
          <div className="mt-auto pt-8 border-t border-white/10 flex flex-col items-center gap-3">
             <img src={logoSrc} alt="Logo" className="w-8 h-8 opacity-50" />
             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">
               Freedom Clan &copy; {new Date().getFullYear()}
             </p>
          </div>
        </div>
      </div>
    </>
  );
}
