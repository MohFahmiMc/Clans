"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar({ logoSrc }: { logoSrc: string }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { 
      name: 'Utama', 
      path: '/freedom/main',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    { 
      name: 'Roster', 
      path: '/freedom/members',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    { 
      name: 'Galeri', 
      path: '/freedom/gallery',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    { 
      name: 'Aliansi', 
      path: '/freedom/alliance',
      icon: (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      )
    },
  ];

  return (
    <>
      {/* ======================================================== */}
      {/* TOP NAVIGATION BAR */}
      {/* ======================================================== */}
      <nav className="border-b border-white/10 bg-[#050507]/80 backdrop-blur-2xl sticky top-0 z-50 transition-all duration-300">
        {/* Glow Line Accent under Navbar */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          
          {/* SISI KIRI: Tombol Menu Hamburger Stylized & Brand Logo */}
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2.5 rounded-xl bg-white/[0.03] hover:bg-orange-500/10 border border-white/10 hover:border-orange-500/30 text-slate-300 hover:text-orange-400 active:scale-95 transition-all focus:outline-none shadow-inner"
              aria-label="Open Menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="7" x2="21" y2="7"></line>
                <line x1="3" y1="12" x2="16" y2="12"></line>
                <line x1="3" y1="17" x2="21" y2="17"></line>
              </svg>
            </button>
            
            <Link href="/freedom/main" className="flex items-center gap-3 group">
              <div className="relative flex items-center justify-center">
                <div className="absolute -inset-1.5 bg-gradient-to-r from-orange-600 to-amber-500 rounded-full blur-md opacity-30 group-hover:opacity-75 transition duration-500" />
                <img src={logoSrc} alt="Logo" className="w-8 h-8 md:w-9 md:h-9 object-contain relative z-10 transition-transform duration-300 group-hover:scale-110" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm md:text-base font-black uppercase tracking-wider text-white group-hover:text-orange-400 transition-colors leading-none">
                  THE FREEDOM
                </span>
                <span className="text-[9px] font-mono font-semibold text-orange-500/80 tracking-widest uppercase mt-0.5 hidden sm:block">
                  Official Clan
                </span>
              </div>
            </Link>
          </div>

          {/* MID/RIGHT MOBILE QUICK INDICATOR */}
          <div className="flex md:hidden items-center gap-2">
            <Link 
              href="/freedom/daftar" 
              className="text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg bg-orange-500/15 border border-orange-500/30 text-orange-400 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm shadow-orange-500/10"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
              <span>Join</span>
            </Link>
          </div>

          {/* SISI KANAN: Desktop Menu Navigasi Utama */}
          <div className="hidden md:flex items-center gap-1.5 bg-white/[0.02] border border-white/5 p-1.5 rounded-2xl backdrop-blur-md">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link 
                  key={link.path}
                  href={link.path} 
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider rounded-xl transition-all duration-300 relative flex items-center gap-2 ${
                    active
                      ? 'text-orange-400 bg-orange-500/15 border border-orange-500/30 shadow-md shadow-orange-500/10 font-black'
                      : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <span className={active ? 'text-orange-400' : 'text-slate-500'}>
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                  {active && (
                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-0.5 bg-orange-500 rounded-full shadow-[0_0_8px_#f97316]" />
                  )}
                </Link>
              );
            })}

            <div className="w-px h-5 bg-white/10 mx-1" />

            <Link 
              href="/freedom/daftar" 
              className={`text-xs font-black uppercase tracking-widest px-5 py-2 rounded-xl active:scale-95 transition-all duration-300 flex items-center gap-2 shadow-lg ${
                isActive('/freedom/daftar')
                  ? 'text-white bg-gradient-to-r from-orange-500 to-amber-500 border border-orange-400 shadow-orange-500/30'
                  : 'text-orange-300 bg-gradient-to-r from-orange-600/80 to-amber-600/80 hover:from-orange-500 hover:to-amber-500 border border-orange-400/40 shadow-orange-500/20 hover:shadow-orange-500/40'
              }`}
            >
              <span>Pendaftaran</span>
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </Link>
          </div>
        </div>
      </nav>

      {/* ======================================================== */}
      {/* SIDEBAR NAVIGATION DRAWER (MOBILE VIEW WITH SLIDE ANIMATION) */}
      {/* ======================================================== */}
      
      {/* Overlay Gelap Belakang Backdrop */}
      <div 
        onClick={() => setIsSidebarOpen(false)}
        className={`fixed inset-0 bg-black/80 backdrop-blur-md z-[99] transition-opacity duration-300 ease-in-out ${
          isSidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`} 
      />

      {/* Panel Sidebar Drawer Samping */}
      <aside 
        className={`fixed top-0 left-0 bottom-0 z-[100] w-full max-w-[290px] bg-[#09090b]/95 backdrop-blur-2xl border-r border-white/10 p-6 text-white h-full flex flex-col transition-transform duration-300 ease-out shadow-2xl ${
          isSidebarOpen ? 'translate-x-0 shadow-orange-500/10' : '-translate-x-full'
        }`}
      >
        {/* Glow ambient internal sidebar */}
        <div className="absolute top-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header Drawer */}
        <div className="flex items-center justify-between pb-5 border-b border-white/10 mb-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
              <img src={logoSrc} alt="Logo" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <span className="text-sm font-black uppercase tracking-wider text-white block leading-tight">
                THE FREEDOM
              </span>
              <span className="text-[10px] text-orange-400 font-semibold tracking-widest uppercase">
                Navigation
              </span>
            </div>
          </div>
          <button 
            onClick={() => setIsSidebarOpen(false)} 
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 active:scale-90 transition-all focus:outline-none border border-transparent hover:border-white/10"
            aria-label="Close Menu"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Menu Links Navigasi */}
        <div className="flex flex-col gap-2 relative z-10">
          <span className="text-[10px] font-mono uppercase tracking-widest text-slate-500 font-bold px-1 mb-1">
            Menu Utama
          </span>

          {navLinks.map((link) => {
            const active = isActive(link.path);
            return (
              <Link 
                key={link.path}
                href={link.path} 
                onClick={() => setIsSidebarOpen(false)} 
                className={`px-4 py-3 text-xs font-bold tracking-wider uppercase active:scale-[0.98] rounded-xl transition-all flex items-center justify-between border ${
                  active
                    ? 'text-orange-400 bg-orange-500/15 border-orange-500/30 shadow-md shadow-orange-500/5 font-black'
                    : 'text-slate-300 hover:text-white hover:bg-white/5 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={active ? 'text-orange-400' : 'text-slate-500'}>
                    {link.icon}
                  </span>
                  <span>{link.name}</span>
                </div>
                <span className={`text-xs transition-transform ${active ? 'text-orange-400 translate-x-0' : 'text-slate-600 -translate-x-1'}`}>
                  →
                </span>
              </Link>
            );
          })}

          <div className="my-2 h-px bg-white/5" />

          {/* Highlight Pendaftaran Button */}
          <Link 
            href="/freedom/daftar" 
            onClick={() => setIsSidebarOpen(false)} 
            className={`px-4 py-3.5 text-xs font-black tracking-wider uppercase active:scale-[0.98] rounded-xl transition-all flex items-center justify-between shadow-lg border ${
              isActive('/freedom/daftar')
                ? 'text-white bg-gradient-to-r from-orange-600 to-amber-600 border-orange-400 shadow-orange-500/20'
                : 'text-orange-300 bg-orange-500/10 border-orange-500/30 hover:bg-orange-500/20 shadow-orange-500/5'
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <span>Pendaftaran Clan</span>
            </div>
            <span className="text-xs text-orange-400">★</span>
          </Link>
        </div>

        {/* Footer Area / Portal Admin */}
        <div className="mt-auto pt-6 border-t border-white/10 flex flex-col gap-4 relative z-10">
          <Link 
            href="/freedom/admin" 
            onClick={() => setIsSidebarOpen(false)}
            className={`px-4 py-3 rounded-xl font-bold uppercase tracking-widest text-[10px] transition-all flex items-center justify-between border group ${
              isActive('/freedom/admin')
                ? 'text-red-400 bg-red-500/20 border-red-500/40'
                : 'text-slate-400 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/30 border-white/10 bg-black/40'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <svg className="w-4 h-4 text-slate-500 group-hover:text-red-400 transition-colors" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span>Portal Admin</span>
            </div>
            <span className="text-[9px] bg-white/5 group-hover:bg-red-500/20 text-slate-400 group-hover:text-red-400 px-2 py-0.5 rounded font-mono transition-colors">
              Access
            </span>
          </Link>

          <div className="text-center text-[9px] text-slate-500 uppercase tracking-widest font-mono flex items-center justify-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            The Freedom Clan Network
          </div>
        </div>
      </aside>
    </>
  );
}
