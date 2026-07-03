import { useEffect, useState, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
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

const oedIcon = L.divIcon({
  className: 'custom-oed-marker',
  html: `<div class="relative">
    <div class="w-8 h-8 rounded-full bg-[#DC2626] flex items-center justify-center shadow-lg border-2 border-white">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </div>
    <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#DC2626]"></div>
  </div>`,
  iconSize: [32, 40],
  iconAnchor: [16, 40],
  popupAnchor: [0, -42],
});

const nearestOedIcon = L.divIcon({
  className: 'custom-oed-marker',
  html: `<div class="relative pin-pulse">
    <div class="w-10 h-10 rounded-full bg-[#DC2626] flex items-center justify-center shadow-xl border-[3px] border-white">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
    </div>
    <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[9px] border-t-[#DC2626]"></div>
  </div>`,
  iconSize: [40, 48],
  iconAnchor: [20, 48],
  popupAnchor: [0, -50],
});

const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `<div class="relative"><div class="w-4 h-4 rounded-full bg-[#2563EB] border-2 border-white shadow-md"></div></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function MapController({ userLocation }: { userLocation: UserLocation | null }) {
  const map = useMap();
  useEffect(() => {
    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 15, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
    }
  }, [userLocation, map]);
  return null;
}

export function MapSection({ userLocation, geolocationStatus, oedLocations, onRequestLocation }: MapSectionProps) {
  const [mapRef, isInView] = useInView<HTMLDivElement>();
  const [isMapReady, setIsMapReady] = useState(false);

  const mapCenter = useMemo(() => {
    if (userLocation) return [userLocation.lat, userLocation.lng] as [number, number];
    return [39.925533, 32.866287] as [number, number];
  }, [userLocation]);

  useEffect(() => {
    const timer = setTimeout(() => setIsMapReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="pt-10 pb-12 sm:pb-16 px-4 sm:px-6">
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
            <span className="w-3 h-3 rounded-full bg-[#DC2626]"></span>
            <span className="text-xs text-[var(--text-muted)]">OED Cihazı</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-[#2563EB]"></span>
            <span className="text-xs text-[var(--text-muted)]">Sizin Konumunuz</span>
          </div>
        </div>

        <motion.div
          ref={mapRef}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl shadow-xl border border-[var(--border)] overflow-hidden bg-white"
          style={{ aspectRatio: '16/9' }}
        >
          {!isMapReady || geolocationStatus === 'loading' ? (
            <SkeletonLoader />
          ) : geolocationStatus === 'denied' || geolocationStatus === 'error' ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[var(--bg-primary)] min-h-[300px]">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" className="opacity-30">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              <p className="mt-3 text-sm text-[var(--text-muted)]">Konumunuza erişmek için izin verin</p>
              <button
                onClick={onRequestLocation}
                className="mt-3 px-5 py-2 rounded-lg bg-[var(--accent-blue)] text-white text-sm font-medium hover:bg-[var(--accent-blue-hover)] transition-colors"
              >
                Konumumu Kullan
              </button>
            </div>
          ) : (
            <MapContainer
              center={mapCenter}
              zoom={13}
              scrollWheelZoom={true}
              zoomControl={false}
              className="w-full h-full"
              style={{ minHeight: '300px' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/">CARTO</a>'
                url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
              />
              <MapController userLocation={userLocation} />

              {userLocation && (
                <>
                  <Circle
                    center={[userLocation.lat, userLocation.lng]}
                    radius={userLocation.accuracy || 100}
                    pathOptions={{
                      color: '#2563EB',
                      fillColor: '#2563EB',
                      fillOpacity: 0.08,
                      weight: 1,
                      opacity: 0.3,
                    }}
                  />
                  <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon} />
                </>
              )}

              {oedLocations.map((oed, index) => (
                <Marker
                  key={oed.id}
                  position={[oed.lat, oed.lng]}
                  icon={index === 0 && oed.distance ? nearestOedIcon : oedIcon}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <h3 className="text-sm font-semibold text-[var(--text-primary)]">{oed.name}</h3>
                      <p className="text-xs text-[var(--text-muted)] mt-1">{oed.address}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                          oed.status === 'available'
                            ? 'bg-[var(--accent-green-light)] text-[var(--accent-green)]'
                            : oed.status === 'in-use'
                            ? 'bg-[var(--accent-amber-light)] text-[var(--accent-amber)]'
                            : 'bg-gray-100 text-gray-500'
                        }`}>
                          {oed.status === 'available' ? 'Müsait' : oed.status === 'in-use' ? 'Kullanımda' : 'Bilinmiyor'}
                        </span>
                        {oed.distance !== undefined && (
                          <span className="text-[10px] font-medium text-[var(--accent-blue)]">
                            {oed.distance < 1000 ? `${oed.distance}m` : `${(oed.distance / 1000).toFixed(1)}km`}
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${oed.lat},${oed.lng}`, '_blank')}
                        className="mt-3 w-full py-2 rounded-lg bg-[var(--accent-blue)] text-white text-xs font-medium hover:bg-[var(--accent-blue-hover)] transition-colors"
                      >
                        Yol Tarifi Al
                      </button>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </motion.div>
      </div>
    </section>
  );
}
