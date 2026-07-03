import { useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    OneSignalDeferred?: Array<(OneSignal: any) => void>;
    OneSignal?: any;
  }
}

export function useOneSignal() {
  const [isReady, setIsReady] = useState(false);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const check = () => {
      if (typeof window !== 'undefined' && window.OneSignal) {
        setIsReady(true);
        const id = window.OneSignal.User?.PushSubscription?.id;
        const optIn = window.OneSignal.User?.PushSubscription?.optedIn;
        if (id) setPlayerId(id);
        if (optIn) setIsSubscribed(true);
      }
    };
    const timer = setInterval(check, 500);
    setTimeout(() => clearInterval(timer), 10000);
    return () => clearInterval(timer);
  }, []);

  const subscribe = useCallback(async (): Promise<string | null> => {
    if (!window.OneSignal) {
      console.log('[OneSignal] SDK hazir degil');
      return null;
    }

    try {
      await window.OneSignal.Slidedown.promptPush({ force: true });
      await new Promise((r) => setTimeout(r, 2000));

      const id = window.OneSignal.User?.PushSubscription?.id;
      const optIn = window.OneSignal.User?.PushSubscription?.optedIn;

      console.log('[OneSignal] Player ID:', id, 'OptedIn:', optIn);

      if (id) {
        setPlayerId(id);
        setIsSubscribed(true);
        return id;
      }
      return null;
    } catch (err: any) {
      console.error('[OneSignal] Subscribe error:', err);
      return null;
    }
  }, []);

  return { isReady, playerId, isSubscribed, subscribe };
}
