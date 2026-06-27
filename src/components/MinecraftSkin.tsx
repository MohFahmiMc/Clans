"use client";

import React, { useEffect, useRef } from 'react';
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
  
  // Ref untuk menempelkan canvas 3D ke dalam div HTML
  const canvasRef = useRef<HTMLCanvasElement>(null);
  // Ref untuk menyimpan instansi viewer agar tidak berlipat ganda
  const viewerRef = useRef<SkinViewer | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Membangun Dunia 3D untuk Skin
    const viewer = new SkinViewer({
      canvas: canvasRef.current,
      width: width,
      height: height,
      skin: skinUrl,
    });

    // Mengatur kamera dan pencahayaan
    viewer.fov = 70;
    viewer.zoom = 0.8;
    // Kontrol mouse: pengguna bisa memutar skin pakai klik & geser
    viewer.autoRotate = true; 
    viewer.autoRotateSpeed = 0.5;

    // Animasi Jalan / Berdiri
    if (isWalking) {
      viewer.animation = new WalkingAnimation();
      // Bisa atur kecepatan jalan
      if (viewer.animation) viewer.animation.speed = 0.8; 
    } else {
      viewer.animation = new IdleAnimation();
    }

    // Simpan di Ref
    viewerRef.current = viewer;

    // Cleanup saat komponen ditutup agar tidak membebani memori browser
    return () => {
      if (viewerRef.current) {
        viewerRef.current.dispose();
      }
    };
  }, [skinUrl, width, height, isWalking]);

  return (
    <div className="relative group cursor-grab active:cursor-grabbing flex justify-center">
      <canvas 
        ref={canvasRef} 
        className="drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]"
      />
      {/* Tooltip kecil untuk petunjuk */}
      <span className="absolute bottom-2 bg-black/50 text-[8px] text-white/50 px-2 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Geser untuk memutar
      </span>
    </div>
  );
}
