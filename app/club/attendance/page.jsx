import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Registration from "@/models/Registration";
import Event from "@/models/Event";
import ClubMember from "@/models/ClubMember";
import AttendanceTable from "@/app/admin/attendance/_AttendanceTable";

export default async function ClubAttendancePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await dbConnect();

  let clubIds;
  if (session.user.role === "ADMIN") {
    clubIds = null;
  } else {
    const memberships = await ClubMember.find({ userId: session.user.id, role: { $in: ["ADMIN", "COMMITTEE"] }, status: "ACTIVE" }).select("clubId").lean();
    clubIds = memberships.map((membership) => membership.clubId);
    if (!clubIds.length) redirect("/dashboard");
  }

  const events = await Event.find(clubIds ? { clubId: { $in: clubIds } } : {}).select("title slug").sort({ startsAt: -1 }).lean();
  const eventIds = events.map((event) => event._id);
  const records = await Registration.find({ eventId: { $in: eventIds }, status: { $in: ["REGISTERED", "CHECKED_IN"] } })
    .select("+qrToken")
    .populate("userId", "name email city")
    .populate("eventId", "title slug")
    .sort({ createdAt: -1 }).limit(500).lean();

  const safeRecords = records.map((row) => ({
    _id: String(row._id), qrToken: row.qrToken, status: row.status,
    checkedInAt: row.checkedInAt ? new Date(row.checkedInAt).toISOString() : null,
    aicteAwarded: row.aicteAwarded || 0,
    user: { name: row.userId?.name || "Unknown Student", email: row.userId?.email || "No email", city: row.userId?.city || "—" },
    event: { title: row.eventId?.title || "Deleted Event", slug: row.eventId?.slug || "" },
  }));
  return <div className="p-6 md:p-10"><AttendanceTable initialRecords={safeRecords} events={JSON.parse(JSON.stringify(events))} /></div>;
}

export const dynamic = "force-dynamic";
