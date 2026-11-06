import mongoose from "mongoose";
import { randomUUID } from "node:crypto";
import { dbConnect } from "@/lib/db";
import { requireClubAdmin } from "@/lib/permissions";
import ClubAd from "@/models/ClubAd";
import { fail, ok, readJson } from "@/lib/http";

export async function POST(req) {
  const body = await readJson(req);
  if (!body?.adId || !body?.clubId || !mongoose.isValidObjectId(body.adId) || !mongoose.isValidObjectId(body.clubId)) return fail("Valid adId and clubId are required");
  const access = await requireClubAdmin(body.clubId);
  if (access.error) return access.error;
  await dbConnect();
  const ad = await ClubAd.findOneAndUpdate(
    { _id: body.adId, clubId: body.clubId, ownerId: access.user.id, status: "PENDING_PAYMENT", paymentMode: "DEMO" },
    { $set: { status: "PENDING_REVIEW", paymentVerifiedAt: new Date(), demoPaymentId: `DEMO-CLUB-AD-${randomUUID()}` } },
    { new: true }
  );
  if (!ad) return fail("Ad order not found or already processed", 404);
  return ok({ verified: true, demo: true, status: ad.status, message: "Demo payment recorded. Your club ad is waiting for platform admin review. No real money was charged." });
}
