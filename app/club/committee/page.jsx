import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import ClubMember from "@/models/ClubMember";
import Club from "@/models/Club";
import Event from "@/models/Event";
import Registration from "@/models/Registration";
import { ScanLine, Users, CalendarDays, ClipboardList, ArrowRight } from "lucide-react";

export default async function CommitteeDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await dbConnect();
  const cookieStore = await cookies();
  const activeClubId = cookieStore.get("activeClubId")?.value;
  const membershipQuery = { userId: session.user.id, role: "COMMITTEE", status: "ACTIVE" };
  if (activeClubId) membershipQuery.clubId = activeClubId;
  const membership = await ClubMember.findOne(membershipQuery).populate("clubId", "name slug").lean();
  if (!membership?.clubId) redirect("/club/member");
  const clubId = membership.clubId._id;
  const [memberCount, pendingCount, events, eventIds] = await Promise.all([
    ClubMember.countDocuments({ clubId, status: "ACTIVE", role: "MEMBER" }),
    ClubMember.countDocuments({ clubId, status: "PENDING", paymentStatus: { $ne: "PENDING" } }),
    Event.find({ clubId, status: "PUBLISHED" }).sort({ startsAt: 1 }).limit(5).lean(),
    Event.find({ clubId }).select("_id").lean(),
  ]);
  const attendedCount = await Registration.countDocuments({ eventId: { $in: eventIds.map((event) => event._id) }, status: "CHECKED_IN" });
  return <main className="p-6 md:p-10"><div className="mx-auto max-w-5xl space-y-8"><header><p className="text-xs font-bold uppercase tracking-[.2em] text-yellow-400">Committee workspace</p><h1 className="mt-2 text-3xl font-black">{membership.clubId.name}</h1><p className="mt-2 text-sm text-zinc-400">Manage regular member requests and help run event check-ins.</p></header><div className="grid gap-4 sm:grid-cols-3"><Stat icon={<Users size={20}/>} label="Active members" value={memberCount}/><Stat icon={<ClipboardList size={20}/>} label="Pending join requests" value={pendingCount}/><Stat icon={<CalendarDays size={20}/>} label="Students checked in" value={attendedCount}/></div><div className="grid gap-4 md:grid-cols-2"><Link href="/club/members" className="rounded-2xl border border-white/10 bg-[#121214] p-5 hover:border-yellow-400/30"><p className="font-bold">Manage regular members</p><p className="mt-1 text-xs text-zinc-500">Add or remove regular members and review requests.</p><ArrowRight className="mt-4 text-yellow-400" size={18}/></Link><Link href="/club/scanner" className="rounded-2xl border border-white/10 bg-[#121214] p-5 hover:border-yellow-400/30"><p className="font-bold">Launch QR scanner</p><p className="mt-1 text-xs text-zinc-500">Scan event tickets and record attendance.</p><ScanLine className="mt-4 text-yellow-400" size={18}/></Link></div><section className="rounded-3xl border border-white/10 bg-[#121214] p-6"><h2 className="text-lg font-bold">Upcoming events</h2><div className="mt-4 space-y-3">{events.map((event) => <div key={String(event._id)} className="flex items-center justify-between gap-4 border-b border-white/5 pb-3"><div><p className="font-semibold">{event.title}</p><p className="mt-1 text-xs text-zinc-500">{new Date(event.startsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></div><Link href="/club/scanner" className="text-xs font-bold text-yellow-400">Scan tickets</Link></div>)}{!events.length && <p className="py-6 text-sm text-zinc-500">No published events yet.</p>}</div></section></div></main>;
}
function Stat({ icon, label, value }) { return <div className="rounded-2xl border border-white/10 bg-[#121214] p-5"><div className="flex items-center justify-between text-zinc-400"><span className="text-sm">{label}</span><span className="text-yellow-400">{icon}</span></div><p className="mt-3 text-2xl font-black">{value}</p></div>; }

export const dynamic = "force-dynamic";
