import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  MapPin,
  ChevronDown,
  ChevronUp,
  WifiOff,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';

interface VolunteersPanelProps {
  userLocation: { lat: number; lng: number } | null;
}

interface Volunteer {
  id: number;
  name: string;
  lat: number;
  lng: number;
  updated_at: string | null;
}

interface NearbyVolunteer extends Volunteer {
  distance: number;
}

const DEFAULT_LOCATION = {
  lat: 39.925533,
  lng: 32.866287,
};

const RADIUS_METERS = 1000;

// 2 dakikadan eski konumları aktif kabul etmiyoruz.
const ACTIVE_WINDOW_MS = 2 * 60 * 1000;

function calculateDistance(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number
) {
  const R = 6371000;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export function VolunteersPanel({
  userLocation,
}: VolunteersPanelProps) {
  const [expanded, setExpanded] = useState(() => {
    try {
      const saved = localStorage.getItem(
        'volunteers-panel-expanded'
      );

      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  const [nearbyVolunteers, setNearbyVolunteers] = useState<
    NearbyVolunteer[]
  >([]);

  const [volunteerCount, setVolunteerCount] =
    useState<number>(0);

  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);

  const loadVolunteers = async () => {
    try {
      setIsError(false);

      const { data, error } = await supabase
        .from('volunteers')
        .select(
          'id, name, lat, lng, updated_at'
        );

      if (error) {
        throw error;
      }

      const volunteers =
        (data as Volunteer[]) || [];

      const now = Date.now();

      // Toplam kayıtlı gönüllü sayısı
      setVolunteerCount(volunteers.length);

      const location =
        userLocation || DEFAULT_LOCATION;

      const nearby = volunteers
        .filter((volunteer) => {
          if (
            typeof volunteer.lat !== 'number' ||
            typeof volunteer.lng !== 'number'
          ) {
            return false;
          }

          // Güncel konumu olmayan gönüllüyü aktif sayma
          if (!volunteer.updated_at) {
            return false;
          }

          const updatedAt = new Date(
            volunteer.updated_at
          ).getTime();

          return (
            now - updatedAt <= ACTIVE_WINDOW_MS
          );
        })
        .map((volunteer) => {
          const distance = calculateDistance(
            location.lat,
            location.lng,
            volunteer.lat,
            volunteer.lng
          );

          return {
            ...volunteer,
            distance,
          };
        })
        .filter(
          (volunteer) =>
            volunteer.distance <= RADIUS_METERS
        )
        .sort(
          (a, b) => a.distance - b.distance
        );

      setNearbyVolunteers(nearby);
    } catch (error) {
      console.error(
        'Gönüllüler yüklenemedi:',
        error
      );

      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Panel açık/kapalı durumunu kaydet
  useEffect(() => {
    localStorage.setItem(
      'volunteers-panel-expanded',
      JSON.stringify(expanded)
    );
  }, [expanded]);

  // Gönüllüleri 5 saniyede bir güncelle
  useEffect(() => {
    loadVolunteers();

    const interval = window.setInterval(() => {
      loadVolunteers();
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, [
    userLocation?.lat,
    userLocation?.lng,
  ]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{ once: true }}
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
      className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6"
    >
      <button
        onClick={() =>
          setExpanded(!expanded)
        }
        className="w-full flex items-center justify-between p-4 rounded-xl bg-white dark:bg-[var(--bg-card)] shadow-md hover:shadow-lg transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[var(--accent-green-light)] flex items-center justify-center">
            <Users className="w-5 h-5 text-[var(--accent-green)]" />
          </div>

          <div className="text-left">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              Gönüllü İlk Yardımcılar
            </h3>

            <p className="text-xs text-[var(--text-muted)]">
              {isError
                ? 'Bağlantı hatası'
                : `${volunteerCount} kayıtlı gönüllü`}
              {!isError &&
                ` — ${nearbyVolunteers.length} kişi yakınınızda`}
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
          initial={{
            height: 0,
            opacity: 0,
          }}
          animate={{
            height: 'auto',
            opacity: 1,
          }}
          transition={{ duration: 0.3 }}
          className="mt-3 bg-white dark:bg-[var(--bg-card)] rounded-xl shadow-md overflow-hidden"
        >
          {isError ? (
            <div className="p-8 text-center">
              <WifiOff className="w-10 h-10 text-[var(--accent-amber)] mx-auto mb-2 opacity-60" />

              <p className="text-sm font-medium text-[var(--text-primary)]">
                Bağlantı kurulamadı
              </p>

              <p className="text-xs text-[var(--text-muted)] mt-1">
                Lütfen internet bağlantınızı
                kontrol edin.
              </p>
            </div>
          ) : isLoading ? (
            <div className="p-8 text-center">
              <div className="w-6 h-6 border-2 border-[var(--accent-green)] border-t-transparent rounded-full animate-spin mx-auto" />

              <p className="text-sm text-[var(--text-muted)] mt-2">
                Yükleniyor...
              </p>
            </div>
          ) : nearbyVolunteers.length > 0 ? (
            <div className="divide-y divide-[var(--border-subtle)] max-h-64 overflow-y-auto custom-scrollbar">
              {nearbyVolunteers.map(
                (volunteer) => (
                  <div
                    key={volunteer.id}
                    className="flex items-center gap-3 p-4 hover:bg-[var(--bg-primary)] dark:hover:bg-[#0D0F18] transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-green-light)] flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold text-[var(--accent-green)]">
                        {volunteer.name
                          ?.charAt(0)
                          .toUpperCase()}
                      </span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--text-primary)] truncate">
                        {volunteer.name}
                      </p>

                      <p className="text-xs text-[var(--text-muted)]">
                        <MapPin className="w-3 h-3 inline mr-1" />

                        {volunteer.distance <
                        1000
                          ? `${volunteer.distance}m`
                          : `${(
                              volunteer.distance /
                              1000
                            ).toFixed(1)}km`}{' '}
                        uzaklıkta
                      </p>
                    </div>

                    <div className="w-2 h-2 rounded-full bg-[var(--accent-green)] animate-pulse" />
                  </div>
                )
              )}
            </div>
          ) : (
            <div className="p-8 text-center">
              <Users className="w-10 h-10 text-[var(--text-muted)] mx-auto mb-2 opacity-40" />

              <p className="text-sm text-[var(--text-muted)]">
                1 km içinde aktif gönüllü
                bulunamadı.
              </p>

              <p className="text-xs text-[var(--text-muted)] mt-1">
                İlk gönüllü olmak ister misiniz?
              </p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}
