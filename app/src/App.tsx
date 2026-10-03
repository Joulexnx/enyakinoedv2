import { ThemeProvider } from '@/hooks/useTheme';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useVolunteerTracking } from '@/hooks/useVolunteerTracking';

import { HeaderBar } from '@/sections/HeaderBar';
import { EmergencyAlertBanner } from '@/sections/EmergencyAlertBanner';
import { HeroSection } from '@/sections/HeroSection';
import { StatisticsDashboard } from '@/sections/StatisticsDashboard';
import { MapSection } from '@/sections/MapSection';
import { NearbyOEDList } from '@/sections/NearbyOEDList';
import { InformationPanel } from '@/sections/InformationPanel';
import { TYDGuide } from '@/sections/TYDGuide';
import { Footer } from '@/sections/Footer';
import PrivacyPolicy from '@/pages/PrivacyPolicy';

import { VolunteersPanel } from '@/components/VolunteersPanel';

function HomePage() {
  // Gönüllü sistemi ileride tekrar aktif edilecek.
  // Mevcut GPS takip altyapısı korunuyor.
  useVolunteerTracking();

  const {
    status,
    userLocation,
    nearestDistance,
    walkingTime,
    sortedOEDs,
    requestLocation,
  } = useGeolocation();

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <HeaderBar />

      <EmergencyAlertBanner />

      <main>
        <HeroSection
          onRequestLocation={requestLocation}
        />

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

        {/* GÖNÜLLÜLER */}
        <VolunteersPanel
          userLocation={userLocation}
        />

        <NearbyOEDList
          oedLocations={sortedOEDs}
        />

        <InformationPanel />

        <TYDGuide />
      </main>

      <Footer />
    </div>
  );
}

export default function App() {
  const path =
    window.location.pathname.replace(
      /\/+$/,
      ''
    ) || '/';

  return (
    <ThemeProvider>
      {path === '/gizlilik-politikasi' ? (
        <PrivacyPolicy />
      ) : (
        <HomePage />
      )}
    </ThemeProvider>
  );
}