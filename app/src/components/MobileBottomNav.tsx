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
    <>
      {/* SABİT MOBİL ALT MENÜ */}
      <nav
        className="
          fixed
          bottom-0
          left-0
          right-0
          z-[70]
          sm:hidden
        "
        aria-label="Mobil navigasyon"
      >
        <div className="mx-2 mb-2">
          <div
            className="
              relative
              overflow-hidden
              rounded-2xl
              border
              border-[#2a3040]
              bg-[#11141d]
              shadow-[0_-8px_35px_rgba(0,0,0,0.45)]
            "
          >
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
                      transition-transform
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
                    {/* SADECE AKTİF ÖĞENİN ARKA PLANI */}
                    {isActive && (
                      <div
                        className="
                          absolute
                          top-1.5
                          w-12
                          h-8
                          rounded-xl
                          bg-[#1d4ed8]/20
                        "
                      />
                    )}

                    {/* SADECE AKTİF ÖĞENİN ÜST ÇİZGİSİ */}
                    {isActive && (
                      <div
                        className="
                          absolute
                          top-0.5
                          w-7
                          h-0.5
                          rounded-full
                          bg-[#3b82f6]
                        "
                      />
                    )}

                    {/* İKON */}
                    <div
                      className={`
                        relative
                        z-10
                        flex
                        items-center
                        justify-center
                        w-7
                        h-7
                        transition-colors
                        duration-200
                        ${
                          isActive
                            ? 'text-[#3b82f6]'
                            : 'text-[#9ca6b8]'
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

                    {/* YAZI */}
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
                            ? 'text-[#3b82f6]'
                            : 'text-[#9ca6b8]'
                        }
                      `}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* TELEFON GÜVENLİ ALANI */}
            <div
              className="
                h-[env(safe-area-inset-bottom)]
                bg-[#11141d]
              "
            />
          </div>
        </div>
      </nav>

      {/* ALT MENÜ İÇİN SAYFA BOŞLUĞU
          İçeriğin barın altında kalmasını engeller */}
      <div
        className="
          h-[92px]
          sm:hidden
          pointer-events-none
        "
        aria-hidden="true"
      />
    </>
  );
}