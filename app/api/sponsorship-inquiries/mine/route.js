import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import SponsorshipInquiry from "@/models/SponsorshipInquiry";
import { fail, ok } from "@/lib/http";
export async function GET() {
  const session = await auth();
  if (!session?.user) return fail("Sign in to view your proposals", 401);
  await dbConnect();
  const rows = await SponsorshipInquiry.find({ sponsorUserId: session.user.id })
    .populate("clubId", "name institution city")
    .populate("eventId", "title")
    .sort({ createdAt: -1 }).lean();
  return ok(rows.map((row) => ({ ...row, _id: String(row._id), clubId: row.clubId ? { name: row.clubId.name, institution: row.clubId.institution, city: row.clubId.city } : null, eventId: row.eventId ? { title: row.eventId.title } : null })));
}
