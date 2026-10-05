import { useEffect, useMemo, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
  Circle,
} from 'react-leaflet';
import { motion } from 'framer-motion';
import {
  Navigation,
  MapPin,
  LocateFixed,
  AlertTriangle,
  Clock3,
  ExternalLink,
  Crosshair,
} from 'lucide-react';
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

const ANKARA_CENTER: [number, number] = [39.925533, 32.866287];

/*
 * CARTO Voyager
 * API anahtarý doðrudan URL üzerinde kullanýlýyor.
 */
const CARTO_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

const oedIcon = L.divIcon({
  className: 'custom-oed-marker',
  html: `
    <div style="
      position: relative;
      width: 42px;
      height: 50px;
      display: flex;
      align-items: flex-start;
      justify-content: center;
    ">
      <div style="
        width: 38px;
        height: 38px;
        border-radius: 50%;
        background: linear-gradient(145deg, #ef4444, #dc2626);
        border: 3px solid #ffffff;
        box-shadow:
          0 4px 12px rgba(15, 23, 42, 0.28),
          0 0 0 2px rgba(220, 38, 38, 0.12);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <svg
          width="17"
          height="17"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0-7.78 0z"/>
        </svg>
      </div>

      <div style="
        position: absolute;
        left: 50%;
        bottom: 3px;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 7px solid transparent;
        border-right: 7px solid transparent;
        border-top: 10px solid #dc2626;
      "></div>
    </div>
  `,
  iconSize: [42, 50],
  iconAnchor: [21, 50],
  popupAnchor: [0, -52],
});

const nearestOedIcon = L.divIcon({
  className: 'custom-oed-marker custom-oed-marker-nearest',
  html: `
    <div style="
      position: relative;
      width: 52px;
      height: 62px;
      display: flex;
      align-items: flex-start;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        top: -3px;
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: rgba(220, 38, 38, 0.18);
        animation: oedPulse 2s ease-out infinite;
      "></div>

      <div style="
        position: relative;
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(145deg, #ef4444, #b91c1c);
        border: 3px solid #ffffff;
        box-shadow:
          0 5px 16px rgba(15, 23, 42, 0.34),
          0 0 0 3px rgba(220, 38, 38, 0.18);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 2;
      ">
        <svg
          width="19"
          height="19"
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

      <div style="
        position: absolute;
        left: 50%;
        bottom: 3px;
        transform: translateX(-50%);
        width: 0;
        height: 0;
        border-left: 8px solid transparent;
        border-right: 8px solid transparent;
        border-top: 11px solid #b91c1c;
        z-index: 1;
      "></div>

      <div style="
        position: absolute;
        top: -23px;
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
        background: #0f172a;
        color: white;
        border-radius: 999px;
        padding: 4px 9px;
        font-size: 9px;
        font-weight: 700;
        letter-spacing: .02em;
        box-shadow: 0 4px 12px rgba(15,23,42,.22);
        z-index: 5;
      ">
        EN YAKIN
      </div>
    </div>
  `,
  iconSize: [52, 62],
  iconAnchor: [26, 62],
  popupAnchor: [0, -64],
});

