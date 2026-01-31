import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { insertCarSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";
import { setupAuth, registerAuthRoutes, isAuthenticated } from "./replit_integrations/auth";

// Middleware to check for admin role
const isAdmin = async (req: any, res: any, next: any) => {
  const userId = req.user?.claims?.sub;
  if (!userId) return res.status(401).json({ message: "Unauthorized" });
  
  const user = await storage.getUser(userId); // We might need to add this to storage or use authStorage
  // Actually, let's use authStorage directly or add to main storage
  const { authStorage } = await import("./replit_integrations/auth");
  const dbUser = await authStorage.getUser(userId);
  
  if (dbUser?.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admin access required" });
  }
  next();
};

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
  app.post(api.cars.create.path, isAuthenticated, isAdmin, async (req, res) => {
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

  app.put(api.cars.update.path, isAuthenticated, isAdmin, async (req, res) => {
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

  app.delete(api.cars.delete.path, isAuthenticated, isAdmin, async (req, res) => {
    const id = Number(req.params.id);
    const car = await storage.getCar(id);
    if (!car) {
      return res.status(404).json({ message: "Car not found" });
    }
    await storage.deleteCar(id);
    res.status(204).send();
  });

  app.patch(api.bookings.updateStatus.path, isAuthenticated, isAdmin, async (req, res) => {
      const id = Number(req.params.id);
      const { status } = req.body;
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
