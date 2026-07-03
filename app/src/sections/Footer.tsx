import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

type ModalType = 'privacy' | 'terms' | null;

const privacyContent = [
  {
    title: '1. Toplanan Bilgiler',
    text: 'En Yakın OED uygulaması, size en yakın OED cihazını bulmak için konum bilginizi kullanır. Konum bilgisi sadece cihazınızda işlenir ve sunucularımıza kaydedilmez.',
  },
  {
    title: '2. Konum Verileri',
    text: 'Konum bilginiz sadece OED cihazlarına olan mesafeyi hesaplamak için kullanılır. Bu bilgiler üçüncü taraflarla paylaşılmaz ve hiçbir şekilde saklanmaz.',
  },
  {
    title: '3. Çerezler',
    text: 'Uygulama koyu mod tercihinizi ve panel açık/kapalı durumlarını localStorage\'da saklar. Bu veriler sadece tarayıcınızda bulunur.',
  },
  {
    title: '4. Güvenlik',
    text: 'Kişisel bilgilerinizin güvenliği bizim için önemlidir. Verilerinizi korumak için uygun teknik ve idari önlemleri alıyoruz.',
  },
  {
    title: '5. İletişim',
    text: 'Gizlilik politikası hakkında sorularınız için uygulama üzerinden bizimle iletişime geçebilirsiniz.',
  },
];

const termsContent = [
  {
    title: '1. Hizmet Kapsamı',
    text: 'En Yakın OED, Ankara ilindeki Otomatik Eksternal Defibrilatör (OED) cihazlarının konumlarını gösteren bir bilgi platformudur. Bu uygulama profesyonel tıbbi hizmet yerine geçmez. Acil durumlarda önce 112 acil servisini arayınız.',
  },
  {
    title: '2. Kullanım Koşulları',
    text: 'Uygulamayı kullanarak bu koşulları kabul etmiş olursunuz. Uygulamada yer alan bilgiler Sağlık Bakanlığı ve ilgili kurumların açık verilerinden sağlanmaktadır.',
  },
  {
    title: '3. Sorumluluk Reddi',
    text: 'En Yakın OED, uygulama üzerinden sağlanan bilgilerin kullanımından doğacak herhangi bir zarardan sorumlu değildir. OED kullanımı öncesinde mutlaka 112\'yi arayınız.',
  },
  {
    title: '4. Bilgi Doğruluğu',
    text: 'OED konum bilgileri en güncel haliyle sunulmaya çalışılsa da, cihazların taşınması veya kaldırılması durumunda bilgiler güncel olmayabilir.',
  },
  {
    title: '5. Değişiklikler',
    text: 'Bu kullanım koşulları zaman zaman güncellenebilir. Değişiklikler uygulamada yayınlandığı tarihten itibaren geçerlidir.',
  },
];

function LegalModal({ type, onClose }: { type: ModalType; onClose: () => void }) {
  if (!type) return null;
  const isPrivacy = type === 'privacy';
  const title = isPrivacy ? 'Gizlilik Politikası' : 'Kullanım Koşulları';
  const content = isPrivacy ? privacyContent : termsContent;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={onClose}>
      <motion.div initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] }}
        className="bg-white dark:bg-[#161823] rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border-subtle)] flex-shrink-0">
          <h3 className="text-lg font-semibold text-[var(--text-primary)]">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--border-subtle)] transition-colors">
            <X className="w-5 h-5 text-[var(--text-muted)]" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-5">
          {content.map((section, i) => (
            <div key={i}>
              <h4 className="text-sm font-semibold text-[var(--text-primary)] mb-1.5">{section.title}</h4>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{section.text}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}

export function Footer() {
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <>
      <footer className="py-6 bg-white dark:bg-[var(--bg-card)] border-t border-[var(--border-subtle)]">
        <div className="max-w-[1200px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-[var(--text-muted)] text-center sm:text-left">
            &copy; 2025 En Yakın OED — Hayat kurtarmak için geliştirildi
          </p>
          <div className="flex items-center gap-4">
            <button onClick={() => setModal('privacy')}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              Gizlilik Politikası
            </button>
            <span className="text-xs text-[var(--text-muted)]">·</span>
            <button onClick={() => setModal('terms')}
              className="text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
              Kullanım Koşulları
            </button>
          </div>
        </div>
      </footer>
      <AnimatePresence>
        {modal && <LegalModal type={modal} onClose={() => setModal(null)} />}
      </AnimatePresence>
    </>
  );
}
