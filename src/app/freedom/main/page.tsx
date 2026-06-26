import React from 'react';
import logoPnAsset from '../../../assets/logo_pn.png';
import mcProwAsset from '../../../assets/mc_prow.png';

const getSrc = (asset: any) => asset?.src || (typeof asset === 'string' ? asset : '');

export default function MainPage() {
  const logoPnSrc = getSrc(logoPnAsset);
  const mcProwSrc = getSrc(mcProwAsset);

  return (
    <>
      {/* 1. HERO SECTION */}
      <header className="pt-20 pb-16 md:pt-32 md:pb-24 px-4 text-center flex flex-col items-center">
        <div className="max-w-4xl mx-auto w-full flex flex-col items-center">
          <div className="flex items-center gap-2 mb-6 bg-black/40 px-4 py-1.5 rounded-full border border-orange-500/30 backdrop-blur-md">
            <img src={logoPnSrc} alt="PN Logo" className="h-4 w-4 md:h-5 md:w-5 object-contain" />
            <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-orange-500">
              ProwNetwork Official
            </span>
          </div>
          
          <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase text-white mb-4 drop-shadow-[0_0_30px_rgba(234,88,12,0.5)]">
            FREEDOM
          </h1>
          
          <p className="text-sm md:text-lg text-slate-300 max-w-xl mx-auto font-medium leading-relaxed mb-8 px-2">
            Welcome to the official website of Clan Freedom, the first clan in <span className="text-yellow-500 font-bold">ProwNetwork</span>.
          </p>
          
          <a href="https://discord.gg/2veK4TDWtF" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-3 w-full sm:w-auto px-8 py-4 bg-orange-600 hover:bg-orange-500 text-white font-bold rounded shadow-[0_0_20px_rgba(234,88,12,0.4)] transition-all uppercase tracking-widest text-xs md:text-sm">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
            Join Server Discord
          </a>
        </div>
      </header>

      {/* 2. SERVER INFO */}
      <section id="server" className="py-16 md:py-24 border-y border-white/5 bg-black/50 backdrop-blur-md">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <img src={mcProwSrc} alt="Minecraft ProwNetwork" className="w-full max-w-[250px] md:max-w-[400px] mx-auto object-contain mb-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)]" />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-[#0f0f0f] border border-white/10 p-8 rounded-lg flex flex-col items-center justify-center group hover:border-orange-500 hover:bg-orange-500/5 transition-all">
              <svg className="w-8 h-8 text-orange-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Bedrock IP Server</span>
              <span className="text-xl md:text-3xl font-black text-white tracking-widest group-hover:text-orange-400">
                be.prownetwork.net
              </span>
            </div>
            
            <a href="https://discord.gg/8X4rz7eARM" target="_blank" rel="noreferrer" className="bg-[#0f0f0f] border border-white/10 p-8 rounded-lg flex flex-col items-center justify-center group hover:border-[#5865F2] hover:bg-[#5865F2]/5 transition-all">
              <svg className="w-8 h-8 text-[#5865F2] mb-4 fill-current" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189z"/></svg>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">PN Official Community</span>
              <span className="text-xl md:text-3xl font-black text-white uppercase tracking-wider group-hover:text-[#5865F2]">
                Join Prow Discord
              </span>
            </a>
          </div>
        </div>
      </section>

      {/* 3. STATS GRID */}
      <section className="py-12 md:py-20 px-4 w-full border-b border-white/5 bg-black/30 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { value: "95%", label: "Win Rate", icon: <svg className="w-5 h-5 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg> },
              { value: "S-Tier", label: "Clan Rank", icon: <svg className="w-5 h-5 mx-auto mb-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg> },
              { value: "10+", label: "Elite Members", icon: <svg className="w-5 h-5 mx-auto mb-2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path></svg> },
              { value: "Full", label: "Kebebasan", icon: <svg className="w-5 h-5 mx-auto mb-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path></svg> }
            ].map((stat, i) => (
              <div key={i} className="text-center p-6 bg-[#0f0f0f] border border-white/5 rounded-lg hover:border-orange-500/50 transition-all shadow-lg">
                {stat.icon}
                <h3 className="text-2xl md:text-4xl font-black text-white mb-1">{stat.value}</h3>
                <p className="text-slate-500 uppercase tracking-widest text-[9px] md:text-[10px] font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
