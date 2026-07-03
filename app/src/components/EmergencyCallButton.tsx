import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Siren, X, Phone, Loader2, CheckCircle, AlertTriangle, MapPin } from 'lucide-react';
import { trpc } from '@/providers/trpc';

interface EmergencyCallButtonProps {
  userLocation: { lat: number; lng: number } | null;
}

export function EmergencyCallButton({ userLocation }: EmergencyCallButtonProps) {
  const [showModal, setShowModal] = useState(false);
  const [result, setResult] = useState<{
    notifiedCount: number;
    nearbyVolunteers: Array<{ id: number; name: string; distance: number }>;
  } | null>(null);
  const [swStatus, setSwStatus] = useState<string>('');

  const notifyMutation = trpc.emergency.notify.useMutation({
    onSuccess: (data) => {
      setResult(data);
    },
    onError: () => {
      setResult({
        notifiedCount: 0,
        nearbyVolunteers: nearbyQuery.data?.map(v => ({ id: v.id, name: v.name, distance: v.distance })) || [],
      });
    },
  });

  const callerLat = userLocation?.lat ?? 39.925533;
  const callerLng = userLocation?.lng ?? 32.866287;

  const nearbyQuery = trpc.volunteer.listNearby.useQuery(
    { lat: callerLat, lng: callerLng, radius: 1000 },
    { enabled: showModal }
  );

  useEffect(() => {
    const checkSW = async () => {
      if (!('serviceWorker' in navigator)) {
        setSwStatus('Desteklenmiyor');
        return;
      }
      try {
        const reg = await navigator.serviceWorker.ready;
        setSwStatus(reg.active ? 'Aktif' : 'Pasif');
      } catch {
        setSwStatus('Hata');
      }
    };
    checkSW();
  }, []);

  const handleEmergencyCall = async () => {
    await notifyMutation.mutateAsync({
      lat: callerLat,
      lng: callerLng,
      radius: 1000,
    });
  };

  const reset = () => {
    setShowModal(false);
    setResult(null);
    notifyMutation.reset();
  };

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', damping: 12 }}
        onClick={() => setShowModal(true)}
        className="fixed bottom-24 sm:bottom-8 left-4 sm:left-auto sm:right-24 z-50 flex items-center gap-2.5 px-5 py-3.5 rounded-full bg-[var(--accent-red)] text-white font-bold shadow-lg hover:shadow-glow-red hover:scale-105 active:scale-95 transition-all"
      >
        <Siren className="w-5 h-5" />
        <span className="text-sm">Ilk Yardimci Cagir</span>
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
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
              className="bg-white dark:bg-[#161823] rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] bg-[var(--accent-red-light)] flex-shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--accent-red)] flex items-center justify-center">
                    <Siren className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[var(--accent-red)]">Ilk Yardimci Cagir</h3>
                    <p className="text-xs text-[var(--accent-red)]/70">Yakinizdaki gonullu ilk yardimlilara ulasin</p>
                  </div>
                </div>
                <button onClick={reset} className="p-2 rounded-lg hover:bg-white/30 transition-colors">
                  <X className="w-5 h-5 text-[var(--accent-red)]" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto">
                {!result ? (
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-4 rounded-xl bg-[var(--accent-amber-light)]">
                      <AlertTriangle className="w-5 h-5 text-[var(--accent-amber)] flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-semibold text-[var(--accent-amber)]">Once 112'yi arayin!</p>
                        <p className="text-xs text-[var(--text-secondary)] mt-1">Bu sistem 112'nin yerini tutmaz. Once acil servisi arayin.</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-[var(--bg-primary)] dark:bg-[#0D0F18]">
                      <p className="text-sm font-medium text-[var(--text-primary)] mb-2">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        1000m icindeki gonulluler:
                      </p>
                      {nearbyQuery.isLoading ? (
                        <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                          <Loader2 className="w-4 h-4 animate-spin" /> Araniyor...
                        </div>
                      ) : nearbyQuery.data && nearbyQuery.data.length > 0 ? (
                        <p className="text-sm text-[var(--accent-green)] font-medium">{nearbyQuery.data.length} ilk yardimci bulundu</p>
                      ) : (
                        <p className="text-sm text-[var(--accent-amber)]">Yakinizda kayitli gonullu bulunamadi</p>
                      )}
                    </div>

                    <div className="p-2 rounded-lg bg-[var(--bg-primary)] dark:bg-[#0D0F18] text-xs">
                      <p className="text-[var(--text-muted)]">Service Worker: {swStatus || 'Kontrol ediliyor...'}</p>
                    </div>

                    <div className="flex gap-3">
                      <a href="tel:112" className="flex-1 py-3.5 rounded-xl bg-[var(--accent-red)] text-white font-bold text-center hover:bg-[var(--accent-red-hover)] active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                        <Phone className="w-5 h-5" /> 112'yi Ara
                      </a>
                      <button onClick={handleEmergencyCall} disabled={notifyMutation.isPending}
                        className="flex-1 py-3.5 rounded-xl bg-[var(--accent-blue)] text-white font-bold hover:bg-[var(--accent-blue-hover)] active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                        {notifyMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Siren className="w-5 h-5" />}
                        Cagir
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="text-center">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
                        className="w-16 h-16 rounded-full bg-[var(--accent-green-light)] flex items-center justify-center mx-auto mb-3">
                        <CheckCircle className="w-8 h-8 text-[var(--accent-green)]" />
                      </motion.div>
                      <h4 className="text-lg font-bold text-[var(--text-primary)]">Cagri Gonderildi!</h4>
                      {result.notifiedCount > 0 ? (
                        <p className="text-sm text-[var(--accent-green)] mt-1">{result.notifiedCount} gonulluye bildirim gonderildi.</p>
                      ) : (
                        <p className="text-sm text-[var(--text-secondary)] mt-1">
                          {result.nearbyVolunteers.length > 0 ? `${result.nearbyVolunteers.length} ilk yardimci listelendi.` : 'Yakinizda kayitli gonullu bulunamadi.'}
                        </p>
                      )}
                    </div>

                    {result.nearbyVolunteers.length > 0 && (
                      <div className="space-y-2 max-h-56 overflow-y-auto custom-scrollbar">
                        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">Yakinizdaki Ilk Yardimcilar</p>
                        {result.nearbyVolunteers.map((v) => (
                          <div key={v.id} className="flex items-center gap-3 p-3 rounded-xl bg-[var(--bg-primary)] dark:bg-[#0D0F18]">
                            <div className="w-8 h-8 rounded-full bg-[var(--accent-green-light)] flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-bold text-[var(--accent-green)]">{v.name.charAt(0).toUpperCase()}</span>
                            </div>
                            <p className="text-sm font-medium text-[var(--text-primary)] flex-1 min-w-0 truncate">{v.name}</p>
                            <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--accent-blue-light)] text-[var(--accent-blue)] flex-shrink-0">
                              {v.distance < 1000 ? `${v.distance}m` : `${(v.distance / 1000).toFixed(1)}km`}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    <button onClick={reset} className="w-full py-3 rounded-xl bg-[var(--bg-primary)] dark:bg-[#0D0F18] text-[var(--text-primary)] font-medium border border-[var(--border)] hover:bg-[var(--border-subtle)] transition-all">
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
