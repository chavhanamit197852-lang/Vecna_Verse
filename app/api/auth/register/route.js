import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";

// Note: NO role field — clients cannot self-assign roles
const Schema = z.object({
  name: z.string().min(1).max(120),
  email: z.string().email(),
  password: z.string().min(8).max(200),
  city: z.string().max(120).optional(),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    accuracy: z.number().optional(),
  }).optional(),
});

export async function POST(req) {
  let body;
  try {
    body = Schema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await dbConnect();
  const email = body.email.toLowerCase().trim();
  const existing = await User.findOne({ email });

  if (existing) {
    // ── Case A: OAuth-only account (no passwordHash yet) ──
    // Let them attach a password so they can use BOTH Google and password login.
    if (!existing.passwordHash) {
      existing.passwordHash = await bcrypt.hash(body.password, 10);
      if (!existing.name && body.name) existing.name = body.name;
      if (!existing.city && body.city) existing.city = body.city;
      if (!existing.role) existing.role = "STUDENT";
      if (body.location && !existing.location?.lat) {
        existing.location = {
          lat: body.location.lat,
          lng: body.location.lng,
          accuracy: body.location.accuracy ?? null,
          capturedAt: new Date(),
        };
      }
      await existing.save();
      return NextResponse.json(
        { id: String(existing._id), linked: true },
        { status: 200 }
      );
    }

    // ── Case B: real duplicate — already has a password ──
    return NextResponse.json(
      { error: "Email already registered. Try signing in instead." },
      { status: 409 }
    );
  }

  // ── Case C: brand-new user ──
  const doc = {
    name: body.name,
    email,
    passwordHash: await bcrypt.hash(body.password, 10),
    role: "STUDENT",
    city: body.city || null,
  };

  if (body.location) {
    doc.location = {
      lat: body.location.lat,
      lng: body.location.lng,
      accuracy: body.location.accuracy ?? null,
      capturedAt: new Date(),
    };
  }

  const user = await User.create(doc);
  return NextResponse.json({ id: String(user._id) }, { status: 201 });
}