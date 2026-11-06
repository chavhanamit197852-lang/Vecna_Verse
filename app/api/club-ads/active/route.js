import { dbConnect } from "@/lib/db";
import ClubAd from "@/models/ClubAd";
import { ok } from "@/lib/http";
const allowed = ["HOMEPAGE", "EVENTS", "CLUB_DIRECTORY"];
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const placement = searchParams.get("placement") || "HOMEPAGE";
  if (!allowed.includes(placement)) return ok([]);
  await dbConnect();
  const now = new Date();
  await ClubAd.updateMany({ status: "ACTIVE", endsAt: { $lte: now } }, { $set: { status: "EXPIRED" } });
  const ads = await ClubAd.find({ status: "ACTIVE", placement, paymentVerifiedAt: { $ne: null }, startsAt: { $lte: now }, endsAt: { $gt: now } })
    .populate("clubId", "name slug institution")
    .select("title body targetUrl imageUrl placement tier clubId")
    .sort({ tier: -1, createdAt: -1 }).limit(4).lean();
  if (ads.length) await ClubAd.updateMany({ _id: { $in: ads.map((ad) => ad._id) } }, { $inc: { impressions: 1 } });
  return ok(ads.map((ad) => ({ ...ad, _id: String(ad._id), clubId: ad.clubId ? { name: ad.clubId.name, slug: ad.clubId.slug, institution: ad.clubId.institution } : null })));
}
