import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Link from "next/link";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import ClubMember from "@/models/ClubMember";
import Event from "@/models/Event";
import Registration from "@/models/Registration";
import { CalendarDays, Users, Ticket, ArrowRight } from "lucide-react";

export default async function ClubMemberDashboard() {
  const session = await auth();
  if (!session?.user) redirect("/login");
  await dbConnect();
  const memberships = await ClubMember.find({ userId: session.user.id, status: "ACTIVE" }).populate("clubId", "name slug institution city").lean();
  const cookieStore = await cookies();
  const selectedId = cookieStore.get("activeClubId")?.value;
  const membership = memberships.find((item) => String(item.clubId?._id) === selectedId) || memberships[0];
  if (!membership?.clubId) redirect("/clubs");

  const [events, tickets] = await Promise.all([
    Event.find({ clubId: membership.clubId._id, status: "PUBLISHED", startsAt: { $gte: new Date() } }).sort({ startsAt: 1 }).limit(5).lean(),
    Registration.countDocuments({ userId: session.user.id, status: { $in: ["REGISTERED", "CHECKED_IN"] } }),
  ]);
  const club = membership.clubId;
  return <main className="p-6 md:p-10"><div className="mx-auto max-w-5xl space-y-8"><header><p className="text-xs font-bold uppercase tracking-[.2em] text-yellow-400">Member workspace</p><h1 className="mt-2 text-3xl font-black">{club.name}</h1><p className="mt-2 text-sm text-zinc-400">{club.institution}{club.city ? ` · ${club.city}` : ""}</p><p className="mt-3 text-sm text-zinc-500">Your club role: <span className="font-bold text-yellow-300">{membership.role}</span></p></header><div className="grid gap-4 sm:grid-cols-2"><Stat icon={<Users size={20}/>} label="Club role" value={membership.role}/><Stat icon={<Ticket size={20}/>} label="My event tickets" value={tickets}/></div><section className="rounded-3xl border border-white/10 bg-[#121214] p-6"><div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">Upcoming club events</h2><Link href="/events" className="text-xs font-bold text-yellow-400">Explore all events</Link></div><div className="space-y-3">{events.map((event) => <Link key={String(event._id)} href={`/events/${event.slug}`} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/[0.02] p-4 hover:border-yellow-400/30"><div><p className="font-bold">{event.title}</p><p className="mt-1 text-xs text-zinc-500">{new Date(event.startsAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}</p></div><ArrowRight size={16} className="text-yellow-400"/></Link>)}{!events.length && <p className="py-8 text-center text-sm text-zinc-500">No upcoming events for this club.</p>}</div></section></div></main>;
}
function Stat({ icon, label, value }) { return <div className="rounded-2xl border border-white/10 bg-[#121214] p-5"><div className="flex items-center justify-between text-zinc-400"><span className="text-sm">{label}</span><span className="text-yellow-400">{icon}</span></div><p className="mt-3 text-2xl font-black text-white">{value}</p></div>; }

export const dynamic = "force-dynamic";
