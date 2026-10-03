import { useEffect, useState, useMemo } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from 'react-leaflet';
import { motion } from 'framer-motion';
import { useInView } from '@/hooks/useInView';
import type { UserLocation, OEDLocation } from '@/types';
import { SkeletonLoader } from '@/components/SkeletonLoader';
import L from 'leaflet';

interface MapSectionProps {
  userLocation: UserLocation | null;
  geolocationStatus: string;
  oedLocations: OEDLocation[];
  onRequestLocation: () => void;
}

const ANKARA_CENTER: [number, number] = [
  39.925533,
  32.866287,
];

const oedIcon = L.divIcon({
  className: 'custom-oed-marker',
  html: `
    <div class="relative">
      <div class="w-8 h-8 rounded-full bg-[#DC2626] flex items-center justify-center shadow-lg border-2 border-white">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0-7.78 0z"/>
        </svg>
      </div>

      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#DC2626]"></div>
    </div>
  `,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -42],
});

const nearestOedIcon = L.divIcon({
  className: 'custom-oed-marker',
  html: `
    <div class="relative">
      <div class="w-10 h-10 rounded-full bg-[#DC2626] flex items-center justify-center shadow-xl border-[3px] border-white">
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0-7.78 0z"/>
        </svg>
      </div>

      <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-[#DC2626]"></div>
    </div>
  `,
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -50],
});

