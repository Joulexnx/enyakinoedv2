import { motion } from 'framer-motion';
import { Navigation, AlertTriangle } from 'lucide-react';
import type { OEDLocation } from '@/types';

interface OEDCardProps {
  oed: OEDLocation;
  index: number;
}

export function OEDLocationCard({ oed, index }: OEDCardProps) {
  const isAvailable = oed.status === 'available';
  const statusColor = isAvailable
    ? 'bg-[var(--accent-green)]'
    : oed.status === 'in-use'
      ? 'bg-[var(--accent-amber)]'
      : 'bg-[var(--text-muted)]';

  const statusText = isAvailable ? 'Müsait' : oed.status === 'in-use' ? 'Kullanımda' : 'Bilinmiyor';

  const formatDistance = (d?: number) => {
    if (!d) return '';
    if (d < 1000) return `${d}m`;
    return `${(d / 1000).toFixed(1)}km`;
  };

  const handleDirections = () => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${oed.lat},${oed.lng}`, '_blank');
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -15 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.4,
        delay: index * 0.08,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      }}
      className="bg-[var(--bg-card)] rounded-xl p-4 shadow-sm hover:shadow-md border-l-[3px] border-l-transparent hover:border-l-[var(--accent-blue)] transition-all duration-200"
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-1">
            <span
              className={`block w-2.5 h-2.5 rounded-full ${statusColor} ${
                isAvailable ? 'status-pulse' : ''
              }`}
            />
          </div>

          <div>
            <h4 className="text-sm font-semibold text-[var(--text-primary)]">
              {oed.name}
            </h4>

            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {oed.address}
            </p>

            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {oed.hours}
            </p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          {oed.distance !== undefined && (
            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--accent-blue-light)] text-[var(--accent-blue)]">
              {formatDistance(oed.distance)}
            </span>
          )}

          <span
            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
              isAvailable
                ? 'bg-[var(--accent-green-light)] text-[var(--accent-green)]'
                : 'bg-[var(--accent-amber-light)] text-[var(--accent-amber)]'
            }`}
          >
            {statusText}
          </span>
        </div>
      </div>

      {oed.note && (
        <div className="mt-3 rounded-lg border border-[var(--accent-amber)]/25 bg-[var(--accent-amber)]/10 px-3 py-2.5">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-[var(--accent-amber)]" />
            <p className="text-xs leading-relaxed text-[var(--text-primary)]">
              {oed.note}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-center gap-3 mt-3 pt-3 border-t border-[var(--border-subtle)]">
        <button
          onClick={handleDirections}
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent-blue)] hover:underline"
        >
          <Navigation className="w-3.5 h-3.5" />
          Yol Tarifi
        </button>
      </div>
    </motion.div>
  );
}