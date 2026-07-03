import { createRouter, publicQuery } from "./middleware";
import { volunteerRouter } from "./routers/volunteer";
import { emergencyRouter } from "./routers/emergency";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  volunteer: volunteerRouter,
  emergency: emergencyRouter,
});

export type AppRouter = typeof appRouter;
