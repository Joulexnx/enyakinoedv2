import { Phone, Heart } from 'lucide-react';

export function QuickActionBar() {
  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white shadow-[0_-4px_24px_rgba(0,0,0,0.08)] border-t border-[var(--border)] h-20 px-3 flex items-center gap-3">
      <a
        href="tel:112"
        className="flex-1 flex items-center justify-center gap-2.5 h-12 rounded-xl bg-[var(--accent-red)] text-white font-semibold text-base shadow-glow-red active:scale-[0.97] transition-transform"
      >
        <Phone className="w-5 h-5" />
        112 Ara
      </a>
      <button
        onClick={() => window.open('https://www.turkishredcrescent.org.tr/', '_blank')}
        className="flex-1 flex items-center justify-center gap-2.5 h-12 rounded-xl bg-[var(--accent-green)] text-white font-semibold text-base active:scale-[0.97] transition-transform"
      >
        <Heart className="w-5 h-5" />
        TYD
      </button>
    </div>
  );
}
