import mongoose from "mongoose";
import { dbConnect } from "@/lib/db";
import { requireClubAdmin } from "@/lib/permissions";
import ClubAd from "@/models/ClubAd";
import { fail, ok } from "@/lib/http";
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const clubId = searchParams.get("clubId");
  if (!clubId || !mongoose.isValidObjectId(clubId)) return fail("A valid clubId is required");
  const access = await requireClubAdmin(clubId);
  if (access.error) return access.error;
  await dbConnect();
  const ads = await ClubAd.find({ clubId }).sort({ createdAt: -1 }).lean();
  return ok(ads.map((ad) => ({ ...ad, _id: String(ad._id), clubId: String(ad.clubId) })));
}
