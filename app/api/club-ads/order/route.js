import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireClubAdmin } from "@/lib/permissions";
import Club from "@/models/Club";
import ClubAd from "@/models/ClubAd";
import { fail, ok, readJson, safeUrl } from "@/lib/http";

const plans = {
  BASIC: { amount: 499, days: 7 },
  STANDARD: { amount: 1499, days: 14 },
  PREMIUM: { amount: 3999, days: 30 },
};
const placements = ["HOMEPAGE", "EVENTS", "CLUB_DIRECTORY"];

export async function POST(req) {
  const body = await readJson(req);
  if (!body?.clubId || !mongoose.isValidObjectId(body.clubId)) return fail("Select a valid club first");
  const access = await requireClubAdmin(body.clubId);
  if (access.error) return access.error;
  const plan = plans[body.tier];
  const targetUrl = safeUrl(body.targetUrl);
  if (!plan || !placements.includes(body.placement) || !body.title?.trim() || body.title.trim().length > 90 || !body.body?.trim() || body.body.trim().length > 420 || !targetUrl) {
    return fail("Please provide a valid ad title, description, destination, placement and plan");
  }
  await dbConnect();
  const club = await Club.findById(body.clubId).select("_id").lean();
  if (!club) return fail("Club not found", 404);
  const ad = await ClubAd.create({
    clubId: club._id, ownerId: access.user.id, title: body.title.trim(), body: body.body.trim(),
    targetUrl, imageUrl: safeUrl(body.imageUrl) || "", placement: body.placement,
    tier: body.tier, amountInr: plan.amount, durationDays: plan.days,
    paymentMode: "DEMO", status: "PENDING_PAYMENT",
  });
  return ok({ adId: String(ad._id), amount: plan.amount, currency: "INR", demo: true, message: "Demo order created. No real payment will be collected." }, 201);
}
