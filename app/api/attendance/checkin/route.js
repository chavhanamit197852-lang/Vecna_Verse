import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireCommitteeOrAbove } from "@/lib/permissions";
import Registration from "@/models/Registration";
import User from "@/models/User";

const bodySchema = z.object({ token: z.string().min(16).max(256) });

export async function POST(req) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid QR token" }, { status: 400 });
  await dbConnect();

  const ticket = await Registration.findOne({ qrToken: parsed.data.token })
    .select("+qrToken")
    .populate("eventId", "title clubId aictePoints status")
    .lean();
  if (!ticket || !ticket.eventId) return NextResponse.json({ error: "Invalid QR Code" }, { status: 404 });
  if (ticket.status === "PAYMENT_PENDING") return NextResponse.json({ error: "Ticket payment is not confirmed" }, { status: 409 });
  if (ticket.status === "CANCELLED") return NextResponse.json({ error: "This ticket was cancelled" }, { status: 409 });
  if (ticket.eventId.status !== "PUBLISHED" && ticket.eventId.status !== "COMPLETED") {
    return NextResponse.json({ error: "This event is not available for check-in" }, { status: 409 });
  }

  if (ticket.eventId.clubId) {
    // Only COMMITTEE / club ADMIN (or platform ADMIN) may scan — plain MEMBERs may not.
    const access = await requireCommitteeOrAbove(ticket.eventId.clubId);
    if (access.error) return access.error;
  } else {
    if (!["ADMIN", "CLUB_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Scanner access denied" }, { status: 403 });
    }
  }

  const points = Math.max(0, Number(ticket.eventId.aictePoints || 0));
  const scannerSession = session;
  const updated = await Registration.findOneAndUpdate(
    { _id: ticket._id, status: "REGISTERED" },
    { $set: { status: "CHECKED_IN", checkedInAt: new Date(), checkedInBy: scannerSession?.user?.id || null, aicteAwarded: points } },
    { new: true }
  );

  if (!updated) {
    return NextResponse.json({ error: "Student is already checked in or ticket is no longer valid" }, { status: 409 });
  }

  if (points > 0) await User.findByIdAndUpdate(ticket.userId, { $inc: { aicteTotal: points } });
  const student = await User.findById(ticket.userId).select("name email image").lean();

  return NextResponse.json({
    success: true,
    aicteAwarded: points,
    student: { name: student?.name || "Student", email: student?.email || "" },
    event: ticket.eventId.title,
    checkedInAt: updated.checkedInAt,
  });
}