const userIcon = L.divIcon({
  className: 'custom-user-marker',
  html: `
    <div style="
      position: relative;
      width: 30px;
      height: 30px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: rgba(37, 99, 235, 0.18);
        animation: userPulse 2s ease-out infinite;
      "></div>

      <div style="
        position: relative;
        width: 17px;
        height: 17px;
        border-radius: 50%;
        background: #2563eb;
        border: 3px solid white;
        box-shadow: 0 3px 10px rgba(15,23,42,.28);
        z-index: 2;
      "></div>
    </div>
  `,
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

const emergencyIcon = L.divIcon({
  className: 'custom-emergency-marker',
  html: `
    <div style="
      position: relative;
      width: 54px;
      height: 54px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        width: 54px;
        height: 54px;
        border-radius: 50%;
        background: rgba(239, 68, 68, 0.18);
        animation: emergencyPulse 1.6s ease-out infinite;
      "></div>

      <div style="
        position: relative;
        width: 46px;
        height: 46px;
        border-radius: 50%;
        background: linear-gradient(145deg, #ef4444, #b91c1c);
        border: 4px solid white;
        box-shadow: 0 5px 18px rgba(127,29,29,.35);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-size: 23px;
        font-weight: 800;
        z-index: 2;
      ">
        !
      </div>
    </div>
  `,
  iconSize: [54, 54],
  iconAnchor: [27, 27],
  popupAnchor: [0, -30],
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
      map.flyTo(emergencyLocation, 17, {
        duration: 1.3,
        easeLinearity: 0.25,
      });
      return;
    }

    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 15, {
        duration: 1.2,
        easeLinearity: 0.25,
      });
      return;
    }

    map.setView(ANKARA_CENTER, 12);
  }, [userLocation, emergencyLocation, map]);

  return null;
}

function MapStyle() {
  return (
    <style>
      {`
        .leaflet-container {
          font-family: inherit;
          background: var(--map-bg);
        }

        .leaflet-tile {
          image-rendering: auto;
        }

        .leaflet-control-zoom {
          border: 0 !important;
          box-shadow: 0 8px 24px rgba(15, 23, 42, 0.14) !important;
          overflow: hidden;
          border-radius: 12px !important;
        }

        .leaflet-control-zoom a {
          width: 38px !important;
          height: 38px !important;
          line-height: 38px !important;
          border: 0 !important;
          color: var(--text-secondary) !important;
          background: var(--bg-card) !important;
          font-size: 20px !important;
          font-weight: 500 !important;
          transition: background .2s ease, color .2s ease;
        }

        .leaflet-control-zoom a:hover {
          background: var(--border-subtle) !important;
          color: var(--accent-blue) !important;
        }

        .leaflet-control-attribution {
          border-radius: 8px 0 0 0 !important;
          padding: 4px 7px !important;
          background: var(--bg-card) !important;
          backdrop-filter: blur(8px);
          font-size: 9px !important;
          color: var(--text-muted) !important;
        }

        .leaflet-popup-content-wrapper {
          border-radius: 16px !important;
          padding: 0 !important;
          overflow: hidden;
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.18) !important;
        }

        .leaflet-popup-content {
          margin: 0 !important;
          min-width: 220px;
        }

        .leaflet-popup-tip {
          box-shadow: 3px 3px 5px rgba(15, 23, 42, 0.08);
        }

        .leaflet-popup-close-button {
          top: 10px !important;
          right: 10px !important;
          width: 28px !important;
          height: 28px !important;
          border-radius: 50%;
          color: var(--text-muted) !important;
          background: var(--bg-card) !important;
          font-size: 18px !important;
          line-height: 26px !important;
          z-index: 5;
        }

        @keyframes oedPulse {
          0% {
            transform: scale(.7);
            opacity: .65;
          }

          70% {
            transform: scale(1.35);
            opacity: 0;
          }

          100% {
            transform: scale(1.35);
            opacity: 0;
          }
        }

        @keyframes userPulse {
          0% {
            transform: scale(.75);
            opacity: .7;
          }

          70% {
            transform: scale(1.45);
            opacity: 0;
          }

          100% {
            transform: scale(1.45);
            opacity: 0;
          }
        }

        @keyframes emergencyPulse {
          0% {
            transform: scale(.75);
            opacity: .75;
          }

          70% {
            transform: scale(1.4);
            opacity: 0;
          }

          100% {
            transform: scale(1.4);
            opacity: 0;
          }
        }
      `}
    </style>
  );
}

