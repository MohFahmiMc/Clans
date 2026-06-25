import React from 'react';

export default function Home() {
  // 2. List Member Clan (Tanpa Emoji)
  const members = [
    { name: "FreedomLeader", role: "Clan Leader", rank: "Tier I" },
    { name: "GhostSniper", role: "Co-Leader", rank: "Tier I" },
    { name: "ShadowMedic", role: "Officer", rank: "Tier II" },
    { name: "DarkKnight", role: "Main Roster", rank: "Tier II" },
    { name: "ViperStrike", role: "Main Roster", rank: "Tier II" },
    { name: "ApexHunter", role: "Member", rank: "Tier III" },
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen font-sans flex flex-col justify-between antialiased selection:bg-red-600 selection:text-white">
      
      {/* NAVIGATION BAR (Bagus di Mobile & Desktop) */}
      <nav className="border-b border-slate-900 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* 3. Logo dari src/assets/logo.png */}
            <img 
              src="/src/assets/logo.png" 
              alt="Freedom Logo" 
              className="h-9 w-9 sm:h-11 sm:w-11 object-contain"
              onError={(e) => {
                // Fallback jika file logo belum di-upload ke folder assets
                e.currentTarget.style.display = 'none';
              }}
            />
            {/* 1. Nama Clan: Freedom */}
            <span className="text-xl sm:text-2xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">
              FREEDOM
            </span>
          </div>
          <div>
            <a 
              href="https://discord.gg" 
              target="_blank" 
              rel="noreferrer" 
              className="text-xs sm:text-sm font-semibold uppercase tracking-wider bg-slate-900 hover:bg-slate-800 border border-slate-800 px-4 py-2 rounded-md transition"
            >
              Community
            </a>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative py-20 sm:py-32 text-center px-4 overflow-hidden bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full pointer-events-none opacity-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        
        <div className="relative z-10 max-w-4xl mx-auto">
          <span className="text-xs sm:text-sm font-bold uppercase tracking-[0.3em] text-red-500 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full">
            Official Clan Website
          </span>
          <h1 className="text-5xl sm:text-8xl font-black tracking-tight uppercase text-white mt-6 mb-4">
            FREEDOM
          </h1>
          <p className="text-base sm:text-xl text-slate-400 max-w-2xl mx-auto px-2 sm:px-0 font-normal leading-relaxed">
            Membawa kebebasan dalam bermain, kekuatan dalam persatuan, dan dominasi mutlak di setiap medan pertempuran.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4 px-4 sm:px-0">
            <a 
              href="https://discord.gg" 
              target="_blank" 
              rel="noreferrer" 
              className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-md shadow-lg shadow-red-600/20 transition transform active:scale-95 text-center text-sm uppercase tracking-wider"
            >
              Join Our Discord
            </a>
            <a 
              href="#roster" 
              className="px-8 py-4 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 font-bold rounded-md transition text-center text-sm uppercase tracking-wider"
            >
              View Roster
            </a>
          </div>
        </div>
      </header>

      {/* TENTANG CLAN SECTION */}
      <section className="max-w-6xl mx-auto py-16 sm:py-24 px-4 sm:px-6 w-full">
        <div className="grid lg:grid-cols-3 gap-12 items-center">
          <div className="lg:col-span-1">
            <h2 className="text-3xl sm:text-4xl font-black uppercase tracking-tight text-white border-l-4 border-red-600 pl-4">
              ABOUT US
            </h2>
            <p className="mt-4 text-slate-400 text-sm sm:text-base">
              Bagaimana kami mendefinisikan ulang arti dari sebuah komunitas kompetitif.
            </p>
          </div>
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-6 text-slate-400 text-sm sm:text-base leading-relaxed">
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-lg">
              <h3 className="font-bold text-white text-lg mb-2 uppercase tracking-wide">Visi Kami</h3>
              <p>Didirikan untuk membentuk ruang di mana setiap talenta memiliki kebebasan mengekspresikan mekanik permainan terbaik mereka tanpa batas di bawah nama FREEDOM.</p>
            </div>
            <div className="bg-slate-900/40 border border-slate-900 p-6 rounded-lg">
              <h3 className="font-bold text-white text-lg mb-2 uppercase tracking-wide">Aktivitas</h3>
              <p>Kami konsisten mengadakan latihan bersama, mengevaluasi strategi mingguan, serta aktif berpartisipasi dalam ajang kompetitif lokal maupun nasional.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. & 5. LIST MEMBER ROSTER SECTION (Responsive Monitor & HP) */}
      <section id="roster" className="max-w-7xl mx-auto py-16 sm:py-24 px-4 sm:px-6 w-full border-t border-slate-900">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white">
            CLAN ROSTER
          </h2>
          <p className="text-slate-500 text-sm sm:text-base mt-2">
            Barisan personil aktif yang berjuang di bawah bendera Freedom.
          </p>
        </div>

        {/* Grid otomatis menyesuaikan ukuran layar PC (4 kolom) dan HP (2 kolom) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {members.map((member, index) => (
            <div 
              key={index} 
              className="bg-slate-900/30 p-5 sm:p-6 rounded-lg border border-slate-900 hover:border-red-600/50 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-red-600/5 blur-xl pointer-events-none group-hover:bg-red-600/10 transition-all"></div>
              <div>
                <span className="text-[10px] font-bold tracking-widest text-slate-600 uppercase block mb-1">
                  {member.rank}
                </span>
                <h3 className="text-base sm:text-xl font-bold tracking-tight text-white group-hover:text-red-500 transition truncate">
                  {member.name}
                </h3>
              </div>
              <div className="mt-6 pt-3 border-t border-slate-900/80 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">
                  {member.role}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-slate-900 bg-slate-950/50 py-8 text-center text-slate-600 text-xs sm:text-sm w-full px-4">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>&copy; {new Date().getFullYear()} FREEDOM CLAN. All rights reserved.</p>
          <p className="text-slate-700">Dibuat dan Dioptimalkan untuk Mobile & Desktop.</p>
        </div>
      </footer>
      
    </div>
  );
}
