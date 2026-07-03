import { ThemeProvider } from '@/hooks/useTheme';
import { useGeolocation } from '@/hooks/useGeolocation';
import { HeaderBar } from '@/sections/HeaderBar';
import { EmergencyAlertBanner } from '@/sections/EmergencyAlertBanner';
import { HeroSection } from '@/sections/HeroSection';
import { StatisticsDashboard } from '@/sections/StatisticsDashboard';
import { MapSection } from '@/sections/MapSection';
import { NearbyOEDList } from '@/sections/NearbyOEDList';
import { InformationPanel } from '@/sections/InformationPanel';
import { TYDGuide } from '@/sections/TYDGuide';
import { Footer } from '@/sections/Footer';

export default function App() {
  const {
    status,
    userLocation,
    nearestDistance,
    walkingTime,
    sortedOEDs,
    requestLocation,
  } = useGeolocation();

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        <HeaderBar />
        <EmergencyAlertBanner />

        <main>
          <HeroSection onRequestLocation={requestLocation} />
          <StatisticsDashboard
            nearestDistance={nearestDistance}
            walkingTime={walkingTime}
          />
          <MapSection
            userLocation={userLocation}
            geolocationStatus={status}
            oedLocations={sortedOEDs}
            onRequestLocation={requestLocation}
          />
          <NearbyOEDList oedLocations={sortedOEDs} />
          <InformationPanel />
          <TYDGuide />
        </main>

        <Footer />
      </div>
    </ThemeProvider>
  );
}
