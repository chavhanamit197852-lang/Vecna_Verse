import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import ClubMember from "@/models/ClubMember";

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await dbConnect();

  // Find all memberships for this user
  const memberships = await ClubMember.find({ userId: session.user.id, status: "ACTIVE" })
    .populate("clubId", "name slug institution")
    .lean();

  // Filter out deleted clubs
  const clubs = memberships
    .filter((m) => m.clubId)
    .map((m) => ({
      _id: String(m.clubId._id),
      name: m.clubId.name,
      slug: m.clubId.slug,
      institution: m.clubId.institution,
      myRole: m.role, // "ADMIN", "COMMITTEE", or "MEMBER"
    }));

  return NextResponse.json(clubs);
}