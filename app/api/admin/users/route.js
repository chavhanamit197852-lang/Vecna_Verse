import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import { requireRole } from "@/lib/permissions";

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(req) {
  const auth = await requireRole("ADMIN");
  if (auth.error) return auth.error;
  await dbConnect();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
  const q = (searchParams.get("q") || "").trim();
  const role = searchParams.get("role"); // optional filter

  const filter = {};
  if (q) {
    const rx = new RegExp(escapeRegex(q), "i");
    filter.$or = [{ name: rx }, { email: rx }, { city: rx }];
  }
  if (role && ["STUDENT", "SPONSOR", "CLUB_ADMIN", "ADMIN"].includes(role)) {
    filter.role = role;
  }

  const [total, docs] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter)
      .sort({ lastLoginAt: -1, createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("_id name email role city createdAt lastLoginAt")
      .lean(),
  ]);

  const now = Date.now();
  const users = docs.map((u) => ({
    id: String(u._id),
    name: u.name || "—",
    email: u.email,
    role: u.role || "STUDENT",
    city: u.city || null,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt || null,
    recentlyActive: u.lastLoginAt && now - new Date(u.lastLoginAt).getTime() < 5 * 60 * 1000,
    isSelf: String(u._id) === String(auth.user.id),
  }));

  const counts = await User.aggregate([
    { $group: { _id: "$role", n: { $sum: 1 } } },
  ]);
  const byRole = { STUDENT: 0, SPONSOR: 0, CLUB_ADMIN: 0, ADMIN: 0 };
  counts.forEach((c) => { byRole[c._id] = c.n; });

  return NextResponse.json({
    users,
    total,
    page,
    limit,
    pages: Math.ceil(total / limit),
    byRole,
  });
}