import { Heart, MapPin, Footprints, Activity } from 'lucide-react';
import { StatCard } from '@/components/StatCard';

interface StatisticsDashboardProps {
  nearestDistance: string;
  walkingTime: string;
  oedCount: number;
}

export function StatisticsDashboard({
  nearestDistance,
  walkingTime,
  oedCount,
}: StatisticsDashboardProps) {

  return (
    <section className="py-8 bg-[var(--bg-card)] border-y border-[var(--border-subtle)]">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon={<Heart className="w-5 h-5 text-[var(--accent-red)]" />}
            label="Toplam OED"
            value={oedCount}
            subtitle="Türkiye'de kayıtlı cihaz"
            color="red"
            isCounter
            delay={0}
          />
          <StatCard
            icon={<MapPin className="w-5 h-5 text-[var(--accent-blue)]" />}
            label="En Yakın"
            value={nearestDistance}
            subtitle="Mesafe"
            color="blue"
            delay={1}
          />
          <StatCard
            icon={<Footprints className="w-5 h-5 text-[var(--accent-amber)]" />}
            label="Tahmini Süre"
            value={walkingTime}
            subtitle="Yürüyüş mesafesi"
            color="amber"
            delay={2}
          />
          <StatCard
            icon={<Activity className="w-5 h-5 text-[var(--accent-green)]" />}
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