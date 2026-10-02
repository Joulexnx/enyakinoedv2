import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useVolunteerTracking() {
  useEffect(() => {
    let watchId: number | null = null;
    let cancelled = false;

    const startTracking = async () => {
      const volunteerId =
        localStorage.getItem('volunteer_id');

      if (!volunteerId) {
        return;
      }

      if (!navigator.geolocation) {
        console.warn(
          'Bu cihaz konum takibini desteklemiyor.'
        );
        return;
      }

      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          if (cancelled) {
            return;
          }

          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          console.log(
            '[Volunteer GPS]',
            lat,
            lng
          );

          const { error } = await supabase
            .from('volunteers')
            .update({
              lat,
              lng,
              updated_at:
                new Date().toISOString(),
            })
            .eq('id', volunteerId);

          if (error) {
            console.error(
              'Gönüllü konumu güncellenemedi:',
              error
            );
          }
        },
        (error) => {
          console.error(
            'Gönüllü konum takip hatası:',
            error
          );
        },
        {
          enableHighAccuracy: true,
          maximumAge: 5000,
          timeout: 15000,
        }
      );
    };

    startTracking();

    return () => {
      cancelled = true;

      if (watchId !== null) {
        navigator.geolocation.clearWatch(
          watchId
        );
      }
    };
  }, []);
}
