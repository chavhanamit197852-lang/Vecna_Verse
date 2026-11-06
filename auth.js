import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { authConfig } from "./auth.config";

/* ─────────────────────────────────────────────
   Provider list — Credentials + optional OAuth
──────────────────────────────────────────────*/
const providers = [
  Credentials({
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
  async authorize(raw) {
  const parsed = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(raw);
  if (!parsed.success) {
    console.log("✗ validation", parsed.error);
    return null;
  }

  await dbConnect();
  const email = parsed.data.email.toLowerCase();
  const u = await User.findOne({ email }).lean();

  if (!u) {
    console.log("✗ no user:", email);
    return null;
  }
  if (!u.passwordHash) {
    console.log("✗ no passwordHash for:", email, "| fields present:", Object.keys(u));
    return null;
  }

  const match = await bcrypt.compare(parsed.data.password, u.passwordHash);
  if (!match) {
    console.log("✗ bad password for:", email);
    return null;
  }

  console.log("✓ auth OK:", email);
  return {
    id: String(u._id),
    name: u.name,
    email: u.email,
    image: u.image,
    role: u.role || "STUDENT",
    clubId: u.clubId ? String(u.clubId) : null,
  };
},
  }),
];

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    })
  );
}

if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    })
  );
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,

  callbacks: {
    ...authConfig.callbacks,

    /* Runs BEFORE sign-in completes — allow / deny + create user on OAuth */
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        await dbConnect();
        const email = user.email?.toLowerCase();
        if (!email) return false;

        const existing = await User.findOne({ email });

        if (!existing) {
          // First-time OAuth user → create as STUDENT
          const created = await User.create({
            email,
            name: user.name || "Student",
            image: user.image,
            role: "STUDENT",                            // ← was "USER"
            emailVerified: new Date(),                  // OAuth provider verified it
            lastLoginAt: new Date(),                    // ← track first login
          });
          user.id = String(created._id);
          user.role = "STUDENT";
          user.clubId = null;
        } else {
          // Returning user → hydrate role + club from DB
          user.id = String(existing._id);
          user.role = existing.role || "STUDENT";       // ← fallback fixed
          user.clubId = existing.clubId ? String(existing.clubId) : null;

          // Opportunistically backfill avatar
          if (user.image && !existing.image) {
            existing.image = user.image;
            await existing.save();
          }
        }
      }
      return true;
    },

    /* JWT — copy role/uid into the token on first sign-in */
    async jwt({ token, user }) {
      if (user) {
        token.uid = user.id;
        token.role = user.role || "STUDENT";            // ← was "USER"
        token.clubId = user.clubId || null;
      }
      if (!token.uid && token.sub) token.uid = token.sub;
      return token;
    },

    /* Session — surface role/uid to the client */
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.uid;
        session.user.role = token.role || "STUDENT";    // ← was "USER"
        session.user.clubId = token.clubId || null;
      }
      return session;
    },
  },

  /* Runs AFTER sign-in succeeds — never blocks login if it fails */
  events: {
    async signIn({ user }) {
      if (!user?.id) return;
      try {
        await dbConnect();
        await User.updateOne(
          { _id: user.id },
          { $set: { lastLoginAt: new Date() } }
        );
      } catch {
        // Silently ignore — tracking must never break auth
      }
    },
  },
});