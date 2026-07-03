import { Heart, MapPin, Footprints, Activity } from 'lucide-react';
import { StatCard } from '@/components/StatCard';

interface StatisticsDashboardProps {
  nearestDistance: string;
  walkingTime: string;
}

export function StatisticsDashboard({ nearestDistance, walkingTime }: StatisticsDashboardProps) {
  return (
    <section className="py-8 bg-white dark:bg-[var(--bg-card)] border-y border-[var(--border-subtle)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Heart className="w-5 h-5 text-[#DC2626]" />}
            label="Toplam OED"
            value={25}
            subtitle="Ankara'da kayıtlı cihaz"
            color="red"
            isCounter
            delay={0}
          />
          <StatCard
            icon={<MapPin className="w-5 h-5 text-[#2563EB]" />}
            label="En Yakın"
            value={nearestDistance}
            subtitle="Mesafe"
            color="blue"
            delay={1}
          />
          <StatCard
            icon={<Footprints className="w-5 h-5 text-[#D97706]" />}
            label="Tahmini Süre"
            value={walkingTime}
            subtitle="Yürüyüş mesafesi"
            color="amber"
            delay={2}
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-[#059669]" />}
            label="Sistem Durumu"
            value="Aktif"
            subtitle="Tüm sistemler çalışıyor"
            color="green"
            delay={3}
          />
        </div>
      </div>
    </section>
  );
}
