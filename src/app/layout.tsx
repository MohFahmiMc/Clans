import './globals.css'
import React from 'react'
import type { Metadata, Viewport } from 'next'

// SEO & Meta Tags untuk Discord Embed, WhatsApp, dan Browser
export const metadata: Metadata = {
  title: 'FREEDOM CLAN | ProwNetwork',
  description: 'Fraksi elit yang mendominasi server Minecraft Bedrock ProwNetwork. Simbol Kebebasan dan Kekuatan.',
  keywords: ['Freedom Clan', 'ProwNetwork', 'Minecraft Bedrock', 'Clan Elite', 'PVP'],
  authors: [{ name: 'MohFahmi', url: 'https://mifahmi.my.id' }],
  
  // Memanggil Favicon dari folder public
  icons: {
    icon: '/favicon.png', 
  },

  // Konfigurasi Embed Preview (Discord, WhatsApp, Facebook)
  openGraph: {
    title: 'FREEDOM CLAN | ProwNetwork',
    description: 'Fraksi elit yang mendominasi server Minecraft Bedrock ProwNetwork.',
    url: 'https://clans.scarily.my.id/freedom',
    siteName: 'Freedom Clan',
    images: [
      {
        url: '/preview.png', // Memanggil gambar preview dari folder public
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
    images: ['/preview.png'],
  },
}

// Mengatur warna garis samping embed (Discord) dan warna header browser mobile menjadi Kuning
export const viewport: Viewport = {
  themeColor: '#eab308', // Kode warna kuning (Yellow 500)
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
