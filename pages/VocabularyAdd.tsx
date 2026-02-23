
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Loader2, 
  ArrowLeft, 
  Volume2, 
  CheckCircle2, 
  Zap, 
  Plus, 
  Library,
  Target,
  BrainCircuit,
  Languages,
  X,
  Keyboard,
  RotateCcw
} from 'lucide-react';
import { Vocabulary } from '../types';
import { autoFillVocabulary, speakWord } from '../services/geminiService';
import { supabase } from '../services/supabase';

export default function VocabularyAdd() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [generating, setGenerating] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [totalSaved, setTotalSaved] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  const [formData, setFormData] = useState({
    word: '',
    meaning: '',
    example: ''
  });

  useEffect(() => {
    const fetchVocab = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('vocabularies')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching vocab:', error);
        return;
      }

      if (data) {
        setTotalSaved(data.length);
        if (id) {
          const wordToEdit = data.find(v => v.id === id);
          if (wordToEdit) {
            setFormData({
              word: wordToEdit.word,
              meaning: wordToEdit.meaning,
              example: wordToEdit.example || ''
            });
          }
        }
      }
    };

    fetchVocab();
  }, [id]);

  const handleSpeak = async () => {
    if (!formData.word || speaking) return;
    setSpeaking(true);
    try {
      await speakWord(formData.word);
    } catch (err) {
      console.error(err);
    } finally {
      setSpeaking(false);
    }
  };

  const handleAutoFill = async () => {
    if (!formData.word || generating) return;
    setGenerating(true);
    try {
      const data = await autoFillVocabulary(formData.word);
      setFormData(prev => ({
        ...prev,
        meaning: data.meaning,
        example: data.example
      }));
    } catch (err) {
      console.error("Auto-fill failed", err);
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.word || !formData.meaning) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in to save vocabulary.');
      return;
    }

    try {
      if (id) {
        const { error } = await supabase
          .from('vocabularies')
          .update({
            word: formData.word,
            meaning: formData.meaning,
            example: formData.example
          })
          .eq('id', id)
          .eq('user_id', user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('vocabularies')
          .insert([{
            user_id: user.id,
            word: formData.word,
            meaning: formData.meaning,
            example: formData.example,
            learned: false,
            created_at: Date.now()
          }]);

        if (error) throw error;
        setTotalSaved(prev => prev + 1);
      }

      setShowSuccessModal(true);
      
      if (!id) {
          setFormData({ word: '', meaning: '', example: '' });
      }
    } catch (error: any) {
      console.error('Error saving vocabulary:', error);
      alert('Failed to save vocabulary: ' + error.message);
    }
  };

  const clearForm = () => {
    setFormData({ word: '', meaning: '', example: '' });
  };

  const springConfig = { type: "spring", stiffness: 400, damping: 30 };

  return (
    <div className="w-full min-h-[85vh] flex flex-col items-center justify-start sm:justify-center py-6 sm:py-10 px-4 overflow-x-hidden">
      <div className="w-full max-w-lg relative">
        {/* Navigation & Counter */}
        <div className="flex justify-between items-center mb-8 px-1">
           <motion.button 
              whileHover={{ x: -2 }}
              whileActive={{ scale: 0.95 }}
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-indigo-500 transition-colors"
           >
              <ArrowLeft size={16} /> Back
           </motion.button>
           <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm">
              <Target size={14} className="text-indigo-500" />
              Vault Count: <span className="text-slate-900 dark:text-white ml-1 font-mono">{totalSaved}</span>
           </div>
        </div>

        {/* Command Center Card */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig}
          className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl rounded-[3rem] p-8 sm:p-12 shadow-[0_50px_100px_-30px_rgba(0,0,0,0.1)] dark:shadow-[0_50px_100px_-30px_rgba(0,0,0,0.6)] border border-slate-100 dark:border-white/5 relative overflow-hidden"
        >
          {/* Neural Activity Shimmer */}
          <AnimatePresence>
            {generating && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-indigo-600/5 pointer-events-none overflow-hidden"
              >
                <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-indigo-400/20 to-transparent animate-[shimmer_2s_infinite]" />
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-10 relative z-10">
            {/* Input 1: The Word */}
            <div className="space-y-4">
              <div className="flex justify-between items-center px-1">
                <label className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.3em] text-indigo-500">
                  <Keyboard size={14} /> Entry Term
                </label>
                {generating && (
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest animate-pulse">
                    <BrainCircuit size={12} /> Neural Processing
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="relative group">
                  <input
                    type="text"
                    required
                    autoFocus
                    value={formData.word}
                    onChange={e => setFormData(prev => ({ ...prev, word: e.target.value }))}
                    className="w-full bg-slate-50 dark:bg-white/5 text-3xl sm:text-4xl font-black text-slate-900 dark:text-white placeholder:text-slate-200 dark:placeholder:text-slate-800 outline-none border-2 border-transparent focus:border-indigo-500/40 focus:bg-white dark:focus:bg-white/10 rounded-3xl px-6 py-6 transition-all shadow-inner"
                    placeholder="Search..."
                  />
                  
                  <div className="absolute right-5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                    {formData.word && (
                      <button 
                        type="button"
                        onClick={() => setFormData(p => ({...p, word: ''}))}
                        className="p-2 text-slate-300 hover:text-red-500 transition-colors"
                      >
                        <X size={20} />
                      </button>
                    )}
                    <AnimatePresence>
                      {formData.word && (
                        <motion.button
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.8 }}
                          type="button"
                          onClick={handleSpeak}
                          className={`p-3 rounded-2xl transition-all shadow-lg ${speaking ? 'text-white bg-indigo-600 scale-110' : 'text-slate-400 bg-white dark:bg-white/5 hover:text-indigo-500 border border-slate-100 dark:border-white/10'}`}
                        >
                          {speaking ? <Loader2 size={20} className="animate-spin" /> : <Volume2 size={20} />}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
                
                <motion.button
                  type="button"
                  onClick={handleAutoFill}
                  disabled={generating || !formData.word}
                  whileHover={!generating && formData.word ? { scale: 1.02, y: -2 } : {}}
                  whileActive={!generating && formData.word ? { scale: 0.98 } : {}}
                  className={`w-full py-5 rounded-[2rem] font-black text-[12px] uppercase tracking-[0.25em] transition-all flex items-center justify-center gap-3 shadow-2xl ${
                    generating || !formData.word
                      ? 'bg-slate-100 dark:bg-white/5 text-slate-400 cursor-not-allowed border border-transparent' 
                      : 'bg-indigo-600 text-white border-indigo-500 shadow-indigo-600/30 hover:bg-indigo-500'
                  }`}
                >
                  {generating ? (
                    <><Loader2 size={18} className="animate-spin" /> Synaptic Sync...</>
                  ) : (
                    <><Sparkles size={18} /> Translate with AI</>
                  )}
                </motion.button>
              </div>
            </div>

            <div className="h-[2px] w-full bg-slate-50 dark:bg-white/5 rounded-full"></div>

            {/* Input 2: The Meaning */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 px-1">
                <Languages size={14} className="text-slate-400" />
                <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Linguistic Insight (Bangla)</label>
              </div>
              <div className="relative min-h-[80px]">
                <input
                  type="text"
                  required
                  value={formData.meaning}
                  onChange={e => setFormData(prev => ({ ...prev, meaning: e.target.value }))}
                  className="w-full px-7 py-5 rounded-[2rem] bg-slate-50 dark:bg-white/[0.03] border-2 border-transparent text-slate-900 dark:text-white font-bangla font-bold text-2xl sm:text-3xl focus:bg-white dark:focus:bg-white/10 focus:border-indigo-500/30 outline-none transition-all placeholder:text-slate-200 dark:placeholder:text-slate-800 shadow-inner"
                  placeholder="অটো-ফিল ব্যবহার করুন..."
                />
                {generating && <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[2px] rounded-[2rem] animate-pulse"></div>}
              </div>
            </div>

            {/* Input 3: The Example */}
            <div className="space-y-4">
              <label className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 ml-1">Example Usage</label>
              <div className="relative min-h-[140px]">
                <textarea
                  value={formData.example}
                  onChange={e => setFormData(prev => ({ ...prev, example: e.target.value }))}
                  className="w-full px-7 py-6 rounded-[2rem] bg-slate-50 dark:bg-white/[0.03] border-2 border-transparent text-slate-700 dark:text-slate-200 font-medium text-sm sm:text-base leading-relaxed min-h-[140px] focus:bg-white dark:focus:bg-white/10 focus:border-indigo-500/30 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-800 resize-none shadow-inner"
                  placeholder="Construct a contextual sentence..."
                />
                {generating && <div className="absolute inset-0 bg-indigo-500/5 backdrop-blur-[2px] rounded-[2rem] animate-pulse"></div>}
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02, y: -4 }}
                whileActive={{ scale: 0.98 }}
                className="flex-[3] bg-slate-900 dark:bg-indigo-600 text-white py-6 rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] transition-all shadow-2xl shadow-indigo-600/20 flex items-center justify-center gap-4 border border-white/5"
              >
                {id ? 'Sync Update' : 'Synchronize'}
                <Zap size={18} className="text-amber-400 fill-amber-400" />
              </motion.button>
              
              {!id && (
                <motion.button
                  type="button"
                  onClick={clearForm}
                  whileHover={{ scale: 1.05 }}
                  whileActive={{ scale: 0.95 }}
                  className="flex-1 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-[2.5rem] flex items-center justify-center border border-slate-200 dark:border-white/10 py-5 transition-all"
                >
                  <RotateCcw size={22} className="sm:hidden" />
                  <span className="hidden sm:inline text-[11px] font-black uppercase tracking-widest">Reset</span>
                </motion.button>
              )}
            </div>
          </form>
        </motion.div>
      </div>

      {/* Success Modal */}
      <AnimatePresence>
        {showSuccessModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowSuccessModal(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-2xl"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={springConfig}
              className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-[4rem] p-12 border border-slate-200 dark:border-white/10 text-center shadow-[0_40px_80px_-20px_rgba(0,0,0,0.5)]"
            >
              <div className="w-24 h-24 bg-green-500/10 rounded-[3rem] flex items-center justify-center mx-auto mb-10 border border-green-500/20 shadow-inner">
                <CheckCircle2 size={48} className="text-green-500" />
              </div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-tighter leading-none">Sync Confirmed</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-12 font-medium tracking-wide">Record successfully committed to your vault.</p>
              
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setShowSuccessModal(false)}
                  className="py-5 rounded-3xl bg-slate-100 dark:bg-white/5 text-[10px] font-black uppercase tracking-[0.2em] text-slate-900 dark:text-white hover:bg-slate-200 transition-all border border-transparent"
                >
                  <Plus size={16} className="inline mr-1" /> Again
                </button>
                <button
                  onClick={() => navigate('/read')}
                  className="py-5 rounded-3xl bg-indigo-600 text-white text-[10px] font-black uppercase tracking-[0.2em] shadow-xl shadow-indigo-600/30 hover:bg-indigo-500 transition-all"
                >
                  <Library size={16} className="inline mr-1" /> Library
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <style>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(50%); }
        }
      `}</style>
    </div>
  );
}
