import { motion } from 'framer-motion';
import {
  MapPin,
  Siren,
  HeartHandshake,
  LockKeyhole,
} from 'lucide-react';

interface HeroSectionProps {
  onRequestLocation: () => void;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const itemVariants = {
  hidden: {
    opacity: 0,
    y: 20,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
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
    },
  },
};

export function HeroSection({
  onRequestLocation,
}: HeroSectionProps) {
  return (
    <section className="pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* SOL TARAF */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 max-w-xl"
          >

            {/* BAŞLIK */}
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[var(--text-primary)] leading-[1.15] tracking-tight"
            >
              Hayat Kurtarmak İçin{' '}
              <span className="text-[var(--accent-red)]">
                Saniyeler İçinde
              </span>{' '}
              OED Bulun
            </motion.h1>

            {/* AÇIKLAMA */}
            <motion.p
              variants={itemVariants}
              className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed"
            >
              Türkiye'de ani kalp durması durumunda size en yakın
              otomatik eksternal defibrilatörü (OED) kolayca bulun.
            </motion.p>

            {/* AKSİYONLAR */}
            <motion.div
              variants={itemVariants}
              className="mt-8 flex flex-wrap items-stretch gap-3"
            >

              {/* KONUM */}
              <button
                onClick={onRequestLocation}
                className="flex items-center justify-center gap-2.5 px-7 py-4 rounded-xl bg-[var(--accent-blue)] text-white text-base font-semibold shadow-glow-blue hover:bg-[var(--accent-blue-hover)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <MapPin className="w-5 h-5" />

                <span>
                  Konumumu Kullan
                </span>
              </button>

              {/* ACİL YARDIM */}
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] cursor-not-allowed min-w-[165px]"
                aria-disabled="true"
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--accent-red-light)] flex items-center justify-center flex-shrink-0">
                  <Siren className="w-4 h-4 text-[var(--accent-red)]" />
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">
                    Acil Yardım
                  </span>

                  <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] mt-0.5">
                    <LockKeyhole className="w-3 h-3" />
                    Yakında Aktif
                  </span>
                </div>
              </div>

              {/* GÖNÜLLÜ */}
              <div
                className="flex items-center gap-2.5 px-4 py-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)] text-[var(--text-secondary)] cursor-not-allowed min-w-[165px]"
                aria-disabled="true"
              >
                <div className="w-9 h-9 rounded-lg bg-[var(--accent-green-light)] flex items-center justify-center flex-shrink-0">
                  <HeartHandshake className="w-4 h-4 text-[var(--accent-green)]" />
                </div>

                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">
                    Gönüllü Ol
                  </span>

                  <span className="flex items-center gap-1 text-[10px] text-[var(--text-muted)] mt-0.5">
                    <LockKeyhole className="w-3 h-3" />
                    Yakında Aktif
                  </span>
                </div>
              </div>

            </motion.div>

            {/* İSTATİSTİKLER */}
            <motion.div
              variants={itemVariants}
              className="mt-6 flex flex-wrap items-center gap-5 sm:gap-8"
            >
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <span>🚨</span>
                7/24 Acil
              </span>

              <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <span>📍</span>
                 86 OED Noktası
              </span>

              <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <span>⚡</span>
                Anında Sonuç
              </span>
            </motion.div>

          </motion.div>

          {/* SAĞ TARAF - GÖRSEL */}
          <motion.div
            initial={{
              opacity: 0,
              scale: 0.95,
            }}
            animate={{
              opacity: 1,
              scale: 1,
            }}
            transition={{
              duration: 0.7,
              delay: 0.2,
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
            className="flex-shrink-0 w-full max-w-md lg:max-w-lg"
          >
            <img
              src="./hero-illustration.jpg"
              alt="OED konum illüstrasyonu"
              className="w-full h-auto rounded-2xl shadow-lg"
              loading="eager"
            />
          </motion.div>

        </div>
      </div>
    </section>
  );
}