import { Phone, Heart } from 'lucide-react';

export function QuickActionFAB() {
  return (
    <div className="hidden sm:flex fixed bottom-6 right-6 z-50 items-center gap-3">
      <a
        href="tel:112"
        className="w-14 h-14 rounded-full bg-[var(--accent-red)] text-white flex items-center justify-center shadow-lg hover:scale-110 hover:shadow-glow-red transition-all duration-200"
        aria-label="112 Ara"
      >
        <Phone className="w-6 h-6" />
      </a>
      <button
        onClick={() => window.open('https://www.turkishredcrescent.org.tr/', '_blank')}
        className="w-14 h-14 rounded-full bg-[var(--accent-green)] text-white flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200"
        aria-label="TYD"
      >
        <Heart className="w-6 h-6" />
      </button>
    </div>
  );
}
