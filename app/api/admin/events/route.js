import { dbConnect } from "@/lib/db";
import { requireEventCreationAccess } from "@/lib/permissions";
import Event from "@/models/Event";
import Club from "@/models/Club";
import ClubMember from "@/models/ClubMember";
import { eventInput } from "@/lib/validators";
import { fail, ok, readJson } from "@/lib/http";

export async function POST(req) {
  const { user, error } = await requireEventCreationAccess();
  if (error) return error;
  const body = await readJson(req);
  if (!body) return fail("Invalid request body");
  if (body.capacity === "") body.capacity = undefined;
  if (body.aictePoints === "") body.aictePoints = 0;
  if (body.ticketPrice === "") body.ticketPrice = 0;
  if (body.coverImage === "") body.coverImage = undefined;
  if (body.location === null) body.location = undefined;
  const parsed = eventInput.safeParse(body);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid event data");

  await dbConnect();
  let clubId = null;
  if (body.clubId) {
    const club = await Club.findById(body.clubId).select("_id").lean();
    if (!club) return fail("Selected club was not found", 404);
    if (user.role !== "ADMIN") {
      const membership = await ClubMember.findOne({ clubId: club._id, userId: user.id, role: "ADMIN", status: "ACTIVE" }).lean();
      if (!membership) return fail("You can create events only for clubs you administer", 403);
    }
    clubId = club._id;
  } else if (user.role !== "ADMIN") {
    return fail("Club Admin must select their club", 400);
  }

  const slug = parsed.data.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + "-" + Date.now().toString(36);
  try {
    const event = await Event.create({ ...parsed.data, slug, clubId, scope: clubId ? "CLUB" : "PLATFORM", createdBy: user.id, status: "DRAFT", isPublished: false });
    return ok({ id: String(event._id), slug, scope: event.scope }, 201);
  } catch (err) {
    console.error("Event creation failed:", err);
    return fail("Failed to create event", 500);
  }
}
