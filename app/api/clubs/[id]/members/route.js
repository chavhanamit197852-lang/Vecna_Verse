import { NextResponse } from "next/server";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireCommitteeOrAbove } from "@/lib/permissions";
import ClubMember from "@/models/ClubMember";
import User from "@/models/User";

const MEMBER_RANK = { MEMBER: 1, COMMITTEE: 2, ADMIN: 3 };

/* ─── ADD MEMBER ─── */
export async function POST(req, { params }) {
  const { id: clubId } = await params;
  const auth = await requireCommitteeOrAbove(clubId);
  if (auth.error) return auth.error;

  const body = await req.json();
  const schema = z.object({
    email: z.string().email(),
    role: z.enum(["MEMBER", "COMMITTEE", "ADMIN"]).default("MEMBER"),
  });
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  // COMMITTEE can only add MEMBERs
  const actorRank = MEMBER_RANK[auth.membership.role];
  const targetRank = MEMBER_RANK[parsed.data.role];
  
  if (actorRank <= targetRank && auth.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "You don't have permission to assign this role" },
      { status: 403 }
    );
  }

  await dbConnect();

  const student = await User.findOne({ email: parsed.data.email.toLowerCase() }).lean();
  if (!student) {
    return NextResponse.json({ error: "No student found with this email" }, { status: 404 });
  }

  const existing = await ClubMember.findOne({ clubId, userId: student._id }).lean();
  if (existing) {
    return NextResponse.json({ error: "Already a member" }, { status: 409 });
  }

  await ClubMember.create({
    clubId,
    userId: student._id,
    role: parsed.data.role,
    status: "ACTIVE",
    addedBy: auth.user.id,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}

/* ─── LIST MEMBERS ─── */
export async function GET(req, { params }) {
  const { id: clubId } = await params;
  const auth = await requireCommitteeOrAbove(clubId);
  if (auth.error) return auth.error;

  await dbConnect();
  const members = await ClubMember.find({ clubId })
    .populate("userId", "name email city image")
    .sort({ "role": 1, createdAt: -1 })
    .lean();

  return NextResponse.json(members);
}

/* ─── REMOVE MEMBER ─── */
export async function DELETE(req, { params }) {
  const { id: clubId } = await params;
  const auth = await requireCommitteeOrAbove(clubId);
  if (auth.error) return auth.error;

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId required" }, { status: 400 });
  }

  // Cannot remove yourself
  if (userId === auth.user.id) {
    return NextResponse.json({ error: "You cannot remove yourself" }, { status: 400 });
  }

  await dbConnect();

  const target = await ClubMember.findOne({ clubId, userId }).lean();
  if (!target) {
    return NextResponse.json({ error: "Member not found" }, { status: 404 });
  }

  const actorRank = MEMBER_RANK[auth.membership.role];
  const targetRank = MEMBER_RANK[target.role];

  // COMMITTEE cannot remove ADMIN or another COMMITTEE
  if (actorRank <= targetRank && auth.user.role !== "ADMIN") {
    return NextResponse.json(
      { error: "You don't have permission to remove this member" },
      { status: 403 }
    );
  }

  // Cannot remove the last ADMIN
  if (target.role === "ADMIN") {
    const adminCount = await ClubMember.countDocuments({ clubId, role: "ADMIN" });
    if (adminCount <= 1) {
      return NextResponse.json(
        { error: "Cannot remove the last Club Admin" },
        { status: 409 }
      );
    }
  }

  await ClubMember.deleteOne({ clubId, userId });
  return NextResponse.json({ ok: true });
}

/* APPROVE OR REJECT A JOIN REQUEST — Committee or Club Admin (regular members only) */
export async function PATCH(req, { params }) {
  const { id: clubId } = await params;
  const access = await requireCommitteeOrAbove(clubId);
  if (access.error) return access.error;
  const parsed = z.object({ userId: z.string(), action: z.enum(["APPROVE", "REJECT"]) }).safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  await dbConnect();
  const member = await ClubMember.findOneAndUpdate(
    { clubId, userId: parsed.data.userId, role: "MEMBER", status: "PENDING", paymentStatus: { $ne: "PENDING" } },
    { $set: { status: parsed.data.action === "APPROVE" ? "ACTIVE" : "REJECTED" } },
    { new: true }
  );
  if (!member) return NextResponse.json({ error: "Pending free membership request not found" }, { status: 404 });
  return NextResponse.json({ ok: true, status: member.status });
}
