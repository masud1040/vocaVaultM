
import React, { useState } from 'react';
import { Volume2, Loader2 } from 'lucide-react';
import { speakWord } from '../services/geminiService';

interface VoiceButtonProps {
  word: string;
  className?: string;
}

const VoiceButton: React.FC<VoiceButtonProps> = ({ word, className = "" }) => {
  const [loading, setLoading] = useState(false);

  const handleSpeak = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading) return;
    
    setLoading(true);
    try {
      await speakWord(word);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleSpeak}
      className={`p-2 rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors ${className}`}
      disabled={loading}
      title="Pronounce word"
    >
      {loading ? (
        <Loader2 size={18} className="animate-spin" />
      ) : (
        <Volume2 size={18} />
      )}
    </button>
  );
};

export default VoiceButton;
