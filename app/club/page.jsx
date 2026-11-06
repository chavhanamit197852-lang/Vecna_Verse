import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import Club from "@/models/Club";
import ClubMember from "@/models/ClubMember";
import Registration from "@/models/Registration";
import { Calendar, Users, IndianRupee, Activity, ScanLine, ArrowRight, PlusCircle } from "lucide-react";

export default async function ClubDashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await dbConnect();

  const isPlatformAdmin = session.user.role === "ADMIN";
  const memberships = isPlatformAdmin ? [] : await ClubMember.find({ userId: session.user.id, status: "ACTIVE" }).populate("clubId", "name slug").lean();
  const managed = isPlatformAdmin ? [] : memberships.filter((m) => m.role === "ADMIN");
  if (!isPlatformAdmin && !managed.length) redirect("/dashboard");

  const clubIds = managed.map((m) => m.clubId?._id).filter(Boolean);
  const eventFilter = isPlatformAdmin ? {} : { clubId: { $in: clubIds } };
  const [clubs, recentEvents, allEvents] = await Promise.all([
    isPlatformAdmin ? Club.find().select("name slug").lean() : Promise.resolve(managed.map((m) => m.clubId).filter(Boolean)),
    Event.find(eventFilter).sort({ createdAt: -1 }).limit(6).lean(),
    Event.find(eventFilter).select("_id status ticketPrice").lean(),
  ]);
  const eventIds = allEvents.map((event) => event._id);
  const [checkedIn, paidRows] = await Promise.all([
    Registration.countDocuments({ eventId: { $in: eventIds }, status: "CHECKED_IN" }),
    Registration.find({ eventId: { $in: eventIds }, status: "CHECKED_IN", "payment.status": "PAID" }).select("payment.amount").lean(),
  ]);
  const ticketIncome = paidRows.reduce((sum, row) => sum + Number(row.payment?.amount || 0), 0);
  const published = allEvents.filter((event) => event.status === "PUBLISHED").length;

  return <main className="min-h-screen bg-[#09090b] p-6 text-white md:p-10"><div className="mx-auto max-w-6xl space-y-8">
    <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-xs font-semibold uppercase tracking-[.2em] text-yellow-400">Club Workspace</p><h1 className="mt-2 text-3xl font-black md:text-4xl">{isPlatformAdmin ? "Platform Club Command Center" : clubs[0]?.name || "Club Workspace"}</h1><p className="mt-2 text-sm text-zinc-400">Manage club events, attendance and demo ticket activity.</p></div><div className="flex flex-wrap gap-3"><Link href="/club/events" className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-bold hover:bg-white/10"><PlusCircle size={16}/> Create Event</Link><Link href="/club/scanner" className="flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2.5 text-sm font-bold text-black hover:bg-yellow-300"><ScanLine size={16}/> Launch Scanner</Link></div></header>
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"><KpiCard title="Total Events" value={allEvents.length} icon={<Calendar size={20}/>} /><KpiCard title="Students Attended" value={checkedIn} icon={<Users size={20}/>} /><KpiCard title="Demo Ticket Payments" value={`₹${ticketIncome.toLocaleString("en-IN")}`} icon={<IndianRupee size={20}/>} accent /><KpiCard title="Published Events" value={published} icon={<Activity size={20}/>} /></div>
    <div className="grid gap-6 lg:grid-cols-3"><section className="rounded-3xl border border-white/5 bg-[#121214] p-6 lg:col-span-2"><div className="mb-6 flex items-center justify-between"><h2 className="text-lg font-bold">Recent Events</h2><Link href="/club/events" className="text-xs font-bold text-yellow-400">View All</Link></div><div className="space-y-4">{recentEvents.map((event) => <div key={String(event._id)} className="flex items-center justify-between gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4"><div className="min-w-0"><h3 className="truncate font-bold">{event.title}</h3><p className="mt-1 text-xs text-zinc-500">{event.city || "Location TBA"} · {event.startsAt ? new Date(event.startsAt).toLocaleDateString("en-IN") : "Date TBA"}</p></div><div className="flex items-center gap-3"><span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold text-emerald-400">{event.status}</span><Link href={`/club/scanner?event=${event._id}`} className="rounded-lg bg-white/5 p-2 text-zinc-400 hover:text-white"><ScanLine size={16}/></Link></div></div>)}{!recentEvents.length && <p className="py-10 text-center text-sm text-zinc-500">No events created yet.</p>}</div></section><section className="space-y-4"><h2 className="text-lg font-bold">Quick Links</h2><QuickLink href="/club/analytics" title="Analytics" description="Attendance and demo payment reports"/><QuickLink href="/club/attendance" title="Attendance" description="Search, manage and export check-ins"/><QuickLink href="/club/sponsors" title="Sponsor proposals" description="Review funding proposals from sponsors"/><QuickLink href="/club/ads" title="Club advertisements" description="Buy promotional placements for your club"/></section></div>
  </div></main>;
}
function KpiCard({ title, value, icon, accent = false }) { return <div className={`rounded-3xl border p-6 ${accent ? "border-yellow-400/30 bg-yellow-400/10" : "border-white/5 bg-[#121214]"}`}><div className="flex items-center justify-between"><p className="text-sm font-semibold text-zinc-400">{title}</p><div className={`flex h-10 w-10 items-center justify-center rounded-xl ${accent ? "bg-yellow-400 text-black" : "bg-white/5 text-zinc-400"}`}>{icon}</div></div><h3 className="mt-4 text-3xl font-black">{value}</h3></div>; }
function QuickLink({ href, title, description }) { return <Link href={href} className="group flex items-center justify-between rounded-2xl border border-white/5 bg-[#121214] p-5 hover:border-yellow-400/30 hover:bg-yellow-400/5"><div><p className="font-bold group-hover:text-yellow-400">{title}</p><p className="mt-1 text-xs text-zinc-500">{description}</p></div><ArrowRight size={18} className="text-zinc-500 group-hover:text-yellow-400"/></Link>; }

export const dynamic = "force-dynamic";
