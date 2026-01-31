# FleetCommand - Car Rental Management System

## Overview

FleetCommand is a full-stack car rental management web application that allows customers to browse, search, and book rental vehicles online while administrators manage the fleet, reservations, and view business analytics. The system features a React frontend with a modern UI component library, an Express backend with RESTful APIs, PostgreSQL database with Drizzle ORM, and Replit Auth for authentication.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript, bundled using Vite
- **Routing**: Wouter for client-side navigation
- **State Management**: TanStack React Query for server state and caching
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **Forms**: React Hook Form with Zod validation via @hookform/resolvers
- **Charts**: Recharts for admin analytics dashboard

The frontend follows a component-based architecture with:
- Pages in `client/src/pages/` (Home, Catalog, CarDetails, Bookings, AdminDashboard)
- Reusable components in `client/src/components/`
- Custom hooks in `client/src/hooks/` for data fetching and auth
- Path aliases configured: `@/` for client/src, `@shared/` for shared code

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript compiled with tsx
- **API Design**: RESTful endpoints defined in `shared/routes.ts` with Zod schemas
- **Database**: PostgreSQL accessed via Drizzle ORM
- **Session Management**: express-session with connect-pg-simple for PostgreSQL session storage

Key backend files:
- `server/index.ts` - Express app setup and middleware
- `server/routes.ts` - API route handlers with role-based access control
- `server/storage.ts` - Database operations abstraction layer
- `server/db.ts` - Drizzle database connection

### Database Schema
Located in `shared/schema.ts` with Drizzle ORM:
- **users** - User accounts with roles (user/admin), integrated with Replit Auth
- **sessions** - Session storage for authentication
- **cars** - Vehicle inventory with make, model, year, status, daily rate, features
- **bookings** - Reservations linking users to cars with dates and payment status

Database migrations managed via `drizzle-kit push` command.

### Authentication System
- **Provider**: Replit Auth (OpenID Connect)
- **Implementation**: Located in `server/replit_integrations/auth/`
- **Features**: 
  - OAuth-based login flow
  - Automatic user creation on first login
  - First user automatically assigned admin role
  - Session-based authentication with PostgreSQL storage
  - Role-based access control (user/admin)

### Build System
- **Development**: `tsx` for TypeScript execution with Vite dev server
- **Production Build**: Custom build script in `script/build.ts` using esbuild for server and Vite for client
- **Output**: Server bundled to `dist/index.cjs`, client assets to `dist/public/`

## External Dependencies

### Database
- **PostgreSQL**: Primary database, connection via `DATABASE_URL` environment variable
- **Drizzle ORM**: Type-safe database queries and schema management

### Authentication
- **Replit Auth**: OAuth/OpenID Connect provider (issuer URL: https://replit.com/oidc)
- **Required env vars**: `REPL_ID`, `SESSION_SECRET`, `DATABASE_URL`

### Key NPM Packages
- **UI**: @radix-ui/* primitives, class-variance-authority, tailwind-merge
- **Data**: @tanstack/react-query, drizzle-orm, drizzle-zod
- **Forms**: react-hook-form, zod
- **Auth**: passport, openid-client, express-session, connect-pg-simple
- **Utilities**: date-fns, lucide-react icons, recharts

### External Services
- **Unsplash**: Dynamic vehicle images sourced from Unsplash URLs
- **Google Fonts**: Inter and Outfit font families