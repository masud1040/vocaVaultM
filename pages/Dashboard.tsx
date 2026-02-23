
import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar, AreaChart, Area
} from 'recharts';
import { BookOpen, GraduationCap, Trophy, Zap, Sparkles, CheckCircle2, TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import { Vocabulary, GrammarNote, TestResult } from '../types';
import VoiceButton from '../components/VoiceButton';
import { supabase } from '../services/supabase';

const Dashboard: React.FC = () => {
  const [vocab, setVocab] = useState<Vocabulary[]>([]);
  const [grammar, setGrammar] = useState<GrammarNote[]>([]);
  const [tests, setTests] = useState<TestResult[]>([]);
  const [activeWords, setActiveWords] = useState<Vocabulary[]>([]);
  const [currentWordIdx, setCurrentWordIdx] = useState(0);

  // Expanded default words to ensure at least 12 words are always available
  const defaultWords: Vocabulary[] = [
    { id: 'd1', word: 'Ebullient', meaning: 'উল্লাসিত, অত্যন্ত খুশি', example: 'She was ebullient after hearing the news.', learned: false, createdAt: Date.now() - 86400000 * 5 },
    { id: 'd2', word: 'Ephemeral', meaning: 'ক্ষণস্থায়ী', example: 'Fame in the world of social media is often ephemeral.', learned: true, createdAt: Date.now() - 86400000 * 4 },
    { id: 'd3', word: 'Serendipity', meaning: 'আকস্মিক সৌভাগ্য', example: 'Finding that old book was pure serendipity.', learned: false, createdAt: Date.now() - 86400000 * 3 },
    { id: 'd4', word: 'Resilient', meaning: 'স্থিতিস্থাপক, ঘুরে দাঁড়াতে সক্ষম', example: 'The community was resilient in the face of disaster.', learned: true, createdAt: Date.now() - 86400000 * 2 },
    { id: 'd5', word: 'Ambiguous', meaning: 'দ্ব্যর্থক, অস্পষ্ট', example: 'His reply was ambiguous and left us confused.', learned: false, createdAt: Date.now() - 86400000 * 1 },
    { id: 'd6', word: 'Luminous', meaning: 'উজ্জ্বল, দীপ্তিময়', example: 'The moon cast a luminous glow over the lake.', learned: false, createdAt: Date.now() },
    { id: 'd7', word: 'Alacrity', meaning: 'তৎপরতা, উদ্যম', example: 'He accepted the invitation with alacrity.', learned: false, createdAt: Date.now() },
    { id: 'd8', word: 'Benevolent', meaning: 'দয়ালু, পরোপকারী', example: 'The benevolent businessman donated millions to charity.', learned: true, createdAt: Date.now() },
    { id: 'd9', word: 'Candid', meaning: 'অকপট, সরল', example: 'I appreciated her candid response to my question.', learned: false, createdAt: Date.now() },
    { id: 'd10', word: 'Diligence', meaning: 'অধ্যবসায়, পরিশ্রম', example: 'Few party members challenge his diligence as an MP.', learned: true, createdAt: Date.now() },
    { id: 'd11', word: 'Eloquence', meaning: 'বাকপটুতা', example: 'His eloquence moved the entire audience to tears.', learned: false, createdAt: Date.now() },
    { id: 'd12', word: 'Frugal', meaning: 'মিতব্যয়ী', example: 'He led a frugal life to save money for his children.', learned: true, createdAt: Date.now() },
    { id: 'd13', word: 'Gregarious', meaning: 'মিশুক, সামাজিক', example: 'She is such a gregarious and outgoing person.', learned: false, createdAt: Date.now() },
    { id: 'd14', word: 'Haughty', meaning: 'অহংকারী', example: 'The haughty waiter treated us with clear contempt.', learned: false, createdAt: Date.now() },
  ];

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [vocabRes, grammarRes, testsRes] = await Promise.all([
        supabase.from('vocabularies').select('*').eq('user_id', user.id),
        supabase.from('grammar_notes').select('*').eq('user_id', user.id),
        supabase.from('test_results').select('*').eq('user_id', user.id)
      ]);

      const savedVocab = vocabRes.data || [];
      const savedGrammar = grammarRes.data || [];
      const savedTests = testsRes.data || [];

      setVocab(savedVocab);
      setGrammar(savedGrammar);
      setTests(savedTests);

      // Merge user words with defaults. User words will appear alongside defaults.
      // We shuffle the combined list and take exactly 12.
      const combinedPool = [...savedVocab, ...defaultWords];
      
      // Ensure uniqueness based on the word string to avoid duplicates if user adds same words as defaults
      const uniquePoolMap = new Map();
      combinedPool.forEach(v => {
        if (!uniquePoolMap.has(v.word.toLowerCase())) {
          uniquePoolMap.set(v.word.toLowerCase(), v);
        }
      });
      
      const finalPool = Array.from(uniquePoolMap.values());
      const shuffled = finalPool.sort(() => 0.5 - Math.random()).slice(0, 12);
      setActiveWords(shuffled);
    };

    fetchData();
  }, []);

  // Growth Chart Data
  const growthData = useMemo(() => {
    const source = vocab.length > 0 ? vocab : defaultWords.slice(0, 6);
    const sorted = [...source].sort((a, b) => {
      const timeA = a.created_at || a.createdAt || 0;
      const timeB = b.created_at || b.createdAt || 0;
      return timeA - timeB;
    });
    let cumulative = 0;
    return sorted.map(v => {
      cumulative += 1;
      const time = v.created_at || v.createdAt || Date.now();
      return {
        date: new Date(time).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        count: cumulative
      };
    }).slice(-10);
  }, [vocab]);

  // Performance Data
  const performanceData = useMemo(() => {
    if (tests.length === 0) return [{ date: 'N/A', score: 0 }];
    return tests.map(t => ({
      date: new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
      score: Math.round(t.score)
    })).slice(-7);
  }, [tests]);

  // Word rotation logic
  useEffect(() => {
    if (activeWords.length === 0) return;
    const interval = setInterval(() => {
      setCurrentWordIdx((prev) => (prev + 1) % activeWords.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [activeWords]);

  // Calculate trends
  const calculateTrend = (data: any[], key: string) => {
    if (data.length < 2) return { value: 0, isUp: true };
    const current = data[data.length - 1][key];
    const previous = data[data.length - 2][key];
    if (previous === 0) return { value: current > 0 ? 100 : 0, isUp: current >= 0 };
    const change = ((current - previous) / previous) * 100;
    return { value: Math.abs(Math.round(change)), isUp: change >= 0 };
  };

  const vocabTrend = useMemo(() => calculateTrend(growthData, 'count'), [growthData]);
  const testTrend = useMemo(() => calculateTrend(performanceData, 'score'), [performanceData]);

  const learnedCount = vocab.filter(v => v.learned).length;
  const pieData = [
    { name: 'Learned', value: learnedCount || 0, color: '#6366f1' },
    { name: 'To Learn', value: Math.max(vocab.length - learnedCount, 1), color: '#1e293b' }
  ];

  const currentWord = activeWords[currentWordIdx];

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-slate-900/90 border border-white/10 backdrop-blur-xl p-3 rounded-xl shadow-2xl">
          <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">{label}</p>
          <p className="text-sm font-black text-white">{payload[0].value} {payload[0].name === 'score' ? '%' : 'Words'}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-8 pb-12">
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950/20 via-slate-900/40 to-slate-950/40 rounded-[3rem] pt-20 pb-24 px-6 sm:px-12 text-center border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] backdrop-blur-sm">
        <div className="absolute top-10 right-10 text-white/5 text-[12rem] font-black select-none pointer-events-none transform rotate-12">Aa</div>
        <div className="absolute bottom-10 left-10 text-white/5 text-[12rem] font-black select-none pointer-events-none font-['Noto_Sans_Bengali'] transform -rotate-12">ক</div>
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full"></div>

        <div className="relative z-10 max-w-4xl mx-auto space-y-10">
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 text-indigo-300 text-[11px] font-black uppercase tracking-[0.25em] border border-white/10 backdrop-blur-md"
          >
            <Sparkles size={14} className="text-amber-400" />
            Empowering Your Lexicon
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl sm:text-7xl lg:text-8xl font-black text-white tracking-tighter leading-[0.9]"
          >
            Forge Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-indigo-400 animate-gradient-x">
              Vocabulary.
            </span>
          </motion.h1>

          <div className="pt-12 flex justify-center perspective-1000 h-[380px]">
            <AnimatePresence mode="wait">
              {currentWord && (
                <motion.div
                  key={currentWord.id}
                  initial={{ opacity: 0, x: 100, rotateY: 45, scale: 0.8 }}
                  animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -100, rotateY: -45, scale: 0.8 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="w-full max-w-[360px] bg-white/[0.05] backdrop-blur-2xl border border-white/10 p-12 rounded-[3.5rem] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] flex flex-col items-center justify-center relative overflow-hidden group hover:border-indigo-500/30 transition-colors"
                >
                  <div className="absolute top-8 left-8">
                    <VoiceButton word={currentWord.word} className="text-white hover:bg-white/10 p-3 bg-white/5 rounded-2xl" />
                  </div>
                  <div className="absolute top-8 right-8">
                    {currentWord.learned ? (
                      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-[9px] font-black uppercase tracking-widest">
                        <CheckCircle2 size={10} /> Learned
                      </div>
                    ) : (
                      <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[9px] font-black uppercase tracking-widest">
                        Active
                      </div>
                    )}
                  </div>
                  <div className="text-center space-y-6 relative z-10">
                    <div className="space-y-2">
                      <h2 className="text-4xl sm:text-5xl font-black text-white tracking-tight group-hover:scale-105 transition-transform duration-500">{currentWord.word}</h2>
                      <div className="text-[10px] text-indigo-400/60 uppercase tracking-[0.4em] font-black">Phonetic Target</div>
                    </div>
                    <div className="h-[2px] w-12 bg-indigo-500/30 mx-auto rounded-full"></div>
                    <div className="space-y-2">
                      <p className="text-2xl font-bold text-slate-200 font-['Noto_Sans_Bengali'] leading-snug">
                        {currentWord.meaning}
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 px-4 max-w-7xl mx-auto">
        <StatCard 
          title="Total Lexicon" 
          value={vocab.length} 
          icon={<BookOpen size={20} className="text-indigo-400" />} 
          trend={vocabTrend}
        />
        <StatCard 
          title="Mastered" 
          value={learnedCount} 
          icon={<Sparkles size={20} className="text-pink-400" />} 
        />
        <StatCard 
          title="Grammar Logic" 
          value={grammar.length} 
          icon={<GraduationCap size={20} className="text-amber-400" />} 
        />
        <StatCard 
          title="Retention Rate" 
          value={tests.length > 0 ? `${Math.round(tests[tests.length-1].score)}%` : '0%'} 
          icon={<Zap size={20} className="text-yellow-400" />} 
          trend={testTrend}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 px-4 max-w-7xl mx-auto">
        <div className="bg-white/60 dark:bg-slate-900/40 p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-indigo-500/10 rounded-2xl">
                 <TrendingUp size={24} className="text-indigo-500" />
               </div>
               <div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Lexicon Expansion</h3>
                 <p className="text-xs text-slate-500 font-medium">Cumulative growth velocity</p>
               </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={growthData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="count" name="Words" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" animationDuration={2000} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-slate-900/40 p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl backdrop-blur-md">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
               <div className="p-3 bg-purple-500/10 rounded-2xl">
                 <Activity size={24} className="text-purple-500" />
               </div>
               <div>
                 <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight">Neural Calibration</h3>
                 <p className="text-xs text-slate-500 font-medium">Historical assessment performance</p>
               </div>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#64748b', fontWeight: 700 }} />
                <YAxis hide domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="score" name="score" radius={[8, 8, 0, 0]} animationDuration={1500}>
                  {performanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.score > 70 ? '#10b981' : entry.score > 40 ? '#6366f1' : '#f43f5e'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <section className="max-w-7xl mx-auto px-4">
        <div className="bg-white/60 dark:bg-slate-900/40 p-10 rounded-[3rem] border border-slate-200 dark:border-white/5 shadow-2xl backdrop-blur-md flex flex-col md:flex-row items-center gap-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="p-4 bg-indigo-500/10 rounded-3xl w-fit mx-auto md:mx-0">
               <Target size={32} className="text-indigo-500" />
            </div>
            <div>
               <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Linguistic Fluency</h3>
               <p className="text-slate-500 font-medium leading-relaxed max-w-md">
                 Total mastery percentage across your digital archive. This reflects your verified retention through active learning sessions.
               </p>
            </div>
            <div className="flex items-center justify-center md:justify-start gap-8">
               <div className="space-y-1 text-center">
                 <div className="text-2xl font-black text-indigo-600">{learnedCount}</div>
                 <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">Mastered</div>
               </div>
               <div className="w-[1px] h-10 bg-slate-100 dark:bg-white/5"></div>
               <div className="space-y-1 text-center">
                 <div className="text-2xl font-black text-slate-400">{vocab.length - learnedCount}</div>
                 <div className="text-[10px] uppercase font-black tracking-widest text-slate-400">Queue</div>
               </div>
            </div>
          </div>

          <div className="relative h-64 w-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  animationBegin={0}
                  animationDuration={1500}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-black text-slate-900 dark:text-white leading-none">
                {Math.round((learnedCount / Math.max(vocab.length, 1)) * 100)}%
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 mt-1">Efficiency</span>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .perspective-1000 { perspective: 1000px; }
        @keyframes gradient-x {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 15s ease infinite;
        }
      `}</style>
    </div>
  );
};

const StatCard = ({ title, value, icon, trend }: { title: string, value: string | number, icon: React.ReactNode, trend?: { value: number, isUp: boolean } }) => (
  <motion.div 
    whileHover={{ y: -8, scale: 1.02 }}
    className="bg-white/60 dark:bg-slate-900/60 p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 flex justify-between items-center group shadow-xl backdrop-blur-md transition-all duration-300 relative overflow-hidden"
  >
    <div className="space-y-2 relative z-10">
      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-indigo-500 transition-colors">{title}</div>
      <div className="flex items-baseline gap-3">
        <div className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{value}</div>
        {trend && (
          <div className={`flex items-center text-xs font-bold ${trend.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
            {trend.isUp ? <TrendingUp size={14} className="mr-1" /> : <TrendingDown size={14} className="mr-1" />}
            {trend.value}%
          </div>
        )}
      </div>
      <div className="w-10 h-[4px] bg-indigo-500 rounded-full group-hover:w-16 transition-all duration-500"></div>
    </div>
    <div className="p-4 bg-slate-50/50 dark:bg-white/[0.03] rounded-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500 border border-transparent group-hover:border-white/10 shadow-inner relative z-10">
      {icon}
    </div>
  </motion.div>
);

export default Dashboard;
