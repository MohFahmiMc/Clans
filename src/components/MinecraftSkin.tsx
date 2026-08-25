"use client";

import React, { useEffect, useRef, useState } from 'react';
import { SkinViewer, WalkingAnimation, IdleAnimation } from 'skinview3d';

interface MinecraftSkinProps {
  skinUrl: string;       // Link atau path gambar skin (.png)
  width?: number;        // Lebar kanvas (default 200)
  height?: number;       // Tinggi kanvas (default 300)
  isWalking?: boolean;   // Apakah skin jalan di tempat?
}

export default function MinecraftSkin({ 
  skinUrl, 
  width = 200, 
  height = 300, 
  isWalking = true 
}: MinecraftSkinProps) {
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const viewerRef = useRef<SkinViewer | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!canvasRef.current || !skinUrl) return;

    let viewer: SkinViewer | null = null;

    try {
      // 1. Cek ketersediaan WebGL pada browser
      const testCanvas = document.createElement('canvas');
      const gl = testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl');
      if (!gl) {
        setHasError(true);
        return;
      }

      // 2. Bersihkan instance lama jika masih tersisa
      if (viewerRef.current) {
        try {
          viewerRef.current.dispose();
        } catch (_) {}
        viewerRef.current = null;
      }

      // 3. Inisialisasi SkinViewer dalam blok try-catch
      viewer = new SkinViewer({
        canvas: canvasRef.current,
        width: width,
        height: height,
        skin: skinUrl,
      });

      viewer.fov = 70;
      viewer.zoom = 0.8;
      viewer.autoRotate = true; 
      viewer.autoRotateSpeed = 0.5;

      if (isWalking) {
        viewer.animation = new WalkingAnimation();
        if (viewer.animation) viewer.animation.speed = 0.8; 
      } else {
        viewer.animation = new IdleAnimation();
      }

      viewerRef.current = viewer;
      setHasError(false);
    } catch (_) {
      // Menangkap error crash WebGL agar tidak merusak seluruh halaman
      setHasError(true);
    }

    // Cleanup aman saat modal ditutup
    return () => {
      if (viewerRef.current) {
        try {
          viewerRef.current.dispose();
        } catch (_) {}
        viewerRef.current = null;
      }
    };
  }, [skinUrl, width, height, isWalking]);

  // Tampilan fallback jika WebGL gagal atau penuh
  if (hasError) {
    return (
      <div 
        className="flex items-center justify-center bg-black/40 rounded-xl border border-white/10 text-[10px] text-slate-400 p-2 text-center select-none"
        style={{ width, height }}
      >
        <span>Preview 3D Tidak Tersedia</span>
      </div>
    );
  }

  return (
    <div className="relative group cursor-grab active:cursor-grabbing flex justify-center">
      <canvas 
        ref={canvasRef} 
        className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
      />
      <span className="absolute bottom-2 bg-black/50 text-[8px] text-white/50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Geser untuk memutar
      </span>
    </div>
  );
}
