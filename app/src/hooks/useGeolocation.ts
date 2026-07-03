import { useState, useCallback } from 'react';
import type { UserLocation, GeolocationStatus, OEDLocation } from '@/types';
import { OED_LOCATIONS } from '@/data/oed-locations';

// Haversine formula to calculate distance in meters
function getDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

// Estimate walking time in minutes
function getWalkingTime(distanceMeters: number): number {
  const walkingSpeedMps = 1.4; // ~5 km/h
  const seconds = distanceMeters / walkingSpeedMps;
  return Math.ceil(seconds / 60);
}

export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [nearestDistance, setNearestDistance] = useState<string>('-');
  const [walkingTime, setWalkingTime] = useState<string>('-');
  const [sortedOEDs, setSortedOEDs] = useState<OEDLocation[]>(OED_LOCATIONS);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      return;
    }

    setStatus('loading');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        const location = { lat: latitude, lng: longitude, accuracy };
        setUserLocation(location);
        setStatus('granted');

        // Calculate distances and sort
        const withDistances = OED_LOCATIONS.map((oed) => ({
          ...oed,
          distance: getDistance(latitude, longitude, oed.lat, oed.lng),
        })).sort((a, b) => (a.distance || 0) - (b.distance || 0));

        setSortedOEDs(withDistances);

        const nearest = withDistances[0];
        if (nearest.distance) {
          if (nearest.distance < 1000) {
            setNearestDistance(`${nearest.distance}m`);
          } else {
            setNearestDistance(`${(nearest.distance / 1000).toFixed(1)}km`);
          }
          const time = getWalkingTime(nearest.distance);
          setWalkingTime(`${time}dk`);
        }
      },
      () => {
        setStatus('denied');
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  return {
    status,
    userLocation,
    nearestDistance,
    walkingTime,
    sortedOEDs,
    requestLocation,
  };
}
