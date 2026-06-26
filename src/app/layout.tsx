import './globals.css'
import React from 'react'
import type { Metadata, Viewport } from 'next'

// SEO & Meta Tags
export const metadata: Metadata = {
  // 1. INI KUNCI UTAMANYA: Memberi tahu sistem domain asli kamu
  metadataBase: new URL('https://clans.scarily.my.id'),
  
  title: 'FREEDOM CLAN | ProwNetwork',
  description: 'Fraksi elit yang mendominasi server Minecraft Bedrock ProwNetwork. Simbol Kebebasan dan Kekuatan.',
  keywords: ['Freedom Clan', 'ProwNetwork', 'Minecraft Bedrock', 'Clan Elite', 'PVP'],
  authors: [{ name: 'MohFahmi', url: 'https://mifahmi.my.id' }],
  
  // Favicon
  icons: {
    icon: '/favicon.png', 
    shortcut: '/favicon.png', // Tambahan agar lebih pasti terbaca browser
    apple: '/favicon.png',
  },

  // Konfigurasi Embed Preview
  openGraph: {
    title: 'FREEDOM CLAN | ProwNetwork',
    description: 'Fraksi elit yang mendominasi server Minecraft Bedrock ProwNetwork.',
    url: '/freedom',
    siteName: 'Freedom Clan',
    images: [
      {
        // Berkat metadataBase di atas, ini otomatis menjadi https://clans.scarily.my.id/preview.png
        url: '/preview.png', 
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
    images: ['/preview.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#eab308', // Garis kuning di Discord
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
