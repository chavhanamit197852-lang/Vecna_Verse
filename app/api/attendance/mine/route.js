import { dbConnect } from "@/lib/db";
import { requireUser } from "@/lib/permissions";
import Registration from "@/models/Registration";
import { ticketQr } from "@/lib/qr";
import { ok } from "@/lib/http";

export async function GET() {
  const { user, error } = await requireUser();
  if (error) return error;
  await dbConnect();
  const rows = await Registration.find({ userId: user.id, status: { $in: ["REGISTERED", "CHECKED_IN"] } })
    .select("+qrToken")
    .populate("eventId", "title city startsAt slug ticketPrice")
    .sort({ createdAt: -1 }).lean();
  return ok(await Promise.all(rows.map(async (row) => ({
    id: String(row._id), status: row.status, checkedInAt: row.checkedInAt,
    aicteAwarded: row.aicteAwarded, payment: row.payment,
    event: row.eventId ? { title: row.eventId.title, city: row.eventId.city, startsAt: row.eventId.startsAt, slug: row.eventId.slug, ticketPrice: row.eventId.ticketPrice } : null,
    qr: await ticketQr(row.qrToken),
  }))));
}
