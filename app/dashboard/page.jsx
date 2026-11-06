import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Registration from "@/models/Registration";
import DashboardView from "./_DashboardView";

export default async function Dashboard() {
  const session = await auth();
  const userId = session?.user?.id;
  
  if (!userId) redirect("/login");

  await dbConnect();

  // 1. Fetch User Data (Defensive)
  let user = null;
  try {
    user = await User.findById(userId).lean();
  } catch {
    redirect("/login");
  }

  // 2. Fetch Attendance Stats
  let totalTickets = 0;
  let checkedIn = 0;
  let upcomingEvents = [];

  try {
    [totalTickets, checkedIn] = await Promise.all([
      Registration.countDocuments({ userId, status: { $in: ["REGISTERED", "CHECKED_IN"] } }),
      Registration.countDocuments({ userId, status: "CHECKED_IN" }),
    ]);

    const rows = await Registration.find({ userId, status: "REGISTERED" })
      .populate("eventId", "title slug startsAt city aictePoints")
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    upcomingEvents = rows
      .filter((a) => a.eventId && new Date(a.eventId.startsAt) > new Date())
      .sort((a, b) => new Date(a.eventId.startsAt) - new Date(b.eventId.startsAt));
  } catch {
    // Fallback to empty data if something fails
  }

  // 3. Calculate derived stats
  const aicteTotal = user?.aicteTotal || 0;
  const aicteRequired = 100; // Change based on your curriculum
  const aictePct = Math.min(100, Math.round((aicteTotal / aicteRequired) * 100));
  const attendanceRate = totalTickets ? Math.round((checkedIn / totalTickets) * 100) : 0;

  // 4. Render the Client View
  return (
    <DashboardView
      user={user ? JSON.parse(JSON.stringify(user)) : null}
      totalTickets={totalTickets}
      checkedIn={checkedIn}
      upcomingEvents={JSON.parse(JSON.stringify(upcomingEvents))}
      aicteTotal={aicteTotal}
      aictePct={aictePct}
      attendanceRate={attendanceRate}
    />
  );
}
export const dynamic = "force-dynamic";
