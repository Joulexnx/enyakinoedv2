import { useState, useEffect } from 'react';
import { Phone, Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

export function HeaderBar() {
  const [scrolled, setScrolled] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -72, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className={`fixed top-0 left-0 right-0 z-50 h-[72px] flex items-center transition-all duration-300 ${
        scrolled
          ? 'bg-white/95 dark:bg-[#161823]/95 backdrop-blur-lg shadow-md dark:shadow-[0_4px_12px_rgba(0,0,0,0.3)]'
          : 'bg-white dark:bg-[#161823] shadow-sm dark:shadow-[0_1px_2px_rgba(0,0,0,0.2)]'
      }`}
    >
      <div className="max-w-[1200px] mx-auto w-full px-4 sm:px-6 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-[var(--accent-red)] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 7v10M7 12h10" />
            </svg>
          </div>
          <span className="text-lg font-semibold text-[var(--text-primary)] tracking-tight">
            En Yakın OED
          </span>
        </div>

        {/* Center badge - hidden on mobile */}
        <div className="hidden md:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[var(--accent-red-light)]">
          <span className="text-sm">&#x26A0;</span>
          <span className="text-xs font-medium text-[var(--accent-red)]">
            Acil durumda önce 112'yi arayın
          </span>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--border-subtle)] dark:hover:bg-[#1E2030] transition-all duration-200"
            aria-label={theme === 'dark' ? 'Aydınlık mod' : 'Koyu mod'}
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>

          <a
            href="tel:112"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent-red)] text-white text-sm font-semibold shadow-glow-red hover:bg-[var(--accent-red-hover)] hover:-translate-y-px active:translate-y-0 transition-all duration-200"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden sm:inline">112 Ara</span>
            <span className="sm:hidden">112</span>
          </a>
        </div>
      </div>
    </motion.header>
  );
}
