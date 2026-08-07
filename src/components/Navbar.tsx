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
      <nav className="border-b border-white/10 bg-black/70 backdrop-blur-xl sticky top-0 z-50 transition-all duration-300">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex items-center justify-between">
          
          {/* SISI KIRI: Tombol Dua Garis Hamburger & Logo */}
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 active:scale-95 transition-all focus:outline-none"
              aria-label="Open Menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="8" x2="21" y2="8"></line>
                <line x1="3" y1="16" x2="21" y2="16"></line>
              </svg>
            </button>
            
            <Link href="/freedom/main" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur opacity-20 group-hover:opacity-50 transition duration-300" />
                <img src={logoSrc} alt="Logo" className="w-8 h-8 object-contain relative z-10" />
              </div>
              <span className="text-sm font-black uppercase tracking-wider text-white group-hover:text-orange-400 transition-colors">
                Freedom
              </span>
            </Link>
          </div>

          {/* SISI KANAN: Desktop Menu Navigasi Utama */}
          <div className="hidden md:flex items-center gap-1">
            <Link href="/freedom/main" className="px-3.5 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              Utama
            </Link>
            <Link href="/freedom/members" className="px-3.5 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              Roster
            </Link>
            <Link href="/freedom/gallery" className="px-3.5 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              Galeri
            </Link>
            <Link href="/freedom/alliance" className="px-3.5 py-2 text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              Aliansi
            </Link>
            <Link href="/freedom/daftar" className="ml-2 text-xs font-bold uppercase tracking-widest text-orange-400 hover:text-orange-300 border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 px-4 py-2 rounded-xl shadow-lg shadow-orange-500/10 hover:shadow-orange-500/20 active:scale-95 transition-all">
              Pendaftaran
            </Link>
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* SIDEBAR NAVIGATION DRAWER (MOBILE VIEW WITH SLIDE ANIMATION) */}
      {/* ======================================================== */}
      
      {/* Overlay Gelap Belakang Backdrop (Fade In/Out Animation) */}
      <div 
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[99] transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
      />

      {/* Panel Sidebar Drawer Samping (Slide In/Out Animation) */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-[100] w-full max-w-xs bg-[#0c0c0e]/95 backdrop-blur-2xl border-r border-white/10 p-6 text-white h-full flex flex-col transition-transform duration-300 ease-in-out ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl shadow-orange-500/10' : '-translate-x-full'
        }`}
      >
        {/* Header Drawer */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <img src={logoSrc} alt="Logo" className="w-7 h-7 object-contain" />
            <div>
              <span className="text-sm font-black uppercase tracking-wider text-white block">Menu Clan</span>
              <span className="text-[10px] text-orange-400 font-medium">The Freedom Alliance</span>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all focus:outline-none"
            aria-label="Close Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Links Navigasi */}
        <div className="flex flex-col gap-1.5">
          <Link 
            href="/freedom/main" 
            onClick={() => setIsSidebarOpen(false)} 
            className="px-4 py-3 text-xs font-bold tracking-wider uppercase text-slate-300 hover:text-white hover:bg-white/10 active:scale-[0.98] rounded-xl transition-all flex items-center justify-between group"
          >
            <span>Utama</span>
            <span className="text-xs text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all">→</span>
          </Link>
          <Link 
            href="/freedom/members" 
            onClick={() => setIsSidebarOpen(false)} 
            className="px-4 py-3 text-xs font-bold tracking-wider uppercase text-slate-300 hover:text-white hover:bg-white/10 active:scale-[0.98] rounded-xl transition-all flex items-center justify-between group"
          >
            <span>Roster</span>
            <span className="text-xs text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all">→</span>
          </Link>
          <Link 
            href="/freedom/gallery" 
            onClick={() => setIsSidebarOpen(false)} 
            className="px-4 py-3 text-xs font-bold tracking-wider uppercase text-slate-300 hover:text-white hover:bg-white/10 active:scale-[0.98] rounded-xl transition-all flex items-center justify-between group"
          >
            <span>Galeri</span>
            <span className="text-xs text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all">→</span>
          </Link>
          <Link 
            href="/freedom/alliance" 
            onClick={() => setIsSidebarOpen(false)} 
            className="px-4 py-3 text-xs font-bold tracking-wider uppercase text-slate-300 hover:text-white hover:bg-white/10 active:scale-[0.98] rounded-xl transition-all flex items-center justify-between group"
          >
            <span>Aliansi</span>
            <span className="text-xs text-slate-500 group-hover:text-orange-400 group-hover:translate-x-1 transition-all">→</span>
          </Link>
          <Link 
            href="/freedom/daftar" 
            onClick={() => setIsSidebarOpen(false)} 
            className="mt-2 px-4 py-3 text-xs font-bold tracking-wider uppercase text-orange-400 bg-orange-500/10 border border-orange-500/20 hover:bg-orange-500/20 active:scale-[0.98] rounded-xl transition-all flex items-center justify-between shadow-lg shadow-orange-500/5"
          >
            <span>Pendaftaran Clan</span>
            <span className="text-xs text-orange-400">★</span>
          </Link>
        </div>

        {/* Footer Area / Portal Admin */}
        <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-4">
          <Link 
            href="/freedom/admin" 
            onClick={() => setIsSidebarOpen(false)}
            className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-between border border-white/10 bg-black/40 group"
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Portal Admin</span>
            </div>
            <span className="text-[9px] bg-white/5 group-hover:bg-red-500/20 text-slate-400 group-hover:text-red-400 px-2 py-0.5 rounded font-mono transition-colors">Access</span>
          </Link>

          <div className="text-center text-[9px] text-slate-600 uppercase tracking-widest font-mono flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
            Freedom Database v2.0
          </div>
        </div>
      </aside>
    </>
  );
}
