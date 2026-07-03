export interface OEDLocation {
  id: number;
  name: string;
  address: string;
  lat: number;
  lng: number;
  distance?: number;
  status: 'available' | 'in-use' | 'unknown';
  hours: string;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export type GeolocationStatus = 'idle' | 'loading' | 'granted' | 'denied' | 'error';

export interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  subtitle: string;
  color: 'red' | 'blue' | 'amber' | 'green';
  isCounter?: boolean;
}

export interface OEDCardProps {
  oed: OEDLocation;
  index: number;
}
