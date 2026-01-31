import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./models/auth";
import { relations } from "drizzle-orm";

// Export auth models so they are included in the schema
export * from "./models/auth";

// Cars Table
export const cars = pgTable("cars", {
  id: serial("id").primaryKey(),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  color: text("color").notNull(),
  transmission: text("transmission").notNull(), // 'automatic' | 'manual'
  fuelType: text("fuel_type").notNull(), // 'petrol' | 'diesel' | 'electric' | 'hybrid'
  dailyRate: decimal("daily_rate", { precision: 10, scale: 2 }).notNull(),
  imageUrl: text("image_url").notNull(),
  status: text("status").notNull().default("available"), // 'available' | 'maintenance' | 'rented'
  features: text("features").array(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertCarSchema = createInsertSchema(cars).omit({ 
  id: true, 
  createdAt: true 
});

export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;

// Bookings Table
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().references(() => users.id), // Using text to match Replit Auth user ID
  carId: integer("car_id").notNull().references(() => cars.id),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"), // 'pending' | 'confirmed' | 'completed' | 'cancelled'
  paymentStatus: text("payment_status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBookingSchema = createInsertSchema(bookings).omit({ 
  id: true, 
  createdAt: true 
});

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Relations
export const carsRelations = relations(cars, ({ many }) => ({
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  car: one(cars, {
    fields: [bookings.carId],
    references: [cars.id],
  }),
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
}));

// API Types
export type CreateCarRequest = InsertCar;
export type UpdateCarRequest = Partial<InsertCar>;

export type CreateBookingRequest = Omit<InsertBooking, 'userId' | 'totalPrice' | 'status' | 'paymentStatus'>;
export type UpdateBookingStatusRequest = { status: string };

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
