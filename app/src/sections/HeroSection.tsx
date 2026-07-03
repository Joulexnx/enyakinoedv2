import { motion } from 'framer-motion';
import { MapPin } from 'lucide-react';

interface HeroSectionProps {
  onRequestLocation: () => void;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
  },
};

export function HeroSection({ onRequestLocation }: HeroSectionProps) {
  return (
    <section className="pt-32 sm:pt-36 pb-12 sm:pb-16 px-4 sm:px-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex-1 max-w-xl"
          >
            <motion.h1
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-[2.75rem] font-bold text-[var(--text-primary)] leading-[1.15] tracking-tight"
            >
              Hayat Kurtarmak İçin{' '}
              <span className="text-[var(--accent-red)]">Saniyeler İçinde</span>{' '}
              OED Bulun
            </motion.h1>

            <motion.p
              variants={itemVariants}
              className="mt-4 text-base sm:text-lg text-[var(--text-secondary)] leading-relaxed"
            >
              Ankara'da ani kalp durması durumunda en yakın otomatik eksternal
              defibrilatörü (OED) anında bulun. 25 noktada hizmetinizdeyiz.
            </motion.p>

            <motion.div variants={itemVariants} className="mt-8">
              <button
                onClick={onRequestLocation}
                className="flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl bg-[var(--accent-blue)] text-white text-base font-semibold shadow-glow-blue hover:bg-[var(--accent-blue-hover)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200"
              >
                <MapPin className="w-5 h-5" />
                Konumumu Kullan
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6 flex flex-wrap items-center gap-5 sm:gap-8">
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <>&#x1F6A8;</> 7/24 Acil
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <>&#x1F4CD;</> 25 Nokta
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                <>&#x26A1;</> Anında Sonuç
              </span>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
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
