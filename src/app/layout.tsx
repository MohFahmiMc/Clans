import './globals.css'
import React from 'react'
import type { Metadata } from 'next'

// SEO & Meta Tags yang jauh lebih profesional
export const metadata: Metadata = {
  title: 'FREEDOM CLAN | ProwNetwork',
  description: 'Fraksi elit yang mendominasi server Minecraft Bedrock ProwNetwork. Simbol Kebebasan dan Kekuatan.',
  keywords: ['Freedom Clan', 'ProwNetwork', 'Minecraft Bedrock', 'Clan Elite', 'PVP'],
  authors: [{ name: 'MohFahmi', url: 'https://mifahmi.my.id' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id" className="scroll-smooth">
      {/* antialiased: Membuat font jadi lebih tajam dan halus (tidak buram).
        overflow-x-hidden: Proteksi ganda agar layar tidak bisa digeser ke kiri/kanan di Mobile.
      */}
      <body className="bg-[#050505] text-slate-200 antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
