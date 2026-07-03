import { z } from "zod";
import { createRouter, publicQuery } from "../middleware";
import { getDb } from "../queries/connection";
import { volunteers } from "@db/schema";
import { eq, sql } from "drizzle-orm";

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const volunteerRouter = createRouter({
  register: publicQuery
    .input(
      z.object({
        name: z.string().min(2).max(255),
        phone: z.string().min(10).max(20),
        lat: z.number(),
        lng: z.number(),
        pushEndpoint: z.string().optional(),
        pushP256dh: z.string().optional(),
        pushAuth: z.string().optional(),
        onesignalPlayerId: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = getDb();
      const result = await db.insert(volunteers).values({
        name: input.name,
        phone: input.phone,
        lat: input.lat,
        lng: input.lng,
        pushEndpoint: input.pushEndpoint || null,
        pushP256dh: input.pushP256dh || null,
        pushAuth: input.pushAuth || null,
        onesignalPlayerId: input.onesignalPlayerId || null,
      });
      return { success: true, id: Number(result[0].insertId) };
    }),

  updateLocation: publicQuery
    .input(z.object({ id: z.number(), lat: z.number(), lng: z.number() }))
    .mutation(async ({ input }) => {
      const db = getDb();
      await db.update(volunteers).set({ lat: input.lat, lng: input.lng }).where(eq(volunteers.id, input.id));
      return { success: true };
    }),

  listNearby: publicQuery
    .input(z.object({ lat: z.number(), lng: z.number(), radius: z.number().default(1000) }))
    .query(async ({ input }) => {
      const db = getDb();
      const allVolunteers = await db.select().from(volunteers);
      const nearby = allVolunteers
        .map((v) => ({ ...v, distance: Math.round(haversineDistance(input.lat, input.lng, v.lat, v.lng)) }))
        .filter((v) => v.distance <= input.radius)
        .sort((a, b) => a.distance - b.distance)
        .map(({ pushEndpoint, pushP256dh, pushAuth, phone, ...rest }) => rest);
      return nearby;
    }),

  count: publicQuery.query(async () => {
    const db = getDb();
    const result = await db.select({ count: sql<number>`count(*)` }).from(volunteers);
    return result[0]?.count ?? 0;
  }),
});
