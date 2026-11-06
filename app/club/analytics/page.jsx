import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import Registration from "@/models/Registration";
import ClubMember from "@/models/ClubMember";
import Sponsor from "@/models/Sponsor";
import ClubAnalyticsView from "./_ClubAnalyticsView";

export default async function ClubAnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await dbConnect();

  const isPlatformAdmin = session.user.role === "ADMIN";
  const memberships = isPlatformAdmin ? [] : await ClubMember.find({ userId: session.user.id, role: "ADMIN", status: "ACTIVE" }).select("clubId").lean();
  const clubIds = isPlatformAdmin ? null : memberships.map((m) => m.clubId);
  if (!isPlatformAdmin && !clubIds.length) redirect("/dashboard");

  const eventFilter = isPlatformAdmin ? {} : { clubId: { $in: clubIds } };
  const events = await Event.find(eventFilter).lean();
  const eventIds = events.map((event) => event._id);
  const attendance = await Registration.find({ eventId: { $in: eventIds }, status: "CHECKED_IN" }).lean();
  const eventMap = new Map(events.map((event) => [String(event._id), event]));
  const totalIncome = attendance.reduce((sum, row) => {
    const event = eventMap.get(String(row.eventId));
    return sum + (row.payment?.status === "PAID" ? Number(row.payment.amount || 0) : 0);
  }, 0);
  const sponsors = await Sponsor.find(isPlatformAdmin ? {} : { clubId: { $in: clubIds } }).lean();
  const totalSponsorAmount = sponsors.reduce((sum, sponsor) => sum + ((sponsor.paymentStatus === "PAID" || !sponsor.paymentStatus) ? Number(sponsor.amount || 0) : 0), 0);
  const chartData = events.map((event) => ({
    name: event.title,
    students: attendance.filter((row) => String(row.eventId) === String(event._id)).length,
  })).slice(0, 5);

  return <ClubAnalyticsView stats={{ totalStudents: attendance.length, totalIncome, totalSponsors: totalSponsorAmount, totalAdSpend: 0, totalEvents: events.length }} chartData={chartData} sponsors={JSON.parse(JSON.stringify(sponsors))} />;
}

export const dynamic = "force-dynamic";
