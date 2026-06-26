import './globals.css'
import React from 'react'
import type { Metadata, Viewport } from 'next'
import Link from 'next/link'

// IMPORT ASSETS LOKAL
import logoAsset from '../assets/logo.png';
import logoPnAsset from '../assets/logo_pn.png';

// Fungsi ambil gambar yang aman
const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');

export const metadata: Metadata = {
  metadataBase: new URL('https://clans.scarily.my.id'),
  title: 'FREEDOM CLAN | ProwNetwork',
  description: 'Fraksi elit yang mendominasi server Minecraft Bedrock ProwNetwork. Simbol Kebebasan dan Kekuatan.',
  keywords: ['Freedom Clan', 'ProwNetwork', 'Minecraft Bedrock', 'Clan Elite', 'PVP'],
  authors: [{ name: 'M.K Fahmi', url: 'https://mifahmi.my.id' }],
  icons: {
    icon: '/favicon.png', 
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'FREEDOM CLAN | ProwNetwork',
    description: 'Fraksi elit yang mendominasi server Minecraft Bedrock ProwNetwork.',
    url: 'https://clans.scarily.my.id/freedom',
    siteName: 'Freedom Clan',
    images: [
      {
        url: 'https://clans.scarily.my.id/preview.png', 
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
    description: 'Fraksi elit yang mendominasi server Minecraft Bedrock ProwNetwork.',
    images: ['https://clans.scarily.my.id/preview.png'],
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
      <body className="bg-[#050505] text-slate-200 antialiased overflow-x-hidden">
        
        {/* BACKGROUND GLOBAL */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-40"
          style={{ backgroundImage: `url(${bgSrc})` }}
        ></div>
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-black/40 via-[#0a0a0a]/80 to-[#050505]"></div>

        <div className="relative z-10 min-h-screen flex flex-col">
          
          {/* NAVIGATION BAR */}
          <nav className="border-b border-white/10 bg-black/60 backdrop-blur-xl sticky top-0 px-4 py-4 z-50">
            <div className="max-w-6xl mx-auto flex justify-between items-center">
              <div className="flex items-center gap-3">
                <img src={logoSrc} alt="Freedom" className="h-9 w-9 md:h-10 md:w-10 object-contain drop-shadow-lg" />
                <span className="text-xl md:text-2xl font-black tracking-tighter text-white">FREEDOM</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="hidden md:flex gap-8 text-xs font-bold text-slate-300 uppercase tracking-widest">
                  <Link href="/main" className="hover:text-orange-500 transition-colors">Base</Link>
                  <Link href="/main#server" className="hover:text-orange-500 transition-colors">Server</Link>
                  <Link href="/members" className="hover:text-orange-500 transition-colors">Members</Link>
                </div>
              </div>
            </div>
          </nav>

          {/* KONTEN UTAMA HALAMAN */}
          <main className="flex-grow">
            {children}
          </main>

          {/* FOOTER */}
          <footer className="border-t border-white/5 bg-black/80 backdrop-blur-md py-12 text-center px-4 mt-auto">
            <div className="flex justify-center gap-4 mb-6 opacity-40">
              <img src={logoSrc} alt="Freedom" className="h-8 w-8 object-contain" />
              <img src={logoPnSrc} alt="PN" className="h-8 w-8 object-contain" />
            </div>
            <h2 className="text-xl font-black text-slate-500 tracking-tighter mb-2">
              FREEDOM CLAN
            </h2>
            <p className="text-slate-600 text-[9px] font-bold uppercase tracking-widest">
              &copy; {new Date().getFullYear()} ScarilyId Teams.
            </p>
          </footer>

        </div>
      </body>
    </html>
  )
}
