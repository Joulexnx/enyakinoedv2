import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Siren,
  X,
  Phone,
  Loader2,
  CheckCircle,
  AlertTriangle,
  MapPin,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface EmergencyCallButtonProps {
  userLocation: { lat: number; lng: number } | null;
}

interface VolunteerRow {
  id: string | number;
  name: string;
  lat: number | null;
  lng: number | null;
  player_id: string | null;
  updated_at: string | null;
}

interface NearbyVolunteer {
  id: string | number;
  name: string;
  distance: number;
  player_id: string | null;
}

interface EmergencyResult {
  notifiedCount: number;
  nearbyVolunteers: NearbyVolunteer[];
}

const RADIUS_METERS = 1000;
const ACTIVE_WINDOW_MS = 2 * 60 * 1000;

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadius = 6371000;

  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;

  return (
    earthRadius *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

export function EmergencyCallButton({
  userLocation,
}: EmergencyCallButtonProps) {
  const [showModal, setShowModal] = useState(false);

  const [nearbyVolunteers, setNearbyVolunteers] =
    useState<NearbyVolunteer[]>([]);

  const [isLoadingVolunteers, setIsLoadingVolunteers] =
    useState(false);

  const [isSending, setIsSending] = useState(false);

  const [result, setResult] =
    useState<EmergencyResult | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [swStatus, setSwStatus] =
    useState<string>('');

  const callerLat =
    userLocation?.lat ?? 39.925533;

  const callerLng =
    userLocation?.lng ?? 32.866287;

  const getNearbyVolunteers = async (): Promise<
    NearbyVolunteer[]
  > => {
    const { data, error } = await supabase
      .from('volunteers')
      .select(
        'id, name, lat, lng, player_id, updated_at'
      );

    if (error) {
      throw error;
    }

    const now = Date.now();

    return ((data ?? []) as VolunteerRow[])
      .filter((volunteer) => {
        if (
          volunteer.lat === null ||
          volunteer.lng === null ||
          !volunteer.updated_at
        ) {
          return false;
        }

        const updatedAt = new Date(
          volunteer.updated_at
        ).getTime();

        return (
          Number.isFinite(updatedAt) &&
          now - updatedAt <= ACTIVE_WINDOW_MS
        );
      })
      .map((volunteer) => ({
        ...volunteer,
        distance: calculateDistance(
          callerLat,
          callerLng,
          volunteer.lat as number,
          volunteer.lng as number
        ),
      }))
      .filter(
        (volunteer) =>
          volunteer.distance <= RADIUS_METERS
      )
      .sort(
        (a, b) =>
          a.distance - b.distance
      )
      .map((volunteer) => ({
        id: volunteer.id,
        name: volunteer.name,
        distance: Math.round(
          volunteer.distance
        ),
        player_id: volunteer.player_id,
      }));
  };

  const loadNearbyVolunteers = async () => {
    setIsLoadingVolunteers(true);
    setErrorMessage(null);

    try {
      const nearby =
        await getNearbyVolunteers();

      setNearbyVolunteers(nearby);
    } catch (error) {
      console.error(
        'Yakındaki gönüllüler alınamadı:',
        error
      );

      setNearbyVolunteers([]);

      setErrorMessage(
        'Yakındaki gönüllüler alınırken bir hata oluştu.'
      );
    } finally {
      setIsLoadingVolunteers(false);
    }
  };

  useEffect(() => {
    if (!showModal) {
      return;
    }

    loadNearbyVolunteers();

    const interval = window.setInterval(
      loadNearbyVolunteers,
      5000
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [
    showModal,
    callerLat,
    callerLng,
  ]);

  useEffect(() => {
    const checkSW = async () => {
      if (!('serviceWorker' in navigator)) {
        setSwStatus('Desteklenmiyor');
        return;
      }

      try {
        const registration =
          await navigator.serviceWorker.ready;

        setSwStatus(
          registration.active
            ? 'Aktif'
            : 'Pasif'
        );
      } catch {
        setSwStatus('Hata');
      }
    };

    checkSW();
  }, []);

  const handleEmergencyCall = async () => {
    setIsSending(true);
    setErrorMessage(null);

    try {
      /*
       * Bildirim göndermeden hemen önce
       * gönüllü listesini yeniden alıyoruz.
       *
       * Böylece 5 saniyelik eski liste yerine
       * mümkün olan en güncel konumları kullanıyoruz.
       */
      const latestVolunteers =
        await getNearbyVolunteers();

      setNearbyVolunteers(
        latestVolunteers
      );

      /*
       * OneSignal subscription ID'si olan
       * gönüllüleri seçiyoruz.
       */
      const playerIds =
        latestVolunteers
          .map(
            (volunteer) =>
              volunteer.player_id
          )
          .filter(
            (
              playerId
            ): playerId is string =>
              Boolean(playerId)
          );

      /*
       * Yakında gönüllü var ama OneSignal
       * aboneliği yoksa bildirim gönderemeyiz.
       */
      if (playerIds.length === 0) {
        setResult({
          notifiedCount: 0,
          nearbyVolunteers:
            latestVolunteers,
        });

        return;
      }

      /*
       * Vercel API fonksiyonuna gönderiyoruz.
       *
       * API tarafı OneSignal REST API
       * anahtarını güvenli şekilde kullanıyor.
       */
      const response = await fetch(
        '/api/send-alert',
        {
          method: 'POST',

          headers: {
            'Content-Type':
              'application/json',
          },

          body: JSON.stringify({
            playerIds,
            latitude: callerLat,
            longitude: callerLng,
          }),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data?.error ||
            'OneSignal bildirimi gönderilemedi.'
        );
      }

      /*
       * OneSignal recipients bilgisi
       * dönerse onu kullanıyoruz.
       *
       * Dönmezse gönderdiğimiz subscription
       * sayısını kullanıyoruz.
       */
      const notifiedCount =
        typeof data?.data?.recipients ===
        'number'
          ? data.data.recipients
          : playerIds.length;

      setResult({
        notifiedCount,
        nearbyVolunteers:
          latestVolunteers,
      });
    } catch (error) {
      console.error(
        'Acil bildirim gönderilemedi:',
        error
      );

      setResult({
        notifiedCount: 0,
        nearbyVolunteers:
          nearbyVolunteers,
      });

      setErrorMessage(
        'Bildirim gönderilirken bir hata oluştu. Lütfen tekrar deneyin.'
      );
    } finally {
      setIsSending(false);
    }
  };

  const reset = () => {
    setShowModal(false);
    setResult(null);
    setErrorMessage(null);
    setIsSending(false);
  };

  return (
    <>
      {/* ACİL YARDIMCI ÇAĞIR BUTONU */}

      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{
          delay: 1,
          type: 'spring',
          damping: 12,
        }}
        onClick={() =>
          setShowModal(true)
        }
        className="fixed bottom-24 sm:bottom-8 left-4 sm:left-auto sm:right-24 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-[var(--accent-red)] text-white font-bold shadow-lg hover:shadow-glow-red hover:scale-105 active:scale-95 transition-all"
      >
        <Siren className="w-5 h-5" />

        <span className="text-sm">
          İlk Yardımcı Çağır
        </span>
      </motion.button>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={reset}
          >
            <motion.div
              initial={{
                scale: 0.9,
                opacity: 0,
                y: 20,
              }}
              animate={{
                scale: 1,
                opacity: 1,
                y: 0,
              }}
              exit={{
                scale: 0.9,
                opacity: 0,
                y: 20,
              }}
              transition={{
                duration: 0.3,
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
              className="bg-white dark:bg-[#161823] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) =>
                e.stopPropagation()
              }
            >
              {/* HEADER */}

              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--accent-red-light)] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-red)] flex items-center justify-center">
                    <Siren className="w-5 h-5 text-white" />
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-[var(--accent-red)]">
                      İlk Yardımcı Çağır
                    </h3>

                    <p className="text-xs text-[var(--accent-red)]/70">
                      Yakınınızdaki gönüllü ilk yardımcılara ulaşın
                    </p>
                  </div>
                </div>

                <button
                  onClick={reset}
                  className="p-2 rounded-lg hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-[var(--accent-red)]" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {!result ? (
                  <div className="space-y-4">

                    {/* 112 UYARISI */}

                    <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--accent-amber-light)]">
                      <AlertTriangle className="w-5 h-5 text-[var(--accent-amber)] flex-shrink-0 mt-0.5" />

                      <div>
                        <p className="text-sm font-semibold text-[var(--accent-amber)]">
                          Önce 112'yi arayın!
                        </p>

                        <p className="text-xs text-[var(--text-secondary)] mt-1">
                          Bu sistem 112'nin yerini tutmaz. Önce acil servisi arayın.
                        </p>
                      </div>
                    </div>

                    {/* GÖNÜLLÜ SAYISI */}

                    <div className="p-4 rounded-xl bg-[var(--bg-primary)] dark:bg-[#0D0F18]">
                      <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />

                        1000m içindeki aktif gönüllüler:
                      </p>

                      {isLoadingVolunteers ? (
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                          <Loader2 className="w-4 h-4 animate-spin" />

                          Aranıyor...
                        </div>
                      ) : nearbyVolunteers.length > 0 ? (
                        <p className="text-sm text-[var(--accent-green)] font-medium">
                          {nearbyVolunteers.length}{' '}
                          ilk yardımcı bulundu
                        </p>
                      ) : (
                        <p className="text-sm text-[var(--accent-amber)]">
                          Yakınınızda aktif gönüllü bulunamadı
                        </p>
                      )}
                    </div>

                    {/* SERVICE WORKER DURUMU */}

                    <div className="p-2 rounded-lg bg-[var(--bg-primary)] dark:bg-[#0D0F18] text-xs">
                      <p className="text-[var(--text-muted)]">
                        Service Worker:{' '}
                        {swStatus ||
                          'Kontrol ediliyor...'}
                      </p>
                    </div>

                    {/* HATA */}

                    {errorMessage && (
                      <div className="p-3 rounded-lg bg-[var(--accent-red-light)] text-xs text-[var(--accent-red)]">
                        {errorMessage}
                      </div>
                    )}

                    {/* BUTONLAR */}

                    <div className="flex gap-3">

                      <a
                        href="tel:112"
                        className="flex-1 py-3.5 rounded-xl bg-[var(--accent-red)] text-white font-bold text-center hover:bg-[var(--accent-red-hover)] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                      >
                        <Phone className="w-5 h-5" />

                        112'yi Ara
                      </a>

                      <button
                        onClick={
                          handleEmergencyCall
                        }
                        disabled={
                          isSending ||
                          isLoadingVolunteers
                        }
                        className="flex-1 py-3.5 rounded-xl bg-[var(--accent-blue)] text-white font-bold hover:bg-[var(--accent-blue-hover)] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSending ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Gönderiliyor...
                          </>
                        ) : (
                          <>
                            <Siren className="w-5 h-5" />
                            Çağır
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">

                    {/* SONUÇ */}

                    <div className="text-center">
                      <motion.div
                        initial={{
                          scale: 0,
                        }}
                        animate={{
                          scale: 1,
                        }}
                        transition={{
                          type: 'spring',
                          damping: 15,
                        }}
                        className="w-16 h-16 rounded-full bg-[var(--accent-green-light)] flex items-center justify-center mx-auto mb-3"
                      >
                        <CheckCircle className="w-8 h-8 text-[var(--accent-green)]" />
                      </motion.div>

                      <h4 className="text-lg font-bold text-[var(--text-primary)]">
                        Çağrı Gönderildi!
                      </h4>

                      {result.notifiedCount >
                      0 ? (
                        <p className="text-sm text-[var(--accent-green)] mt-1">
                          {result.notifiedCount}{' '}
                          gönüllüye bildirim gönderildi.
                        </p>
                      ) : (
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          {result
                            .nearbyVolunteers
                            .length > 0
                            ? `${result.nearbyVolunteers.length} ilk yardımcı listelendi.`
                            : 'Yakınınızda aktif gönüllü bulunamadı.'}
                        </p>
                      )}
                    </div>

                    {/* GÖNÜLLÜ LİSTESİ */}

                    {result.nearbyVolunteers
                      .length > 0 && (
                      <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">

                        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
                          Yakınınızdaki İlk Yardımcılar
                        </p>

                        {result.nearbyVolunteers.map(
                          (volunteer) => (
                            <div
                              key={
                                volunteer.id
                              }
                              className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-primary)] dark:bg-[#0D0F18]"
                            >
                              <div className="w-8 h-8 rounded-full bg-[var(--accent-green-light)] flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-[var(--accent-green)]">
                                  {volunteer.name
                                    .charAt(
                                      0
                                    )
                                    .toUpperCase()}
                                </span>
                              </div>

                              <p className="text-sm font-medium text-[var(--text-primary)] flex-1 min-w-0 truncate">
                                {
                                  volunteer.name
                                }
                              </p>

                              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--accent-blue-light)] text-[var(--accent-blue)] flex-shrink-0">
                                {volunteer.distance <
                                1000
                                  ? `${volunteer.distance}m`
                                  : `${(
                                      volunteer.distance /
                                      1000
                                    ).toFixed(
                                      1
                                    )}km`}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    )}

                    {/* HATA */}

                    {errorMessage && (
                      <div className="p-3 rounded-lg bg-[var(--accent-red-light)] text-xs text-[var(--accent-red)]">
                        {errorMessage}
                      </div>
                    )}

                    {/* KAPAT */}

                    <button
                      onClick={reset}
                      className="w-full py-3 rounded-xl bg-[var(--bg-primary)] dark:bg-[#0D0F18] text-[var(--text-primary)] font-medium border border-[var(--border)] hover:bg-[var(--border-subtle)] transition-all"
                    >
                      Kapat
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
