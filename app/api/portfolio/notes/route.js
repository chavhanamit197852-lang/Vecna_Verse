import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import EventNote from "@/models/EventNote";
import Registration from "@/models/Registration";
import { fail, ok } from "@/lib/http";

export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return error;
  const f = await req.formData();
  const eventId = String(f.get("eventId") || "");
  const summary = String(f.get("summary") || "").trim();
  if (!mongoose.isValidObjectId(eventId) || summary.length < 3 || summary.length > 5000) {
    return fail("Choose an event and enter a summary");
  }
  await dbConnect();
  const participated = await Registration.exists({ eventId, userId: user.id, status: "CHECKED_IN" });
  if (!participated) return fail("Notes can only be attached to events you attended", 403);
  const d = await EventNote.findOneAndUpdate(
    { userId: user.id, eventId },
    { $set: {
      summary,
      contactName: String(f.get("contactName") || "").slice(0, 120),
      contactEmail: String(f.get("contactEmail") || "").slice(0, 200),
      contactPhone: String(f.get("contactPhone") || "").slice(0, 40),
    } },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  );
  return ok({ id: String(d._id) }, 201);
}
