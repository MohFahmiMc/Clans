"use client";

import React, { useState } from 'react';
import Link from 'next/link';

export default function Navbar({ logoSrc }: { logoSrc: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* ======================================================== */}
      {/* TOP NAVIGATION BAR */}
      {/* ======================================================== */}
      <nav className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          
          {/* SISI KIRI: Tombol Dua Garis (Minimalist Modern) & Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="text-slate-300 hover:text-white transition-colors focus:outline-none"
              aria-label="Open Menu"
            >
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="9" x2="21" y2="9"></line>
                <line x1="3" y1="15" x2="21" y2="15"></line>
              </svg>
            </button>
            
            <div className="flex items-center gap-3">
              <img src={logoSrc} alt="Logo" className="w-8 h-8 object-contain" />
              <span className="text-sm font-black uppercase tracking-wider text-white">Freedom</span>
            </div>
          </div>

          {/* SISI KANAN: Desktop Menu Navigasi Utama */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/freedom/main" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              Utama
            </Link>
            <Link href="/freedom/members" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              Roster
            </Link>
            <Link href="/freedom/gallery" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              Galeri
            </Link>
            <Link href="/freedom/alliance" className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
              Aliansi
            </Link>
            <Link href="/freedom/join" className="text-xs font-bold uppercase tracking-widest text-orange-500 hover:text-orange-400 transition-colors border border-orange-500/20 bg-orange-500/5 px-3 py-1.5 rounded-md shadow-sm shadow-orange-500/5">
              Pendaftaran
            </Link>
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* SIDEBAR NAVIGATION DRAWER (MOBILE VIEW) */}
      {/* ======================================================== */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-[100] flex animate-in fade-in duration-200">
          {/* Overlay Gelap Belakang Backdrop */}
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          
          {/* Kontainer Utama Drawer Samping */}
          <div className="relative flex flex-col w-full max-w-xs bg-[#0a0a0b] border-r border-white/10 p-6 text-white h-full z-10 animate-in slide-in-from-left duration-200">
            
            {/* Header Laci Samping */}
            <div className="flex items-center justify-between pb-6 border-b border-white/5 mb-6">
              <div className="flex items-center gap-3">
                <img src={logoSrc} alt="Logo" className="w-6 h-6 object-contain" />
                <span className="text-sm font-black uppercase tracking-wider text-white">Menu Clan</span>
              </div>
              <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white p-1 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Menu Links Roster Navigasi */}
            <div className="flex flex-col gap-2">
              <Link 
                href="/freedom/main" 
                onClick={() => setIsSidebarOpen(false)} 
                className="px-4 py-3 text-sm font-bold tracking-wide uppercase text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                Utama
              </Link>
              <Link 
                href="/freedom/members" 
                onClick={() => setIsSidebarOpen(false)} 
                className="px-4 py-3 text-sm font-bold tracking-wide uppercase text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                Roster
              </Link>
              <Link 
                href="/freedom/gallery" 
                onClick={() => setIsSidebarOpen(false)} 
                className="px-4 py-3 text-sm font-bold tracking-wide uppercase text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                Galeri
              </Link>
              <Link 
                href="/freedom/alliance" 
                onClick={() => setIsSidebarOpen(false)} 
                className="px-4 py-3 text-sm font-bold tracking-wide uppercase text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-all"
              >
                Aliansi
              </Link>
              <Link 
                href="/freedom/join" 
                onClick={() => setIsSidebarOpen(false)} 
                className="px-4 py-3 text-sm font-bold tracking-wide uppercase text-orange-500 bg-orange-500/5 border border-orange-500/10 rounded-lg transition-all"
              >
                Pendaftaran Clan
              </Link>
            </div>

            {/* AREA BAWAH: Diisolasi menggunakan mt-auto agar menempel di bagian bawah sidebar */}
            <div className="mt-auto flex flex-col gap-5">
              
              {/* Link Kontrol Akses Portal Admin */}
              <Link 
                href="/freedom/admin" 
                onClick={() => setIsSidebarOpen(false)}
                className="text-slate-500 hover:text-red-400 hover:bg-red-500/5 px-4 py-3 rounded-lg font-bold uppercase tracking-widest text-[10px] transition-all flex items-center gap-3 border border-white/5 bg-white/[0.01]"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                </svg>
                Portal Admin
              </Link>

              {/* Footer Sidebar */}
              <div className="text-center text-[9px] text-slate-600 uppercase tracking-widest font-mono">
                Freedom Database Center v2.0
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
