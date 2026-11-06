import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import Club from "@/models/Club";
import Event from "@/models/Event";
import SponsorshipInquiry from "@/models/SponsorshipInquiry";
import { fail, ok, readJson } from "@/lib/http";

const schema = z.object({ clubId: z.string().min(1), sponsorName: z.string().trim().min(2).max(120), contactEmail: z.string().email(), message: z.string().trim().min(20).max(2000), budgetInr: z.coerce.number().min(1).max(100000000), eventId: z.string().optional().nullable() });

export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return error;
  const parsed = schema.safeParse(await readJson(req));
  if (!parsed.success) return fail(parsed.error.issues[0]?.message || "Invalid sponsorship proposal");
  await dbConnect();
  const club = await Club.findById(parsed.data.clubId).select("_id").lean();
  if (!club) return fail("Club not found", 404);
  if (parsed.data.eventId) {
    const event = await Event.findOne({ _id: parsed.data.eventId, clubId: club._id }).select("_id").lean();
    if (!event) return fail("Event does not belong to this club", 400);
  }
  const inquiry = await SponsorshipInquiry.create({ ...parsed.data, sponsorUserId: user.id, contactEmail: parsed.data.contactEmail.toLowerCase() });
  return ok({ id: String(inquiry._id), status: inquiry.status, message: "Proposal sent to the club." }, 201);
}
