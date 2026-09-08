import './globals.css'
import React from 'react'
import type { Metadata, Viewport } from 'next'

// IMPORT KOMPONEN NAVBAR BARU
import Navbar from '../components/Navbar';

// IMPORT ASSETS LOKAL
import logoAsset from '../assets/logo.png';
import logoPnAsset from '../assets/logo_pn.png';

const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');

// METADATA OPEN GRAPH UNTUK EMBED DISCORD / SOSIAL MEDIA
export const metadata: Metadata = {
  metadataBase: new URL('https://freedom.scarily.my.id'),
  title: 'THE FREEDOM CLAN | ProwNetwork Official',
  description: 'Clan Pertama & Terbesar di server Minecraft Bedrock ProwNetwork. Simbol Kebebasan, Kejayaan, dan Persaudaraan.',
  keywords: ['Freedom Clan', 'ProwNetwork', 'Minecraft Bedrock', 'Clan Elite'],
  authors: [{ name: 'M.K Fahmi', url: 'https://mifahmi.my.id' }],
  icons: {
    icon: '/favicon.png', 
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'THE FREEDOM CLAN — ProwNetwork',
    description: 'Clan Pertama & Utama di server Minecraft Bedrock ProwNetwork. Mari raih kejayaan bersama kami!',
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

// WARNA STRIP SAMPING SAAT LINK DIDISCORD EMBED
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
    <html lang="id" className="scroll-smooth">
      <body className="bg-[#050505] text-slate-200 antialiased overflow-x-hidden font-sans selection:bg-orange-500/30 selection:text-orange-300">
        
        {/* BACKGROUND GLOBAL */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none"
          style={{ backgroundImage: `url(${bgSrc})` }}
        />
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#050505]/60 via-[#0a0a0c]/85 to-[#050505] pointer-events-none" />

        <div className="relative z-10 min-h-screen flex flex-col">
          
          {/* NAVBAR COMPONENT */}
          <Navbar logoSrc={logoSrc} />

          {/* KONTEN UTAMA */}
          <main className="flex-grow">
            {children}
          </main>

          {/* FOOTER GLOBAL - SIMPEL, RAPI & BERSIH */}
          <footer className="border-t border-white/10 bg-[#070709]/95 backdrop-blur-xl relative z-10 pt-12 pb-8 mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              
              {/* GRID FOOTER 3 KOLOM */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-8 border-b border-white/10">
                
                {/* KOLOM 1: BRAND IDENTITY */}
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <img src={logoSrc} alt="Freedom Clan" className="h-8 w-8 object-contain filter drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                    <img src={logoPnSrc} alt="ProwNetwork" className="h-7 w-7 object-contain opacity-75" />
                  </div>
                  <div>
                    <h3 className="text-base font-black tracking-tight text-white uppercase">THE FREEDOM CLAN</h3>
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">
                      ProwNetwork Bedrock Official
                    </p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Klan pelopor utama di server Minecraft Bedrock ProwNetwork. Simbol kebebasan, persaudaraan, dan kejayaan.
                  </p>
                </div>

                {/* KOLOM 2: NAVIGASI EKOSISTEM */}
                <div className="flex flex-col gap-2.5">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-orange-500 pl-2">
                    Navigasi
                  </h4>
                  <ul className="grid grid-cols-2 gap-2 text-xs text-slate-400 font-medium">
                    <li><a href="/freedom/main" className="hover:text-orange-400 transition-colors">Utama</a></li>
                    <li><a href="/freedom/members" className="hover:text-orange-400 transition-colors">Roster</a></li>
                    <li><a href="/freedom/gallery" className="hover:text-orange-400 transition-colors">Galeri</a></li>
                    <li><a href="/freedom/alliance" className="hover:text-orange-400 transition-colors">Aliansi</a></li>
                    <li><a href="/freedom/daftar" className="hover:text-orange-400 transition-colors text-orange-400 font-bold">Pendaftaran</a></li>
                  </ul>
                </div>

                {/* KOLOM 3: KREDIT PENGEMBANG */}
                <div className="flex flex-col gap-2.5">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-orange-500 pl-2">
                    Pengembang Web
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Situs web resmi ini dirancang dan dikembangkan untuk ekosistem Freedom Clan.
                  </p>
                  <div className="bg-white/[0.03] p-3 rounded-xl border border-white/5 backdrop-blur-md">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Developer Official</span>
                    <a 
                      href="https://mifahmi.my.id" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors inline-flex items-center gap-1.5 mt-0.5"
                    >
                      <span>M.K Fahmi</span>
                      <svg className="w-3 h-3 fill-current opacity-70" viewBox="0 0 24 24">
                        <path d="M14 3h7v7h-2V6.41l-9.29 9.3-1.42-1.42 9.3-9.29H14V3zM5 5h6v2H5v12h12v-6h2v6a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z"/>
                      </svg>
                    </a>
                  </div>
                </div>

              </div>

              {/* BARIS BAWAH FOOTER & TOMBOL SCROLL KE ATAS */}
              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">
                  &copy; {new Date().getFullYear()} ScarilyId Teams &amp; Freedom Clan. All rights reserved.
                </p>
                
                <a 
                  href="#" 
                  className="group flex items-center gap-2 text-[10px] text-slate-400 hover:text-orange-400 font-bold uppercase tracking-wider transition-all duration-300 bg-white/[0.03] hover:bg-orange-500/10 px-3 py-1.5 rounded-lg border border-white/5 hover:border-orange-500/30"
                >
                  <span>Kembali Ke Atas</span>
                  <span className="transform group-hover:-translate-y-0.5 transition-transform">↑</span>
                </a>
              </div>

            </div>
          </footer>

        </div>
      </body>
    </html>
  )
}
