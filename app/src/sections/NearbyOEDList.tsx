import { motion } from 'framer-motion';
import type { OEDLocation } from '@/types';
import { OEDLocationCard } from '@/components/OEDLocationCard';

interface NearbyOEDListProps {
  oedLocations: OEDLocation[];
}

export function NearbyOEDList({ oedLocations }: NearbyOEDListProps) {
  const displayedOEDs = oedLocations.slice(0, 5);

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-[var(--bg-card)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        >
          <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
            Yakınımdaki OED'ler
          </h2>
          <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">
            Size en yakın cihazlar sıralı olarak listeleniyor
          </p>
        </motion.div>

        <div className="mt-6 flex flex-col gap-3 max-h-[480px] overflow-y-auto custom-scrollbar pr-1">
          {displayedOEDs.map((oed, index) => (
            <OEDLocationCard key={oed.id} oed={oed} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
