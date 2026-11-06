import { dbConnect } from "@/lib/db";
import ClubAd from "@/models/ClubAd";
import { ok, fail } from "@/lib/http";
export async function POST(_req, { params }) {
  const { id } = await params;
  await dbConnect();
  const result = await ClubAd.updateOne({ _id: id, status: "ACTIVE" }, { $inc: { clicks: 1 } });
  if (!result.matchedCount) return fail("Advertisement not found", 404);
  return ok({ tracked: true });
}
