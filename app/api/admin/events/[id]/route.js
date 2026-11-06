import { dbConnect } from "@/lib/db";
import { requireUser, requireClubAccess } from "@/lib/permissions";
import Event from "@/models/Event";
import { fail, ok, readJson } from "@/lib/http";
import { eventInput } from "@/lib/validators";
import mongoose from "mongoose";

export async function PATCH(req, { params }) {
  const { error } = await requireUser();
  if (error) return error;

  const { id } = await params;
  const b = await readJson(req);

  const validActions = ["PUBLISH", "CANCEL", "COMPLETE"];
  if (!validActions.includes(b?.action)) {
    return fail("Invalid action. Must be PUBLISH, CANCEL, or COMPLETE.", 400);
  }

  await dbConnect();

  const event = await Event.findById(id);
  if (!event) return fail("Event not found", 404);

  // Verify the club admin owns this event (Admins bypass this)
  const access = await requireClubAccess(event.clubId);
  if (access.error) return access.error;

  // ─── STRICT STATE MACHINE GUARDS ───
  
  // 1. You cannot COMPLETE an event that hasn't been published yet
  if (b.action === "COMPLETE" && event.status !== "PUBLISHED") {
    return fail("Only published events can be marked as completed.", 400);
  }

  // 2. You cannot CANCEL an event that is already COMPLETED or CANCELLED
  if (b.action === "CANCEL" && ["COMPLETED", "CANCELLED"].includes(event.status)) {
    return fail("This event is already finalized and cannot be cancelled.", 400);
  }

  // 3. You cannot PUBLISH an event that is already PUBLISHED, COMPLETED, or CANCELLED
  if (b.action === "PUBLISH" && event.status !== "DRAFT") {
    return fail("Only draft events can be published.", 400);
  }

  // ─── APPLY ACTION ───
  try {
    if (b.action === "PUBLISH") {
      event.status = "PUBLISHED";
      event.isPublished = true;
    } 
    
    else if (b.action === "CANCEL") {
      event.status = "CANCELLED";
      event.isPublished = false;
    } 
    
    else if (b.action === "COMPLETE") {
      event.status = "COMPLETED";
      event.isPublished = false;
    }

    await event.save();

    return ok({ 
      status: event.status, 
      isPublished: event.isPublished,
      message: `Event successfully ${b.action.toLowerCase()}ed.`
    });
  } catch (err) {
    console.error("Event update failed:", err);
    return fail("Server error while updating event.", 500);
  }
}

// ─── UPDATE event details (organizers / platform admin) ───
export async function PUT(req, { params }) {
  const { error } = await requireUser();
  if (error) return error;
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return fail("Invalid event id", 400);
  const body = await readJson(req);
  if (!body) return fail("Invalid request body");

  await dbConnect();
  const event = await Event.findById(id);
  if (!event) return fail("Event not found", 404);
  const access = await requireClubAccess(event.clubId);
  if (access.error) return access.error;
  if (["CANCELLED", "COMPLETED"].includes(event.status)) return fail("Finished or cancelled events cannot be edited.", 409);

  const parsed = eventInput.partial().safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid event data");
  const d = parsed.data;

  const startsAt = d.startsAt || event.startsAt;
  const endsAt = d.endsAt || event.endsAt;
  if (new Date(endsAt) <= new Date(startsAt)) return fail("End time must be after the start time.");
  if (d.capacity !== undefined && d.capacity > 0 && d.capacity < (event.registeredCount || 0)) {
    return fail(`Capacity cannot be lower than the ${event.registeredCount} students already registered.`);
  }
  if (d.ticketPrice !== undefined && d.ticketPrice !== event.ticketPrice && (event.registeredCount || 0) > 0) {
    return fail("Ticket price cannot be changed after registrations exist.", 409);
  }

  // Only editable fields — never clubId / slug / status / createdBy.
  for (const k of ["title", "description", "category", "city", "venue", "coverImage", "startsAt", "endsAt", "registrationDeadline", "capacity", "aictePoints", "aicteCategory", "ticketPrice", "location"]) {
    if (d[k] !== undefined) event[k] = d[k];
  }
  await event.save();
  return ok({ id: String(event._id), slug: event.slug, status: event.status });
}
