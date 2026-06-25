import './globals.css'
import React from 'react'

export const metadata = {
  title: 'Website Resmi Clan',
  description: 'Tempat berkumpulnya para pemenang',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  )
}
