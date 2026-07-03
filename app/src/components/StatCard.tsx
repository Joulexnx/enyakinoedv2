import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import { useAnimatedCounter } from '@/hooks/useAnimatedCounter';

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle: string;
  color: 'red' | 'blue' | 'amber' | 'green';
  isCounter?: boolean;
  delay?: number;
}

const colorMap = {
  red: { text: 'text-[#DC2626]', bg: 'bg-[#FEE2E2]' },
  blue: { text: 'text-[#2563EB]', bg: 'bg-[#DBEAFE]' },
  amber: { text: 'text-[#D97706]', bg: 'bg-[#FEF3C7]' },
  green: { text: 'text-[#059669]', bg: 'bg-[#D1FAE5]' },
};

export function StatCard({ icon, label, value, subtitle, color, isCounter, delay = 0 }: StatCardProps) {
  const [ref, isInView] = useInView<HTMLDivElement>();
  const numericTarget = isCounter && typeof value === 'number' ? value : 0;
  const animatedValue = useAnimatedCounter(numericTarget, isInView);
  const colors = colorMap[color];

  const displayValue = isCounter ? animatedValue : value;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: delay * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="bg-white rounded-2xl p-6 shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-250"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-10 h-10 rounded-xl ${colors.bg} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className={`text-4xl font-bold ${colors.text} tracking-tight`}>
        {displayValue}
      </div>
      <div className="flex items-center gap-2 mt-2">
        {color === 'green' && (
          <span className="w-2 h-2 rounded-full bg-[#059669] status-pulse" />
        )}
        <span className="text-xs text-[var(--text-muted)]">{subtitle}</span>
      </div>
    </motion.div>
  );
}
