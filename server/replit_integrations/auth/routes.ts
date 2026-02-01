import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, (req, res) => {
  // In development mode, return a mock user
  if (process.env.NODE_ENV === 'development') {
    return res.json({
      id: 'dev-user-1',
      email: 'dev@example.com',
      firstName: 'Dev',
      lastName: 'User',
      profileImageUrl: 'https://via.placeholder.com/150'
    });
  }

  // Production code
  if (!req.user || !(req.user as any).claims) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const claims = (req.user as any).claims;
  res.json({
    id: claims.sub,
    email: claims.email,
    firstName: claims.first_name,
    lastName: claims.last_name,
    profileImageUrl: claims.profile_image_url,
  });
});
}
