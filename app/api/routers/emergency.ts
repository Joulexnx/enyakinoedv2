import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { volunteers, emergencyCalls } from "@db/schema";
import { env } from "../lib/env";
import webpush from "web-push";

webpush.setVapidDetails(
  "mailto:enyakinoed@example.com",
  env.vapidPublicKey,
  env.vapidPrivateKey
);

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function sendOneSignalNotification(playerIds: string[], title: string, body: string, data: any) {
  if (!env.onesignalApiKey || env.onesignalApiKey === '') {
    console.log('[OneSignal] API Key yok, atlaniyor');
    return 0;
  }
  try {
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${env.onesignalApiKey}`,
      },
      body: JSON.stringify({
        app_id: env.onesignalAppId,
        include_player_ids: playerIds,
        headings: { en: title, tr: title },
        contents: { en: body, tr: body },
        data: data,
        android_channel_id: 'emergency',
        priority: 10,
        ttl: 300,
        buttons: [{ id: 'navigate', text: 'Olay Yerine Git' }],
      }),
    });
    const result = (await response.json()) as { recipients?: number };
    console.log('[OneSignal] Response:', JSON.stringify(result));
    return result.recipients || 0;
  } catch (err: any) {
    console.error('[OneSignal] Error:', err.message);
    return 0;
  }
}

export const emergencyRouter = createRouter({
  notify: publicQuery
    .input(z.object({ lat: z.number(), lng: z.number(), radius: z.number().default(1000) }))
    .mutation(async ({ input }) => {
      console.log('[Emergency] Notify at:', input.lat, input.lng);
      const db = getDb();
      const allVolunteers = await db.select().from(volunteers);

      const nearby = allVolunteers
        .map((v) => ({ ...v, distance: haversineDistance(input.lat, input.lng, v.lat, v.lng) }))
        .filter((v) => v.distance <= input.radius)
        .sort((a, b) => a.distance - b.distance);

      console.log('[Emergency] Nearby:', nearby.length);

      let webPushSent = 0;
      let oneSignalSent = 0;

      // 1. OneSignal ile gonder
      const oneSignalIds = nearby.filter(v => v.onesignalPlayerId).map(v => v.onesignalPlayerId!);
      if (oneSignalIds.length > 0) {
        console.log('[Emergency] Sending OneSignal to:', oneSignalIds.length);
        oneSignalSent = await sendOneSignalNotification(
          oneSignalIds,
          'YAKININIZDA ACIL DURUM!',
          `Yaklasik mesafede acil ilk yardim gerekli! Olay yerine gitmek icin tiklayin.`,
          { lat: input.lat, lng: input.lng }
        );
      }

      // 2. Web Push ile gonder (fallback)
      for (const volunteer of nearby) {
        if (volunteer.pushEndpoint && volunteer.pushP256dh && volunteer.pushAuth) {
          try {
            await webpush.sendNotification(
              {
                endpoint: volunteer.pushEndpoint,
                keys: { p256dh: volunteer.pushP256dh, auth: volunteer.pushAuth },
              },
              JSON.stringify({
                title: 'YAKININIZDA ACIL DURUM VAR',
                body: `Yaklasik ${Math.round(volunteer.distance)}m mesafede acil ilk yardim gerekli!`,
                icon: '/favicon.ico',
                tag: `emergency-${Date.now()}`,
                requireInteraction: true,
                actions: [{ action: 'navigate', title: 'Olay Yerine Git' }, { action: 'dismiss', title: 'Kapat' }],
                data: { lat: input.lat, lng: input.lng },
              })
            );
            webPushSent++;
          } catch {
            // Skip failed
          }
        }
      }

      await db.insert(emergencyCalls).values({
        callerLat: input.lat,
        callerLng: input.lng,
        notifiedCount: webPushSent + oneSignalSent,
      });

      return {
        success: true,
        notifiedCount: webPushSent + oneSignalSent,
        oneSignalSent,
        webPushSent,
        nearbyVolunteers: nearby.map((v) => ({ id: v.id, name: v.name, distance: Math.round(v.distance), lat: v.lat, lng: v.lng })),
      };
    }),

  getVapidKey: publicQuery.query(() => ({ publicKey: env.vapidPublicKey })),
});
