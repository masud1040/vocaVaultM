
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  PlusCircle, 
  BookOpen, 
  ClipboardList, 
  GraduationCap, 
  Moon,
  Sun,
  Menu,
  X,
  LogOut
} from 'lucide-react';

import Dashboard from './pages/Dashboard';
import VocabularyAdd from './pages/VocabularyAdd';
import VocabularyRead from './pages/VocabularyRead';
import Test from './pages/Test';
import Grammar from './pages/Grammar';
import Login from './pages/Login';
import Landing from './pages/Landing';
import { Theme, User } from './types';
import { supabase } from './services/supabase';

const Navbar = ({ theme, toggleTheme, user, onLogout }: { 
  theme: Theme, 
  toggleTheme: () => void,
  user: User | null,
  onLogout: () => void
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  if (!user) return null;

  const links = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} /> },
    { name: 'Add', path: '/add', icon: <PlusCircle size={20} /> },
    { name: 'Library', path: '/read', icon: <BookOpen size={20} /> },
    { name: 'Test', path: '/test', icon: <ClipboardList size={20} /> },
    { name: 'Grammar', path: '/grammar', icon: <GraduationCap size={20} /> },
  ];

  return (
    <nav className="sticky top-0 z-[60] bg-white/60 dark:bg-[#050810]/60 backdrop-blur-xl border-b border-slate-200 dark:border-white/5 transition-all duration-300 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className="bg-indigo-600 p-2 rounded-xl text-white shadow-lg shadow-indigo-600/30">
                <BookOpen size={20} />
              </div>
              <span className="text-lg font-black text-slate-900 dark:text-white tracking-tighter">LinguistAI</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-1">
            {links.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  location.pathname === link.path
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                {link.icon}
                {link.name}
              </Link>
            ))}
            <div className="h-6 w-[1px] bg-slate-200 dark:bg-white/10 mx-2"></div>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileActive={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 transition-all border border-transparent dark:border-white/5"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} className="text-yellow-400" />}
            </motion.button>
            
            <button 
              onClick={onLogout}
              className="p-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all"
            >
              <LogOut size={18} />
            </button>
          </div>

          <div className="md:hidden flex items-center gap-2">
            <button onClick={toggleTheme} className="p-2 text-slate-600 dark:text-slate-400">
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} className="text-yellow-400" />}
            </button>
            <button onClick={() => setIsOpen(!isOpen)} className="p-2 text-slate-600 dark:text-slate-400">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="md:hidden bg-white/90 dark:bg-[#050810]/90 backdrop-blur-xl border-b border-slate-200 dark:border-white/5"
          >
            <div className="px-2 pt-2 pb-6 space-y-1">
              {links.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-black uppercase tracking-widest ${
                    location.pathname === link.path
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-300'
                  }`}
                >
                  {link.icon}
                  {link.name}
                </Link>
              ))}
              <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-500 font-black uppercase tracking-widest">
                <LogOut size={20} /> Logout
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const AnimatedRoutes = ({ user, handleLogin }: { user: User | null, handleLogin: (u: User) => void }) => {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.1 }}
        className="w-full h-full overflow-x-hidden"
      >
        <Routes location={location}>
          <Route path="/landing" element={!user ? <Landing /> : <Navigate to="/" replace />} />
          <Route path="/login" element={!user ? <Login onLogin={handleLogin} /> : <Navigate to="/" replace />} />
          <Route path="/" element={<ProtectedRoute user={user}><Dashboard /></ProtectedRoute>} />
          <Route path="/add" element={<ProtectedRoute user={user}><VocabularyAdd /></ProtectedRoute>} />
          <Route path="/add/:id" element={<ProtectedRoute user={user}><VocabularyAdd /></ProtectedRoute>} />
          <Route path="/read" element={<ProtectedRoute user={user}><VocabularyRead /></ProtectedRoute>} />
          <Route path="/test" element={<ProtectedRoute user={user}><Test /></ProtectedRoute>} />
          <Route path="/grammar" element={<ProtectedRoute user={user}><Grammar /></ProtectedRoute>} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
};

interface ProtectedRouteProps {
  user: User | null;
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ user, children }) => {
  if (!user) return <Navigate to="/landing" replace />;
  return <>{children}</>;
};

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved as Theme) || 'light';
  });
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const u: User = {
          id: session.user.id,
          name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
        };
        setUser(u);
        localStorage.setItem('auth_user', JSON.stringify(u));
      } else {
        setUser(null);
        localStorage.removeItem('auth_user');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');
  const handleLogin = (u: User) => setUser(u);
  const handleLogout = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('auth_user');
    setUser(null);
  };

  return (
    <HashRouter>
      <div className="min-h-screen transition-colors duration-300 overflow-x-hidden bg-transparent">
        <Navbar theme={theme} toggleTheme={toggleTheme} user={user} onLogout={handleLogout} />
        <main className={user ? "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6" : ""}>
          <AnimatedRoutes user={user} handleLogin={handleLogin} />
        </main>
      </div>
    </HashRouter>
  );
};

export default App;
