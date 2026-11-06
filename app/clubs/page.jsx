import { dbConnect } from "@/lib/db";
import Club from "@/models/Club";
import ClubMember from "@/models/ClubMember";
import { auth } from "@/auth";
import JoinClubButton from "@/components/JoinClubButton";
import ClubAdSpotlight from "@/components/ClubAdSpotlight";
import { Building2, MapPin, Users } from "lucide-react";

export default async function ClubsDirectory() {
  await dbConnect();
  const session = await auth();
  const allClubs = await Club.find().sort({ createdAt: -1 }).lean();
  const ids = allClubs.map((club) => club._id);
  const [counts, memberships] = await Promise.all([
    ClubMember.aggregate([{ $match: { clubId: { $in: ids }, status: "ACTIVE" } }, { $group: { _id: "$clubId", count: { $sum: 1 } } }]),
    session?.user ? ClubMember.find({ userId: session.user.id, clubId: { $in: ids } }).lean() : [],
  ]);
  const countMap = new Map(counts.map((item) => [String(item._id), item.count]));
  const memberMap = new Map(memberships.map((item) => [String(item.clubId), item]));
  // Private clubs are only listed for their members (and platform admins).
  const clubs = allClubs.filter((c) => !c.isPrivate || memberMap.has(String(c._id)) || session?.user?.role === "ADMIN");
  return <main className="min-h-screen bg-[#09090b] px-5 py-12 text-white"><ClubAdSpotlight placement="CLUB_DIRECTORY"/><div className="mx-auto max-w-6xl"><p className="text-xs font-bold uppercase tracking-[.2em] text-yellow-400">Discover</p><div className="mt-3 flex flex-wrap items-center justify-between gap-4"><h1 className="text-4xl font-black">Campus Clubs</h1><a href="/clubs/new" className="rounded-xl bg-yellow-400 px-5 py-3 text-sm font-black text-black">+ Create a club</a></div><p className="mt-3 text-zinc-400">Explore communities, join clubs and unlock member-only event registrations.</p><div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{clubs.map((club) => { const membership = memberMap.get(String(club._id)); return <article key={String(club._id)} className="flex flex-col rounded-3xl border border-white/10 bg-[#121214] p-6"><div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400/10 text-2xl font-black text-yellow-400">{club.name?.[0] || "C"}</div><h2 className="mt-4 text-xl font-bold">{club.name}{club.isPrivate && <span className="ml-2 rounded-full bg-white/10 px-2 py-0.5 align-middle text-[10px] font-bold uppercase text-zinc-300">Private</span>}</h2><p className="mt-2 flex items-center gap-2 text-xs text-zinc-500"><Building2 size={13}/>{club.institution}</p>{club.city && <p className="mt-1 flex items-center gap-2 text-xs text-zinc-500"><MapPin size={13}/>{club.city}</p>}<p className="mt-4 flex items-center gap-2 text-xs text-zinc-500"><Users size={13}/>{countMap.get(String(club._id)) || 0} active members</p><p className="mt-3 text-sm font-bold text-yellow-300">{club.membershipFee > 0 ? `₹${club.membershipFee} membership` : "Free membership"}</p><div className="mt-auto pt-5"><JoinClubButton isAuthenticated={Boolean(session?.user)} clubId={String(club._id)} membership={membership ? { id: String(membership._id), status: membership.status, paymentStatus: membership.paymentStatus, membershipFee: membership.membershipFee } : null} /></div></article>; })}</div>{!clubs.length && <p className="mt-12 text-center text-zinc-500">No clubs have been created yet.</p>}</div></main>;
}

export const dynamic = "force-dynamic";
