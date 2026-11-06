import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import TeamPost from "@/models/TeamPost";
import TeamChat from "@/models/TeamChat";
import HackathonBoard from "@/components/HackathonBoard";
import Link from "next/link";
import { ArrowLeft, Users, Globe2, MessageCircle } from "lucide-react";

export default async function HackathonPage() {
  const session = await auth();
  await dbConnect();
  const posts = await TeamPost.find(session?.user?.id ? { $or: [{ status: "OPEN" }, { authorId: session.user.id }] } : { status: "OPEN" }).populate("authorId", "name image city state country college").sort({ createdAt: -1 }).limit(100).lean();
  const chatRows = session?.user?.id ? await TeamChat.find({ members: session.user.id }).select("postId").lean() : [];
  const chatTeamIds = chatRows.map(row => String(row.postId));
  const safePosts = JSON.parse(JSON.stringify(posts.map(p => ({ ...p, isOwner: String(p.authorId?._id) === session?.user?.id }))));
  return <main className="min-h-screen bg-[#09090b] px-5 py-10 text-white md:px-10"><div className="mx-auto max-w-6xl">
    <Link href="/communities" className="inline-flex items-center gap-2 text-sm text-zinc-400 hover:text-yellow-400"><ArrowLeft size={16}/> All communities</Link>
    <header className="mt-7 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#19191c] to-[#101012] p-8 md:p-10"><p className="text-xs font-bold uppercase tracking-[.25em] text-yellow-400">Global collaboration</p><h1 className="mt-3 text-4xl font-black md:text-5xl">Hackathon Team Finder</h1><p className="mt-4 max-w-2xl text-sm leading-6 text-zinc-400">Find co-builders across cities, states and countries. Apply to join a team, get accepted, then collaborate in your private team chat.</p><div className="mt-6 flex flex-wrap gap-3 text-xs font-semibold text-zinc-300"><span className="rounded-full bg-white/5 px-3 py-2"><Users className="mr-1 inline" size={14}/>{posts.length} open teams</span><span className="rounded-full bg-white/5 px-3 py-2"><Globe2 className="mr-1 inline" size={14}/>Worldwide teammates</span><span className="rounded-full bg-white/5 px-3 py-2"><MessageCircle className="mr-1 inline" size={14}/>Private team chat after acceptance</span></div></header>
    <HackathonBoard posts={safePosts} chatTeamIds={chatTeamIds} signedIn={Boolean(session?.user)}/>
  </div></main>;
}

export const dynamic = "force-dynamic";
