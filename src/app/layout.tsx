import './globals.css'
import React from 'react'
import type { Metadata, Viewport } from 'next'

// IMPORT KOMPONEN NAVBAR
import Navbar from '../components/Navbar';

// IMPORT ASSETS LOKAL
import logoAsset from '../assets/logo.png';
import logoPnAsset from '../assets/logo_pn.png';

const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');

// METADATA OPEN GRAPH & DISCORD EMBED PREVIEW
export const metadata: Metadata = {
  metadataBase: new URL('https://freedom.scarily.my.id'),
  title: 'THE FREEDOM CLAN | ProwNetwork Official',
  description: 'Clan Pertama & Terbesar di server Minecraft Bedrock ProwNetwork. Simbol Kebebasan, Kejayaan, dan Persaudaraan.',
  keywords: ['Freedom Clan', 'ProwNetwork', 'Minecraft Bedrock', 'Clan Elite', 'Freedom Alliance'],
  authors: [{ name: 'M.K Fahmi', url: 'https://mifahmi.my.id' }],
  icons: {
    icon: '/favicon.png', 
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'THE FREEDOM CLAN — ProwNetwork',
    description: 'Clan Utama & Terbesar di server Minecraft Bedrock ProwNetwork. Mari raih kejayaan bersama!',
    url: 'https://freedom.scarily.my.id',
    siteName: 'Freedom Clan Network',
    images: [
      {
        url: 'https://freedom.scarily.my.id/preview.png', 
        width: 1200,
        height: 630,
        alt: 'Freedom Clan Official Preview',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'THE FREEDOM CLAN — ProwNetwork',
    description: 'Clan Pertama & Utama di server Minecraft Bedrock ProwNetwork.',
    images: ['https://freedom.scarily.my.id/preview.png'],
  },
}

// STRIP WARNA DISCORD EMBED & MOBILE THEME
export const viewport: Viewport = {
  themeColor: '#f97316', 
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const logoSrc = getSrc(logoAsset);
  const logoPnSrc = getSrc(logoPnAsset);
  const bgSrc = "https://i.imgur.com/U2eVJEi.png";

  return (
    <html lang="id" className="scroll-smooth" id="top">
      <body className="bg-[#050505] text-slate-200 antialiased overflow-x-hidden font-sans selection:bg-orange-500/30 selection:text-orange-300">
        
        {/* BACKGROUND GLOBAL */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-25 pointer-events-none"
          style={{ backgroundImage: `url(${bgSrc})` }}
        />
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#050505]/70 via-[#0a0a0c]/90 to-[#050505] pointer-events-none" />

        <div className="relative z-10 min-h-screen flex flex-col">
          
          {/* NAVBAR COMPONENT */}
          <Navbar logoSrc={logoSrc} />

          {/* KONTEN UTAMA HALAMAN */}
          <main className="flex-grow">
            {children}
          </main>

          {/* FOOTER GLOBAL - ELEGANT, GLASSMORPHIC & CLEAN */}
          <footer className="border-t border-white/10 bg-[#060608]/90 backdrop-blur-2xl relative z-10 pt-12 pb-8 mt-auto overflow-hidden">
            
            {/* Top Glowing Gradient Divider Line */}
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-orange-500/40 to-transparent pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 bg-orange-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
              
              {/* MAIN FOOTER GRID (4 KOLOM TERTATA) */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-white/10">
                
                {/* KOLOM 1: IDENTITY & BRANDING */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/20 backdrop-blur-md">
                      <img src={logoSrc} alt="Freedom Clan" className="h-7 w-7 object-contain drop-shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                    </div>
                    <img src={logoPnSrc} alt="ProwNetwork" className="h-6 w-6 object-contain opacity-70 hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-black tracking-wider text-white uppercase">THE FREEDOM CLAN</h3>
                    <p className="text-[10px] font-bold text-orange-400 tracking-widest uppercase mt-0.5">
                      ProwNetwork Bedrock Official
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Klan pelopor utama di server Minecraft Bedrock ProwNetwork. Menjunjung tinggi persaudaraan, kekuatan, dan kebebasan.
                  </p>
                </div>

                {/* KOLOM 2: QUICK LINKS NAVIGASI */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-200 border-l-2 border-orange-500 pl-2.5">
                    Navigasi Situs
                  </h4>
                  <ul className="grid grid-cols-2 gap-2 text-xs text-slate-400 font-medium">
                    <li>
                      <a href="/freedom/main" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                        <span className="text-orange-500/60">&rsaquo;</span> Utama
                      </a>
                    </li>
                    <li>
                      <a href="/freedom/members" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                        <span className="text-orange-500/60">&rsaquo;</span> Roster
                      </a>
                    </li>
                    <li>
                      <a href="/freedom/gallery" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                        <span className="text-orange-500/60">&rsaquo;</span> Galeri
                      </a>
                    </li>
                    <li>
                      <a href="/freedom/alliance" className="hover:text-orange-400 transition-colors flex items-center gap-1.5">
                        <span className="text-orange-500/60">&rsaquo;</span> Aliansi
                      </a>
                    </li>
                    <li className="col-span-2 mt-1">
                      <a href="/freedom/daftar" className="text-orange-400 hover:text-orange-300 font-bold transition-colors flex items-center gap-1.5">
                        <span className="text-orange-500">&rsaquo;</span> Pendaftaran Klan
                      </a>
                    </li>
                  </ul>
                </div>

                {/* KOLOM 3: KOMUNITAS & STATUS */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-200 border-l-2 border-orange-500 pl-2.5">
                    Komunitas
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Terbuka untuk diplomasi aliansi dan keanggotaan baru.
                  </p>
                  
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-slate-300 font-semibold">ProwNetwork Active Clan</span>
                  </div>

                  <a 
                    href="/freedom/daftar"
                    className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/30 text-orange-400 text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 w-fit"
                  >
                    <span>Gabung Klan</span>
                    <span className="text-xs">→</span>
                  </a>
                </div>

                {/* KOLOM 4: KREDIT PENGEMBANG (CLEAN CARD) */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-200 border-l-2 border-orange-500 pl-2.5">
                    Pengembang
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Web platform resmi Freedom Clan didesain & dikembangkan oleh:
                  </p>

                  <div className="bg-white/[0.03] border border-white/10 hover:border-orange-500/30 p-3.5 rounded-2xl transition-all duration-300 group">
                    <span className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-widest block">
                      Lead Developer
                    </span>
                    <a 
                      href="https://mifahmi.my.id" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-black text-orange-400 group-hover:text-orange-300 transition-colors inline-flex items-center gap-2 mt-1"
                    >
                      <span>M.K Fahmi</span>
                      <svg className="w-3.5 h-3.5 fill-current opacity-80 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" viewBox="0 0 24 24">
                        <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zM5 5h6v2H5v12h12v-6h2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"/>
                      </svg>
                    </a>
                  </div>
                </div>

              </div>

              {/* BOTTOM BAR & SMOOTH SCROLL BUTTON */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">
                  &copy; {new Date().getFullYear()} ScarilyId Teams &amp; Freedom Clan. All rights reserved.
                </p>
                
                <a 
                  href="#top" 
                  className="group flex items-center gap-2 text-[10px] text-slate-400 hover:text-orange-400 font-bold uppercase tracking-wider transition-all duration-300 bg-white/[0.03] hover:bg-orange-500/10 px-3.5 py-2 rounded-xl border border-white/5 hover:border-orange-500/30 active:scale-95"
                >
                  <span>Atas Halaman</span>
                  <svg className="w-3 h-3 stroke-current stroke-[2.5] transform group-hover:-translate-y-0.5 transition-transform" fill="none" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                </a>
              </div>

            </div>
          </footer>

        </div>
      </body>
    </html>
  )
}
