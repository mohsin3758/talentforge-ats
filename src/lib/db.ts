import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Check if the cached client has the User model (added in a later schema migration).
// If not, create a new client. This prevents stale Prisma clients in dev.
function createPrismaClient() {
  return new PrismaClient({
    log: ['query'],
  })
}

let client = globalForPrisma.prisma ?? createPrismaClient()

// Verify the cached client has all models (fixes stale cache after schema changes)
if (typeof (client as { user?: unknown }).user === 'undefined') {
  client = createPrismaClient()
}

export const db = client

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db