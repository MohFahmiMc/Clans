import './globals.css'
import React from 'react'
import type { Metadata, Viewport } from 'next'

// SEO & Meta Tags untuk Discord Embed, WhatsApp, dan Browser
export const metadata: Metadata = {
  // PENTING: Mendeklarasikan domain utama
  metadataBase: new URL('https://clans.scarily.my.id'),
  
  title: 'FREEDOM CLAN | ProwNetwork',
  description: 'Fraksi elit yang mendominasi server Minecraft Bedrock ProwNetwork. Simbol Kebebasan dan Kekuatan.',
  keywords: ['Freedom Clan', 'ProwNetwork', 'Minecraft Bedrock', 'Clan Elite', 'PVP'],
  authors: [{ name: 'M.K Fahmi', url: 'https://mifahmi.my.id' }], // Terhubung ke portofoliomu
  
  // Memanggil Favicon
  icons: {
    icon: '/favicon.png', 
    shortcut: '/favicon.png',
    apple: '/favicon.png',
  },

  // Konfigurasi Embed Preview (Discord, WhatsApp, Facebook)
  openGraph: {
    title: 'FREEDOM CLAN | ProwNetwork',
    description: 'Fraksi elit yang mendominasi server Minecraft Bedrock ProwNetwork.',
    url: 'https://clans.scarily.my.id/freedom',
    siteName: 'Freedom Clan',
    images: [
      {
        // SOLUSI: Gunakan link penuh (Absolute URL) agar bot Discord tidak bingung
        url: 'https://clans.scarily.my.id/preview.png', 
        width: 1200,
        height: 630,
        alt: 'Freedom Clan Preview',
      },
    ],
    locale: 'id_ID',
    type: 'website',
  },

  // Konfigurasi Embed khusus untuk Twitter / X
  twitter: {
    card: 'summary_large_image',
    title: 'FREEDOM CLAN | ProwNetwork',
    description: 'Fraksi elit yang mendominasi server Minecraft Bedrock ProwNetwork.',
    // Gunakan link penuh juga di sini
    images: ['https://clans.scarily.my.id/preview.png'],
  },
}

// Mengatur warna garis samping embed (Discord) menjadi Kuning
export const viewport: Viewport = {
  themeColor: '#eab308', 
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="scroll-smooth">
      <body className="bg-[#050505] text-slate-200 antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
