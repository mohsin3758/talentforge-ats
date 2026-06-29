import { NextRequest } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/**
 * POST /api/auth/register
 *
 * Creates a new user with email + password.
 * Passwords are hashed with bcrypt (10 rounds).
 *
 * Body:
 *   { email: string, password: string, name?: string }
 *
 * Returns:
 *   201: { id, email, name, role }
 *   400: { error: "Email and password are required" }
 *   409: { error: "Email already registered" }
 *   500: { error: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password) {
      return Response.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return Response.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await db.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return Response.json(
        { error: "Email already registered" },
        { status: 409 },
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        email: normalizedEmail,
        name: name?.trim() || null,
        passwordHash,
        role: "recruiter",
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
      },
    });

    return Response.json(user, { status: 201 });
  } catch (e) {
    console.error("[auth/register] error:", e);
    return Response.json({ error: (e as Error).message, stack: (e as Error).stack }, { status: 500 });
  }
}
