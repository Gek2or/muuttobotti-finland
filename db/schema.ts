import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const bookings = sqliteTable("bookings", {
  id: text("id").primaryKey(),
  service: text("service").notNull(),
  customerName: text("customer_name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull(),
  pickup: text("pickup").notNull(),
  destination: text("destination").notNull(),
  preferredDate: text("preferred_date").notNull(),
  preferredTime: text("preferred_time").notNull(),
  notes: text("notes").notNull().default(""),
  photoCount: integer("photo_count").notNull().default(0),
  status: text("status").notNull().default("new"),
  notificationStatus: text("notification_status").notNull().default("queued"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
