// lib/permissions.js
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { dbConnect } from "@/lib/db";
import ClubMember from "@/models/ClubMember";

const ROLE_RANK = { STUDENT: 1, SPONSOR: 1, CLUB_ADMIN: 2, ADMIN: 3 };
const MEMBER_RANK = { MEMBER: 1, COMMITTEE: 2, ADMIN: 3 };

/* ─── Global role gate (unchanged) ─── */
export async function requireRole(minRole = "STUDENT") {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if ((ROLE_RANK[session.user.role] || 0) < (ROLE_RANK[minRole] || 0)) {
    return { error: NextResponse.json({ error: `Requires ${minRole}` }, { status: 403 }) };
  }
  return { user: session.user };
}
export const requireUser = requireRole;

/* ─── Event creation (Admin OR any Club Admin) ─── */
export async function requireEventCreationAccess() {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role === "ADMIN") return { user: session.user };
  await dbConnect();
  const managedClub = await ClubMember.exists({ userId: session.user.id, role: "ADMIN", status: "ACTIVE" });
  if (!managedClub) {
    return { error: NextResponse.json({ error: "Active Club Admin membership required" }, { status: 403 }) };
  }
  return { user: session.user };
}

/* ─── Any club member (MEMBER, COMMITTEE, or ADMIN) ─── */
export async function requireClubMembership(clubId) {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role === "ADMIN") {
    return { user: session.user, membership: { role: "ADMIN" } };
  }

  await dbConnect();
  const membership = await ClubMember.findOne({
    clubId, userId: session.user.id, status: "ACTIVE",
  }).lean();

  if (!membership) {
    return { error: NextResponse.json({ error: "Not a member of this club" }, { status: 403 }) };
  }
  return { user: session.user, membership };
}

/* ─── NEW: Committee or above (COMMITTEE + ADMIN) ─── */
export async function requireCommitteeOrAbove(clubId) {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role === "ADMIN") {
    return { user: session.user, membership: { role: "ADMIN" } };
  }

  await dbConnect();
  const membership = await ClubMember.findOne({ clubId, userId: session.user.id, status: "ACTIVE" }).lean();

  if (!membership) {
    return { error: NextResponse.json({ error: "Not a member of this club" }, { status: 403 }) };
  }

  if ((MEMBER_RANK[membership.role] || 0) < MEMBER_RANK.COMMITTEE) {
    return { error: NextResponse.json({ error: "Committee access required" }, { status: 403 }) };
  }

  return { user: session.user, membership };
}

/* ─── Club Admin only (ADMIN) ─── */
export async function requireClubAdmin(clubId) {
  const session = await auth();
  if (!session?.user) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  if (session.user.role === "ADMIN") {
    return { user: session.user, membership: { role: "ADMIN" } };
  }

  await dbConnect();
  const membership = await ClubMember.findOne({
    clubId, userId: session.user.id, role: "ADMIN", status: "ACTIVE",
  }).lean();

  if (!membership) {
    return { error: NextResponse.json({ error: "Club Admin access required" }, { status: 403 }) };
  }
  return { user: session.user, membership };
}

export const requireClubAccess = requireClubAdmin;