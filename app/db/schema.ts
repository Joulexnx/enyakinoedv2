import {
  mysqlTable,
  serial,
  int,
  varchar,
  double,
  timestamp,
  text,
} from "drizzle-orm/mysql-core";

// Gonullu ilk yardimcilar tablosu
export const volunteers = mysqlTable("volunteers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  lat: double("lat").notNull(),
  lng: double("lng").notNull(),
  pushEndpoint: text("push_endpoint"),
  pushP256dh: text("push_p256dh"),
  pushAuth: text("push_auth"),
  onesignalPlayerId: varchar("onesignal_player_id", { length: 255 }),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

// Acil durum cagrilar tablosu
export const emergencyCalls = mysqlTable("emergency_calls", {
  id: serial("id").primaryKey(),
  callerLat: double("caller_lat").notNull(),
  callerLng: double("caller_lng").notNull(),
  callerName: varchar("caller_name", { length: 255 }),
  callerPhone: varchar("caller_phone", { length: 20 }),
  notifiedCount: int("notified_count").default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});
