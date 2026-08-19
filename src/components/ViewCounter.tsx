"use client";

import React, { useState, useEffect } from 'react';

export default function ViewCounter() {
  const [views, setViews] = useState<number | null>(null);
  const [displayViews, setDisplayViews] = useState<number>(0);

  useEffect(() => {
    const fetchAndRecordView = async () => {
      // Ambil riwayat kunjungan terakhir dari browser
      const lastVisit = localStorage.getItem('prow_last_view_time');
      const now = Date.now();
      const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000; // 24 Jam dalam milidetik

      // Validasi apakah ini pengunjung baru atau sudah lewat batas 24 jam
      const isNewVisit = !lastVisit || (now - parseInt(lastVisit, 10)) > TWENTY_FOUR_HOURS;

      try {
        const res = await fetch('/api/views', {
          method: isNewVisit ? 'POST' : 'GET',
          cache: 'no-store'
        });

        const data = await res.json();

        // Pastikan response API mengirimkan key `views`
        if (data.views !== undefined) {
          setViews(data.views);
          
          // Jika ini kunjungan baru dan data berhasil disimpan di DB, set localStorage
          if (isNewVisit && res.ok) {
            localStorage.setItem('prow_last_view_time', now.toString());
          }
        }
      } catch (err) {
        console.error("SYSTEM ERROR: Gagal melakukan sinkronisasi data pengunjung:", err);
      }
    };

    fetchAndRecordView();
  }, []);

  // Animasi hitungan angka merayap naik
  useEffect(() => {
    if (views === null) return;

    let start = 0;
    const duration = 1200; // Durasi animasi 1.2 detik
    const steps = 30; // 30 kali perubahan angka
    const increment = Math.ceil(views / steps) || 1;
    const stepTime = duration / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= views) {
        setDisplayViews(views);
        clearInterval(timer);
      } else {
        setDisplayViews(start);
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [views]);

  return (
    <div className="inline-flex items-center gap-2 bg-black/60 border border-orange-500/30 px-4 py-2 rounded-full backdrop-blur-md shadow-lg shadow-orange-500/5 animate-in fade-in duration-500">
      
      {/* Indikator Titik Hijau Ping (Live) */}
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
      </span>
      
      {/* Ikon Mata */}
      <svg className="w-4 h-4 text-orange-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
      
      {/* Label Text */}
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-slate-300">
        Pengunjung:
      </span>
      
      {/* Angka Total (Format ribuan Indonesia, misal: 1.250) */}
      <span className="text-xs sm:text-sm font-mono font-extrabold text-orange-400 min-w-[20px] text-center">
        {views === null ? '...' : displayViews.toLocaleString('id-ID')}
      </span>
      
    </div>
  );
}
