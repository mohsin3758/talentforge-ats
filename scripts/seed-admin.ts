#!/usr/bin/env bun
/**
 * Seed admin user for TalentForge ATS.
 *
 * Creates a default admin user with email/password credentials.
 * Run after `bun run db:push` to set up authentication.
 *
 * Default credentials:
 *   Email: admin@talentforge.com
 *   Password: Admin123! (change in production!)
 *
 * Usage:
 *   bun scripts/seed-admin.ts
 *
 * Override credentials via env:
 *   ADMIN_EMAIL=you@example.com ADMIN_PASSWORD=SecurePass bun scripts/seed-admin.ts
 */
import bcrypt from "bcryptjs";
import { db } from "../src/lib/db";

async function main() {
  const email = (process.env.ADMIN_EMAIL ?? "admin@talentforge.com").toLowerCase().trim();
  const password = process.env.ADMIN_PASSWORD ?? "Admin123!";
  const name = process.env.ADMIN_NAME ?? "Admin Recruiter";

  console.log("Seeding admin user...");
  console.log(`  Email: ${email}`);
  console.log(`  Name:  ${name}`);

  const existing = await db.user.findUnique({ where: { email } });

  if (existing) {
    console.log("  → User already exists, skipping.");
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      name,
      passwordHash,
      role: "admin",
    },
    select: { id: true, email: true, role: true },
  });

  console.log("  → Created admin user:");
  console.log(`     ID:    ${user.id}`);
  console.log(`     Email: ${user.email}`);
  console.log(`     Role:  ${user.role}`);
  console.log("");
  console.log("⚠️  Default password is 'Admin123!' — change it immediately in production!");
}

main()
  .catch((e) => {
    console.error("Failed to seed admin:", e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
