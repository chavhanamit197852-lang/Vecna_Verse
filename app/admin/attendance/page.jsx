import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Registration from "@/models/Registration";
import Event from "@/models/Event";
import AttendanceTable from "./_AttendanceTable";

export const dynamic = "force-dynamic";

export default async function AdminAttendancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  await dbConnect();
  const [events, records] = await Promise.all([
    Event.find().select("title slug").sort({ startsAt: -1 }).lean(),
    Registration.find({ status: { $in: ["REGISTERED", "CHECKED_IN"] } })
      .select("+qrToken")
      .populate("userId", "name email city")
      .populate("eventId", "title slug")
      .sort({ createdAt: -1 })
      .limit(1000)
      .lean(),
  ]);

  const safeRecords = records.map((row) => ({
    _id: String(row._id),
    qrToken: row.qrToken,
    status: row.status,
    checkedInAt: row.checkedInAt ? new Date(row.checkedInAt).toISOString() : null,
    aicteAwarded: row.aicteAwarded || 0,
    user: {
      name: row.userId?.name || "Unknown Student",
      email: row.userId?.email || "No email",
      city: row.userId?.city || "—",
    },
    event: {
      title: row.eventId?.title || "Deleted Event",
      slug: row.eventId?.slug || "",
    },
  }));

  return <AttendanceTable initialRecords={safeRecords} events={JSON.parse(JSON.stringify(events))} showAdminSidebar />;
}
