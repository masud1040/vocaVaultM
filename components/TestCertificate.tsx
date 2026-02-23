
import React from 'react';
import { Award, ShieldCheck, Zap, Globe, Cpu, BookOpen } from 'lucide-react';
import { TestResult } from '../types';

interface TestCertificateProps {
  result: TestResult;
  userName: string;
}

const TestCertificate: React.FC<TestCertificateProps> = ({ result, userName }) => {
  const dateStr = new Date(result.date).toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const isHighPerformer = result.score >= 80;
  const grade = result.score >= 90 ? 'A+' : result.score >= 80 ? 'A' : result.score >= 70 ? 'B+' : result.score >= 60 ? 'B' : 'C';

  return (
    <div 
      id="test-certificate-element" 
      className="relative w-[600px] h-[400px] bg-[#050810] border border-white/10 flex flex-col justify-between shadow-2xl select-none overflow-hidden"
    >
      {/* Premium Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020617] via-[#0f172a] to-[#020617]"></div>
      
      {/* Light Orbs */}
      <div className={`absolute top-[-20%] right-[-10%] w-[300px] h-[300px] blur-[100px] rounded-full opacity-30 ${isHighPerformer ? 'bg-amber-500' : 'bg-indigo-500'}`}></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[300px] h-[300px] bg-purple-500/10 blur-[100px] rounded-full"></div>
      
      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

      {/* Decorative Border */}
      <div className="absolute inset-4 border border-white/5 pointer-events-none"></div>
      <div className="absolute inset-6 border border-white/5 pointer-events-none"></div>

      {/* Header */}
      <div className="relative z-10 p-10 flex justify-between items-start">
        <div className="flex items-center gap-4">
          <div className={`p-2.5 rounded-xl border border-white/20 shadow-lg ${isHighPerformer ? 'bg-amber-500' : 'bg-indigo-600'}`}>
            <Award size={28} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-white tracking-tighter leading-none">LINGUISTAI</h1>
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.4em] mt-1">Authorized Linguistic Assessment</p>
          </div>
        </div>
        
        <div className="text-right">
           <div className={`text-4xl font-black ${isHighPerformer ? 'text-amber-500' : 'text-indigo-400'} tracking-tighter leading-none`}>
             {result.score.toFixed(0)}%
           </div>
           <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Total Accuracy</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 px-10 text-center space-y-4 -mt-4">
        <div className="space-y-1">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.5em]">Certificate of Proficiency</p>
          <h2 className="text-4xl font-black text-white tracking-tight uppercase max-w-sm mx-auto">
            {userName}
          </h2>
        </div>
        
        <div className="w-16 h-[2px] bg-white/10 mx-auto"></div>
        
        <p className="text-xs text-slate-400 max-w-xs mx-auto font-medium leading-relaxed">
          Has successfully verified <span className="text-white font-bold">{result.correctAnswers}</span> linguistic units from a pool of <span className="text-white font-bold">{result.total}</span> within the secure VocaVault archive.
        </p>
      </div>

      {/* Footer / Authenticators */}
      <div className="relative z-10 p-10 flex justify-between items-end">
        <div className="flex items-center gap-8">
          <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Verification Date</p>
            <p className="text-xs font-black text-white tracking-widest font-mono">{dateStr}</p>
          </div>
          <div className="space-y-1">
            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Status</p>
            <div className="flex items-center gap-2">
              <ShieldCheck size={12} className="text-emerald-400" />
              <span className="text-[10px] font-black text-white uppercase tracking-tighter">Verified Achievement</span>
            </div>
          </div>
        </div>

        {/* Security Hologram */}
        <div className="relative w-16 h-16 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent rounded-full animate-pulse"></div>
          <div className={`w-12 h-12 rounded-full border-2 ${isHighPerformer ? 'border-amber-500/50' : 'border-indigo-500/50'} flex items-center justify-center relative overflow-hidden backdrop-blur-md`}>
            <Cpu size={24} className={isHighPerformer ? 'text-amber-500/50' : 'text-indigo-500/50'} />
            <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/5 to-transparent"></div>
          </div>
          <div className="absolute -bottom-1 text-[7px] font-black text-white/40 uppercase tracking-widest">GRADE {grade}</div>
        </div>
      </div>
    </div>
  );
};

export default TestCertificate;
