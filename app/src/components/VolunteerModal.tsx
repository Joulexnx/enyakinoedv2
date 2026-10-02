import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  User,
  Phone,
  MapPin,
  Bell,
  BellOff,
  Loader2,
  CheckCircle,
} from 'lucide-react';

import { supabase } from '@/lib/supabase';
import { requestOneSignalPermission } from '@/lib/onesignal';

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
}

export function VolunteerModal({
  isOpen,
  onClose,
  userLocation,
}: VolunteerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const [step, setStep] = useState<
    'form' | 'push' | 'success' | 'error'
  >('form');

  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !phone.trim()) {
      return;
    }

    setStep('push');
  };

  const getCurrentLocation = async () => {
    if (userLocation) {
      return userLocation;
    }

    if (!navigator.geolocation) {
      throw new Error('Cihazınız konum bilgisini desteklemiyor.');
    }

    return new Promise<{ lat: number; lng: number }>(
      (resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            });
          },
          () => {
            reject(
              new Error(
                'Konum alınamadı. Lütfen konum iznini açın.'
              )
            );
          },
          {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 5000,
          }
        );
      }
    );
  };

  const registerVolunteer = async (
    subscriptionId: string | null
  ) => {
    setLoading(true);
    setErrorMsg('');

    try {
      const location = await getCurrentLocation();

      const { data, error } = await supabase
        .from('volunteers')
        .insert({
          name: name.trim(),
          phone: phone.trim(),
          lat: location.lat,
          lng: location.lng,
          certified: true,
          player_id: subscriptionId,
          updated_at: new Date().toISOString(),
        })
        .select('id')
        .single();

      if (error) {
        console.error('Supabase volunteer registration error:', error);
        throw new Error(
          error.message || 'Gönüllü kaydı oluşturulamadı.'
        );
      }

      if (data?.id) {
        localStorage.setItem(
          'volunteer_id',
          String(data.id)
        );
      }

      localStorage.setItem(
        'volunteer_name',
        name.trim()
      );

      localStorage.setItem(
        'volunteer_registered',
        'true'
      );

      setStep('success');
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Kayıt sırasında bir hata oluştu.'
      );

      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  const handleEnablePush = async () => {
    setLoading(true);
    setErrorMsg('');

    try {
      const subscriptionId =
        await requestOneSignalPermission();

      if (!subscriptionId) {
        throw new Error(
          'Bildirim aboneliği oluşturulamadı. Lütfen bildirim iznini kontrol edin.'
        );
      }

      await registerVolunteer(subscriptionId);
    } catch (error) {
      console.error(error);

      setErrorMsg(
        error instanceof Error
          ? error.message
          : 'Bildirim kurulumu sırasında hata oluştu.'
      );

      setStep('error');
      setLoading(false);
    }
  };

  const handleSkipPush = async () => {
    await registerVolunteer(null);
  };

  const reset = () => {
    setName('');
    setPhone('');
    setStep('form');
    setErrorMsg('');
    setLoading(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
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
              ease: [0.22, 1, 0.36, 1] as [
                number,
                number,
                number,
                number
              ],
            }}
            className="bg-white dark:bg-[#161823] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* HEADER */}

            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-green-light)] flex items-center justify-center">
                  <User className="w-5 h-5 text-[var(--accent-green)]" />
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Gönüllü İlk Yardımcı Ol
                  </h3>

                  <p className="text-xs text-[var(--text-muted)]">
                    Hayat kurtarmak için gönüllü olun
                  </p>
                </div>
              </div>

              <button
                onClick={reset}
                className="p-2 rounded-lg hover:bg-[var(--border-subtle)] transition-colors"
              >
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="p-6">

              {/* FORM */}

              {step === 'form' && (
                <form
                  onSubmit={handleSubmit}
                  className="space-y-4"
                >
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <User className="w-4 h-4 text-[var(--text-muted)]" />
                        Ad Soyad
                      </span>
                    </label>

                    <input
                      type="text"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="Adınız ve soyadınız"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] dark:bg-[#0D0F18] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <Phone className="w-4 h-4 text-[var(--text-muted)]" />
                        Telefon Numarası
                      </span>
                    </label>

                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) =>
                        setPhone(e.target.value)
                      }
                      placeholder="05XX XXX XX XX"
                      required
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] dark:bg-[#0D0F18] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all"
                    />
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--accent-blue-light)]">
                    <MapPin className="w-5 h-5 text-[var(--accent-blue)] flex-shrink-0 mt-0.5" />

                    <div>
                      <p className="text-sm font-medium text-[var(--accent-blue)]">
                        Konumunuz
                      </p>

                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {userLocation
                          ? `${userLocation.lat.toFixed(
                              4
                            )}, ${userLocation.lng.toFixed(
                              4
                            )}`
                          : 'Konum alınacak'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-xl bg-[var(--accent-green)] text-white font-semibold hover:bg-[var(--accent-green-hover)] active:scale-[0.98] transition-all"
                  >
                    Devam Et
                  </button>
                </form>
              )}

              {/* ONESIGNAL */}

              {step === 'push' && (
                <div className="text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-[var(--accent-blue-light)] flex items-center justify-center mx-auto">
                    <Bell className="w-8 h-8 text-[var(--accent-blue)]" />
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text-primary)]">
                      Bildirimleri Aç
                    </h4>

                    <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Yakınınızda acil bir ilk yardım
                      çağrısı olduğunda size anlık
                      bildirim gönderebilmemiz için
                      bildirimleri açın.
                    </p>
                  </div>

                  <div className="flex flex-col gap-3">
                    <button
                      onClick={handleEnablePush}
                      disabled={loading}
                      className="w-full py-3.5 rounded-xl bg-[var(--accent-blue)] text-white font-semibold hover:bg-[var(--accent-blue-hover)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <Bell className="w-5 h-5" />
                      )}

                      {loading
                        ? 'Kaydediliyor...'
                        : 'Bildirimleri Aç'}
                    </button>

                    <button
                      onClick={handleSkipPush}
                      disabled={loading}
                      className="w-full py-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)] font-medium hover:bg-[var(--border-subtle)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      <BellOff className="w-4 h-4" />

                      Bildirim Olmadan Devam Et
                    </button>
                  </div>
                </div>
              )}

              {/* SUCCESS */}

              {step === 'success' && (
                <div className="text-center space-y-5">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      type: 'spring',
                      damping: 15,
                    }}
                    className="w-16 h-16 rounded-full bg-[var(--accent-green-light)] flex items-center justify-center mx-auto"
                  >
                    <CheckCircle className="w-8 h-8 text-[var(--accent-green)]" />
                  </motion.div>

                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text-primary)]">
                      Teşekkürler, {name}!
                    </h4>

                    <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Artık gönüllü ilk yardımcı
                      ağımızdasınız. Yakınınızda acil durum
                      olduğunda size bildirim gelecek.
                    </p>
                  </div>

                  <button
                    onClick={reset}
                    className="w-full py-3.5 rounded-xl bg-[var(--accent-green)] text-white font-semibold hover:bg-[var(--accent-green-hover)] active:scale-[0.98] transition-all"
                  >
                    Tamam
                  </button>
                </div>
              )}

              {/* ERROR */}

              {step === 'error' && (
                <div className="text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-[var(--accent-red-light)] flex items-center justify-center mx-auto">
                    <X className="w-8 h-8 text-[var(--accent-red)]" />
                  </div>

                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text-primary)]">
                      Bir Hata Oluştu
                    </h4>

                    <p className="text-sm text-[var(--text-secondary)] mt-2">
                      {errorMsg ||
                        'Kayıt sırasında bir hata oluştu.'}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setStep('form')}
                      className="flex-1 py-3 rounded-xl bg-[var(--accent-blue)] text-white font-medium hover:bg-[var(--accent-blue-hover)] transition-all"
                    >
                      Tekrar Dene
                    </button>

                    <button
                      onClick={reset}
                      className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)] font-medium hover:bg-[var(--border-subtle)] transition-all"
                    >
                      Kapat
                    </button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
