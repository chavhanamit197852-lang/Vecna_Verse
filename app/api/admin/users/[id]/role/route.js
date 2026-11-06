import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { requireRole } from "@/lib/permissions";

const Schema = z.object({
  role: z.enum(["STUDENT", "SPONSOR", "CLUB_ADMIN", "ADMIN"]),
});

export async function PATCH(req, { params }) {
  const auth = await requireRole("ADMIN");
  if (auth.error) return auth.error;

  const { id } = await params;
  const parsed = Schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid role" }, { status: 400 });
  }
  const { role: newRole } = parsed.data;

  await dbConnect();
  const target = await User.findById(id).select("_id role").lean();
  if (!target) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }
  if (target.role === newRole) {
    return NextResponse.json({ error: "Already has this role" }, { status: 409 });
  }

  // Guardrail 1 — cannot change your own role
  if (String(target._id) === String(auth.user.id)) {
    return NextResponse.json({ error: "You cannot change your own role" }, { status: 403 });
  }

  // Guardrail 2 — cannot demote the last admin
  if (target.role === "ADMIN" && newRole !== "ADMIN") {
    const admins = await User.countDocuments({ role: "ADMIN" });
    if (admins <= 1) {
      return NextResponse.json(
        { error: "Cannot demote the last admin" },
        { status: 409 }
      );
    }
  }

  await User.updateOne({ _id: id }, { $set: { role: newRole } });

  const direction =
    ["STUDENT", "SPONSOR", "CLUB_ADMIN", "ADMIN"].indexOf(newRole) >
    ["STUDENT", "SPONSOR", "CLUB_ADMIN", "ADMIN"].indexOf(target.role)
      ? "promoted"
      : "demoted";

  return NextResponse.json({ ok: true, role: newRole, direction });
}