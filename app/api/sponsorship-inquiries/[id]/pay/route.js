import { randomUUID } from "node:crypto";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import SponsorshipInquiry from "@/models/SponsorshipInquiry";
import Sponsor from "@/models/Sponsor";
import { fail, ok } from "@/lib/http";
export async function POST(_req, { params }) {
  const session = await auth();
  if (!session?.user) return fail("Sign in to contribute", 401);
  const { id } = await params;
  await dbConnect();
  const inquiry = await SponsorshipInquiry.findOne({ _id: id, sponsorUserId: session.user.id, status: "ACCEPTED" }).lean();
  if (!inquiry) return fail("Only an accepted proposal can be funded", 409);
  if (Number(inquiry.budgetInr || 0) <= 0) return fail("This proposal has no contribution amount. Contact the club to agree on a budget.", 400);
  const existing = await Sponsor.findOne({ inquiryId: inquiry._id }).lean();
  if (existing?.paymentStatus === "PAID") return ok({ paid: true, alreadyPaid: true, message: "Contribution was already recorded." });
  const paymentId = `DEMO-SPONSOR-${randomUUID()}`;
  await Sponsor.updateOne(
    { inquiryId: inquiry._id },
    { $set: { clubId: inquiry.clubId, sponsorUserId: session.user.id, sponsorName: inquiry.sponsorName, amount: Number(inquiry.budgetInr), paymentStatus: "PAID", paidAt: new Date(), paymentMode: "DEMO", demoPaymentId: paymentId, eventId: inquiry.eventId || undefined }, $setOnInsert: { inquiryId: inquiry._id, tier: "SILVER" } },
    { upsert: true }
  );
  return ok({ paid: true, demo: true, paymentId, message: "Demo contribution recorded. No real money was collected." });
}
