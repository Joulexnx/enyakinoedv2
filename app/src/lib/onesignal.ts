import { Capacitor } from '@capacitor/core'
import NativeOneSignal from '@onesignal/capacitor-plugin'
import WebOneSignal from 'react-onesignal'

const ONESIGNAL_APP_ID =
  '3628049c-37d2-483e-afe9-f6eafae5761a'

let nativeInitPromise: Promise<void> | null = null
let webInitPromise: Promise<void> | null = null

export function initOneSignal(): Promise<void> {
  if (Capacitor.isNativePlatform()) {
    if (!nativeInitPromise) {
      console.log('OneSignal: Native initialize başlıyor...')

      nativeInitPromise = NativeOneSignal.initialize(
        ONESIGNAL_APP_ID
      )
        .then(() => {
          console.log(
            'OneSignal: Native initialize başarılı.'
          )

          NativeOneSignal.Notifications.addEventListener(
            'click',
            (event) => {
              console.log(
                'OneSignal: Bildirime tıklandı:',
                event
              )

              const data =
                event.notification.additionalData

              if (!data) {
                console.log(
                  'OneSignal: Bildirimde ek veri yok.'
                )
                return
              }

              const latitude = data.latitude
              const longitude = data.longitude

              if (
                typeof latitude !== 'number' ||
                typeof longitude !== 'number'
              ) {
                console.log(
                  'OneSignal: Bildirim koordinatları bulunamadı:',
                  data
                )
                return
              }

              console.log(
                'OneSignal: Acil durum koordinatları:',
                latitude,
                longitude
              )

              window.location.href =
                `/?lat=${latitude}&lng=${longitude}`
            }
          )
        })
        .catch((error) => {
          console.error(
            'OneSignal: Native initialize hatası:',
            error
          )

          nativeInitPromise = null
          throw error
        })
    }

    return nativeInitPromise
  }

  if (!webInitPromise) {
  webInitPromise = WebOneSignal.init({
    appId: ONESIGNAL_APP_ID,
    allowLocalhostAsSecureOrigin: true,
    serviceWorkerPath: '/OneSignalSDKWorker.js',
    serviceWorkerUpdaterPath:
      '/OneSignalSDKUpdaterWorker.js',

    notificationClickHandlerAction: 'focus',
  })
}

  return webInitPromise
}

export async function requestOneSignalPermission(): Promise<string | null> {
  try {
    await initOneSignal()

    if (Capacitor.isNativePlatform()) {
      console.log(
        'OneSignal: Native bildirim izni isteniyor...'
      )

      await NativeOneSignal.Notifications.requestPermission(
        true
      )

      for (let i = 0; i < 20; i++) {
        const subscriptionId =
          await NativeOneSignal.User.pushSubscription.getIdAsync()

        console.log(
          `OneSignal: Native subscription kontrolü ${
            i + 1
          }/20`,
          subscriptionId
        )

        if (subscriptionId) {
          console.log(
            'OneSignal Native Subscription ID:',
            subscriptionId
          )

          return subscriptionId
        }

        await new Promise((resolve) =>
          setTimeout(resolve, 500)
        )
      }

      console.error(
        'OneSignal: Native subscription ID oluşturulamadı.'
      )

      return null
    }

    console.log(
      'OneSignal: Web bildirim izni isteniyor...'
    )

    await WebOneSignal.Notifications.requestPermission()

    for (let i = 0; i < 20; i++) {
      const subscriptionId =
        WebOneSignal.User.PushSubscription.id

      console.log(
        `OneSignal: Web subscription kontrolü ${i + 1}/20`,
        subscriptionId
      )

      if (subscriptionId) {
        console.log(
          'OneSignal: Web Subscription ID:',
          subscriptionId
        )

        return subscriptionId
      }

      await new Promise((resolve) =>
        setTimeout(resolve, 500)
      )
    }

    console.error(
      'OneSignal: Web subscription ID oluşturulamadı.'
    )

    return null
  } catch (error) {
    console.error(
      'OneSignal bildirim kurulumu sırasında hata:',
      error
    )

    return null
  }
}