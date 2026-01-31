import { db } from "./db";
import { cars, bookings, type Car, type InsertCar, type Booking, type InsertBooking } from "@shared/schema";
import { eq, and, or, lt, gt } from "drizzle-orm";

export interface IStorage {
  // Cars
  getCars(status?: string, search?: string): Promise<Car[]>;
  getCar(id: number): Promise<Car | undefined>;
  createCar(car: InsertCar): Promise<Car>;
  updateCar(id: number, car: Partial<InsertCar>): Promise<Car | undefined>;
  deleteCar(id: number): Promise<void>;

  // Bookings
  getBookings(userId?: string): Promise<(Booking & { car: Car })[]>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBookingStatus(id: number, status: string): Promise<Booking | undefined>;
  
  // Validation
  checkAvailability(carId: number, startDate: Date, endDate: Date): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getCars(status?: string, search?: string): Promise<Car[]> {
    let query = db.select().from(cars);
    
    if (status) {
      query = query.where(eq(cars.status, status));
    }
    
    // Simple search implementation (can be improved)
    // Note: Drizzle's like/ilike might be better for search if search param is provided
    const allCars = await query;
    if (search) {
      const lowerSearch = search.toLowerCase();
      return allCars.filter(c => 
        c.make.toLowerCase().includes(lowerSearch) || 
        c.model.toLowerCase().includes(lowerSearch)
      );
    }
    
    return allCars;
  }

  async getCar(id: number): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id));
    return car;
  }

  async createCar(car: InsertCar): Promise<Car> {
    const [newCar] = await db.insert(cars).values(car).returning();
    return newCar;
  }

  async updateCar(id: number, updates: Partial<InsertCar>): Promise<Car | undefined> {
    const [updatedCar] = await db
      .update(cars)
      .set(updates)
      .where(eq(cars.id, id))
      .returning();
    return updatedCar;
  }

  async deleteCar(id: number): Promise<void> {
    await db.delete(cars).where(eq(cars.id, id));
  }

  async getBookings(userId?: string): Promise<(Booking & { car: Car })[]> {
    const query = db.select({
        booking: bookings,
        car: cars
    })
    .from(bookings)
    .innerJoin(cars, eq(bookings.carId, cars.id));

    if (userId) {
       // Filter by user if userId provided
       // Note: In real app, we might want admin to see all. 
       // The route handler will decide whether to pass userId or not based on role.
       // However, the schema uses text for userId, so we need to match that.
       // But wait, the query builder here needs to apply the where clause properly.
       // Since userId is not yet applied in the query construction above.
       // Let's refactor to handle where clause correctly.
       const results = await db.select({
           booking: bookings,
           car: cars
       })
       .from(bookings)
       .innerJoin(cars, eq(bookings.carId, cars.id))
       .where(eq(bookings.userId, userId));
       
       return results.map(r => ({ ...r.booking, car: r.car }));
    }

    const results = await query;
    return results.map(r => ({ ...r.booking, car: r.car }));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db.insert(bookings).values(booking).returning();
    return newBooking;
  }

  async updateBookingStatus(id: number, status: string): Promise<Booking | undefined> {
    const [updatedBooking] = await db
      .update(bookings)
      .set({ status })
      .where(eq(bookings.id, id))
      .returning();
    return updatedBooking;
  }

  async checkAvailability(carId: number, startDate: Date, endDate: Date): Promise<boolean> {
    // Check for overlapping bookings
    // (StartA <= EndB) and (EndA >= StartB)
    const existingBookings = await db.select().from(bookings).where(
      and(
        eq(bookings.carId, carId),
        or(
          eq(bookings.status, 'confirmed'),
          eq(bookings.status, 'pending')
        ),
        // Overlap logic:
        // existing.startDate <= new.endDate AND existing.endDate >= new.startDate
        // Drizzle specific syntax might be needed or raw sql
      )
    );

    // Filter in memory for simplicity with dates, or use raw SQL for overlapping ranges
    const hasOverlap = existingBookings.some(b => {
      const bStart = new Date(b.startDate);
      const bEnd = new Date(b.endDate);
      return bStart <= endDate && bEnd >= startDate;
    });

    return !hasOverlap;
  }
}

export const storage = new DatabaseStorage();
