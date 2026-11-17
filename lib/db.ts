import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function withTimeout(url: string) {
  if (url.includes("connect_timeout=")) return url;
  return `${url}${url.includes("?") ? "&" : "?"}connect_timeout=30`;
}

function createPrismaClient() {
  // Direct URL is more reliable locally; use pooled in production when available.
  const raw =
    process.env.NODE_ENV === "production"
      ? process.env.DATABASE_URL_POOLED || process.env.DATABASE_URL
      : process.env.DATABASE_URL || process.env.DATABASE_URL_POOLED;
  const url = raw ? withTimeout(raw) : undefined;

  return new PrismaClient({
    datasources: url ? { db: { url } } : undefined,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
