
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Timer, 
  CheckCircle2, 
  XCircle, 
  Trophy, 
  RefreshCcw, 
  ArrowRight, 
  BrainCircuit, 
  Sparkles, 
  BookOpen, 
  ChevronRight, 
  Loader2, 
  Target, 
  AlertTriangle, 
  Layers, 
  Clock, 
  Eye,
  Share2,
  Download,
  X,
  LayoutDashboard
} from 'lucide-react';
import { Vocabulary, TestResult, User } from '../types';
import { useNavigate } from 'react-router-dom';
import { toPng } from 'html-to-image';
import TestCertificate from '../components/TestCertificate';
import { supabase } from '../services/supabase';

const Test: React.FC = () => {
  const navigate = useNavigate();
  const [vocab, setVocab] = useState<Vocabulary[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [stage, setStage] = useState<'setup' | 'quiz' | 'result'>('setup');
  const [config, setConfig] = useState({ count: 10, timePerQuestion: 15 });
  const [questions, setQuestions] = useState<{ id: string, word: string, meaning: string, options: string[], correct: string }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<string[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [startTime, setStartTime] = useState(0);
  const [totalTimeTaken, setTotalTimeTaken] = useState(0);
  const [showReview, setShowReview] = useState(false);
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [currentResult, setCurrentResult] = useState<TestResult | null>(null);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUser({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || ''
      });

      const { data, error } = await supabase
        .from('vocabularies')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching vocab:', error);
      } else if (data) {
        setVocab(data);
        if (data.length > 0 && data.length < 10) {
          setConfig(prev => ({ ...prev, count: data.length }));
        }
      }
    };

    fetchData();
  }, []);

  const isLowVocab = vocab.length < 5;

  const startQuiz = () => {
    if (isLowVocab) return;

    const shuffledPool = [...vocab].sort(() => 0.5 - Math.random());
    const selected = shuffledPool.slice(0, Math.min(config.count, vocab.length));
    
    const quizItems = selected.map(item => {
      const otherMeanings = vocab
        .filter(v => v.id !== item.id)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3)
        .map(v => v.meaning);
      
      while (otherMeanings.length < 3) {
        otherMeanings.push("Linguistic Placeholder " + (otherMeanings.length + 1));
      }
      
      const options = [item.meaning, ...otherMeanings].sort(() => 0.5 - Math.random());
      
      return {
        id: item.id,
        word: item.word,
        meaning: item.meaning,
        options,
        correct: item.meaning
      };
    });

    setQuestions(quizItems);
    setAnswers(new Array(quizItems.length).fill(''));
    setCurrentIndex(0);
    setStartTime(Date.now());
    setStage('quiz');
    setTimeLeft(config.timePerQuestion);
    setShowReview(false);
    setCurrentResult(null);
  };

  useEffect(() => {
    if (stage === 'quiz') {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeout();
            return config.timePerQuestion;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [stage, currentIndex]);

  const handleTimeout = () => {
    const newAnswers = [...answers];
    newAnswers[currentIndex] = '';
    setAnswers(newAnswers);
    proceed();
  };

  const proceed = () => {
    setSelectedOption(null);
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setTimeLeft(config.timePerQuestion);
    } else {
      finishQuiz();
    }
  };

  const selectOption = (opt: string) => {
    if (selectedOption !== null) return;
    
    setSelectedOption(opt);
    const newAnswers = [...answers];
    newAnswers[currentIndex] = opt;
    setAnswers(newAnswers);
    
    setTimeout(proceed, 600);
  };

  const finishQuiz = async () => {
    clearInterval(timerRef.current);
    const duration = Math.round((Date.now() - startTime) / 1000);
    setTotalTimeTaken(duration);
    
    const scoreVal = answers.reduce((acc, curr, idx) => curr === questions[idx].correct ? acc + 1 : acc, 0);
    
    const result: TestResult = {
      id: crypto.randomUUID(),
      score: (scoreVal / questions.length) * 100,
      total: questions.length,
      correctAnswers: scoreVal,
      wrongAnswers: questions.length - scoreVal,
      date: Date.now()
    };

    setCurrentResult(result);
    
    if (user) {
      const { error } = await supabase
        .from('test_results')
        .insert([{
          user_id: user.id,
          score: result.score,
          total: result.total,
          correct_answers: result.correctAnswers,
          wrong_answers: result.wrongAnswers,
          date: result.date
        }]);

      if (error) {
        console.error('Error saving test result:', error);
      }
    }

    setStage('result');
  };

  const handleDownloadCertificate = async () => {
    const element = document.getElementById('test-certificate-element');
    if (!element || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(element, { 
        quality: 1.0, 
        pixelRatio: 2,
        cacheBust: true
      });
      const link = document.createElement('a');
      link.download = `linguistai-achievement-${user?.name || 'scholar'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Export failed', err);
    } finally {
      setIsExporting(false);
    }
  };

  const cardWidth = 600;
  const padding = 32;
  const scale = Math.min(1, (windowWidth - padding) / cardWidth);

  if (stage === 'setup') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl bg-white dark:bg-slate-900/40 border border-slate-200 dark:border-white/5 rounded-[3rem] p-8 sm:p-16 shadow-2xl backdrop-blur-3xl relative overflow-hidden"
        >
          <div className="relative z-10 space-y-10">
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-indigo-600/10 rounded-3xl flex items-center justify-center mx-auto border border-indigo-500/20 text-indigo-500 mb-6">
                <BrainCircuit size={40} />
              </div>
              <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase">Proficiency Test</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Linguistic validation protocol.</p>
            </div>
            {isLowVocab && (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="p-6 rounded-3xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-4">
                <AlertTriangle className="text-amber-500 shrink-0 mt-1" size={20} />
                <div className="space-y-1 text-sm">
                  <h4 className="font-black text-amber-600 uppercase tracking-widest text-[10px]">Low Inventory</h4>
                  <p className="text-amber-900/70 dark:text-amber-200/70">Requires <span className="font-black">5 words</span> to initialize. Add more units.</p>
                </div>
              </motion.div>
            )}
            <div className="space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Session Magnitude</label>
                  <span className="text-xl font-black text-indigo-600 dark:text-indigo-400">{config.count} <span className="text-[10px] uppercase opacity-50">Units</span></span>
                </div>
                <input type="range" min="5" max={Math.max(5, Math.min(vocab.length, 100))} step="1" disabled={isLowVocab} value={config.count} onChange={e => setConfig(prev => ({ ...prev, count: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-600" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-end px-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-indigo-500">Temporal Limit</label>
                  <span className="text-xl font-black text-slate-900 dark:text-white">{config.timePerQuestion}s <span className="text-[10px] uppercase opacity-50">/ Word</span></span>
                </div>
                <input type="range" min="5" max="30" step="5" disabled={isLowVocab} value={config.timePerQuestion} onChange={e => setConfig(prev => ({ ...prev, timePerQuestion: parseInt(e.target.value) }))} className="w-full h-2 bg-slate-100 dark:bg-white/10 rounded-full appearance-none cursor-pointer accent-indigo-600" />
              </div>
            </div>
            <motion.button whileHover={!isLowVocab ? { scale: 1.02 } : {}} whileActive={!isLowVocab ? { scale: 0.98 } : {}} disabled={isLowVocab} onClick={startQuiz} className={`w-full py-5 rounded-3xl font-black text-lg flex items-center justify-center gap-3 transition-all ${isLowVocab ? 'bg-slate-100 text-slate-400 cursor-not-allowed' : 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/30'}`}>
              Start Assessment
              <ChevronRight size={20} />
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  if (stage === 'quiz') {
    const q = questions[currentIndex];
    const progress = ((currentIndex + 1) / questions.length) * 100;
    return (
      <div className="max-w-4xl mx-auto pt-8 pb-20 px-4">
        <div className="mb-8 space-y-4">
          <div className="flex justify-between items-end">
             <div className="space-y-1">
               <p className="text-[9px] font-black uppercase tracking-widest text-indigo-500">Linguistic Stream</p>
               <h3 className="text-xl font-black text-slate-900 dark:text-white">{currentIndex + 1} / {questions.length}</h3>
             </div>
             <div className={`flex items-center gap-2 font-mono text-xl font-black ${timeLeft < 5 ? 'text-red-500 animate-pulse' : 'text-slate-900 dark:text-white'}`}>
               <Timer size={18} /> {timeLeft}s
             </div>
          </div>
          <div className="h-1.5 w-full bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
            <motion.div className="h-full bg-indigo-600" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div key={currentIndex} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl border dark:border-white/5 p-8 sm:p-16 rounded-[3rem] shadow-2xl relative z-10 text-center">
             <div className="space-y-10">
               <div className="space-y-2">
                 <span className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 block">Target Unit</span>
                 <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter">{q.word}</h2>
               </div>
               <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {q.options.map((opt, idx) => (
                   <button key={idx} onClick={() => selectOption(opt)} disabled={selectedOption !== null} className={`p-6 rounded-[1.5rem] border-2 text-lg font-bold transition-all ${selectedOption === opt ? (opt === q.correct ? 'bg-green-500 border-green-500 text-white shadow-xl' : 'bg-red-500 border-red-500 text-white shadow-xl') : 'bg-slate-50 dark:bg-white/5 border-transparent text-slate-700 dark:text-slate-300 hover:border-indigo-500/30 font-bangla'}`}>
                     {opt}
                   </button>
                 ))}
               </div>
             </div>
          </motion.div>
        </AnimatePresence>
      </div>
    );
  }

  const finalScore = answers.reduce((acc, curr, idx) => curr === questions[idx].correct ? acc + 1 : acc, 0);
  const percentage = Math.round((finalScore / questions.length) * 100);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white dark:bg-slate-900/40 border dark:border-white/5 p-8 sm:p-16 rounded-[3rem] shadow-2xl text-center relative overflow-hidden">
        <div className="space-y-8 relative z-10">
          <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center mx-auto border border-amber-500/20 shadow-xl"><Trophy size={40} className="text-amber-500" /></div>
          <div className="space-y-2">
            <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Validation Complete</h1>
            <p className="text-slate-500 font-medium">Metrics aggregated for achievement verification.</p>
          </div>
          <div className="text-7xl sm:text-8xl font-black text-indigo-600 tracking-tighter tabular-nums drop-shadow-2xl">{percentage}%</div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             <Metric label="Mastered" value={finalScore} color="text-green-500" bg="bg-green-500/10" />
             <Metric label="Missed" value={questions.length - finalScore} color="text-red-500" bg="bg-red-500/10" />
             <Metric label="Score" value={`${finalScore}/${questions.length}`} color="text-indigo-500" bg="bg-indigo-500/10" />
             <Metric label="Time" value={`${totalTimeTaken}s`} color="text-amber-500" bg="bg-amber-500/10" />
          </div>
          <div className="flex flex-col sm:flex-row gap-4">
             <button onClick={() => setShowCertificateModal(true)} className="flex-1 py-4 rounded-2xl bg-indigo-600/10 text-indigo-600 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 border border-indigo-500/20"><Share2 size={16} /> Achievement Card</button>
             <button onClick={() => setStage('setup')} className="flex-1 py-4 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2"><RefreshCcw size={16} /> Recalibrate</button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showCertificateModal && currentResult && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
             <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCertificateModal(false)} className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl" />
             <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="relative flex flex-col items-center gap-8 w-full">
                <div 
                  className="bg-white/5 p-1 rounded-[2.5rem] border border-white/10 shadow-2xl relative"
                  style={{ transform: `scale(${scale})`, transformOrigin: 'center', width: `${cardWidth}px`, height: '400px' }}
                >
                   <TestCertificate result={currentResult} userName={user?.name || 'Scholar'} />
                </div>
                <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm px-4">
                   <button onClick={handleDownloadCertificate} disabled={isExporting} className="flex-1 bg-white text-slate-950 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl">
                     {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                     Export PNG
                   </button>
                   <button onClick={() => setShowCertificateModal(false)} className="flex-1 bg-white/10 text-white border border-white/10 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest">Dismiss</button>
                </div>
             </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Metric = ({ label, value, color, bg }: any) => (
  <div className={`p-4 rounded-2xl ${bg} border dark:border-white/5`}>
    <div className={`text-xl font-black ${color}`}>{value}</div>
    <div className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{label}</div>
  </div>
);

export default Test;
