import { randomUUID } from "node:crypto";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import SponsorAd from "@/models/SponsorAd";
import { fail, ok, readJson } from "@/lib/http";

export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return error;
  const body = await readJson(req);
  if (!body?.adId) return fail("adId is required");
  await dbConnect();
  const ad = await SponsorAd.findOneAndUpdate(
    { _id: body.adId, ownerId: user.id, status: "PENDING_PAYMENT", paymentMode: "DEMO" },
    { $set: { status: "PENDING_REVIEW", paymentVerifiedAt: new Date(), demoPaymentId: `DEMO-AD-${randomUUID()}` } },
    { new: true }
  );
  if (!ad) return fail("Demo ad order not found or already processed", 404);
  return ok({ verified: true, demo: true, status: ad.status, message: "Demo payment recorded. Your advertisement is waiting for admin review." });
}
