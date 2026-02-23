
import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Sparkles, 
  Volume2, 
  Trophy, 
  GraduationCap, 
  ArrowRight,
  Star
} from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
    }
  };

  const features = [
    {
      icon: <Sparkles className="text-amber-400" size={24} />,
      title: "AI Sentence Crafting",
      description: "Instantly generate natural, contextual sentences for any word using Gemini's advanced reasoning."
    },
    {
      icon: <Volume2 className="text-indigo-400" size={24} />,
      title: "Audio Immersion",
      description: "Master native pronunciation with high-fidelity text-to-speech for every vocabulary item."
    },
    {
      icon: <Trophy className="text-green-400" size={24} />,
      title: "Visual Mastery",
      description: "Track your fluency journey with beautiful interactive charts and automated retention testing."
    },
    {
      icon: <GraduationCap className="text-purple-400" size={24} />,
      title: "Digital Notebook",
      description: "A centralized, intelligent vault for your grammar rules, formulas, and linguistic patterns."
    }
  ];

  return (
    <div className="min-h-screen bg-[#050810] text-white selection:bg-indigo-500/30 overflow-x-hidden w-full relative">
      {/* Immersive Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 2 }}
          className="absolute top-[-10%] left-[-5%] w-[60%] h-[40%] bg-indigo-600/10 rounded-full blur-[80px] md:blur-[120px]"
        />
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 0.6, scale: 1 }}
          transition={{ duration: 2, delay: 0.5 }}
          className="absolute bottom-[5%] right-[-5%] w-[50%] h-[40%] bg-purple-600/10 rounded-full blur-[80px] md:blur-[120px]"
        />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
      >
        {/* Premium Header */}
        <header className="py-6 sm:py-10 flex justify-between items-center">
          <motion.div variants={itemVariants} className="flex items-center gap-2 sm:gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 p-2 rounded-lg sm:rounded-xl shadow-lg shadow-indigo-500/20">
              <BookOpen size={22} className="text-white" strokeWidth={2.5} />
            </div>
            <span className="text-xl sm:text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
              LinguistAI
            </span>
          </motion.div>
          <motion.div variants={itemVariants}>
            <button 
              onClick={() => navigate('/login')}
              className="px-4 py-2 sm:px-6 sm:py-2.5 rounded-full text-xs sm:text-sm font-bold border border-white/10 bg-white/5 hover:bg-white/10 transition-all backdrop-blur-md"
            >
              Sign In
            </button>
          </motion.div>
        </header>

        {/* Hero Section */}
        <section className="pt-12 pb-24 sm:pt-20 sm:pb-32 lg:pt-32 lg:pb-40 text-center max-w-5xl mx-auto">
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-indigo-500/10 text-indigo-300 text-[10px] sm:text-xs font-black uppercase tracking-[0.15em] sm:tracking-[0.2em] mb-6 sm:mb-10 border border-indigo-500/20 backdrop-blur-sm">
            <Star size={12} className="fill-indigo-400" /> New: Gemini 3 Integration
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl lg:text-8xl font-black mb-6 sm:mb-10 tracking-tighter leading-[1.1]">
            Master English. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              Beyond Words.
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-base sm:text-lg lg:text-xl text-slate-400 mb-10 sm:mb-16 leading-relaxed max-w-3xl mx-auto px-2 font-medium">
            Transform your vocabulary learning from a chore into a superpower. 
            Our AI-driven ecosystem bridges the gap between memorization and fluency.
          </motion.p>

          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 px-4 sm:px-0">
            <button 
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white px-8 sm:px-12 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] font-black text-lg sm:text-xl transition-all shadow-2xl shadow-indigo-600/30 flex items-center justify-center gap-3 sm:gap-4 group active:scale-[0.98]"
            >
              Begin Journey
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </button>
            
            <button 
              className="w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 rounded-2xl sm:rounded-[2rem] font-bold text-slate-300 border border-white/10 hover:bg-white/5 transition-all backdrop-blur-sm text-base sm:text-lg active:scale-[0.98]"
            >
              Showcase
            </button>
          </motion.div>
        </section>

        {/* Feature Showcase Grid */}
        <section className="py-16 sm:py-24 border-t border-white/5">
          <motion.div variants={containerVariants} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-10">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={itemVariants}
                whileHover={{ y: -5 }}
                className="group relative p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] bg-white/[0.03] border border-white/5 hover:border-indigo-500/30 transition-all duration-500"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent rounded-3xl sm:rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="relative z-10">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-2xl bg-white/[0.05] flex items-center justify-center mb-6 sm:mb-8 group-hover:scale-110 group-hover:bg-indigo-500/10 transition-all duration-500 shadow-inner">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg sm:text-2xl font-black mb-3 sm:mb-4 group-hover:text-indigo-300 transition-colors">{feature.title}</h3>
                  <p className="text-slate-500 leading-relaxed text-xs sm:text-sm font-medium group-hover:text-slate-400 transition-colors">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </section>

        {/* Footer */}
        <footer className="py-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8 opacity-40 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2 font-black text-xs sm:text-sm uppercase tracking-widest">
            <BookOpen size={16} /> LinguistAI
          </div>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8 text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Github</a>
          </div>
          <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
            © 2025 AI-First Learning
          </p>
        </footer>
      </motion.div>
    </div>
  );
};

export default Landing;
