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

import { VolunteerModal } from '@/components/VolunteerModal';
import { VolunteersPanel } from '@/components/VolunteersPanel';
import { EmergencyCallButton } from '@/components/EmergencyCallButton';

function HomePage() {
  // Gönüllü kayıt sistemi ileride tekrar aktif edilecek.
  // Mevcut GPS takip sistemi korunuyor.
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

      {/* GÖNÜLLÜ OL - GEÇİCİ OLARAK PASİF */}
      <button
        disabled
        className="fixed bottom-4 sm:bottom-8 right-4 sm:right-8 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full bg-gray-400 text-white font-bold shadow-md cursor-not-allowed opacity-90"
      >
        <span className="text-lg">
          🔒
        </span>

        <span className="text-sm">
          Yakında Aktif
        </span>
      </button>

      {/* GÖNÜLLÜ KAYIT MODALI
          Daha sonra tekrar aktif edilebilir. */}
      <VolunteerModal
        isOpen={false}
        onClose={() => {}}
        userLocation={userLocation}
      />

      {/* ACİL DURUM BUTONU */}
      <EmergencyCallButton
        userLocation={userLocation}
      />
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