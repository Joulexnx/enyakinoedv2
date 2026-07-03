import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Users, MapPin, ChevronDown, ChevronUp, WifiOff } from 'lucide-react';
import { trpc } from '@/providers/trpc';

interface VolunteersPanelProps {
  userLocation: { lat: number; lng: number } | null;
}

export function VolunteersPanel({ userLocation }: VolunteersPanelProps) {
  // localStorage'dan expanded state'i oku
  const [expanded, setExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem('volunteers-panel-expanded');
      return saved ? JSON.parse(saved) : true; // default acik
    } catch {
      return true;
    }
  });

  const lat = userLocation?.lat ?? 39.925533;
  const lng = userLocation?.lng ?? 32.866287;

  // Her zaman calissin (expanded'a bagli olmasin)
  const {
    data: nearbyVolunteers,
    isLoading,
    isError,
  } = trpc.volunteer.listNearby.useQuery(
    { lat, lng, radius: 1000 },
    { retry: 1, refetchInterval: 30000 } // Her 30sn'de bir yenile
  );

  const { data: volunteerCount } = trpc.volunteer.count.useQuery(undefined, {
    retry: 1,
    refetchInterval: 30000,
  });

  // expanded degistiginde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem('volunteers-panel-expanded', JSON.stringify(expanded));
  }, [expanded]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
      className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6"
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[var(--bg-card)] shadow-md hover:shadow-lg transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-green-light)] flex items-center justify-center">
            <Users className="w-5 h-5 text-[var(--accent-green)]" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Gonullu Ilk Yardimcilar
            </h3>
            <p className="text-xs text-[var(--text-muted)]">
              {isError
                ? 'Baglanti hatasi'
                : volunteerCount !== undefined
                  ? `${volunteerCount} kayitli gonullu`
                  : 'Yukleniyor...'}
              {nearbyVolunteers !== undefined && ` — ${nearbyVolunteers.length} kisi yakinizda`}
            </p>
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-5 h-5 text-[var(--text-muted)]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[var(--text-muted)]" />
        )}
      </button>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="mt-3 bg-white dark:bg-[var(--bg-card)] rounded-xl shadow-md overflow-hidden"
        >
          {isError ? (
            <div className="p-8 text-center">
              <WifiOff className="w-10 h-10 text-[var(--accent-amber)] mx-auto mb-2 opacity-60" />
              <p className="text-sm font-medium text-[var(--text-primary)]">
                Baglanti kurulamadi
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Lutfen internet baglantinizi kontrol edin.
              </p>
            </div>
          ) : isLoading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-[var(--accent-green)] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-sm text-[var(--text-muted)] mt-2">Yukleniyor...</p>
            </div>
          ) : nearbyVolunteers && nearbyVolunteers.length > 0 ? (
            <div className="divide-y divide-[var(--border-subtle)] max-h-64 overflow-y-auto custom-scrollbar">
              {nearbyVolunteers.map((v) => (
                <div
                  key={v.id}
                  className="flex items-center gap-3 p-4 hover:bg-[var(--bg-primary)] dark:hover:bg-[#0D0F18] transition-colors"
                >
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-green-light)] flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-[var(--accent-green)]">
                      {v.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{v.name}</p>
                    <p className="text-xs text-[var(--text-muted)]">
                      <MapPin className="w-3 h-3 inline mr-1" />
                      {v.distance < 1000 ? `${v.distance}m` : `${(v.distance / 1000).toFixed(1)}km`} uzaklikta
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Users className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2 opacity-40" />
              <p className="text-sm text-[var(--text-muted)]">
                1km icinde kayitli gonullu bulunamadi.
              </p>
              <p className="text-xs text-[var(--text-muted)] mt-1">
                Ilk gonullu olmak ister misiniz?
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
