
import Link from "next/link";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Community from "@/models/Community";
import CommunityMember from "@/models/CommunityMember";
import CommunityJoinButton from "@/components/CommunityJoinButton";

import {
  Users,
  Trophy,
  Code2,
  Megaphone,
  ArrowUpRight,
  Zap,
  UsersRound,
  Rocket,
  Sparkles,
  ArrowRight,
} from "lucide-react";

const ICONS = {
  HACKATHON_TEAM: Trophy,
  LEETCODE: Code2,
  SPONSORSHIP: Megaphone,
  GENERAL: Users,
};

export default async function CommunitiesPage() {
  const session = await auth();

  await dbConnect();

  const communities = await Community.find()
    .sort({ name: 1 })
    .lean();

  const memberships = session?.user?.id
    ? await CommunityMember.find({
        userId: session.user.id,
        status: "ACTIVE",
      })
        .select("communityId")
        .lean()
    : [];

  const joined = new Set(
    memberships.map((m) => String(m.communityId))
  );

  const counts = await CommunityMember.aggregate([
    { $match: { status: "ACTIVE" } },
    {
      $group: {
        _id: "$communityId",
        count: { $sum: 1 },
      },
    },
  ]);

  const countMap = new Map(
    counts.map((c) => [String(c._id), c.count])
  );

  return (
    <main className="min-h-screen overflow-hidden bg-[#09090b] px-5 py-12 text-white md:px-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div>
          <p className="text-xs font-bold uppercase tracking-[.25em] text-yellow-400">
            Build together
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight md:text-6xl">
            Find your people.
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-400 md:text-base">
            Join communities around hackathons, coding, open source
            and student collaboration. Meet builders from anywhere.
          </p>
        </div>

        {/* FEATURED HACKATHON TEAMS */}
        <section className="relative mt-12 overflow-hidden rounded-[2rem] border border-yellow-400/20 bg-[#14130e]">

          {/* Background effects */}
          <div className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-yellow-400/10 blur-[100px]" />
          <div className="pointer-events-none absolute -bottom-32 left-1/3 h-72 w-72 rounded-full bg-orange-500/10 blur-[90px]" />

          <div className="relative grid items-center gap-10 p-7 md:grid-cols-[1.2fr_.8fr] md:p-12">

            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-2 text-xs font-bold uppercase tracking-wider text-yellow-300">
                <span className="h-2 w-2 animate-pulse rounded-full bg-yellow-400" />
                Team formation
              </div>

              <h2 className="mt-6 max-w-xl text-4xl font-black leading-[1.1] tracking-tight md:text-5xl">
                Got an idea?
                <br />
                <span className="text-yellow-400">
                  Find your team.
                </span>
              </h2>

              <p className="mt-5 max-w-lg text-sm leading-7 text-zinc-400 md:text-base">
                Don't build alone. Discover hackathon teams,
                connect with developers and designers, find
                teammates and turn your ideas into real projects.
              </p>

              <div className="mt-7 flex flex-wrap gap-3">
                <Link
                  href="/communities/hackathon"
                  className="group inline-flex items-center gap-3 rounded-xl bg-yellow-400 px-6 py-4 text-sm font-black text-black transition hover:bg-yellow-300"
                >
                  GO FOR IT
                  <ArrowUpRight
                    size={18}
                    className="transition-transform group-hover:-translate-y-1 group-hover:translate-x-1"
                  />
                </Link>

                <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.03] px-5 py-4 text-sm text-zinc-400">
                  <UsersRound size={17} />
                  Find teammates
                </div>
              </div>
            </div>

            {/* Visual team illustration */}
            <div className="relative mx-auto flex aspect-square w-full max-w-[340px] items-center justify-center">

              <div className="absolute inset-5 rounded-full border border-yellow-400/10" />
              <div className="absolute inset-12 rounded-full border border-dashed border-yellow-400/20" />

              <div className="absolute left-5 top-12 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#24221a] shadow-xl">
                <Code2 size={28} className="text-yellow-400" />
              </div>

              <div className="absolute right-3 top-20 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#24221a] shadow-xl">
                <Rocket size={28} className="text-orange-400" />
              </div>

              <div className="absolute bottom-12 left-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-[#24221a] shadow-xl">
                <Sparkles size={28} className="text-yellow-300" />
              </div>

              <div className="relative z-10 flex h-36 w-36 flex-col items-center justify-center rounded-[2rem] border border-yellow-400/30 bg-yellow-400 text-black shadow-[0_0_80px_rgba(250,204,21,0.15)]">
                <Trophy size={42} strokeWidth={1.8} />
                <span className="mt-3 text-xs font-black uppercase tracking-widest">
                  Hackathon
                </span>
                <span className="text-[10px] font-semibold">
                  Teams
                </span>
              </div>

              <div className="absolute bottom-7 right-3 rounded-xl border border-white/10 bg-[#1b1b1d] px-4 py-3 text-xs font-bold text-zinc-300 shadow-xl">
                BUILD. COMPETE. WIN.
              </div>
            </div>

          </div>
        </section>

        {/* COMMUNITY GRID */}
        <section className="mt-16">

          <div className="mb-7 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[.2em] text-yellow-400">
                Explore
              </p>
              <h2 className="mt-2 text-2xl font-black md:text-3xl">
                Your communities
              </h2>
            </div>

            <span className="text-xs text-zinc-500">
              {communities.length} communities
            </span>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">

            {communities.map((community) => {
              const isHackathon =
                community.type === "HACKATHON_TEAM";

              const Icon = ICONS[community.type] || Users;

              const href =
                community.slug === "hackathon"
                  ? "/communities/hackathon"
                  : community.slug === "leetcode"
                  ? "/code-arena"
                  : `/communities/${community.slug}`;

              return (
                <article
                  key={String(community._id)}
                  className={`group relative overflow-hidden rounded-3xl border p-6 transition duration-300 hover:-translate-y-1 ${
                    isHackathon
                      ? "border-yellow-400/30 bg-gradient-to-br from-[#211d10] to-[#121214] hover:border-yellow-400/60"
                      : "border-white/10 bg-[#121214] hover:border-white/20"
                  }`}
                >

                  {isHackathon && (
                    <div className="absolute right-5 top-5 rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                      Team formation
                    </div>
                  )}

                  <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${
                    isHackathon
                      ? "bg-yellow-400 text-black"
                      : "bg-white/10 text-white"
                  }`}>
                    <Icon size={23} />
                  </div>

                  <h2 className="mt-5 text-xl font-bold">
                    {community.name}
                  </h2>

                  <p className="mt-2 min-h-12 text-sm leading-6 text-zinc-400">
                    {community.description ||
                      "Meet students, share ideas and build together."}
                  </p>

                  <p className="mt-4 flex items-center gap-2 text-xs text-zinc-500">
                    <Users size={14} />
                    {countMap.get(String(community._id)) || 0} members
                  </p>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <CommunityJoinButton
                      communityId={String(community._id)}
                      joined={joined.has(String(community._id))}
                      signedIn={Boolean(session?.user)}
                    />

                    <Link
                      href={href}
                      className={`inline-flex items-center gap-1 text-sm font-semibold transition ${
                        isHackathon
                          ? "text-yellow-400"
                          : "text-zinc-300 hover:text-white"
                      }`}
                    >
                      {isHackathon ? "Find a team" : "Explore"}
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </article>
              );
            })}

          </div>
        </section>

      </div>
    </main>
  );
}

export const dynamic = "force-dynamic";
