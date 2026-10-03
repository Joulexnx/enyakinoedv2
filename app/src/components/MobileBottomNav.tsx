import { useState } from 'react';

import {
  Home,
  Map,
  Activity,
  BookOpen,
  GraduationCap,
} from 'lucide-react';

interface MobileBottomNavProps {
  activeItem?: string;
}

const navItems = [
  {
    id: 'home',
    label: 'Ana Sayfa',
    icon: Home,
    action: 'home',
  },
  {
    id: 'map',
    label: 'Harita',
    icon: Map,
    action: 'map',
  },
  {
    id: 'devices',
    label: 'Cihazlar',
    icon: Activity,
    action: 'devices',
  },
  {
    id: 'info',
    label: 'Bilgi',
    icon: BookOpen,
    action: 'info',
  },
  {
    id: 'courses',
    label: 'Kurslar',
    icon: GraduationCap,
    action: 'courses',
  },
];

export function MobileBottomNav({
  activeItem = 'home',
}: MobileBottomNavProps) {

  const [currentItem, setCurrentItem] =
    useState(activeItem);

  const handleNavigation = (action: string) => {

    /* ANA SAYFA */
    if (action === 'home') {
      setCurrentItem('home');

      if (
        window.location.pathname !== '/' &&
        window.location.pathname !== ''
      ) {
        window.location.href = '/';
        return;
      }

      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });

      return;
    }

    /* HARİTA */
    if (action === 'map') {
      setCurrentItem('map');

      if (
        window.location.pathname !== '/' &&
        window.location.pathname !== ''
      ) {
        window.location.href = '/#oed-map';
        return;
      }

      const section =
        document.getElementById('oed-map');

      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }

      return;
    }

    /* CİHAZLAR */
    if (action === 'devices') {
      setCurrentItem('devices');

      if (
        window.location.pathname !== '/' &&
        window.location.pathname !== ''
      ) {
        window.location.href = '/#nearby-oed';
        return;
      }

      const section =
        document.getElementById('nearby-oed');

      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }

      return;
    }

    /* BİLGİ */
    if (action === 'info') {
      setCurrentItem('info');

      if (
        window.location.pathname !== '/' &&
        window.location.pathname !== ''
      ) {
        window.location.href = '/#information';
        return;
      }

      const section =
        document.getElementById('information');

      if (section) {
        section.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      }

      return;
    }

    /* KURSLAR */
    if (action === 'courses') {
      setCurrentItem('courses');

      if (
        window.location.pathname !==
        '/ilk-yardim-kurslari'
      ) {
        window.location.href =
          '/ilk-yardim-kurslari';
      }

      return;
    }
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-[70] sm:hidden"
      aria-label="Mobil navigasyon"
    >
      <div className="mx-2 mb-2">

        <div
          className="
            relative
            overflow-hidden
            rounded-2xl
            border
            border-white/[0.08]
            bg-[#0c1222]/[0.97]
            shadow-[0_-8px_35px_rgba(0,0,0,0.35)]
            backdrop-blur-xl
          "
        >

          {/* Üst parlama */}
          <div
            className="
              pointer-events-none
              absolute
              left-0
              right-0
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-white/15
              to-transparent
            "
          />

          <div className="grid grid-cols-5 h-[72px] px-1">

            {navItems.map((item) => {

              const Icon = item.icon;

              const isActive =
                currentItem === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    handleNavigation(
                      item.action
                    )
                  }
                  className="
                    relative
                    flex
                    flex-col
                    items-center
                    justify-center
                    gap-1
                    transition-all
                    duration-200
                    active:scale-95
                  "
                  aria-label={item.label}
                  aria-current={
                    isActive
                      ? 'page'
                      : undefined
                  }
                >

                  {/* Aktif arka plan */}
                  {isActive && (
                    <div
                      className="
                        absolute
                        top-1.5
                        w-12
                        h-8
                        rounded-xl
                        bg-blue-500/10
                      "
                    />
                  )}

                  {/* Aktif üst çizgi */}
                  {isActive && (
                    <div
                      className="
                        absolute
                        top-0.5
                        w-7
                        h-0.5
                        rounded-full
                        bg-blue-500
                        shadow-[0_0_10px_rgba(59,130,246,0.7)]
                      "
                    />
                  )}

                  {/* İkon */}
                  <div
                    className={`
                      relative
                      z-10
                      flex
                      items-center
                      justify-center
                      w-7
                      h-7
                      transition-all
                      duration-200
                      ${
                        isActive
                          ? 'text-blue-400'
                          : 'text-white/40'
                      }
                    `}
                  >
                    <Icon
                      className="w-[20px] h-[20px]"
                      strokeWidth={
                        isActive
                          ? 2.5
                          : 1.9
                      }
                    />
                  </div>

                  {/* Yazı */}
                  <span
                    className={`
                      relative
                      z-10
                      text-[9px]
                      font-semibold
                      leading-none
                      transition-colors
                      duration-200
                      ${
                        isActive
                          ? 'text-blue-400'
                          : 'text-white/40'
                      }
                    `}
                  >
                    {item.label}
                  </span>

                </button>
              );
            })}

          </div>

          {/* Telefon güvenli alanı */}
          <div
            className="
              h-[env(safe-area-inset-bottom)]
              bg-[#0c1222]
            "
          />

        </div>
      </div>
    </nav>
  );
}