
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  BookOpen, 
  Share2, 
  Download, 
  Layers,
  List as ListIcon,
  ChevronLeft,
  ChevronRight,
  Circle,
  Zap,
  Loader2,
  SortAsc,
  SortDesc,
  Filter,
  Check,
  AlignLeft,
  X,
  Copy
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Vocabulary, User } from '../types';
import VoiceButton from '../components/VoiceButton';
import ShareCard from '../components/ShareCard';
import { toPng } from 'html-to-image';

const HighlightText: React.FC<{ text: string; highlight: string }> = ({ text, highlight }) => {
  if (!highlight.trim()) return <>{text}</>;
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) => (
        regex.test(part) ? (
          <mark key={i} className="bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 rounded-sm px-0.5 no-underline font-inherit">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      ))}
    </>
  );
};

const VocabularyRead: React.FC = () => {
  const navigate = useNavigate();
  const [vocab, setVocab] = useState<Vocabulary[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'flashcard' | 'glossary'>('list');
  const [sortBy, setSortBy] = useState<'az' | 'za'>('az');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'mastered'>('all');
  const [shareWord, setShareWord] = useState<Vocabulary | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const [flashcardIdx, setFlashcardIdx] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('vocab') || '[]');
    setVocab(saved);
    const savedUser = JSON.parse(localStorage.getItem('auth_user') || 'null');
    setUser(savedUser);
  }, []);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this linguistic asset?")) {
      const updated = vocab.filter(v => v.id !== id);
      setVocab(updated);
      localStorage.setItem('vocab', JSON.stringify(updated));
    }
  };

  const toggleLearned = (id: string) => {
    const updated = vocab.map(v => v.id === id ? { ...v, learned: !v.learned } : v);
    setVocab(updated);
    localStorage.setItem('vocab', JSON.stringify(updated));
  };

  const filteredVocab = useMemo(() => {
    let filtered = vocab.filter(v => 
      v.word.toLowerCase().includes(searchTerm.toLowerCase()) || 
      v.meaning.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (statusFilter === 'active') filtered = filtered.filter(v => !v.learned);
    if (statusFilter === 'mastered') filtered = filtered.filter(v => v.learned);

    filtered.sort((a, b) => {
      const comparison = a.word.localeCompare(b.word);
      return sortBy === 'az' ? comparison : -comparison;
    });

    return filtered;
  }, [vocab, searchTerm, sortBy, statusFilter]);

  const groupedVocab = useMemo(() => {
    const groups: { [key: string]: Vocabulary[] } = {};
    filteredVocab.forEach(item => {
      const firstLetter = item.word[0].toUpperCase();
      if (!groups[firstLetter]) groups[firstLetter] = [];
      groups[firstLetter].push(item);
    });
    return groups;
  }, [filteredVocab]);

  const sortedGroupKeys = useMemo(() => {
    const keys = Object.keys(groupedVocab);
    return sortBy === 'az' ? keys.sort() : keys.sort().reverse();
  }, [groupedVocab, sortBy]);

  const downloadShareCard = async () => {
    const element = document.getElementById('premium-card-element');
    if (!element || isDownloading) return;
    setIsDownloading(true);
    try {
      const dataUrl = await toPng(element, { 
        quality: 1.0, 
        pixelRatio: 2,
        cacheBust: true 
      });
      const link = document.createElement('a');
      link.download = `linguistai-${shareWord?.word || 'word'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Download failed', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const cardWidth = 500;
  const padding = 32;
  const scale = Math.min(1, (windowWidth - padding) / cardWidth);

  return (
    <div className="space-y-8 pb-20 max-w-7xl mx-auto px-4">
      {/* Dynamic Header */}
      <div className="flex flex-col lg:flex-row gap-6 justify-between items-start lg:items-center no-print">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Library Vault</h1>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded-md bg-indigo-500 text-white text-[10px] font-black uppercase tracking-widest">{vocab.length} Units</span>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Total Assets Archived</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] lg:w-72">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Filter lexicon..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white outline-none focus:ring-4 focus:ring-indigo-500/10 text-sm font-medium transition-all shadow-sm"
            />
          </div>

          <div className="flex gap-2 p-1.5 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-white/5 shadow-inner">
             <button 
                onClick={() => setSortBy(sortBy === 'az' ? 'za' : 'az')}
                className="p-2.5 rounded-xl bg-white dark:bg-slate-700 text-slate-700 dark:text-white shadow-sm border border-slate-100 dark:border-white/5 hover:scale-105 active:scale-95 transition-all"
                title={sortBy === 'az' ? 'Sort Z-A' : 'Sort A-Z'}
             >
                {sortBy === 'az' ? <SortAsc size={20} /> : <SortDesc size={20} />}
             </button>
             <div className="h-full w-[1px] bg-slate-200 dark:bg-white/10 mx-1"></div>
             <div className="flex items-center gap-1">
               {(['all', 'active', 'mastered'] as const).map((s) => (
                 <button
                   key={s}
                   onClick={() => setStatusFilter(s)}
                   className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                     statusFilter === s 
                       ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                       : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                   }`}
                 >
                   {s}
                 </button>
               ))}
             </div>
          </div>

          <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-2xl border border-slate-200 dark:border-white/5">
            <button 
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500'}`}
            >
              <ListIcon size={16} /> List
            </button>
            <button 
              onClick={() => setViewMode('glossary')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'glossary' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500'}`}
            >
              <AlignLeft size={16} /> Glossary
            </button>
            <button 
              onClick={() => setViewMode('flashcard')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'flashcard' ? 'bg-white dark:bg-slate-700 text-indigo-600 shadow-md' : 'text-slate-500'}`}
            >
              <Layers size={16} /> Study
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div 
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="space-y-12 pt-4"
          >
            {sortedGroupKeys.length > 0 ? (
              sortedGroupKeys.map(letter => (
                <div key={letter} className="space-y-6">
                  <div className="sticky top-20 z-30 flex items-center gap-4 py-2">
                    <div className="w-14 h-14 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 flex items-center justify-center shadow-lg backdrop-blur-xl">
                      <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{letter}</span>
                    </div>
                    <div className="h-[2px] flex-1 bg-gradient-to-r from-slate-200 dark:from-white/10 to-transparent"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groupedVocab[letter].map((item) => (
                      <VocabCard 
                        key={item.id} 
                        item={item} 
                        searchTerm={searchTerm} 
                        onDelete={handleDelete} 
                        onToggle={toggleLearned} 
                        onShare={setShareWord}
                        onCopy={handleCopy}
                        isCopied={copiedId === item.id}
                        onEdit={(id) => navigate(`/add/${id}`)}
                      />
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState />
            )}
          </motion.div>
        ) : viewMode === 'glossary' ? (
          <motion.div
            key="glossary"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="pt-4"
          >
            {filteredVocab.length > 0 ? (
              <div className="bg-white/60 dark:bg-slate-900/40 backdrop-blur-md rounded-[3rem] border border-slate-200 dark:border-white/5 overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 dark:border-white/5">
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-500">Term</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Bangla Meaning</th>
                        <th className="px-8 py-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-white/[0.03]">
                      {filteredVocab.map((item) => (
                        <tr key={item.id} className="group hover:bg-indigo-500/[0.02] transition-colors">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className={`w-2 h-2 rounded-full ${item.learned ? 'bg-green-500' : 'bg-indigo-500'}`} />
                              <span className={`text-lg font-black tracking-tight ${item.learned ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-white'}`}>
                                <HighlightText text={item.word} highlight={searchTerm} />
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-lg font-bold text-slate-600 dark:text-slate-300 font-bangla">
                              <HighlightText text={item.meaning} highlight={searchTerm} />
                            </span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleCopy(item.word, item.id)} 
                                className={`p-2 transition-all ${copiedId === item.id ? 'text-green-500' : 'text-slate-400 hover:text-indigo-600'}`}
                                title="Copy word"
                              >
                                {copiedId === item.id ? <Check size={16} /> : <Copy size={16} />}
                              </button>
                              <button onClick={() => setShareWord(item)} className="p-2 text-slate-400 hover:text-indigo-600"><Share2 size={16} /></button>
                              <VoiceButton word={item.word} className="p-2 hover:bg-white dark:hover:bg-white/10" />
                              <button onClick={() => navigate(`/add/${item.id}`)} className="p-2 text-slate-400 hover:text-indigo-600"><Edit2 size={16} /></button>
                              <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-300 hover:text-red-500"><Trash2 size={16} /></button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <EmptyState />
            )}
          </motion.div>
        ) : (
          <motion.div 
            key="flash"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="min-h-[60vh] flex flex-col items-center justify-center gap-10"
          >
             {vocab.length > 0 ? (
                <div className="w-full max-w-xl space-y-12 px-4">
                   <div className="h-2 w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        className="h-full bg-indigo-600 shadow-[0_0_15px_rgba(79,70,229,0.5)]"
                        animate={{ width: `${((flashcardIdx + 1) / vocab.length) * 100}%` }}
                      />
                   </div>
                   <div 
                     className="h-[380px] cursor-pointer relative group"
                     style={{ perspective: 1200 }}
                     onClick={() => setIsFlipped(!isFlipped)}
                   >
                      <motion.div
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ type: "spring", stiffness: 260, damping: 25 }}
                        style={{ transformStyle: 'preserve-3d' }}
                        className="w-full h-full relative"
                      >
                         <div className="absolute inset-0 bg-white dark:bg-slate-900 border-2 border-slate-100 dark:border-white/5 rounded-[4rem] flex flex-col items-center justify-center p-8 sm:p-12 shadow-2xl backface-hidden group-hover:border-indigo-500/30 transition-colors">
                            <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-8">Asset Analysis</span>
                            <h2 className="text-4xl sm:text-6xl font-black text-slate-900 dark:text-white tracking-tighter text-center">{vocab[flashcardIdx].word}</h2>
                            <div className="mt-12 px-6 py-2 rounded-full bg-slate-50 dark:bg-white/5 text-[9px] font-black uppercase tracking-[0.4em] text-slate-400 group-hover:text-indigo-500 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-500/10 transition-all">Tap to Reveal Meaning</div>
                         </div>
                         <div className="absolute inset-0 bg-indigo-600 dark:bg-indigo-900 rounded-[4rem] flex flex-col items-center justify-center p-8 sm:p-12 shadow-2xl backface-hidden rotate-y-180">
                            <p className="text-3xl sm:text-4xl font-black text-white font-bangla text-center leading-tight mb-8 drop-shadow-lg">{vocab[flashcardIdx].meaning}</p>
                            <div className="w-12 h-[2px] bg-white/20 mb-8 rounded-full"></div>
                            <p className="text-white/80 italic text-center text-xs sm:text-sm px-4 sm:px-6 leading-relaxed">"{vocab[flashcardIdx].example}"</p>
                            <div className="mt-12 flex items-center gap-4">
                               <VoiceButton word={vocab[flashcardIdx].word} className="bg-white/20 text-white hover:bg-white/30 p-4 sm:p-5 rounded-3xl" />
                            </div>
                         </div>
                      </motion.div>
                   </div>
                   <div className="flex items-center justify-center gap-6 sm:gap-10">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFlashcardIdx(Math.max(0, flashcardIdx - 1)); setIsFlipped(false); }}
                        disabled={flashcardIdx === 0}
                        className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-white/5 disabled:opacity-20 active:scale-90 transition-all text-slate-600 dark:text-white"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <div className="flex flex-col items-center">
                        <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">{flashcardIdx + 1}</span>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">of {vocab.length} Units</span>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFlashcardIdx(Math.min(vocab.length - 1, flashcardIdx + 1)); setIsFlipped(false); }}
                        disabled={flashcardIdx === vocab.length - 1}
                        className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-800 shadow-xl border border-slate-100 dark:border-white/5 disabled:opacity-20 active:scale-90 transition-all text-slate-600 dark:text-white"
                      >
                        <ChevronRight size={24} />
                      </button>
                   </div>
                </div>
             ) : (
                <div className="text-center p-20 border border-dashed border-slate-200 dark:border-slate-800 rounded-[3rem] text-slate-400 font-bold uppercase tracking-widest text-xs">No assets available for study.</div>
             )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Share Modal */}
      <AnimatePresence>
        {shareWord && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShareWord(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="relative flex flex-col items-center gap-8 w-full"
              style={{ maxHeight: '90vh' }}
            >
              <div 
                className="bg-white/5 p-1 rounded-[2.5rem] border border-white/10 shadow-2xl relative"
                style={{ 
                  transform: `scale(${scale})`,
                  transformOrigin: 'center',
                  width: `${cardWidth}px`,
                  height: '320px' // Match ShareCard min-h
                }}
              >
                <ShareCard vocabulary={shareWord} userName={user?.name || 'Scholar'} />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm px-4">
                <button 
                  onClick={downloadShareCard}
                  disabled={isDownloading}
                  className="flex-1 bg-white text-slate-950 px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all"
                >
                  {isDownloading ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                  Export Insight
                </button>
                <button 
                  onClick={() => setShareWord(null)}
                  className="flex-1 bg-white/10 text-white border border-white/10 px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest hover:bg-white/20 transition-all"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const EmptyState = () => (
  <div className="text-center py-20 bg-white/40 dark:bg-slate-900/40 rounded-[3rem] border border-dashed border-slate-200 dark:border-white/5 mx-4">
    <div className="w-16 h-16 bg-slate-50 dark:bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-6 text-slate-300">
      <BookOpen size={32} />
    </div>
    <h3 className="text-lg font-black text-slate-900 dark:text-white mb-2 uppercase tracking-tight">Empty Result</h3>
    <p className="text-slate-500 font-medium uppercase tracking-widest text-[9px]">Adjust your filters to see more units.</p>
  </div>
);

interface VocabCardProps {
  item: Vocabulary;
  searchTerm: string;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
  onShare: (v: Vocabulary) => void;
  onEdit: (id: string) => void;
  onCopy: (text: string, id: string) => void;
  isCopied: boolean;
}

const VocabCard: React.FC<VocabCardProps> = ({ item, searchTerm, onDelete, onToggle, onShare, onEdit, onCopy, isCopied }) => (
  <motion.div
    layout
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    className={`group p-6 sm:p-8 rounded-[2.5rem] border transition-all duration-500 relative flex flex-col justify-between overflow-hidden ${
      item.learned 
        ? 'bg-slate-50/60 dark:bg-slate-900/10 border-slate-100 dark:border-white/5 opacity-70 shadow-sm' 
        : 'bg-white dark:bg-slate-900 border-indigo-50/50 dark:border-white/5 shadow-xl hover:border-indigo-500/40 hover:shadow-2xl'
    }`}
  >
    <div className={`absolute top-0 left-0 w-1.5 h-full ${item.learned ? 'bg-green-500/50' : 'bg-indigo-500/30 group-hover:bg-indigo-500'} transition-all`}></div>
    <div className="flex justify-between items-start gap-4 mb-4">
      <div className="flex-1 space-y-1">
        <h3 className={`text-xl sm:text-2xl font-black tracking-tighter leading-none ${item.learned ? 'text-slate-500' : 'text-slate-900 dark:text-white'}`}>
          <HighlightText text={item.word} highlight={searchTerm} />
        </h3>
        <p className="text-indigo-600 dark:text-indigo-400 font-bold font-bangla text-lg sm:text-xl leading-snug">
          <HighlightText text={item.meaning} highlight={searchTerm} />
        </p>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <button 
          onClick={() => onToggle(item.id)}
          className={`p-3 rounded-2xl transition-all shadow-lg active:scale-90 ${
            item.learned ? 'bg-green-500 text-white' : 'bg-slate-50 dark:bg-white/5 text-slate-300 hover:text-green-500 border border-transparent'
          }`}
        >
          {item.learned ? <Check size={18} strokeWidth={3} /> : <Circle size={18} strokeWidth={2.5} />}
        </button>
        <VoiceButton word={item.word} className="bg-slate-50 dark:bg-white/5 p-3 rounded-2xl hover:bg-indigo-50 shadow-md" />
      </div>
    </div>
    <div className={`mb-6 flex-1 ${item.learned ? 'opacity-50' : ''}`}>
      <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 italic font-medium leading-relaxed line-clamp-2">
        "{item.example}"
      </p>
    </div>
    <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5 relative z-10">
      <div className="flex items-center gap-1">
        <button 
          onClick={() => onCopy(item.word, item.id)} 
          className={`p-2.5 rounded-xl transition-all ${isCopied ? 'text-green-500 bg-green-500/10' : 'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
          title="Copy word"
        >
          {isCopied ? <Check size={14} /> : <Copy size={14} />}
        </button>
        <button onClick={() => onEdit(item.id)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Edit2 size={14} /></button>
        <button onClick={() => onShare(item)} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"><Share2 size={14} /></button>
      </div>
      <button onClick={() => onDelete(item.id)} className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={14} /></button>
    </div>
    {item.learned && (
      <div className="absolute bottom-4 right-14 pointer-events-none">
        <div className="px-2 py-0.5 rounded-full bg-green-500/10 text-[8px] font-black text-green-600 uppercase tracking-widest border border-green-500/20">Archived</div>
      </div>
    )}
  </motion.div>
);

export default VocabularyRead;
