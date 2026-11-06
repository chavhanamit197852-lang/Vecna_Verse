import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import mongoose from "mongoose";
import User from "@/models/User";
import Club from "@/models/Club";
import { requireRole } from "@/lib/permissions";

const Schema = z.object({
  clubId: z.string().nullable(), // null = remove from club
});

export async function PATCH(req, { params }) {
  const auth = await requireRole("ADMIN");
  if (auth.error) return auth.error;

  const { id } = await params;
  const parsed = Schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid clubId" }, { status: 400 });
  }

  if (!mongoose.isValidObjectId(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }
  if (parsed.data.clubId && !mongoose.isValidObjectId(parsed.data.clubId)) {
    return NextResponse.json({ error: "Invalid clubId" }, { status: 400 });
  }
  await dbConnect();
  if (parsed.data.clubId && !(await Club.exists({ _id: parsed.data.clubId }))) {
    return NextResponse.json({ error: "Club not found" }, { status: 404 });
  }

  // Prevent the admin from removing themselves from a club accidentally
  if (String(id) === String(auth.user.id)) {
    return NextResponse.json(
      { error: "You cannot change your own club assignment" },
      { status: 403 }
    );
  }

  await User.updateOne(
    { _id: id },
    { $set: { clubId: parsed.data.clubId || null } }
  );

  return NextResponse.json({ ok: true });
}