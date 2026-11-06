import { dbConnect } from "@/lib/db";
import { requireRole } from "@/lib/permissions";
import ClubAd from "@/models/ClubAd";
import { fail, ok, readJson } from "@/lib/http";
export async function PATCH(req, { params }) {
  const access = await requireRole("ADMIN");
  if (access.error) return access.error;
  const { id } = await params;
  const body = await readJson(req);
  if (!["APPROVE", "REJECT"].includes(body?.action)) return fail("Action must be APPROVE or REJECT");
  await dbConnect();
  const ad = await ClubAd.findOne({ _id: id, status: "PENDING_REVIEW", paymentVerifiedAt: { $ne: null } });
  if (!ad) return fail("Club ad not found or already reviewed", 404);
  if (body.action === "APPROVE") {
    ad.status = "ACTIVE";
    ad.startsAt = new Date();
    ad.endsAt = new Date(Date.now() + (ad.durationDays || 7) * 86400000);
  } else ad.status = "REJECTED";
  await ad.save();
  return ok({ status: ad.status });
}