export function MapSection({
  userLocation,
  geolocationStatus,
  oedLocations,
  onRequestLocation,
}: MapSectionProps) {
  const [mapRef, isInView] = useInView<HTMLDivElement>();
  const [isMapReady, setIsMapReady] = useState(false);

  const emergencyLocation = useMemo(() => {
    const params = new URLSearchParams(window.location.search);

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

    return [lat, lng] as [number, number];
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

    return () => clearTimeout(timer);
  }, [emergencyLocation, mapRef]);

  const mapCenter = useMemo(() => {
    if (emergencyLocation) {
      return emergencyLocation;
    }

    if (userLocation) {
      return [userLocation.lat, userLocation.lng] as [number, number];
    }

    return ANKARA_CENTER;
  }, [userLocation, emergencyLocation]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapReady(true);
    }, 300);

    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      id="oed-map"
      className="pt-10 pb-12 sm:pb-16 px-4 sm:px-6 scroll-mt-24"
    >
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
          <div>
            <div className="inline-flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-red-500" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--text-muted)]">
                Ankara OED Haritasý
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-semibold text-[var(--text-primary)] tracking-tight">
              OED Konumlarý
            </h2>

            <p className="text-sm sm:text-base text-[var(--text-secondary)] mt-1">
              Size en yakýn otomatik eksternal defibrilatörü harita üzerinden bulun.
            </p>
          </div>

          <button
            type="button"
            onClick={onRequestLocation}
            disabled={geolocationStatus === 'loading'}
            className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3.5 py-2.5 text-xs font-semibold text-[var(--text-primary)] shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:cursor-wait disabled:opacity-60"
          >
            <LocateFixed className="w-4 h-4 text-[var(--accent-blue)]" />
            {geolocationStatus === 'loading'
              ? 'Konum alýnýyor...'
              : 'Konumumu Bul'}
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 mb-4">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 shadow-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-100" />
            <span className="text-[11px] font-medium text-[var(--text-secondary)]">
              OED
            </span>
          </div>

          {userLocation && (
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-100" />
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                Konumunuz
              </span>
            </div>
          )}

          {emergencyLocation && (
            <div className="inline-flex items-center gap-2 rounded-full border border-red-200 bg-red-50 px-3 py-1.5 shadow-sm">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 ring-2 ring-red-100" />
              <span className="text-[11px] font-semibold text-red-700">
                Acil Durum
              </span>
            </div>
          )}

          {oedLocations.length > 0 && (
            <div className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--surface)] px-3 py-1.5 shadow-sm">
              <MapPin className="w-3.5 h-3.5 text-[var(--text-muted)]" />
              <span className="text-[11px] font-medium text-[var(--text-secondary)]">
                {oedLocations.length} OED noktasý
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
            ease: [0.22, 1, 0.36, 1],
          }}
                    className="relative z-0 isolate rounded-[22px] overflow-hidden border border-[var(--border)] bg-[#e8edf3] shadow-[0_18px_55px_rgba(15,23,42,0.10)] h-[390px] sm:h-[clamp(450px,52vw,620px)]"
          style={{
            height: 'clamp(390px, 52vw, 620px)',
          }}
        >
          {!isMapReady ||
          (geolocationStatus === 'loading' && !emergencyLocation) ? (
            <SkeletonLoader />
          ) : (
            <>
              <MapStyle />

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
                  attribution='&copy; <a href="https://carto.com/" target="_blank" rel="noopener noreferrer">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
                  url={CARTO_TILE_URL}
                  maxZoom={20}
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
                      <div className="p-4 bg-[var(--bg-card)]">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          </div>

                          <div>
                            <h3 className="text-sm font-bold text-[var(--text-primary)]">
                              Acil Durum
                            </h3>

                            <p className="text-[10px] text-[var(--text-muted)]">
                              Yardým konumu
                            </p>
                          </div>
                        </div>

                        <p className="text-xs text-[var(--text-secondary)]">
                          Yardým gerekiyor. En yakýn OED noktasýný kontrol edin.
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
                      radius={userLocation.accuracy || 100}
                      pathOptions={{
                        color: '#2563EB',
                        fillColor: '#2563EB',
                        fillOpacity: 0.07,
                        weight: 1.5,
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
                        <div className="p-4 bg-[var(--bg-card)]">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                              <Crosshair className="w-4 h-4 text-blue-600" />
                            </div>

                            <div>
                              <h3 className="text-sm font-bold text-[var(--text-primary)]">
                                Sizin Konumunuz
                              </h3>

                              <p className="text-[10px] text-[var(--text-muted)]">
                                Mevcut konum
                              </p>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  </>
                )}

                {oedLocations.map((oed, index) => {
                  const isNearest =
                    index === 0 &&
                    oed.distance !== undefined;

                  return (
                    <Marker
                      key={oed.id}
                      position={[oed.lat, oed.lng]}
                      icon={
                        isNearest
                          ? nearestOedIcon
                          : oedIcon
                      }
                    >
                      <Popup>
                        <div className="bg-[var(--bg-card)] overflow-hidden">
                          <div className="px-4 pt-4 pb-3 border-b border-slate-100">
                            <div className="flex items-start gap-3 pr-5">
                              <div className="w-10 h-10 shrink-0 rounded-xl bg-red-50 flex items-center justify-center">
                                <MapPin className="w-5 h-5 text-red-600" />
                              </div>

                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-1.5 mb-1">
                                  <span className="text-[9px] uppercase tracking-[0.1em] font-bold text-red-600">
                                    OED NOKTASI
                                  </span>

                                  {isNearest && (
                                    <span className="text-[9px] uppercase tracking-[0.06em] font-bold bg-slate-900 text-white rounded-full px-2 py-0.5">
                                      En Yakýn
                                    </span>
                                  )}
                                </div>

                                <h3 className="text-sm font-bold leading-tight text-[var(--text-primary)]">
                                  {oed.name}
                                </h3>

                                <p className="text-[11px] leading-relaxed text-[var(--text-muted)] mt-1">
                                  {oed.address}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="px-4 py-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-1.5">
                                <span
                                  className={`w-2 h-2 rounded-full ${
                                    oed.status === 'available'
                                      ? 'bg-emerald-500'
                                      : oed.status === 'in-use'
                                        ? 'bg-amber-500'
                                        : 'bg-slate-400'
                                  }`}
                                />

                                <span className="text-[11px] font-semibold text-[var(--text-secondary)]">
                                  {oed.status === 'available'
                                    ? 'Müsait'
                                    : oed.status === 'in-use'
                                      ? 'Kullanýmda'
                                      : 'Durum bilinmiyor'}
                                </span>
                              </div>

                              {oed.distance !== undefined && (
                                <div className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600">
                                  <Navigation className="w-3 h-3" />

                                  {oed.distance < 1000
                                    ? `${oed.distance} m`
                                    : `${(
                                        oed.distance / 1000
                                      ).toFixed(1)} km`}
                                </div>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5 mt-2 text-[10px] text-[var(--text-muted)]">
                              <Clock3 className="w-3 h-3" />
                              <span>{oed.hours}</span>
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                window.open(
                                  `https://www.google.com/maps/dir/?api=1&destination=${oed.lat},${oed.lng}`,
                                  '_blank',
                                  'noopener,noreferrer'
                                )
                              }
                              className="mt-3 w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 text-white text-[11px] font-bold shadow-sm transition-all hover:bg-blue-700 hover:shadow-md active:scale-[0.98]"
                            >
                              <Navigation className="w-3.5 h-3.5" />
                              Yol Tarifi Al
                              <ExternalLink className="w-3 h-3 opacity-70" />
                            </button>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}
              </MapContainer>

              <div className="pointer-events-none absolute left-4 top-4 z-[500]">
                <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-card)]/90 px-3 py-2 shadow-lg backdrop-blur-md">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50">
                      <Navigation className="h-3.5 w-3.5 text-blue-600" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-[var(--text-primary)]">
                        Ankara OED Haritasý
                      </p>

                      <p className="text-[9px] text-[var(--text-muted)]">
                        Yakýnýnýzdaki noktalarý keþfedin
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </motion.div>
      </div>
    </section>
  );
}















