import { randomUUID } from "node:crypto";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import Club from "@/models/Club";
import ClubMember from "@/models/ClubMember";
import { fail, ok } from "@/lib/http";

export async function POST(_req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;
  await dbConnect();
  const club = await Club.findById(id).lean();
  if (!club) return fail("Club not found", 404);
  const existing = await ClubMember.findOne({ clubId: id, userId: user.id }).lean();
  if (existing?.status === "ACTIVE") return ok({ status: "ACTIVE", message: "You are already an active member." });
  if (existing?.status === "PENDING" && existing.paymentStatus === "PENDING") return ok({ status: "PENDING_PAYMENT", membershipId: String(existing._id), amount: existing.membershipFee, demo: true });
  if (existing) return fail(`Your membership is ${existing.status.toLowerCase()}. Contact the club admin.`, 409);

  const fee = Math.max(0, Number(club.membershipFee || 0));
  const paid = fee > 0;
  const membership = await ClubMember.create({
    clubId: club._id, userId: user.id, role: "MEMBER",
    status: paid ? "PENDING" : ((club.membershipApprovalRequired || club.isPrivate) ? "PENDING" : "ACTIVE"),
    membershipType: paid ? "PAID" : "FREE", membershipFee: fee,
    paymentStatus: paid ? "PENDING" : "NOT_REQUIRED", paymentMode: paid ? "DEMO" : "FREE",
  });
  return ok({ membershipId: String(membership._id), status: membership.status, requiresPayment: paid, amount: fee, demo: paid, message: paid ? "Demo membership checkout created. No real payment will be collected." : membership.status === "ACTIVE" ? "You joined the club." : "Join request sent to the club admin." }, 201);
}

export async function PATCH(_req, { params }) {
  const { user, error } = await requireUser();
  if (error) return error;
  const { id } = await params;
  await dbConnect();
  const membership = await ClubMember.findOneAndUpdate(
    { _id: id, userId: user.id, status: "PENDING", membershipType: "PAID", paymentMode: "DEMO", paymentStatus: "PENDING" },
    { $set: { status: "ACTIVE", paymentStatus: "PAID", paidAt: new Date(), demoPaymentId: `DEMO-MEMBER-${randomUUID()}` } },
    { new: true }
  );
  if (!membership) return fail("Pending demo membership payment not found", 404);
  return ok({ status: "ACTIVE", demo: true, message: "Demo membership payment confirmed. Your membership is active." });
}
