import { randomUUID } from "node:crypto";
import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import Registration from "@/models/Registration";
import { fail, ok, readJson } from "@/lib/http";

export async function POST(req) {
  const { user, error } = await requireUser();
  if (error) return error;
  const body = await readJson(req);
  if (!body?.registrationId) return fail("registrationId is required");
  await dbConnect();

  const registration = await Registration.findOneAndUpdate(
    { _id: body.registrationId, userId: user.id, status: "PAYMENT_PENDING", "payment.mode": "DEMO", "payment.status": "PENDING" },
    { $set: {
      status: "REGISTERED",
      "payment.status": "PAID",
      "payment.demoPaymentId": `DEMO-${randomUUID()}`,
      "payment.paidAt": new Date(),
    } },
    { new: true }
  );

  if (!registration) {
    const existing = await Registration.findOne({ _id: body.registrationId, userId: user.id }).lean();
    if (existing?.status === "REGISTERED" && existing?.payment?.status === "PAID") {
      return ok({ confirmed: true, status: existing.status, message: "Demo payment was already confirmed." });
    }
    return fail("Pending demo registration not found", 404);
  }

  return ok({ confirmed: true, status: registration.status, message: "Demo payment successful. Your QR ticket is ready." });
}
