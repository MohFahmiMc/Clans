"use client";

import React, { useState, useEffect } from 'react';

// Tipe data untuk member dan komentar
interface Member { name: string; role: string; }
interface Comment { id: number; name: string; text: string; time: string; }

export default function Home() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  
  // State untuk komentar
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, name: "System", text: "Selamat datang di basecamp FREEDOM!", time: "Sematkan Komentar" }
  ]);
  const [newName, setNewName] = useState('');
  const [newComment, setNewComment] = useState('');

  // 1. FUNGSI MEMBACA LIST MEMBER DARI public/listmember.txt
  useEffect(() => {
    fetch('/listmember.txt')
      .then((res) => {
        if (!res.ok) throw new Error("File tidak ditemukan");
        return res.text();
      })
      .then((text) => {
        const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
        const parsedMembers: Member[] = [];
        let currentRole = "Member";

        lines.forEach(line => {
          if (!line.includes(',')) {
            currentRole = line;
          } else {
            const tags = line.split(',').map(t => t.trim()).filter(Boolean);
            tags.forEach(tag => {
              parsedMembers.push({ name: tag, role: currentRole });
            });
          }
        });
        
        setMembers(parsedMembers);
        setLoadingMembers(false);
      })
      .catch((err) => {
        console.error("Gagal load member:", err);
        setMembers([{ name: "Belum ada data", role: "System" }]);
        setLoadingMembers(false);
      });
  }, []);

  // 2. FUNGSI MENGIRIM KOMENTAR
  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newComment.trim()) return;
    
    const newEntry: Comment = {
      id: Date.now(),
      name: newName,
      text: newComment,
      time: "Baru saja"
    };
    
    // INFO: Baris ini hanya menyimpan komentar di layar saat ini.
    // Agar tersimpan selamanya & dilihat orang lain, kamu harus menghubungkannya 
    // dengan API Database seperti Firebase / Supabase di sini menggunakan fetch().
    setComments([newEntry, ...comments]);
    setNewComment('');
    
    alert("Komentar terkirim! (Catatan: Untuk menyimpan permanen ke semua orang, pasang Database Firebase)");
  };

  return (
    <div className="text-slate-100 min-h-screen font-sans selection:bg-yellow-500 selection:text-black scroll-smooth relative">
      
      {/* ANIMATED BACKGROUND TEMA KUNING */}
      <div className="fixed inset-0 z-[-1] bg-slate-950 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:24px_24px]"></div>
        {/* Glow Kuning */}
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-yellow-600/20 rounded-full blur-[100px] animate-pulse"></div>
        <div className="absolute top-1/2 -right-20 w-96 h-96 bg-yellow-800/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* NAVIGATION BAR */}
      <nav className="border-b border-yellow-900/30 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50 px-4 sm:px-8 py-3">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* PERBAIKAN LOGO: Memanggil dari folder public/logo.png */}
            <img 
              src="/logo.png" 
              alt="Freedom Logo" 
              className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]"
              onError={(e) => { e.currentTarget.style.display = 'none'; }}
            />
            <span className="text-2xl font-black tracking-tighter text-white">FREEDOM</span>
          </div>
          <div className="hidden sm:flex gap-6 text-sm font-semibold text-slate-300">
            <a href="#home" className="hover:text-yellow-400 transition">Home</a>
            <a href="#about" className="hover:text-yellow-400 transition">About</a>
            <a href="#roster" className="hover:text-yellow-400 transition">Roster</a>
            <a href="#discussion" className="hover:text-yellow-400 transition">Discussion</a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header id="home" className="relative py-24 sm:py-36 text-center px-4 flex flex-col items-center justify-center min-h-[80vh]">
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="inline-block animate-bounce text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 px-4 py-1.5 rounded-full mb-6">
            We Are Live
          </span>
          <h1 className="text-6xl sm:text-9xl font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-br from-white via-yellow-200 to-yellow-600 mb-6 drop-shadow-lg">
            FREEDOM
          </h1>
          <p className="text-lg sm:text-2xl text-slate-400 max-w-2xl mx-auto font-light leading-relaxed">
            Menembus batas, menghancurkan keraguan. Ini adalah era kebebasan emas.
          </p>
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
            <a href="#roster" className="px-8 py-4 bg-yellow-500 hover:bg-yellow-400 text-slate-950 font-bold rounded-lg shadow-[0_0_20px_rgba(234,179,8,0.3)] transition transform hover:-translate-y-1 text-sm uppercase tracking-wider">
              Explore Roster
            </a>
          </div>
        </div>
      </header>

      {/* ABOUT SECTION */}
      <section id="about" className="max-w-6xl mx-auto py-20 px-4 sm:px-6 w-full">
        <div className="bg-slate-900/40 border border-yellow-900/30 backdrop-blur-sm p-8 sm:p-12 rounded-2xl">
          <h2 className="text-3xl font-black uppercase tracking-tight text-white border-l-4 border-yellow-500 pl-4 mb-6">
            Kisah Kami
          </h2>
          <p className="text-slate-300 leading-relaxed text-lg">
            Freedom Clan lahir dari dedikasi dan semangat bermain tanpa batas. Kami mengutamakan taktik, koordinasi tingkat tinggi, dan rasa persaudaraan yang kuat. Kami bermain bukan sekadar untuk menang, tapi untuk mendominasi dengan gaya.
          </p>
        </div>
      </section>

      {/* ROSTER SECTION */}
      <section id="roster" className="max-w-7xl mx-auto py-20 px-4 sm:px-6 w-full">
        <div className="text-center mb-16">
          <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tight text-white drop-shadow-md">
            CLAN ROSTER
          </h2>
          <p className="text-yellow-500 font-semibold text-sm mt-2 uppercase tracking-widest">
            {loadingMembers ? "Loading Data..." : "Live Member Database"}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {members.map((member, index) => (
            <div 
              key={index} 
              className="bg-slate-900/50 backdrop-blur-md p-6 rounded-xl border border-slate-800 hover:border-yellow-500 hover:shadow-[0_0_15px_rgba(234,179,8,0.15)] transition-all duration-300 flex items-center gap-5 group"
            >
              <div className="h-14 w-14 rounded-full bg-slate-800 flex items-center justify-center font-bold text-xl text-slate-400 group-hover:text-slate-950 group-hover:bg-yellow-500 transition-colors">
                {member.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight text-white group-hover:text-yellow-400 transition">
                  {member.name}
                </h3>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ONLINE COMMENT / DISCUSSION SECTION */}
      <section id="discussion" className="max-w-4xl mx-auto py-20 px-4 sm:px-6 w-full mb-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black uppercase tracking-tight text-white">Public Board</h2>
          <p className="text-slate-500 mt-2">Tinggalkan jejak, sapa roster kami.</p>
        </div>

        {/* Form Komentar */}
        <form onSubmit={handleSubmitComment} className="bg-slate-900/60 p-6 rounded-xl border border-yellow-900/30 mb-10 shadow-lg">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
            <input 
              type="text" 
              placeholder="Gamertag / Nama" 
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="col-span-1 bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-yellow-500 transition"
              required
            />
            <input 
              type="text" 
              placeholder="Tulis pesan..." 
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              className="col-span-1 sm:col-span-2 bg-slate-950 border border-slate-700 text-white p-3 rounded-lg focus:outline-none focus:border-yellow-500 transition"
              required
            />
          </div>
          <button type="submit" className="w-full bg-yellow-600 hover:bg-yellow-500 text-slate-950 font-bold py-3 rounded-lg transition-colors">
            Kirim Pesan
          </button>
        </form>

        {/* List Komentar */}
        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment.id} className="bg-slate-900/30 p-5 rounded-lg border border-slate-800/50 flex gap-4 hover:border-yellow-900/50 transition">
              <div className="h-10 w-10 rounded-full bg-slate-800 flex-shrink-0 flex items-center justify-center font-bold text-yellow-500">
                {comment.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-white text-sm">{comment.name}</h4>
                  <span className="text-[10px] text-slate-500">{comment.time}</span>
                </div>
                <p className="text-slate-300 text-sm">{comment.text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-yellow-900/20 bg-slate-950 py-8 text-center text-slate-600 text-sm">
        <p>&copy; {new Date().getFullYear()} FREEDOM CLAN.</p>
      </footer>
      
    </div>
  );
}
