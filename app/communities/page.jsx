import Link from "next/link";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Community from "@/models/Community";
import CommunityMember from "@/models/CommunityMember";
import CommunityJoinButton from "@/components/CommunityJoinButton";
import { Users, Trophy, Code2, Megaphone, ArrowUpRight } from "lucide-react";
const ICONS = { HACKATHON_TEAM: Trophy, LEETCODE: Code2, SPONSORSHIP: Megaphone, GENERAL: Users };
export default async function CommunitiesPage() {
  const session = await auth();
  await dbConnect();
  const communities = await Community.find().sort({ name: 1 }).lean();
  const memberships = session?.user?.id ? await CommunityMember.find({ userId: session.user.id, status: "ACTIVE" }).select("communityId").lean() : [];
  const joined = new Set(memberships.map((m) => String(m.communityId)));
  const counts = await CommunityMember.aggregate([{ $match: { status: "ACTIVE" } }, { $group: { _id: "$communityId", count: { $sum: 1 } } }]);
  const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
  return <main className="min-h-screen bg-[#09090b] px-5 py-12 text-white md:px-10"><div className="mx-auto max-w-6xl">
    <p className="text-xs font-bold uppercase tracking-[.25em] text-yellow-400">Build together</p><h1 className="mt-3 text-4xl font-black md:text-5xl">Find your people.</h1><p className="mt-3 max-w-2xl text-zinc-400">Join communities around hackathons, coding, open source and student collaboration. Meet builders from anywhere.</p>
    <div className="mt-9 grid gap-5 md:grid-cols-2 lg:grid-cols-3">{communities.map((community) => { const Icon = ICONS[community.type] || Users; const href = community.slug === "hackathon" ? "/communities/hackathon" : community.slug === "leetcode" ? "/code-arena" : `/communities/${community.slug}`; return <article key={String(community._id)} className="rounded-3xl border border-white/10 bg-[#121214] p-6"><div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yellow-400 text-black"><Icon size={23}/></div><h2 className="mt-5 text-xl font-bold">{community.name}</h2><p className="mt-2 min-h-12 text-sm leading-6 text-zinc-400">{community.description || "Meet students, share ideas and build together."}</p><p className="mt-4 text-xs text-zinc-500">{countMap.get(String(community._id)) || 0} members</p><div className="mt-5 flex items-center justify-between gap-3"><CommunityJoinButton communityId={String(community._id)} joined={joined.has(String(community._id))} signedIn={Boolean(session?.user)}/><Link href={href} className="inline-flex items-center gap-1 text-sm font-semibold text-yellow-400">Explore <ArrowUpRight size={15}/></Link></div></article>; })}</div>
  </div></main>;
}

export const dynamic = "force-dynamic";
