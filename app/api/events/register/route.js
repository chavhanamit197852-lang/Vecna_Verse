import { randomBytes } from "node:crypto";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import Event from "@/models/Event";
import Registration from "@/models/Registration";
import ClubMember from "@/models/ClubMember";
import { fail, ok, readJson } from "@/lib/http";

export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return error;
  const body = await readJson(req);
  if (!body?.eventId) return fail("eventId is required");

  await dbConnect();
  const event = await Event.findOne({ _id: body.eventId, $or: [{ status: "PUBLISHED" }, { isPublished: true }] }).lean();
  if (!event) return fail("Event not found or not published", 404);

  const now = new Date();
  const deadline = event.registrationDeadline || event.startsAt;
  if ((deadline && new Date(deadline) <= now) || new Date(event.startsAt) <= now) {
    return fail("Registration is closed", 409);
  }
  if (event.clubId) {
    const membership = await ClubMember.findOne({ clubId: event.clubId, userId: user.id, status: "ACTIVE" }).lean();
    if (!membership) return fail("Join this club and activate your membership before registering for its events", 403);
  }

  // Release seats held by abandoned demo checkouts (unpaid for > 30 minutes).
  const stale = await Registration.find({ eventId: event._id, status: "PAYMENT_PENDING", createdAt: { $lt: new Date(Date.now() - 30 * 60 * 1000) } }).select("_id").lean();
  if (stale.length) {
    const del = await Registration.deleteMany({ _id: { $in: stale.map((r) => r._id) }, status: "PAYMENT_PENDING" });
    if (del.deletedCount) await Event.updateOne({ _id: event._id, registeredCount: { $gte: del.deletedCount } }, { $inc: { registeredCount: -del.deletedCount } });
    event.registeredCount = Math.max(0, Number(event.registeredCount || 0) - (del.deletedCount || 0));
  }

  const price = Math.max(0, Number(event.ticketPrice || 0));
  const needsDemoPayment = price > 0;
  let capacityReserved = false;
  try {
    const capacityFilter = event.capacity > 0
      ? { _id: event._id, $or: [{ status: "PUBLISHED" }, { isPublished: true }], $expr: { $lt: [{ $ifNull: ["$registeredCount", 0] }, "$capacity"] } }
      : { _id: event._id, $or: [{ status: "PUBLISHED" }, { isPublished: true }] };
    const reserved = await Event.findOneAndUpdate(capacityFilter, { $inc: { registeredCount: 1 } }, { new: true });
    if (!reserved) return fail("Event is full or registration is closed", 409);
    capacityReserved = true;

    const registration = await Registration.create({
      eventId: event._id,
      userId: user.id,
      qrToken: randomBytes(32).toString("hex"),
      status: needsDemoPayment ? "PAYMENT_PENDING" : "REGISTERED",
      payment: {
        mode: needsDemoPayment ? "DEMO" : "FREE",
        status: needsDemoPayment ? "PENDING" : "NOT_REQUIRED",
        amount: price,
      },
    });

    return ok({
      registrationId: String(registration._id),
      status: registration.status,
      requiresPayment: needsDemoPayment,
      demo: true,
      amount: price,
      currency: "INR",
      message: needsDemoPayment ? "Demo checkout ready. No real payment will be collected." : "Registration confirmed.",
    }, 201);
  } catch (err) {
    if (capacityReserved) await Event.updateOne({ _id: event._id }, { $inc: { registeredCount: -1 } });
    if (err?.code === 11000) return fail("You are already registered for this event", 409);
    console.error("Event registration failed:", err);
    return fail("Could not register for this event", 500);
  }
}
