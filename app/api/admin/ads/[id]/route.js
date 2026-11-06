import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import SponsorAd from "@/models/SponsorAd";
import { fail, ok, readJson } from "@/lib/http";

export async function PATCH(req, { params }) {
  // Ensure only ADMIN can approve ads
  const { error } = await requireUser("ADMIN");
  if (error) return error;

  const { id } = await params;
  const b = await readJson(req);

  if (!["APPROVE", "REJECT"].includes(b?.action)) {
    return fail("Invalid action. Must be APPROVE or REJECT.", 400);
  }

  await dbConnect();

  const ad = await SponsorAd.findOne({ _id: id, status: "PENDING_REVIEW", paymentVerifiedAt: { $ne: null } });
  if (!ad) return fail("Ad not found or already reviewed.", 404);

  if (b.action === "APPROVE") {
    ad.status = "ACTIVE";
    ad.startsAt = new Date();
    // Safely calculate end date
    const days = ad.durationDays || 30; 
    ad.endsAt = new Date(Date.now() + days * 86400000);
  } else {
    ad.status = "REJECTED";
  }

  await ad.save();

  return ok({ status: ad.status, message: `Ad successfully ${ad.status.toLowerCase()}` });
}