import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export function EmergencyAlertBanner() {
  const [visible, setVisible] = useState(true);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: -48, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -48, opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="fixed top-[72px] left-0 right-0 z-40 h-12 bg-[var(--accent-red-light)] border-b border-[var(--accent-red)]/15 flex items-center justify-center"
        >
          <div className="flex items-center gap-2 px-4">
            <span className="text-sm">&#x26A0;</span>
            <span className="text-sm font-medium text-[var(--accent-red)]">
              <strong>Acil durumda önce 112'yi arayın</strong>
              <span className="hidden sm:inline"> — OED kullanmadan önce acil servisi arayın</span>
            </span>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="absolute right-4 p-1 rounded-lg hover:bg-[var(--accent-red)]/10 transition-colors"
            aria-label="Kapat"
          >
            <X className="w-4 h-4 text-[var(--accent-red)]" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
