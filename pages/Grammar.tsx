
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  ChevronDown, 
  ChevronUp, 
  Save, 
  X, 
  GraduationCap, 
  Share2, 
  Download, 
  Eye, 
  BookOpen,
  ArrowRight,
  Sparkles,
  Loader2,
  FileText,
  Search
} from 'lucide-react';
import { GrammarNote, User } from '../types';
import { toPng } from 'html-to-image';
import GrammarShareCard from '../components/GrammarShareCard';
import { exportToPdf } from '../utils/pdfExport';
import { supabase } from '../services/supabase';

const Grammar: React.FC = () => {
  const [notes, setNotes] = useState<GrammarNote[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ topic: '', formula: '', notes: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);
  
  // Detail Modal State
  const [selectedNote, setSelectedNote] = useState<GrammarNote | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  const [isExportingPdf, setIsExportingPdf] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchGrammar = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      setUser({
        id: user.id,
        name: user.user_metadata?.name || user.email?.split('@')[0] || 'User',
        email: user.email || ''
      });

      const { data, error } = await supabase
        .from('grammar_notes')
        .select('*')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching grammar:', error);
      } else if (data) {
        // Map created_at to createdAt for the frontend
        const mappedData = data.map(n => ({
          ...n,
          createdAt: n.created_at
        }));
        setNotes(mappedData);
      }
    };

    fetchGrammar();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be logged in to save grammar notes.');
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from('grammar_notes')
        .update({
          topic: formData.topic,
          formula: formData.formula,
          notes: formData.notes
        })
        .eq('id', editingId)
        .eq('user_id', user.id);

      if (error) {
        console.error('Error updating grammar:', error);
        alert('Failed to update grammar note.');
      } else {
        setNotes(notes.map(n => n.id === editingId ? { ...n, ...formData } : n));
        resetForm();
      }
    } else {
      const newNote = {
        user_id: user.id,
        topic: formData.topic,
        formula: formData.formula,
        notes: formData.notes,
        created_at: Date.now()
      };

      const { data, error } = await supabase
        .from('grammar_notes')
        .insert([newNote])
        .select();

      if (error) {
        console.error('Error adding grammar:', error);
        alert('Failed to add grammar note.');
      } else if (data) {
        const newNoteData = {
          ...data[0],
          createdAt: data[0].created_at
        };
        setNotes([...notes, newNoteData]);
        resetForm();
      }
    }
  };

  const resetForm = () => {
    setIsAdding(false);
    setEditingId(null);
    setFormData({ topic: '', formula: '', notes: '' });
  };

  const handleEdit = (note: GrammarNote) => {
    setFormData({ topic: note.topic, formula: note.formula, notes: note.notes });
    setEditingId(note.id);
    setIsAdding(true);
    setSelectedNote(null);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Delete this linguistic blueprint?")) {
      const { error } = await supabase
        .from('grammar_notes')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting grammar:', error);
        alert('Failed to delete grammar note.');
      } else {
        setNotes(notes.filter(n => n.id !== id));
        setSelectedNote(null);
      }
    }
  };

  const handleExport = async () => {
    const element = document.getElementById('grammar-share-element');
    if (!element || isExporting) return;
    setIsExporting(true);
    try {
      const dataUrl = await toPng(element, { 
        quality: 1.0, 
        pixelRatio: 2,
        cacheBust: true
      });
      
      if (navigator.share) {
        const blob = await (await fetch(dataUrl)).blob();
        const file = new File([blob], `grammar-${selectedNote?.topic || 'note'}.png`, { type: 'image/png' });
        try {
          await navigator.share({
            files: [file],
            title: `Grammar Insight: ${selectedNote?.topic}`,
            text: 'Check out this grammar logic from LinguistAI!'
          });
        } catch (err) {
          const link = document.createElement('a');
          link.download = `linguistai-grammar-${selectedNote?.topic || 'note'}.png`;
          link.href = dataUrl;
          link.click();
        }
      } else {
        const link = document.createElement('a');
        link.download = `linguistai-grammar-${selectedNote?.topic || 'note'}.png`;
        link.href = dataUrl;
        link.click();
      }
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      await exportToPdf('grammar', filteredNotes, user);
    } finally {
      setIsExportingPdf(false);
    }
  };

  const filteredNotes = notes.filter(n => 
    n.topic.toLowerCase().includes(searchTerm.toLowerCase()) || 
    n.notes.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const cardWidth = 600;
  const padding = 32;
  const scale = Math.min(1, (windowWidth - padding) / cardWidth);

  return (
    <div className="max-w-6xl mx-auto py-8 px-4 space-y-12">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter">Grammar Blueprint</h1>
          <div className="flex items-center gap-2">
             <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-[9px] font-black uppercase tracking-widest">{notes.length} Modules</span>
             <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Syntactic Mastery</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Query blueprints..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900 text-sm focus:ring-4 focus:ring-indigo-500/10 transition-all shadow-sm"
            />
          </div>
          <button 
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-white dark:bg-slate-800 text-slate-700 dark:text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-sm border border-slate-200 dark:border-white/5 hover:border-indigo-500/30 transition-all disabled:opacity-50"
          >
            {isExportingPdf ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} Export
          </button>
          <button 
            onClick={() => setIsAdding(true)}
            className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl"
          >
            <Plus size={16} /> Add Module
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-white dark:bg-slate-900/60 backdrop-blur-3xl p-6 sm:p-10 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-2xl relative overflow-hidden"
          >
            <div className="flex justify-between items-center mb-8 relative z-10">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {editingId ? 'Modify Intelligence' : 'Register Blueprint'}
              </h2>
              <button onClick={resetForm} className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors">
                <X size={20} className="text-slate-400" />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-indigo-500 ml-1">Logic Topic</label>
                  <input placeholder="Conditional Perfect" required className="w-full px-5 py-3 rounded-xl border dark:border-white/5 bg-slate-50 dark:bg-white/5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.topic} onChange={e => setFormData(p => ({ ...p, topic: e.target.value }))} />
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] font-black uppercase tracking-widest text-indigo-500 ml-1">Structural Syntax</label>
                  <input placeholder="If + Past Perf..." className="w-full px-5 py-3 rounded-xl border dark:border-white/5 bg-slate-50 dark:bg-white/5 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500/20" value={formData.formula} onChange={e => setFormData(p => ({ ...p, formula: e.target.value }))} />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase tracking-widest text-indigo-500 ml-1">Analysis & Notes</label>
                <textarea placeholder="Detailed rules..." required className="w-full px-5 py-4 rounded-2xl border dark:border-white/5 bg-slate-50 dark:bg-white/5 text-sm min-h-[120px] outline-none focus:ring-2 focus:ring-indigo-500/20 resize-none" value={formData.notes} onChange={e => setFormData(p => ({ ...p, notes: e.target.value }))} />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/20">
                <Save size={18} /> Commit Blueprint
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.map(note => (
          <motion.div key={note.id} layout className="group relative bg-white dark:bg-slate-900/40 p-6 sm:p-8 rounded-[2.5rem] border border-slate-200 dark:border-white/5 shadow-xl hover:shadow-2xl hover:border-indigo-500/30 transition-all duration-500 overflow-hidden">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity"><FileText size={64} className="text-indigo-500" /></div>
            <div className="space-y-4 relative z-10">
              <div className="space-y-1">
                <span className="text-[8px] font-black text-indigo-500 uppercase tracking-widest">Logic Module</span>
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase truncate">{note.topic}</h3>
              </div>
              <p className="text-slate-500 dark:text-slate-400 text-xs font-medium line-clamp-3 leading-relaxed">{note.notes}</p>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50 dark:border-white/5">
                <div className="flex gap-1">
                  <button onClick={() => handleEdit(note)} className="p-2.5 rounded-xl text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-all"><Edit2 size={14} /></button>
                  <button onClick={() => handleDelete(note.id)} className="p-2.5 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all"><Trash2 size={14} /></button>
                </div>
                <button onClick={() => setSelectedNote(note)} className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black text-[8px] uppercase tracking-widest flex items-center gap-2 transition-all">
                  <Eye size={12} /> View Card
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {selectedNote && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelectedNote(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-3xl"
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative flex flex-col items-center gap-8 w-full"
            >
              <div 
                className="bg-white/5 p-1 rounded-[2.5rem] border border-white/10 shadow-2xl relative"
                style={{ 
                  transform: `scale(${scale})`,
                  transformOrigin: 'center',
                  width: `${cardWidth}px`,
                  height: '450px' // Match GrammarShareCard min-h
                }}
              >
                <GrammarShareCard note={selectedNote} userName={user?.name || 'Scholar'} />
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm px-4">
                 <button onClick={handleExport} disabled={isExporting} className="flex-1 bg-white text-slate-950 px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-2xl active:scale-95 transition-all">
                   {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Share2 size={16} />}
                   Share Intel
                 </button>
                 <button onClick={() => setSelectedNote(null)} className="flex-1 bg-white/10 text-white border border-white/10 px-6 py-4 rounded-[1.5rem] font-black text-[10px] uppercase tracking-widest">
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

export default Grammar;
