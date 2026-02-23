
import React, { useState } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { BookOpen, Mail, Lock, User as UserIcon, ArrowRight, Loader2 } from 'lucide-react';
import { User } from '../types';
import { supabase } from '../services/supabase';

interface LoginProps {
  onLogin: (user: User) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isLogin) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });
        
        if (error) throw error;
        
        if (data.user) {
          const user: User = {
            id: data.user.id,
            name: data.user.user_metadata?.name || formData.email.split('@')[0],
            email: data.user.email || formData.email,
          };
          localStorage.setItem('auth_user', JSON.stringify(user));
          onLogin(user);
        }
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              name: formData.name,
            }
          }
        });
        
        if (error) throw error;
        
        if (data.user) {
          const user: User = {
            id: data.user.id,
            name: formData.name || formData.email.split('@')[0],
            email: data.user.email || formData.email,
          };
          localStorage.setItem('auth_user', JSON.stringify(user));
          onLogin(user);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error.message);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
      });
      if (error) throw error;
      // The redirect will handle the actual login state
    } catch (error: any) {
      console.error('Google auth error:', error.message);
      alert(error.message);
      setGoogleLoading(false);
    }
  };

  // Animation Variants
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1],
        staggerChildren: 0.07,
        delayChildren: 0.1
      }
    }
  };

  const childVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" }
    }
  };

  const springTransition = {
    type: "spring",
    stiffness: 400,
    damping: 35,
    mass: 0.5
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-[#050810] relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-25%] left-[-15%] w-[80%] h-[80%] bg-indigo-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[70%] h-[70%] bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-technical-grid opacity-20" />
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-md relative z-10"
      >
        <LayoutGroup>
          <motion.div 
            layout
            className="bg-white/5 backdrop-blur-xl rounded-[3.5rem] border border-white/10 shadow-2xl overflow-hidden p-8 sm:p-12"
          >
            {/* Logo Area */}
            <motion.div layout variants={childVariants} className="flex flex-col items-center mb-10">
              <motion.div 
                layout
                whileHover={{ scale: 1.1, rotate: 5, boxShadow: "0 0 40px rgba(79, 70, 229, 0.4)" }}
                className="bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-[1.5rem] text-white mb-6 shadow-2xl relative group overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                <BookOpen size={36} strokeWidth={2.5} className="relative z-10" />
              </motion.div>
              
              <AnimatePresence mode="wait">
                <motion.div
                  key={isLogin ? 'login-header' : 'signup-header'}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="text-center"
                >
                  <h1 className="text-4xl font-black text-white tracking-tighter mb-2">
                    {isLogin ? 'Welcome Back' : 'Create Account'}
                  </h1>
                  <p className="text-indigo-400/60 text-xs font-black uppercase tracking-[0.3em]">
                    {isLogin ? 'Neural Sync Authorized' : 'Initialize Linguistic Core'}
                  </p>
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* Google Button */}
            <motion.div variants={childVariants}>
              <motion.button 
                layout
                onClick={handleGoogleLogin}
                disabled={googleLoading || loading}
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 1)" }}
                whileActive={{ scale: 0.98 }}
                className="w-full bg-white/95 text-slate-900 py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 transition-all mb-8 shadow-xl"
              >
                {googleLoading ? (
                  <Loader2 className="animate-spin text-indigo-600" size={20} />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#EA4335" d="M12 5.04c1.94 0 3.68.67 5.05 1.97l3.77-3.77C18.47 1.18 15.44 0 12 0 7.28 0 3.25 2.72 1.3 6.69l4.39 3.41C6.73 7.37 9.17 5.04 12 5.04z" />
                      <path fill="#4285F4" d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.28 1.47-1.11 2.72-2.36 3.56l4.39 3.41c2.57-2.37 4.05-5.85 4.05-9.21z" />
                      <path fill="#FBBC05" d="M5.69 14.74c-.25-.74-.39-1.54-.39-2.37s.14-1.63.39-2.37L1.3 6.69C.47 8.36 0 10.13 0 12s.47 3.64 1.3 5.31l4.39-3.41c-.2-.48-.34-1-.34-1.57z" />
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-4.39-3.41c-1.1.74-2.5 1.18-4.04 1.18-2.83 0-5.27-1.91-6.12-4.48L1.3 17.38C3.25 21.28 7.28 24 12 24z" />
                    </svg>
                    Google Authentication
                  </>
                )}
              </motion.button>
            </motion.div>

            {/* Separator */}
            <motion.div layout variants={childVariants} className="flex items-center gap-4 mb-8 opacity-20">
              <div className="h-[1px] flex-1 bg-white" />
              <span className="text-[10px] font-black uppercase tracking-widest text-white">OR</span>
              <div className="h-[1px] flex-1 bg-white" />
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode="popLayout">
                {!isLogin && (
                  <motion.div 
                    layout
                    initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                    animate={{ opacity: 1, height: "auto", marginBottom: 16 }}
                    exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                    transition={springTransition}
                    className="relative"
                  >
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                    <input 
                      type="text"
                      required={!isLogin}
                      placeholder="Display Name"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white/5 border border-white/5 text-white placeholder:text-white/20 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white/10 transition-all font-medium"
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div layout transition={springTransition} className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="email"
                  required
                  placeholder="Email address"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white/5 border border-white/5 text-white placeholder:text-white/20 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white/10 transition-all font-medium"
                />
              </motion.div>

              <motion.div layout transition={springTransition} className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                <input 
                  type="password"
                  required
                  placeholder="Secret Password"
                  value={formData.password}
                  onChange={e => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-14 pr-5 py-4 rounded-2xl bg-white/5 border border-white/5 text-white placeholder:text-white/20 outline-none focus:ring-2 focus:ring-indigo-500/30 focus:bg-white/10 transition-all font-medium"
                />
              </motion.div>

              <motion.div layout variants={childVariants}>
                <motion.button
                  layout
                  type="submit"
                  disabled={loading || googleLoading}
                  whileHover={{ scale: 1.02, boxShadow: "0 20px 40px -10px rgba(79, 70, 229, 0.4)" }}
                  whileActive={{ scale: 0.98 }}
                  className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-5 rounded-3xl font-black transition-all shadow-2xl mt-4 uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 border border-white/10 overflow-hidden relative group"
                >
                  <div className="absolute inset-0 bg-white/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300" />
                  {loading ? (
                    <Loader2 className="animate-spin" size={20} />
                  ) : (
                    <>
                      <span className="relative z-10">{isLogin ? 'Establish Connection' : 'Register Core'}</span>
                      <ArrowRight size={18} className="relative z-10 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Toggle Link */}
            <motion.div layout variants={childVariants} className="mt-12 pt-8 border-t border-white/5 text-center">
              <button 
                type="button"
                onClick={() => setIsLogin(!isLogin)}
                className="group text-white/30 hover:text-white text-[10px] font-black uppercase tracking-[0.2em] transition-all"
              >
                <span className="opacity-50">{isLogin ? "No access key?" : "Already registered?"}</span>{' '}
                <span className="text-indigo-400 group-hover:text-indigo-300 group-hover:underline underline-offset-4 transition-colors">
                  {isLogin ? "Generate Here" : "Login Now"}
                </span>
              </button>
            </motion.div>
          </motion.div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
};

export default Login;
