"use client";

import React, { useState } from 'react';

export default function DatabaseBackupManager() {
  const [downloading, setDownloading] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileData, setFileData] = useState<any | null>(null);
  const [confirmText, setConfirmText] = useState('');

  const getAdminPassword = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('freedom_admin_password') || '';
    }
    return '';
  };

  // 1. Fungsi Download Backup
  const handleDownloadBackup = async () => {
    setDownloading(true);
    try {
      const password = getAdminPassword();
      const res = await fetch(`/api/admin/backup?password=${encodeURIComponent(password)}`, {
        method: 'GET',
        headers: {
          'x-admin-password': password
        }
      });

      if (!res.ok) {
        const err = await res.json();
        alert(`Gagal backup: ${err.error || 'Terjadi kesalahan'}`);
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `database-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Kesalahan jaringan saat mengunduh backup.');
    } finally {
      setDownloading(false);
    }
  };

  // 2. Fungsi Membaca File Backup JSON
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      alert('Mohon pilih file bertipe .json');
      return;
    }

    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.collections) {
          alert('File JSON tidak memiliki struktur backup yang sah!');
          setSelectedFile(null);
          setFileData(null);
          return;
        }
        setFileData(parsed);
      } catch (err) {
        alert('File JSON rusak atau tidak dapat dibaca.');
        setSelectedFile(null);
        setFileData(null);
      }
    };
    reader.readAsText(file);
  };

  // 3. Fungsi Restore Database
  const handleRestoreBackup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fileData) return;

    if (confirmText !== 'RESTORE') {
      alert('Ketik kata "RESTORE" untuk mengonfirmasi tindakan ini.');
      return;
    }

    if (!confirm('PERINGATAN PERMANEN:\nProses ini akan MENGAPUS SEMUA DATA DATABASE SAAT INI dan menggantinya dengan isi file backup.\n\nApakah Anda yakin ingin melanjutkan?')) {
      return;
    }

    setRestoring(true);
    const password = getAdminPassword();

    try {
      const res = await fetch('/api/admin/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password,
          data: fileData
        })
      });

      const result = await res.json();

      if (res.ok) {
        alert('BERHASIL! Database telah dipulihkan secara penuh.');
        setSelectedFile(null);
        setFileData(null);
        setConfirmText('');
      } else {
        alert(`Gagal Restore: ${result.error || 'Terjadi kesalahan server'}`);
      }
    } catch (err) {
      alert('Kesalahan jaringan saat melakukan restore database.');
    } finally {
      setRestoring(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* CARD 1: EXPORT / DOWNLOAD DATABASE BACKUP */}
      <div className="lg:col-span-6 bg-[#09090d]/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-black text-white uppercase tracking-wider">Download Backup Database</h3>
              <p className="text-xs text-slate-400">Ekspor seluruh isi database MongoDB ke dalam file .json</p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed mb-6">
            Fitur ini akan menyalin seluruh koleksi (roster, postingan, konfigurasi, user, dll.) dari database ke satu file cadangan standar JSON. Simpan file ini di tempat aman.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownloadBackup}
          disabled={downloading}
          className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.99] text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {downloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span>Membuat Backup...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              <span>Download Backup (.JSON)</span>
            </>
          )}
        </button>
      </div>

      {/* CARD 2: IMPORT / RESTORE DATABASE */}
      <div className="lg:col-span-6 bg-[#09090d]/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-2xl">
        <div className="flex items-center gap-3 border-b border-white/10 pb-4 mb-4">
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          <div>
            <h3 className="text-base font-black text-white uppercase tracking-wider">Restore Database</h3>
            <p className="text-xs text-slate-400">Pulihkan data dari file cadangan .json</p>
          </div>
        </div>

        <form onSubmit={handleRestoreBackup} className="flex flex-col gap-4">
          
          {/* File Picker */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Pilih File Backup JSON</label>
            <input
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="text-xs text-slate-400 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-500/10 file:text-rose-400 file:border file:border-rose-500/20 hover:file:bg-rose-500/20 file:cursor-pointer transition-all"
            />
          </div>

          {/* Details Preview File */}
          {fileData && (
            <div className="p-3 bg-black/60 border border-white/10 rounded-xl flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Waktu Backup File:</span>
                <span className="text-amber-400 font-mono font-bold">
                  {fileData.timestamp ? new Date(fileData.timestamp).toLocaleString('id-ID') : 'Tidak diketahui'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-bold">Koleksi Terdeteksi:</span>
                <span className="text-emerald-400 font-mono font-bold">
                  {Object.keys(fileData.collections || {}).length} Koleksi
                </span>
              </div>

              <div className="mt-2 flex flex-col gap-1">
                <label className="text-[10px] uppercase font-bold tracking-widest text-rose-400">
                  Ketik <span className="underline">RESTORE</span> untuk mengonfirmasi:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="Ketik RESTORE"
                  className="bg-black border border-rose-500/40 p-2 rounded-lg text-xs text-white font-mono font-bold focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={!fileData || confirmText !== 'RESTORE' || restoring}
            className="w-full bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 active:scale-[0.99] text-white font-black py-3.5 rounded-xl text-xs uppercase tracking-widest transition-all shadow-lg shadow-rose-600/20 flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {restoring ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memulihkan Database...</span>
              </>
            ) : (
              <span>Timpa & Restore Database</span>
            )}
          </button>
        </form>
      </div>

    </div>
  );
}
