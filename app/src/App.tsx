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
import FirstAidCourses from '@/pages/FirstAidCourses';
import CourseCenterManagement from '@/pages/CourseCenterManagement';

import { MobileBottomNav } from '@/components/MobileBottomNav';

function HomePage() {
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
    <div className="min-h-screen bg-[var(--bg-primary)] pb-24 sm:pb-0">

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
    window.location.pathname.replace(/\/+$/, '') || '/';

  const isManagementPage =
    path === '/kurs-merkezi-yonetim';

  return (
    <ThemeProvider>

      {path === '/gizlilik-politikasi' ? (
        <PrivacyPolicy />

      ) : path === '/ilk-yardim-kurslari' ? (
        <FirstAidCourses />

      ) : isManagementPage ? (
        <CourseCenterManagement />

      ) : (
        <HomePage />
      )}

      {!isManagementPage && (
        <MobileBottomNav
          activeItem={
            path === '/ilk-yardim-kurslari'
              ? 'courses'
              : 'home'
          }
        />
      )}

    </ThemeProvider>
  );
}