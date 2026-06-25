import React from 'react';

export default function Home() {
  const members = [
    { name: "AlphaLeader", role: "Clan Leader", avatar: "👑" },
    { name: "GhostSniper", role: "Co-Leader", avatar: "🎯" },
    { name: "ShadowMedic", role: "Officer", avatar: "🛡️" },
    { name: "DarkKnight", role: "Ruster Utama", avatar: "⚔️" },
  ];

  return (
    <div className="bg-gray-950 text-white min-h-screen font-sans flex flex-col justify-between">
      {/* Bagian Atas / Hero */}
      <header className="py-24 text-center bg-gradient-to-b from-purple-900 to-gray-950">
        <h1 className="text-6xl font-extrabold tracking-wider uppercase text-purple-400">
          ZEPHYR CLAN
        </h1>
        <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto px-4">
          Dominasi dan Loyalitas. Komunitas gaming kompetitif yang mengutamakan kerja sama tim dan kemenangan mutlak.
        </p>
        <a 
          href="https://discord.gg" 
          target="_blank" 
          rel="noreferrer" 
          className="inline-block mt-8 px-8 py-3.5 bg-purple-600 hover:bg-purple-700 font-bold rounded-lg shadow-lg transition transform hover:scale-105"
        >
          Mabar di Discord
        </a>
      </header>

      {/* Bagian Tentang Clan */}
      <section className="max-w-4xl mx-auto py-16 px-6 w-full">
        <h2 className="text-3xl font-bold text-center border-b-2 border-purple-500 pb-2 mb-8 uppercase tracking-wide">
          Tentang Kami
        </h2>
        <div className="grid md:grid-cols-2 gap-8 text-gray-300 text-lg leading-relaxed">
          <p>
            Didirikan dengan satu tujuan: Menyatukan para pemain berbakat di bawah satu bendera yang sama. Kami bukan sekadar kelompok bermain, melainkan sebuah keluarga tempat mengasah skill.
          </p>
          <p>
            Kami aktif mengikuti skena turnamen lokal, mengadakan scrim internal mingguan, dan selalu terbuka untuk anggota baru yang memiliki dedikasi tinggi.
          </p>
        </div>
      </section>

      {/* Bagian Anggota / Roster */}
      <section className="max-w-5xl mx-auto py-16 px-6 bg-gray-900/50 rounded-2xl mb-24 w-full border border-gray-800">
        <h2 className="text-3xl font-bold text-center text-purple-400 mb-12 uppercase tracking-wide">
          Roster Clan
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {members.map((member, index) => (
            <div key={index} className="bg-gray-800/80 p-6 rounded-xl text-center border border-gray-700 hover:border-purple-500 transition-all duration-300">
              <div className="text-4xl mb-3">{member.avatar}</div>
              <h3 className="text-lg font-bold tracking-wide truncate">{member.name}</h3>
              <p className="text-purple-400 text-xs mt-1 uppercase font-semibold">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Bagian Kaki / Footer */}
      <footer className="border-t border-gray-900 bg-gray-950 py-6 text-center text-gray-500 text-sm w-full">
        <p>&copy; {new Date().getFullYear()} Zephyr Clan. Dibuat langsung di GitHub.</p>
      </footer>
    </div>
  );
}
