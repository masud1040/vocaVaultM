
import React from 'react';
import { GraduationCap, Cpu, ShieldCheck, Bookmark, Sparkles } from 'lucide-react';
import { GrammarNote } from '../types';

interface GrammarShareCardProps {
  note: GrammarNote;
  userName: string;
}

const GrammarShareCard: React.FC<GrammarShareCardProps> = ({ note, userName }) => {
  const dateStr = new Date(note.createdAt).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div 
      id="grammar-share-element" 
      className="relative w-[600px] min-h-[450px] bg-[#050810] border border-white/10 flex flex-col justify-between shadow-2xl select-none overflow-hidden p-10"
    >
      {/* Background & Gradients */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617]"></div>
      <div className="absolute top-[-20%] left-[-10%] w-[400px] h-[400px] bg-indigo-500/10 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[350px] h-[350px] bg-purple-500/10 blur-[100px] rounded-full"></div>
      
      {/* Texture */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

      {/* Decorative Corners */}
      <div className="absolute top-0 left-0 w-24 h-24 border-t-2 border-l-2 border-indigo-500/20 m-4 rounded-tl-3xl"></div>
      <div className="absolute bottom-0 right-0 w-24 h-24 border-b-2 border-r-2 border-purple-500/20 m-4 rounded-br-3xl"></div>

      {/* Header */}
      <div className="relative z-10 flex justify-between items-start mb-10">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl bg-indigo-600 shadow-xl shadow-indigo-600/20 border border-white/10">
            <GraduationCap size={28} className="text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter leading-none">GRAMMAR LOGIC</h1>
            <p className="text-[8px] font-black text-indigo-400 uppercase tracking-[0.4em] mt-1">Authorized Linguistic Note</p>
          </div>
        </div>
        <div className="flex flex-col items-end">
          <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[8px] font-black text-slate-500 uppercase tracking-widest">
            ID: {note.id.slice(0, 8).toUpperCase()}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="relative z-10 flex-1 space-y-8">
        <div className="space-y-2">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-[0.4em]">Operational Topic</span>
          <h2 className="text-4xl font-black text-white tracking-tight leading-none uppercase">
            {note.topic}
          </h2>
        </div>

        {note.formula && (
          <div className="space-y-3">
             <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Formula Syntax</span>
             <div className="p-5 rounded-2xl bg-indigo-500/5 border border-indigo-500/20 font-mono text-indigo-300 text-lg shadow-inner">
               {note.formula}
             </div>
          </div>
        )}

        <div className="space-y-3">
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.4em]">Syntactic Analysis</span>
           <div className="text-slate-300 text-sm leading-relaxed max-h-[120px] overflow-hidden relative">
             {note.notes}
             <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-[#0f172a] to-transparent"></div>
           </div>
        </div>
      </div>

      {/* Footer */}
      <div className="relative z-10 pt-10 mt-6 flex justify-between items-end border-t border-white/5">
        <div className="flex items-center gap-8">
          <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Compiler</p>
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span className="text-xs font-black text-white uppercase tracking-tight">{userName}</span>
            </div>
          </div>
          <div className="space-y-1">
             <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Archived On</p>
             <p className="text-[10px] font-black text-white font-mono tracking-widest">{dateStr}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Bookmark size={18} className="text-indigo-400" />
          </div>
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Sparkles size={18} className="text-amber-400" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default GrammarShareCard;
