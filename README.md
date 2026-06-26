# 🎮 Website Resmi Freedom Clan

Website beranda resmi untuk **Zephyr Clan** yang dibangun menggunakan **Next.js**, **TypeScript**, dan **Tailwind CSS**. Project ini dibuat dan dikonfigurasi 100% langsung melalui Web UI GitHub dan dihosting secara otomatis menggunakan Vercel.

---

## 🚀 Fitur Utama
* **Hero Section:** Tampilan utama yang bersih dengan ajakan bertindak (CTA) untuk bergabung ke server Discord.
* **Tentang Kami:** Ruang informasi mengenai visi, misi, dan aktivitas turnamen atau scrim mingguan clan.
* **Roster Utama:** Menampilkan daftar pengurus dan anggota inti clan beserta role mereka dalam bentuk kartu (cards) yang responsif.
* **Optimasi Kecepatan:** Menggunakan Next.js App Router untuk performa pemuatan halaman yang instan.

---

## 🛠️ Teknologi yang Digunakan
* **Framework:** Next.js (React)
* **Bahasa:** TypeScript
* **Styling:** Tailwind CSS
* **Hosting Platform:** Vercel

---

## 📂 Struktur Folder Proyek
Proyek ini menggunakan struktur minimalis agar mudah dimodifikasi langsung lewat browser:
```text
├── src/
│   └── app/
│       ├── globals.css   # Pengaturan style global & Tailwind directives
│       ├── layout.tsx    # Struktur HTML & metadata utama website
│       └── page.tsx      # Komponen halaman beranda utama clan
├── next.config.js        # Konfigurasi Next.js
├── package.json          # Daftar dependensi (React, Next, Tailwind)
├── postcss.config.js     # Konfigurasi PostCSS untuk Tailwind
└── tailwind.config.js    # Konfigurasi utility-first class Tailwind
