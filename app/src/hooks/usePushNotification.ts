import { useState, useEffect, useCallback } from 'react';

const VAPID_PUBLIC_KEY = 'BLZ8QYM3SeS7eU1D58mTwUb9stK8vEYfCxphM7RWFzmZyXTrqdhs2SoCwqELFFfrkuCtc-RattpAQWB1VNVMSSI';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

interface PushSubscriptionData {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export function usePushNotification() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscriptionData | null>(null);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    const checkSupport = 'serviceWorker' in navigator && 'PushManager' in window;
    console.log('[Push] Support check:', checkSupport);
    setIsSupported(checkSupport);

    if (checkSupport) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          console.log('[Push] SW registered:', reg.scope, 'active:', !!reg.active);
          setRegistration(reg);
          return reg.pushManager.getSubscription();
        })
        .then((sub) => {
          if (sub) {
            console.log('[Push] Existing subscription found');
            setIsSubscribed(true);
            const keys = sub.toJSON().keys;
            if (keys?.p256dh && keys?.auth) {
              setSubscription({
                endpoint: sub.endpoint,
                p256dh: keys.p256dh,
                auth: keys.auth,
              });
            }
          } else {
            console.log('[Push] No existing subscription');
          }
        })
        .catch((err) => {
          console.error('[Push] SW registration failed:', err);
        });
    }
  }, []);

  const subscribe = useCallback(async (): Promise<PushSubscriptionData | null> => {
    console.log('[Push] Subscribe called, registration:', !!registration);
    if (!registration) return null;

    try {
      console.log('[Push] Requesting notification permission...');
      const permission = await Notification.requestPermission();
      console.log('[Push] Notification permission:', permission);
      
      if (permission !== 'granted') {
        throw new Error('Bildirim izni verilmedi');
      }

      console.log('[Push] Subscribing to push manager...');
      const sub = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY) as unknown as ArrayBuffer,
      });

      console.log('[Push] Push subscription obtained:', !!sub);
      const keys = sub.toJSON().keys;
      
      if (!keys?.p256dh || !keys?.auth) {
        throw new Error('Push keys alinamadi');
      }

      const data: PushSubscriptionData = {
        endpoint: sub.endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth,
      };

      console.log('[Push] Subscription data ready, endpoint:', data.endpoint.substring(0, 50) + '...');
      setSubscription(data);
      setIsSubscribed(true);
      return data;
    } catch (err) {
      console.error('[Push] Push subscription failed:', err);
      return null;
    }
  }, [registration]);

  return { isSupported, isSubscribed, subscription, subscribe };
}
