import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Phone, MapPin, Bell, BellOff, Loader2, CheckCircle } from 'lucide-react';
import { trpc } from '@/providers/trpc';

const VAPID_PUBLIC_KEY = 'BLZ8QYM3SeS7eU1D58mTwUb9stK8vEYfCxphM7RWFzmZyXTrqdhs2SoCwqELFFfrkuCtc-RattpAQWB1VNVMSSI';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

interface VolunteerModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: { lat: number; lng: number } | null;
}

export function VolunteerModal({ isOpen, onClose, userLocation }: VolunteerModalProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState<'form' | 'push' | 'success' | 'error'>('form');
  const [errorMsg, setErrorMsg] = useState('');
  const [pushLoading, setPushLoading] = useState(false);

  const registerMutation = trpc.volunteer.register.useMutation();

  const getPushSubscription = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') return null;

      let reg = await navigator.serviceWorker.getRegistration('/sw.js');
      if (!reg) {
        reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
        await new Promise(r => setTimeout(r, 1000));
      }

      let sub = await reg.pushManager.getSubscription();
      if (!sub) {
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as ArrayBuffer,
        });
      }

      const keys = sub.toJSON().keys;
      if (!keys?.p256dh || !keys?.auth) return null;
      return { endpoint: sub.endpoint, p256dh: keys.p256dh, auth: keys.auth };
    } catch (err) {
      console.error('[Push] Subscription error:', err);
      return null;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;
    setStep('push');
  };

  const handleEnablePush = async () => {
    setPushLoading(true);
    const pushSub = await getPushSubscription();
    setPushLoading(false);
    await registerVolunteer(pushSub);
  };

  const handleSkipPush = async () => {
    await registerVolunteer(null);
  };

  const registerVolunteer = async (
    pushSub: { endpoint: string; p256dh: string; auth: string } | null
  ) => {
    const lat = userLocation?.lat ?? 39.925533;
    const lng = userLocation?.lng ?? 32.866287;

    try {
      await registerMutation.mutateAsync({
        name: name.trim(),
        phone: phone.trim(),
        lat, lng,
        pushEndpoint: pushSub?.endpoint,
        pushP256dh: pushSub?.p256dh,
        pushAuth: pushSub?.auth,
      });
      setStep('success');
    } catch (err: any) {
      setErrorMsg(err?.message || 'Sunucu baglanti hatasi');
      setStep('error');
    }
  };

  const reset = () => {
    setName(''); setPhone(''); setStep('form'); setErrorMsg(''); setPushLoading(false); onClose();
  };

  const isRegistering = registerMutation.isPending || pushLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={reset}>
          <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
            className="bg-white dark:bg-[#161823] rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
            
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--accent-green-light)] flex items-center justify-center">
                  <User className="w-5 h-5 text-[var(--accent-green)]" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--text-primary)]">Gonullu Ilk Yardimci Ol</h3>
                  <p className="text-xs text-[var(--text-muted)]">Hayat kurtarmak icin gonullu olun</p>
                </div>
              </div>
              <button onClick={reset} className="p-2 rounded-lg hover:bg-[var(--border-subtle)] transition-colors">
                <X className="w-5 h-5 text-[var(--text-muted)]" />
              </button>
            </div>

            <div className="p-6">
              {step === 'form' && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                      <span className="flex items-center gap-1.5"><User className="w-4 h-4 text-[var(--text-muted)]" />Ad Soyad</span>
                    </label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Adiniz ve soyadiniz" required
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] dark:bg-[#0D0F18] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">
                      <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-[var(--text-muted)]" />Telefon Numarasi</span>
                    </label>
                    <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="05XX XXX XX XX" required
                      className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--bg-primary)] dark:bg-[#0D0F18] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--accent-blue)] transition-all" />
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[var(--accent-blue-light)]">
                    <MapPin className="w-5 h-5 text-[var(--accent-blue)] flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-[var(--accent-blue)]">Konumunuz</p>
                      <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                        {userLocation ? `${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` : 'Ankara merkez'}
                      </p>
                    </div>
                  </div>
                  <button type="submit" className="w-full py-3.5 rounded-xl bg-[var(--accent-green)] text-white font-semibold hover:bg-[var(--accent-green-hover)] active:scale-[0.98] transition-all">
                    Devam Et
                  </button>
                </form>
              )}

              {step === 'push' && (
                <div className="text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-[var(--accent-blue-light)] flex items-center justify-center mx-auto">
                    <Bell className="w-8 h-8 text-[var(--accent-blue)]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text-primary)]">Bildirimleri Ac</h4>
                    <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Acil bir ilk yardim cagrisi geldiginde size anlik bildirim gonderebilmemiz icin bildirimleri acin.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3">
                    <button onClick={handleEnablePush} disabled={isRegistering}
                      className="w-full py-3.5 rounded-xl bg-[var(--accent-blue)] text-white font-semibold hover:bg-[var(--accent-blue-hover)] active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      {isRegistering ? <Loader2 className="w-5 h-5 animate-spin" /> : <Bell className="w-5 h-5" />}
                      {isRegistering ? 'Kaydediliyor...' : 'Bildirimleri Ac'}
                    </button>
                    <button onClick={handleSkipPush} disabled={isRegistering}
                      className="w-full py-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)] font-medium hover:bg-[var(--border-subtle)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                      <BellOff className="w-4 h-4" />Bildirim Olmadan Devam Et
                    </button>
                  </div>
                </div>
              )}

              {step === 'success' && (
                <div className="text-center space-y-5">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', damping: 15 }}
                    className="w-16 h-16 rounded-full bg-[var(--accent-green-light)] flex items-center justify-center mx-auto">
                    <CheckCircle className="w-8 h-8 text-[var(--accent-green)]" />
                  </motion.div>
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text-primary)]">Tesekkurler, {name}!</h4>
                    <p className="text-sm text-[var(--text-secondary)] mt-2 leading-relaxed">
                      Artik gonullu ilk yardimci agimizdasiniz. Yakinizda acil durum oldugunda size bildirim gelecek.
                    </p>
                  </div>
                  <button onClick={reset} className="w-full py-3.5 rounded-xl bg-[var(--accent-green)] text-white font-semibold hover:bg-[var(--accent-green-hover)] active:scale-[0.98] transition-all">
                    Tamam
                  </button>
                </div>
              )}

              {step === 'error' && (
                <div className="text-center space-y-5">
                  <div className="w-16 h-16 rounded-full bg-[var(--accent-red-light)] flex items-center justify-center mx-auto">
                    <X className="w-8 h-8 text-[var(--accent-red)]" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-[var(--text-primary)]">Bir Hata Olustu</h4>
                    <p className="text-sm text-[var(--text-secondary)] mt-2">{errorMsg || 'Sunucu baglanti hatasi.'}</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setStep('form')} className="flex-1 py-3 rounded-xl bg-[var(--accent-blue)] text-white font-medium hover:bg-[var(--accent-blue-hover)] transition-all">Tekrar Dene</button>
                    <button onClick={reset} className="flex-1 py-3 rounded-xl border border-[var(--border)] text-[var(--text-muted)] font-medium hover:bg-[var(--border-subtle)] transition-all">Kapat</button>
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
