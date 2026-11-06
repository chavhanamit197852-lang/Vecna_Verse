import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Club from "@/models/Club";
import ClubMember from "@/models/ClubMember";

export async function GET() {
  await dbConnect();
  const clubs = await Club.find().select("name slug institution city isPrivate").sort({ name: 1 }).lean();
  const session = await auth();
  const memberships = session?.user ? await ClubMember.find({ userId: session.user.id }).select("clubId role status").lean() : [];
  const membershipMap = new Map(memberships.map((m) => [String(m.clubId), { role: m.role, status: m.status }]));
  const visible = clubs.filter((c) => !c.isPrivate || membershipMap.has(String(c._id)) || session?.user?.role === "ADMIN");
  return NextResponse.json(visible.map((club) => ({ ...club, _id: String(club._id), membership: membershipMap.get(String(club._id)) || null })));
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.institution) {
    return NextResponse.json({ error: "Name and Institution are required" }, { status: 400 });
  }

  await dbConnect();

  // Generate unique slug
  const slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") + "-" + Date.now().toString(36);

  try {
    const club = await Club.create({
      name: String(body.name).trim().slice(0, 120),
      slug,
      institution: String(body.institution).trim().slice(0, 160),
      city: body.city || "",
      membershipFee: Math.max(0, Number(body.membershipFee || 0)),
      membershipApprovalRequired: body.membershipApprovalRequired !== false,
      isPrivate: body.isPrivate === true,
      createdBy: session.user.id,
    });

    // Make the creator the ADMIN of this club
    await ClubMember.create({
      clubId: club._id,
      userId: session.user.id,
      role: "ADMIN",
      status: "ACTIVE",
    });

    return NextResponse.json({ id: String(club._id), slug: club.slug }, { status: 201 });
  } catch (err) {
    if (err.code === 11000) return NextResponse.json({ error: "Club name already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to create club" }, { status: 500 });
  }
}