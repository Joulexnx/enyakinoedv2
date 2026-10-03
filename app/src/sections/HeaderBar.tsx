import { useState, useEffect } from 'react';
import {
  Phone,
  Moon,
  Sun,
  Menu,
  X,
  Home,
  Map,
  Activity,
  BookOpen,
  GraduationCap,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/hooks/useTheme';

export function HeaderBar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, {
      passive: true,
    });

    return () =>
      window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  const closeMenu = () => {
    setMenuOpen(false);
  };

  const goTo = (path: string) => {
    closeMenu();
    window.location.href = path;
  };

  const scrollToSection = (id: string) => {
    closeMenu();

    setTimeout(() => {
      const section = document.getElementById(id);

      if (!section) {
        return;
      }

      section.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  };

  return (
    <>
      {/* HEADER */}
      <motion.header
        initial={{
          y: -72,
          opacity: 0,
        }}
        animate={{
          y: 0,
          opacity: 1,
        }}
        transition={{
          duration: 0.5,
          ease: [
            0.22,
            1,
            0.36,
            1,
          ] as [
            number,
            number,
            number,
            number
          ],
        }}
        className={`fixed top-0 left-0 right-0 z-[60] h-[72px] flex items-center transition-all duration-300 ${
          scrolled
            ? 'bg-[#0b1020]/95 backdrop-blur-xl border-b border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.25)]'
            : 'bg-[#0b1020]/90 backdrop-blur-md border-b border-white/[0.05]'
        }`}
      >
        <div className="max-w-[1240px] mx-auto w-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">

          {/* LOGO */}
          <button
            type="button"
            onClick={() => goTo('/')}
            className="flex items-center gap-3 group"
            aria-label="En Yakın OED ana sayfa"
          >
            <div className="relative w-10 h-10 flex-shrink-0">
              <div className="absolute inset-0 rounded-[13px] bg-gradient-to-br from-red-500 to-red-600 shadow-[0_6px_20px_rgba(239,68,68,0.28)]" />

              <div className="absolute inset-[2px] rounded-[11px] bg-[#111827] flex items-center justify-center">
                <div className="relative">
                  <Activity
                    className="w-5 h-5 text-red-500"
                    strokeWidth={2.7}
                  />

                  <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white" />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start leading-none">
              <span className="text-[17px] sm:text-[18px] font-bold tracking-tight text-white">
                En Yakın OED
              </span>

              <span className="hidden sm:block mt-1 text-[10px] font-medium tracking-[0.16em] uppercase text-white/40">
                Ankara OED Haritası
              </span>
            </div>
          </button>

          {/* DESKTOP CENTER */}
          <div className="hidden lg:flex items-center">
            <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-white/[0.045] border border-white/[0.07]">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]" />

              <span className="text-xs font-medium text-white/60">
                OED konumlarını kolayca keşfedin
              </span>
            </div>
          </div>

          {/* RIGHT ACTIONS */}
          <div className="flex items-center gap-2">

            {/* THEME */}
            <button
              type="button"
              onClick={toggleTheme}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white/55 hover:text-white hover:bg-white/[0.07] border border-transparent hover:border-white/[0.06] transition-all duration-200"
              aria-label={
                theme === 'dark'
                  ? 'Aydınlık mod'
                  : 'Koyu mod'
              }
            >
              {theme === 'dark' ? (
                <Sun className="w-[18px] h-[18px]" />
              ) : (
                <Moon className="w-[18px] h-[18px]" />
              )}
            </button>

            {/* 112 */}
            <a
              href="tel:112"
              className="flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold shadow-[0_6px_20px_rgba(239,68,68,0.22)] hover:-translate-y-px active:translate-y-0 transition-all duration-200"
            >
              <Phone
                className="w-4 h-4"
                strokeWidth={2.5}
              />

              <span className="hidden sm:inline">
                112 Ara
              </span>

              <span className="sm:hidden">
                112
              </span>
            </a>

            {/* HAMBURGER */}
            <button
              type="button"
              onClick={() =>
                setMenuOpen((value) => !value)
              }
              className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 border ${
                menuOpen
                  ? 'bg-white text-[#0b1020] border-white'
                  : 'bg-white/[0.05] text-white border-white/[0.08] hover:bg-white/[0.09]'
              }`}
              aria-label={
                menuOpen
                  ? 'Menüyü kapat'
                  : 'Menüyü aç'
              }
              aria-expanded={menuOpen}
            >
              {menuOpen ? (
                <X
                  className="w-5 h-5"
                  strokeWidth={2.2}
                />
              ) : (
                <Menu
                  className="w-5 h-5"
                  strokeWidth={2.2}
                />
              )}
            </button>
          </div>
        </div>
      </motion.header>

      {/* MENU */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* OVERLAY */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeMenu}
              className="fixed inset-0 z-[55] bg-black/55 backdrop-blur-sm"
            />

            {/* PANEL */}
            <motion.aside
              initial={{
                x: '100%',
                opacity: 0,
              }}
              animate={{
                x: 0,
                opacity: 1,
              }}
              exit={{
                x: '100%',
                opacity: 0,
              }}
              transition={{
                duration: 0.35,
                ease: [
                  0.22,
                  1,
                  0.36,
                  1,
                ] as [
                  number,
                  number,
                  number,
                  number
                ],
              }}
              className="fixed top-0 right-0 bottom-0 z-[58] w-[min(390px,88vw)] bg-[#0c1222] border-l border-white/[0.08] shadow-[-20px_0_60px_rgba(0,0,0,0.35)]"
            >
              <div className="h-full flex flex-col">

                {/* PANEL HEADER */}
                <div className="h-[72px] px-5 sm:px-6 flex items-center justify-between border-b border-white/[0.07]">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/15 flex items-center justify-center">
                      <Activity
                        className="w-5 h-5 text-red-400"
                        strokeWidth={2.4}
                      />
                    </div>

                    <div>
                      <div className="text-sm font-bold text-white">
                        En Yakın OED
                      </div>

                      <div className="text-[10px] text-white/35 mt-0.5">
                        Menü
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closeMenu}
                    className="w-9 h-9 rounded-lg flex items-center justify-center text-white/45 hover:text-white hover:bg-white/[0.06] transition-all"
                    aria-label="Menüyü kapat"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* MENU ITEMS */}
                <nav className="flex-1 overflow-y-auto px-4 py-5">

                  <div className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                    Navigasyon
                  </div>

                  <div className="space-y-1">

                    {/* ANA SAYFA */}
                    <MenuItem
                      icon={
                        <Home className="w-[18px] h-[18px]" />
                      }
                      title="Ana Sayfa"
                      description="En Yakın OED ana sayfası"
                      onClick={() => goTo('/')}
                    />

                    {/* HARİTA */}
                    <MenuItem
                      icon={
                        <Map className="w-[18px] h-[18px]" />
                      }
                      title="OED Haritası"
                      description="Yakınınızdaki OED noktalarını keşfedin"
                      onClick={() =>
                        scrollToSection('oed-map')
                      }
                    />

                    {/* CİHAZLAR */}
                    <MenuItem
                      icon={
                        <Activity className="w-[18px] h-[18px]" />
                      }
                      title="Cihazlar"
                      description="OED noktalarını listeleyin"
                      onClick={() =>
                        scrollToSection('nearby-oed')
                      }
                    />

                    {/* BİLGİ */}
                    <MenuItem
                      icon={
                        <BookOpen className="w-[18px] h-[18px]" />
                      }
                      title="Bilgi"
                      description="OED ve ilk yardım hakkında"
                      onClick={() =>
                        scrollToSection('information')
                      }
                    />

                    {/* KURSLAR */}
                    <MenuItem
                      icon={
                        <GraduationCap className="w-[18px] h-[18px]" />
                      }
                      title="İlk Yardım Kursları"
                      description="İlk yardım eğitim merkezlerini keşfedin"
                      highlight
                      onClick={() =>
                        goTo('/ilk-yardim-kurslari')
                      }
                    />
                  </div>

                  <div className="my-6 h-px bg-white/[0.06]" />

                  {/* YASAL */}
                  <div className="px-3 mb-3 text-[10px] font-bold uppercase tracking-[0.16em] text-white/30">
                    Yasal
                  </div>

                  <MenuItem
                    icon={
                      <ShieldCheck className="w-[18px] h-[18px]" />
                    }
                    title="Gizlilik Politikası"
                    description="Veri ve gizlilik bilgilerimiz"
                    onClick={() =>
                      goTo('/gizlilik-politikasi')
                    }
                  />
                </nav>

                {/* PANEL FOOTER */}
                <div className="p-4 border-t border-white/[0.07]">
                  <div className="rounded-2xl bg-white/[0.035] border border-white/[0.06] p-4">
                    <div className="flex items-start gap-3">

                      <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center flex-shrink-0">
                        <Phone
                          className="w-4 h-4 text-red-400"
                          strokeWidth={2.4}
                        />
                      </div>

                      <div>
                        <div className="text-xs font-bold text-white">
                          Acil durumda
                        </div>

                        <div className="text-[11px] leading-relaxed text-white/40 mt-1">
                          Önce 112 Acil Çağrı
                          Merkezi'ni arayın.
                        </div>

                        <a
                          href="tel:112"
                          onClick={closeMenu}
                          className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors"
                        >
                          112'yi Ara
                          <ChevronRight className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

interface MenuItemProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  onClick: () => void;
  highlight?: boolean;
}

function MenuItem({
  icon,
  title,
  description,
  onClick,
  highlight = false,
}: MenuItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-3.5 p-3 rounded-xl text-left group transition-all duration-200 ${
        highlight
          ? 'bg-blue-500/[0.08] hover:bg-blue-500/[0.13] border border-blue-500/[0.10]'
          : 'hover:bg-white/[0.045] border border-transparent'
      }`}
    >
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${
          highlight
            ? 'bg-blue-500/10 text-blue-400'
            : 'bg-white/[0.045] text-white/50 group-hover:text-white group-hover:bg-white/[0.07]'
        }`}
      >
        {icon}
      </div>

      <div className="flex-1 min-w-0">
        <div
          className={`text-sm font-semibold ${
            highlight
              ? 'text-blue-300'
              : 'text-white/85'
          }`}
        >
          {title}
        </div>

        <div className="text-[10px] sm:text-[11px] text-white/35 mt-1 leading-snug">
          {description}
        </div>
      </div>

      <ChevronRight
        className={`w-4 h-4 flex-shrink-0 transition-transform group-hover:translate-x-0.5 ${
          highlight
            ? 'text-blue-400/60'
            : 'text-white/20'
        }`}
      />
    </button>
  );
}