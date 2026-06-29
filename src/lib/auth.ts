import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

/**
 * NextAuth configuration.
 *
 * Uses Credentials provider (email + password) with bcrypt-hashed passwords
 * stored in the User table. Sessions are JWT-based (not database sessions)
 * for simpler deployment.
 *
 * To add OAuth providers (Google, GitHub, etc.), import them here and add
 * to the providers array. The Account model in schema.prisma already
 * supports OAuth.
 */
export const authOptions: NextAuthOptions = {
  // PrismaAdapter handles OAuth account linking automatically.
  // For credentials-only auth, we use JWT sessions and manual user creation.
  adapter: PrismaAdapter(db as never),
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email.toLowerCase() },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(credentials.password, user.passwordHash);
        if (!isValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial sign-in: add role to token
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role ?? "recruiter";
      }
      return token;
    },
    async session({ session, token }) {
      // Add role to session
      if (session.user) {
        (session.user as { id?: string }).id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
      }
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};
