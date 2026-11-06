import { z } from "zod";
import { dbConnect } from "@/lib/db";
import { requireClubAdmin } from "@/lib/permissions";
import SponsorshipInquiry from "@/models/SponsorshipInquiry";
import Sponsor from "@/models/Sponsor";
import { fail, ok, readJson } from "@/lib/http";

export async function GET(_req, { params }) {
  const { id } = await params;
  const access = await requireClubAdmin(id);
  if (access.error) return access.error;
  await dbConnect();
  const inquiries = await SponsorshipInquiry.find({ clubId: id }).populate("sponsorUserId", "name email image").populate("eventId", "title").sort({ createdAt: -1 }).lean();
  return ok(inquiries.map((item) => ({ ...item, _id: String(item._id), clubId: String(item.clubId) })));
}

export async function PATCH(req, { params }) {
  const { id } = await params;
  const access = await requireClubAdmin(id);
  if (access.error) return access.error;
  const body = await readJson(req);
  const parsed = z.object({ inquiryId: z.string(), status: z.enum(["CONTACTED", "ACCEPTED", "REJECTED", "CLOSED"]), responseNote: z.string().max(1000).optional().default("") }).safeParse(body);
  if (!parsed.success) return fail("Invalid proposal update");
  await dbConnect();
  const inquiry = await SponsorshipInquiry.findOneAndUpdate(
    { _id: parsed.data.inquiryId, clubId: id, status: { $in: ["PENDING", "CONTACTED"] } },
    { $set: { status: parsed.data.status, responseNote: parsed.data.responseNote, respondedBy: access.user.id, respondedAt: new Date() } },
    { new: true }
  );
  if (!inquiry) return fail("Proposal not found or already closed", 404);
  if (inquiry.status === "ACCEPTED") {
    await Sponsor.updateOne(
      { inquiryId: inquiry._id },
      { $setOnInsert: {
        clubId: inquiry.clubId,
        sponsorUserId: inquiry.sponsorUserId,
        sponsorName: inquiry.sponsorName,
        amount: Number(inquiry.budgetInr || 0),
        paymentStatus: "PENDING",
        paymentMode: "DEMO",
        tier: "SILVER",
        eventId: inquiry.eventId || undefined,
        inquiryId: inquiry._id,
      } },
      { upsert: true }
    );
  }
  return ok({ status: inquiry.status });
}