const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div class="w-4 h-4 rounded-full bg-[#2563EB] border-2 border-white shadow-md"></div>
  `,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

const emergencyIcon = L.divIcon({
  className: 'custom-emergency-marker',
  html: `
    <div
      style="
        width: 48px;
        height: 48px;
        border-radius: 50%;
        background: #EF4444;
        border: 4px solid white;
        box-shadow: 0 4px 15px rgba(0,0,0,0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 24px;
        font-weight: bold;
      "
    >
      !
    </div>
  `,
  iconSize: [48, 48],
  iconAnchor: [24, 24],
  popupAnchor: [0, -28],
});

function MapController({
  userLocation,
  emergencyLocation,
}: {
  userLocation: UserLocation | null;
  emergencyLocation: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (emergencyLocation) {
      map.flyTo(
        emergencyLocation,
        17,
        {
          duration: 1.3,
          easeLinearity: 0.25,
        }
      );

      return;
    }

    if (userLocation) {
      map.flyTo(
        [userLocation.lat, userLocation.lng],
        15,
        {
          duration: 1.2,
          easeLinearity: 0.25,
        }
      );

      return;
    }

    map.setView(ANKARA_CENTER, 12);
  }, [
    userLocation,
    emergencyLocation,
    map,
  ]);

  return null;
}

export function MapSection({
  userLocation,
  geolocationStatus,
  oedLocations,
  onRequestLocation,
}: MapSectionProps) {
  const [mapRef, isInView] =
    useInView<HTMLDivElement>();

  const [isMapReady, setIsMapReady] =
    useState(false);

  const emergencyLocation = useMemo(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const latValue = params.get('lat');
    const lngValue = params.get('lng');

    if (!latValue || !lngValue) {
      return null;
    }

    const lat = Number(latValue);
    const lng = Number(lngValue);

    if (
      !Number.isFinite(lat) ||
      !Number.isFinite(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      return null;
    }

    window.history.replaceState(
      {},
      document.title,
      window.location.pathname
    );

    return [lat, lng] as [
      number,
      number
    ];
  }, []);

  useEffect(() => {
    if (!emergencyLocation) {
      return;
    }

    const timer = setTimeout(() => {
      mapRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    }, 700);

    return () => {
      clearTimeout(timer);
    };
  }, [
    emergencyLocation,
    mapRef,
  ]);

  const mapCenter = useMemo(() => {
    if (emergencyLocation) {
      return emergencyLocation;
    }

    if (userLocation) {
      return [
        userLocation.lat,
        userLocation.lng,
      ] as [number, number];
    }

    return ANKARA_CENTER;
  }, [
    userLocation,
    emergencyLocation,
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapReady(true);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, []);

  return (
    <section
      id="oed-map"
      className="pt-10 pb-12 sm:pb-16 px-4 sm:px-6 scroll-mt-24"
    >
      <div className="max-w-[1200px] mx-auto">

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
              OED Konumları
            </h2>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">
              Haritada en yakın otomatik eksternal defibrilatörleri görüntüleyin
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 mb-4">

          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#DC2626]" />

            <span className="text-xs text-[var(--text-muted)]">
              OED Cihazı
            </span>
          </div>

          {userLocation && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#2563EB]" />

              <span className="text-xs text-[var(--text-muted)]">
                Sizin Konumunuz
              </span>
            </div>
          )}

          {emergencyLocation && (
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-[#EF4444]" />

              <span className="text-xs text-[var(--text-muted)]">
                Acil Durum Konumu
              </span>
            </div>
          )}
        </div>

        <motion.div
          ref={mapRef}
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={
            isInView
              ? {
                  opacity: 1,
                  y: 0,
                }
              : {}
          }
          transition={{
            duration: 0.6,
            ease: [
              0.22,
              1,
              0.36,
              1,
            ],
          }}
          className="relative rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden bg-[#e5e7eb]"
          style={{
            height:
              'clamp(360px, 52vw, 620px)',
          }}
        >
          {!isMapReady ||
          (
            geolocationStatus === 'loading' &&
            !emergencyLocation
          ) ? (
            <SkeletonLoader />
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={
                emergencyLocation
                  ? 17
                  : userLocation
                  ? 15
                  : 12
              }
              scrollWheelZoom={true}
              zoomControl={true}
              className="w-full h-full"
              style={{
                height: '100%',
                width: '100%',
              }}
            >

              <TileLayer
                attribution="&copy; OpenStreetMap contributors"
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
              />

              <MapController
                userLocation={userLocation}
                emergencyLocation={emergencyLocation}
              />

              {emergencyLocation && (
                <Marker
                  position={emergencyLocation}
                  icon={emergencyIcon}
                >
                  <Popup>
                    <div className="min-w-[180px]">
                      <h3 className="text-sm font-semibold text-red-600">
                        🚨 Acil Durum
                      </h3>

                      <p className="text-xs text-[var(--text-muted)] mt-1">
                        Yardım gerekiyor.
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {userLocation && (
                <>
                  <Circle
                    center={[
                      userLocation.lat,
                      userLocation.lng,
                    ]}
                    radius={
                      userLocation.accuracy ||
                      100
                    }
                    pathOptions={{
                      color: '#2563EB',
                      fillColor: '#2563EB',
                      fillOpacity: 0.08,
                      weight: 1,
                      opacity: 0.3,
                    }}
                  />

                  <Marker
                    position={[
                      userLocation.lat,
                      userLocation.lng,
                    ]}
                    icon={userIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong>
                          Sizin Konumunuz
                        </strong>
                      </div>
                    </Popup>
                  </Marker>
                </>
              )}

              {oedLocations.map(
                (oed, index) => (
                  <Marker
                    key={oed.id}
                    position={[
                      oed.lat,
                      oed.lng,
                    ]}
                    icon={
                      index === 0 &&
                      oed.distance !==
                        undefined
                        ? nearestOedIcon
                        : oedIcon
                    }
                  >
                    <Popup>
                      <div className="min-w-[200px]">

                        <h3 className="text-sm font-semibold text-[var(--text-primary)]">
                          {oed.name}
                        </h3>

                        <p className="text-xs text-[var(--text-muted)] mt-1">
                          {oed.address}
                        </p>

                        <div className="flex items-center gap-2 mt-2">

                          <span
                            className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                              oed.status ===
                              'available'
                                ? 'bg-[var(--accent-green-light)] text-[var(--accent-green)]'
                                : oed.status ===
                                  'in-use'
                                ? 'bg-[var(--accent-amber-light)] text-[var(--accent-amber)]'
                                : 'bg-gray-100 text-gray-500'
                            }`}
                          >
                            {oed.status ===
                            'available'
                              ? 'Müsait'
                              : oed.status ===
                                'in-use'
                              ? 'Kullanımda'
                              : 'Bilinmiyor'}
                          </span>

                          {oed.distance !==
                            undefined && (
                            <span className="text-[10px] font-medium text-[var(--accent-blue)]">
                              {oed.distance <
                              1000
                                ? `${oed.distance}m`
                                : `${(
                                    oed.distance /
                                    1000
                                  ).toFixed(
                                    1
                                  )}km`}
                            </span>
                          )}

                        </div>

                        <button
                          onClick={() =>
                            window.open(
                              `https://www.google.com/maps/dir/?api=1&destination=${oed.lat},${oed.lng}`,
                              '_blank'
                            )
                          }
                          className="mt-3 w-full py-2 rounded-lg bg-[var(--accent-blue)] text-white text-xs font-medium hover:bg-[var(--accent-blue-hover)] transition-colors"
                        >
                          Yol Tarifi Al
                        </button>

                      </div>
                    </Popup>
                  </Marker>
                )
              )}

            </MapContainer>
          )}
        </motion.div>
      </div>
    </section>
  );
}