import type { Express } from "express";
import { authStorage } from "./storage";
import { isAuthenticated } from "./replitAuth";

// Register auth-specific routes
export function registerAuthRoutes(app: Express): void {
  // Get current authenticated user
  app.get("/api/auth/user", isAuthenticated, (req, res) => {
  // In development mode, return a mock user and ensure the user exists in DB for local testing
  if (process.env.NODE_ENV === 'development') {
    const devUser = {
      id: 'dev-user-1',
      email: 'dev@example.com',
      firstName: 'Dev',
      lastName: 'User',
      profileImageUrl: 'https://via.placeholder.com/150',
    };

    // Persist dev user to DB (best effort; don't block on failure)
    try {
      authStorage.upsertUser({ id: devUser.id, email: devUser.email, firstName: devUser.firstName, lastName: devUser.lastName, profileImageUrl: devUser.profileImageUrl });
    } catch (err) {
      console.error('Failed to upsert dev user:', err);
    }

    return res.json(devUser);
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

  // Dev-friendly logout fallback to avoid 404 when setupAuth isn't initialized
  app.get("/api/logout", (req, res) => {
    try {
      if (typeof (req as any).logout === "function") {
        (req as any).logout(() => {});
      }
    } catch (err) {
      console.warn("logout noop", err);
    }
    res.redirect("/");
  });
});
}
