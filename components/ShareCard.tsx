
import React from 'react';
import { BookOpen, ShieldCheck, Cpu, Globe } from 'lucide-react';
import { Vocabulary } from '../types';

interface ShareCardProps {
  vocabulary: Vocabulary;
  userName: string;
}

const ShareCard: React.FC<ShareCardProps> = ({ vocabulary, userName }) => {
  // Precise current date for "Valid Thru"
  const now = new Date();
  const day = now.getDate().toString().padStart(2, '0');
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  const year = now.getFullYear().toString().slice(-2);
  const dateStr = `${day}/${month}/${year}`;
  
  return (
    <div id="premium-card-element" className="relative w-[500px] min-h-[320px] bg-slate-950 border border-white/10 flex flex-col justify-between shadow-[0_50px_100px_-20px_rgba(0,0,0,1)] group select-none overflow-hidden">
      {/* Background Gradient & Asset Texture */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617]"></div>
      
      {/* Dynamic Lighting Effects */}
      <div className="absolute top-[-40%] right-[-20%] w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-40%] left-[-20%] w-[400px] h-[400px] bg-purple-500/10 blur-[120px] rounded-full"></div>
      
      {/* Technical Grid Overlay */}
      <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#fff 0.5px, transparent 0.5px), linear-gradient(90deg, #fff 0.5px, transparent 0.5px)', backgroundSize: '20px 20px' }}></div>

      {/* Top Bar: Branding & Authentication */}
      <div className="relative z-10 flex justify-between items-start p-8 pb-4">
        <div className="flex items-center gap-4">
          <div className="bg-gradient-to-tr from-indigo-600 to-purple-500 p-2.5 shadow-[0_0_30px_rgba(79,70,229,0.3)] border border-white/20">
            <BookOpen size={24} className="text-white" strokeWidth={2.5} />
          </div>
          <div className="flex flex-col">
            <span className="text-xl font-black text-white leading-none tracking-tighter">VOCAVAULT</span>
            <span className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-1">Certified Linguistic Asset</span>
          </div>
        </div>

        <div className="w-14 h-11 bg-gradient-to-br from-[#d4af37] via-[#f9e586] to-[#b8860b] relative overflow-hidden border border-yellow-200/40 shadow-xl">
           <div className="absolute inset-0 opacity-40 flex flex-col justify-around">
             <div className="w-full h-[0.5px] bg-black"></div>
             <div className="w-full h-[0.5px] bg-black"></div>
             <div className="w-full h-[0.5px] bg-black"></div>
           </div>
           <div className="absolute inset-0 flex items-center justify-center opacity-60">
              <Cpu size={20} className="text-black/80" />
           </div>
        </div>
      </div>

      {/* Main Asset Data */}
      <div className="relative z-10 space-y-4 px-8 py-2">
        <div className="space-y-1">
          <h2 className="text-5xl font-black text-white tracking-tighter drop-shadow-[0_10px_10px_rgba(0,0,0,0.8)]">
            {vocabulary.word}
          </h2>
          <div className="flex items-center gap-3">
              <div className="w-8 h-[2px] bg-indigo-500"></div>
              <p className="text-2xl font-bold text-slate-100 font-['Noto_Sans_Bengali']">
                  {vocabulary.meaning}
              </p>
          </div>
        </div>
        
        {vocabulary.example && (
          <div className="bg-white/[0.03] border-l-2 border-indigo-500/50 p-3 pr-4 max-w-[90%] backdrop-blur-sm">
            <p className="text-xs text-slate-400 italic leading-relaxed line-clamp-2">
              "{vocabulary.example}"
            </p>
          </div>
        )}
      </div>

      {/* Footer: Security & Ownership */}
      <div className="relative z-10 flex justify-between items-end bg-black/40 p-8 pt-6 border-t border-white/5">
        <div className="space-y-2">
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Vault Holder</p>
          <div className="flex items-center gap-2.5">
            <ShieldCheck size={16} className="text-emerald-400" />
            <span className="text-sm font-black text-white uppercase tracking-tight">
              {userName || 'Anonymous User'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-8">
          <div className="text-right space-y-1">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Authorized On</p>
            <p className="text-xs font-black text-white tracking-widest font-mono">{dateStr}</p>
          </div>

          <div className="flex -space-x-5 opacity-80 filter brightness-110">
              <div className="w-10 h-10 rounded-full bg-red-600 mix-blend-screen blur-[1px]"></div>
              <div className="w-10 h-10 rounded-full bg-yellow-500 mix-blend-screen blur-[1px]"></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareCard;
