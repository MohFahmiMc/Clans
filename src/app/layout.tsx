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
  title: 'THE FREEDOM CLAN | ProwNetwork Official',
  description: 'Clan pertama & terbesar di server Minecraft Bedrock ProwNetwork. Simbol kebebasan, kejayaan, dan persaudaraan tanpa batas.',
  keywords: ['Freedom Clan', 'ProwNetwork', 'Minecraft Bedrock', 'Clan Elite', 'PVP Minecraft', 'Freedom Alliance'],
  authors: [{ name: 'M.K Fahmi', url: 'https://mifahmi.my.id' }],
  icons: {
    icon: '/favicon.png', 
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },
  openGraph: {
    title: 'THE FREEDOM CLAN | ProwNetwork Official',
    description: 'Clan Pertama dan Utama di server Minecraft Bedrock ProwNetwork. Mari raih kejayaan bersama kami!',
    url: 'https://clans.scarily.my.id/freedom',
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
    title: 'THE FREEDOM CLAN | ProwNetwork',
    description: 'Clan pertama di server Minecraft Bedrock ProwNetwork.',
    images: ['https://freedom.scarily.my.id/preview.png'],
  },
}

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
        
        {/* BACKGROUND GLOBAL WITH AMBIENT LIGHTING */}
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none transition-opacity duration-1000"
          style={{ backgroundImage: `url(${bgSrc})` }}
        />
        <div className="fixed inset-0 z-0 bg-gradient-to-b from-[#050505]/60 via-[#0a0a0c]/85 to-[#050505] pointer-events-none" />
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-orange-600/10 blur-[140px] pointer-events-none rounded-full" />

        <div className="relative z-10 min-h-screen flex flex-col">
          
          {/* NAVBAR COMPONENT */}
          <Navbar logoSrc={logoSrc} />

          {/* KONTEN UTAMA */}
          <main className="flex-grow">
            {children}
          </main>

          {/* FOOTER GLOBAL WITH EMBED & ADVANCED LAYOUT */}
          <footer className="border-t border-white/10 bg-[#070709]/95 backdrop-blur-2xl relative z-10 pt-16 pb-8 mt-auto overflow-hidden">
            
            {/* Glow Subtle Background Accent */}
            <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
              
              {/* TOP EMBED CTA BANNER */}
              <div className="mb-14 p-6 md:p-8 rounded-3xl bg-gradient-to-r from-orange-950/40 via-black/80 to-[#0c0c0e] border border-orange-500/20 shadow-2xl shadow-orange-500/5 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                
                <div className="flex items-center gap-4 text-center md:text-left">
                  <div className="hidden sm:flex p-3.5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-orange-400 flex-shrink-0">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-500 bg-orange-500/10 border border-orange-500/20 px-2.5 py-0.5 rounded-full">
                      Join The Elite
                    </span>
                    <h3 className="text-xl md:text-2xl font-black text-white uppercase tracking-tight mt-1">
                      Siap Mengukir Sejarah Bersama Kami?
                    </h3>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">
                      Bergabunglah dengan klan termasyhur di ProwNetwork Bedrock Server.
                    </p>
                  </div>
                </div>

                <a 
                  href="/freedom/daftar" 
                  className="w-full md:w-auto px-6 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-black text-xs uppercase tracking-widest rounded-xl shadow-lg shadow-orange-600/30 hover:shadow-orange-500/50 hover:scale-[1.02] active:scale-95 transition-all duration-300 text-center flex items-center justify-center gap-2 flex-shrink-0"
                >
                  <span>Daftar Sekarang</span>
                  <span>&rarr;</span>
                </a>
              </div>

              {/* GRID MULTI-FOOTER */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
                
                {/* COL 1: BRAND IDENTITY & MOTTO */}
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20">
                      <img src={logoSrc} alt="Freedom Clan" className="h-8 w-8 object-contain filter drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]" />
                    </div>
                    <img src={logoPnSrc} alt="ProwNetwork" className="h-7 w-7 object-contain opacity-75 hover:opacity-100 transition-opacity" />
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-black tracking-tight text-white uppercase">THE FREEDOM CLAN</h3>
                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest mt-0.5">
                      ProwNetwork Bedrock Official
                    </p>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Klan pelopor utama di server Minecraft Bedrock ProwNetwork. Berdiri teguh sebagai simbol kebebasan, solidaritas, dan dominasi pertempuran.
                  </p>

                  <div className="mt-1 inline-flex items-center gap-2 text-[10px] font-mono text-slate-400 bg-white/[0.03] border border-white/5 px-3 py-1.5 rounded-lg w-fit">
                    <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                    <span>EST. 02 JANUARI 2023</span>
                  </div>
                </div>

                {/* COL 2: NAVIGASI EKOSISTEM */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-orange-500 pl-2.5">
                    Ekosistem Clan
                  </h4>
                  <ul className="flex flex-col gap-2.5 text-xs text-slate-400 font-medium">
                    {[
                      { label: 'Halaman Utama', href: '/freedom/main' },
                      { label: 'Roster Anggota', href: '/freedom/members' },
                      { label: 'Galeri Momen', href: '/freedom/gallery' },
                      { label: 'Jaringan Aliansi', href: '/freedom/alliance' },
                      { label: 'Form Pendaftaran', href: '/freedom/daftar' },
                    ].map((item, idx) => (
                      <li key={idx}>
                        <a 
                          href={item.href} 
                          className="hover:text-orange-400 hover:translate-x-1 transition-all duration-200 flex items-center gap-2 group"
                        >
                          <span className="text-orange-500/60 group-hover:text-orange-400 transition-colors">&rsaquo;</span>
                          <span>{item.label}</span>
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* COL 3: EMBED CARD SERVER & DIPLOMASI */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-orange-500 pl-2.5">
                    Server & Diplomasi
                  </h4>
                  
                  {/* Mini Embed Status Card */}
                  <div className="bg-[#0f0f13] border border-white/10 p-3.5 rounded-2xl flex flex-col gap-2.5 shadow-inner">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase">Status Server</span>
                      <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        Online
                      </span>
                    </div>

                    <div className="text-xs font-mono font-black text-slate-200 bg-black/50 p-2 rounded-lg border border-white/5 flex items-center justify-between">
                      <span className="truncate">be.prownetwork.net</span>
                      <span className="text-orange-400 text-[10px] ml-1">:19132</span>
                    </div>

                    <div className="pt-1 border-t border-white/5 flex flex-col gap-1 text-[11px]">
                      <div className="flex justify-between text-slate-400">
                        <span>Traktat Aliansi:</span>
                        <span className="text-amber-400 font-bold">Terbuka</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Humas Klan:</span>
                        <span className="text-white font-mono font-bold">DM Raindraa</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* COL 4: KREDIT PENGEMBANG & KREATOR */}
                <div className="flex flex-col gap-3">
                  <h4 className="text-xs font-black uppercase tracking-widest text-white border-l-2 border-orange-500 pl-2.5">
                    Pengembang Situs
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed font-medium">
                    Platform web resmi ini dibangun khusus untuk kebutuhan data, roster, dan portal informasi Freedom Clan.
                  </p>

                  <div className="bg-gradient-to-br from-white/[0.05] to-transparent p-3.5 rounded-2xl border border-white/10 backdrop-blur-md flex flex-col gap-1.5">
                    <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest block">
                      Lead Web Developer
                    </span>
                    <a 
                      href="https://mifahmi.my.id" 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="text-xs font-black text-orange-400 hover:text-orange-300 transition-colors flex items-center gap-1.5 group"
                    >
                      <span>M.K Fahmi</span>
                      <span className="text-[10px] transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">&nearr;</span>
                    </a>
                  </div>
                </div>

              </div>

              {/* BOTTOM FOOTER BAR */}
              <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest font-mono">
                  &copy; {new Date().getFullYear()} ScarilyId Teams &amp; Freedom Clan. All rights reserved.
                </p>
                
                <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-wider font-mono">
                  <span className="hover:text-slate-300 transition-colors">Minecraft Bedrock</span>
                  <span>&bull;</span>
                  <span className="text-orange-500/90 font-black">ProwNetwork</span>
                </div>
              </div>

            </div>
          </footer>

        </div>
      </body>
    </html>
  )
}
