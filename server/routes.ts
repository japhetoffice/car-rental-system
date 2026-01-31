import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertCarSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Set up Replit Auth
  await setupAuth(app);
  registerAuthRoutes(app);

  // Cars Routes
  app.get(api.cars.list.path, async (req, res) => {
    const status = req.query.status as string | undefined;
    const search = req.query.search as string | undefined;
    const cars = await storage.getCars(status, search);
    res.json(cars);
  });

  app.get(api.cars.get.path, async (req, res) => {
    const car = await storage.getCar(Number(req.params.id));
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    res.json(car);
  });

  // Protected Admin Routes for Cars
  // Note: For simplicity in this demo, we might check a specific email or just allow any authenticated user to be admin if no role system is strict yet.
  // Ideally, we'd check req.user.claims.email or a role in DB.
  app.post(api.cars.create.path, isAuthenticated, async (req, res) => {
    try {
      const input = insertCarSchema.parse(req.body);
      const car = await storage.createCar(input);
      res.status(201).json(car);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.put(api.cars.update.path, isAuthenticated, async (req, res) => {
    try {
      const id = Number(req.params.id);
      const input = insertCarSchema.partial().parse(req.body);
      const car = await storage.updateCar(id, input);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json(car);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.delete(api.cars.delete.path, isAuthenticated, async (req, res) => {
    const id = Number(req.params.id);
    const car = await storage.getCar(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    await storage.deleteCar(id);
    res.status(204).send();
  });

  // Bookings Routes
  app.get(api.bookings.list.path, isAuthenticated, async (req, res) => {
    // If admin, show all? Or filter?
    // For now, let's just return bookings for the user unless they are admin (which we'd need to check)
    // To keep it simple: return user's bookings.
    // If we want admin to see all, we need an admin check.
    const user = req.user as any;
    const bookings = await storage.getBookings(user.claims.sub);
    res.json(bookings);
  });

  app.post(api.bookings.create.path, isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const { carId, startDate, endDate } = req.body;
      
      const start = new Date(startDate);
      const end = new Date(endDate);

      // Basic validation
      if (start >= end) {
        return res.status(400).json({ message: "End date must be after start date" });
      }
      
      // Check availability
      const isAvailable = await storage.checkAvailability(carId, start, end);
      if (!isAvailable) {
        return res.status(400).json({ message: "Car is not available for these dates" });
      }

      const car = await storage.getCar(carId);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }

      // Calculate total price
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      const totalPrice = Number(car.dailyRate) * days;

      const booking = await storage.createBooking({
        userId: user.claims.sub,
        carId,
        startDate: start,
        endDate: end,
        totalPrice: totalPrice.toString(), // Decimal as string or number? Drizzle decimal is string usually
        status: "confirmed", // Auto-confirm for simplicity
        paymentStatus: "pending"
      });

      res.status(201).json(booking);
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  app.patch(api.bookings.updateStatus.path, isAuthenticated, async (req, res) => {
      const id = Number(req.params.id);
      const { status } = req.body;
      // Ideally check if user owns booking or is admin
      const booking = await storage.updateBookingStatus(id, status);
      if (!booking) {
          return res.status(404).json({ message: "Booking not found" });
      }
      res.json(booking);
  });

  // Seed Data
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingCars = await storage.getCars();
  if (existingCars.length === 0) {
    console.log("Seeding database with cars...");
    const sampleCars = [
      {
        make: "Toyota",
        model: "Camry",
        year: 2024,
        color: "Silver",
        transmission: "automatic",
        fuelType: "hybrid",
        dailyRate: "55.00",
        imageUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3968e3bb?auto=format&fit=crop&q=80&w=1000",
        status: "available",
        features: ["Bluetooth", "Backup Camera", "Lane Assist"],
        description: "Reliable and fuel-efficient sedan, perfect for city driving and long trips."
      },
      {
        make: "Tesla",
        model: "Model 3",
        year: 2023,
        color: "White",
        transmission: "automatic",
        fuelType: "electric",
        dailyRate: "85.00",
        imageUrl: "https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&q=80&w=1000",
        status: "available",
        features: ["Autopilot", "Long Range", "Premium Audio"],
        description: "Experience the future of driving with this high-performance electric vehicle."
      },
      {
        make: "Ford",
        model: "Explorer",
        year: 2023,
        color: "Blue",
        transmission: "automatic",
        fuelType: "petrol",
        dailyRate: "95.00",
        imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000",
        status: "available",
        features: ["AWD", "7 Seats", "Navigation"],
        description: "Spacious SUV with plenty of room for family and luggage."
      },
      {
        make: "BMW",
        model: "M4",
        year: 2024,
        color: "Black",
        transmission: "automatic",
        fuelType: "petrol",
        dailyRate: "150.00",
        imageUrl: "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&q=80&w=1000",
        status: "available",
        features: ["Sport Mode", "Leather Seats", "Sunroof"],
        description: "Luxury sports coupe delivering exhilarating performance and style."
      }
    ];

    for (const car of sampleCars) {
      await storage.createCar(car);
    }
    console.log("Database seeded successfully.");
  }
}
