import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import SponsorAd from "@/models/SponsorAd";
import { fail, ok, readJson, safeUrl } from "@/lib/http";

const plans = { BASIC: { amount: 999, days: 7 }, STANDARD: { amount: 2499, days: 30 }, PREMIUM: { amount: 5999, days: 90 } };

export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return error;
  const body = await readJson(req);
  const plan = plans[body?.tier];
  const targetUrl = safeUrl(body?.targetUrl);
  if (!plan || !body?.title?.trim() || body.title.length > 80 || !body?.body?.trim() || body.body.length > 400 || !targetUrl) {
    return fail("Invalid advertisement details");
  }
  await dbConnect();
  const ad = await SponsorAd.create({
    ownerId: user.id, title: body.title.trim(), body: body.body.trim(), targetUrl,
    tier: body.tier, amountInr: plan.amount, amountPaise: plan.amount * 100,
    durationDays: plan.days, paymentMode: "DEMO", status: "PENDING_PAYMENT",
  });
  return ok({ adId: String(ad._id), amount: plan.amount, currency: "INR", demo: true, message: "Demo order created. No real payment will be collected." }, 201);
}
