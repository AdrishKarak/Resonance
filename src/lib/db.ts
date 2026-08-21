/**
 * -----------------------------------------------------------------------------
 * Prisma database client (singleton)
 * -----------------------------------------------------------------------------
 * Exports the single shared PrismaClient instance used by every server-side
 * data access point: tRPC routers (voices, generations, billing), API routes
 * (`/api/voices`, `/api/audio`), and the Polar webhook handler.
 *
 * It exists to guarantee exactly one client per process: instantiating a new
 * PrismaClient per import would exhaust the database connection pool,
 * especially during Next.js dev-mode hot reloads. The client uses the
 * driver-adapter (`@prisma/adapter-pg`) setup against a normalized
 * PostgreSQL connection string from `env.ts`.
 */
import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "@/generated/prisma/client";
import { normalizeDatabaseUrl } from "@/lib/database-url";
import { env } from "@/lib/env";

// Driver adapter: connects Prisma through `pg` using the connection string,
// with sslmode upgraded to verify-full where applicable.
const adapter = new PrismaPg({
  connectionString: normalizeDatabaseUrl(env.DATABASE_URL),
});

// Cache the Prisma client on globalThis to survive hot reloads in dev and
// avoid exhausting DB connections with one pool per module re-evaluation.
const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Reuse the cached instance if present; otherwise create it once per process.
const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

// Only persist on globalThis outside production, where hot reloads happen.
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
