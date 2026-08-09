import './globals.css'
import React from 'react'
import type { Metadata, Viewport } from 'next'

// IMPORT KOMPONEN NAVBAR BARU
import Navbar from '../components/Navbar';

// IMPORT ASSETS LOKAL
import logoAsset from '../assets/logo.png';
import logoPnAsset from '../assets/logo_pn.png';

const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');

export const metadata: Metadata = {
  metadataBase: new URL('https://freedom.scarily.my.id'),
  title: 'THE FREEDOM CLAN | ProwNetwork',
  description: 'Clan pertama di server Minecraft Bedrock ProwNetwork. Simbol Kebebasan dan Kekuatan.',
  keywords: ['Freedom Clan', 'ProwNetwork', 'Minecraft Bedrock', 'Clan Elite', 'PVP'],
  authors: [{ name: 'M.K Fahmi', url: 'https://mifahmi.my.id' }],
  icons: {
    icon: '/favicon.png', 
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'FREEDOM CLAN | ProwNetwork',
    description: 'Clan Pertama di server Minecraft Bedrock ProwNetwork.',
    url: 'https://clans.scarily.my.id/freedom',
    siteName: 'Freedom Clan',
    images: [
      {
        url: 'https://freedom.scarily.my.id/preview.png', 
        width: 1200,
        height: 630,
        alt: 'Freedom Clan Preview',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FREEDOM CLAN | ProwNetwork',
    description: 'Clan pertama di server Minecraft Bedrock ProwNetwork.',
    images: ['https://freedom.scarily.my.id/preview.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#eab308', 
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
      <body className="bg-[#050505] text-slate-200 antialiased overflow-x-hidden font-sans">
        
        {/* BACKGROUND GLOBAL */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40 pointer-events-none"
          style={{ backgroundImage: `url(${bgSrc})` }}
        ></div>
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/40 via-[#0a0a0a]/80 to-[#050505] pointer-events-none"></div>

        <div className="relative z-10 min-h-screen flex flex-col">
          
          {/* MEMANGGIL NAVBAR CLIENT COMPONENT */}
          <Navbar logoSrc={logoSrc} />

          {/* KONTEN UTAMA HALAMAN */}
          <main className="flex-grow">
            {children}
          </main>

          {/* FOOTER GLOBAL - MULTI COLUMN DESIGN */}
          <footer className="border-t border-white/10 bg-[#08080a]/90 backdrop-blur-xl relative z-10 pt-16 pb-8 mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6">
              
              {/* GRID MULTI-FOOTER */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/5">
                
                {/* COL 1: BRAND & DESKRIPSI */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <img src={logoSrc} alt="Freedom Clan" className="h-10 w-10 object-contain filter drop-shadow-[0_0_8px_rgba(234,179,8,0.4)]" />
                    <img src={logoPnSrc} alt="ProwNetwork" className="h-8 w-8 object-contain opacity-80" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-white uppercase">Freedom Clan</h3>
                    <p className="text-xs font-semibold text-yellow-500 uppercase tracking-widest mt-0.5">ProwNetwork Official</p>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Clan pertama di server Minecraft Bedrock ProwNetwork. Simbol kebebasan, persaudaraan, dan kekuatan tempur tak tertandingi.
                  </p>
                </div>

                {/* COL 2: NAVIGASI CEPAT */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-yellow-500 pl-2">Navigasi Utama</h4>
                  <ul className="flex flex-col gap-2 text-xs text-slate-400 font-medium">
                    <li>
                      <a href="/" className="hover:text-yellow-400 transition-colors flex items-center gap-1.5">
                        <span className="text-yellow-500">&rsaquo;</span> Beranda
                      </a>
                    </li>
                    <li>
                      <a href="/freedom/alliance" className="hover:text-yellow-400 transition-colors flex items-center gap-1.5">
                        <span className="text-yellow-500">&rsaquo;</span> Jaringan Aliansi
                      </a>
                    </li>
                    <li>
                      <a href="/#members" className="hover:text-yellow-400 transition-colors flex items-center gap-1.5">
                        <span className="text-yellow-500">&rsaquo;</span> Daftar Anggota
                      </a>
                    </li>
                    <li>
                      <a href="/#about" className="hover:text-yellow-400 transition-colors flex items-center gap-1.5">
                        <span className="text-yellow-500">&rsaquo;</span> Tentang Clan
                      </a>
                    </li>
                  </ul>
                </div>

                {/* COL 3: KOMUNITAS & SERVER */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-yellow-500 pl-2">Jaringan & Server</h4>
                  <ul className="flex flex-col gap-2.5 text-xs text-slate-400 font-medium">
                    <li className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-slate-300 font-semibold">ProwNetwork Bedrock</span>
                    </li>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Diplomasi Klan</span>
                      <p className="text-slate-300">Terbuka Traktat Aliansi</p>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px] uppercase font-bold tracking-wider">Kontak Aliansi</span>
                      <p className="text-slate-300 font-semibold">DM Raindraa</p>
                    </div>
                  </ul>
                </div>

                {/* COL 4: DEVELOPER & KREDIT */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-yellow-500 pl-2">Pengembang Web</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Situs web resmi ini dirancang dan dikembangkan untuk ekosistem Freedom Clan.
                  </p>
                  <div className="mt-1 bg-white/5 p-3 rounded-xl border border-white/5 backdrop-blur-md">
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Developer Official</span>
                    <a 
                      href="https://mifahmi.my.id" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-bold text-yellow-500 hover:text-yellow-400 hover:underline transition-all flex items-center gap-1 mt-0.5"
                    >
                      M.K Fahmi ↗
                    </a>
                  </div>
                </div>

              </div>

              {/* BOTTOM FOOTER BAR */}
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                  &copy; {new Date().getFullYear()} ScarilyId Teams &amp; Freedom Clan. All rights reserved.
                </p>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <span>Minecraft Bedrock Clan</span>
                  <span>&bull;</span>
                  <span className="text-yellow-500/80">ProwNetwork</span>
                </div>
              </div>

            </div>
          </footer>

        </div>
      </body>
    </html>
  )
}
