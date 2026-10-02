import { useState } from 'react';
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
  // Gönüllü kayıtlıysa canlı GPS takibini başlatır.
  // Konum değiştikçe Supabase'deki lat/lng/updated_at güncellenir.
  useVolunteerTracking();

  const {
    status,
    userLocation,
    nearestDistance,
    walkingTime,
    sortedOEDs,
    requestLocation,
  } = useGeolocation();

  const [showVolunteerModal, setShowVolunteerModal] =
    useState(false);

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

      {/* GÖNÜLLÜ OL BUTONU */}
      <button
        onClick={() =>
          setShowVolunteerModal(true)
        }
        className="fixed bottom-24 sm:bottom-8 right-4 sm:right-8 z-50 flex items-center gap-2 px-5 py-3.5 rounded-full bg-[var(--accent-green)] text-white font-bold shadow-lg hover:scale-105 active:scale-95 transition-all"
      >
        <span className="text-lg">
          ❤️
        </span>

        <span className="text-sm">
          Gönüllü Ol
        </span>
      </button>

      {/* GÖNÜLLÜ KAYIT MODALI */}
      <VolunteerModal
        isOpen={showVolunteerModal}
        onClose={() =>
          setShowVolunteerModal(false)
        }
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
