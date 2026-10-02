import OneSignal from 'react-onesignal';

const ONESIGNAL_APP_ID = '3628049c-37d2-483e-afe9-f6eafae5761a';

let initPromise: Promise<void> | null = null;

export function initOneSignal() {
  if (!initPromise) {
    initPromise = OneSignal.init({
      appId: ONESIGNAL_APP_ID,
      allowLocalhostAsSecureOrigin: true,
      serviceWorkerPath: '/OneSignalSDKWorker.js',
      serviceWorkerUpdaterPath: '/OneSignalSDKUpdaterWorker.js',
    });
  }

  return initPromise;
}

export async function requestOneSignalPermission() {
  await initOneSignal();

  await OneSignal.Notifications.requestPermission();

  // OneSignal abonelik ID'sinin oluşmasını bekle
  for (let i = 0; i < 20; i++) {
    const subscriptionId = OneSignal.User.PushSubscription.id;

    if (subscriptionId) {
      return subscriptionId;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return null;
}
