
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
  Sparkles,
} from "lucide-react";

const ICONS = {
  HACKATHON_TEAM: Trophy,
  LEETCODE: Code2,
  SPONSORSHIP: Megaphone,
  GENERAL: Users,
};

function getCommunityHref(community) {
  if (community.slug === "hackathon") {
    return "/communities/hackathon";
  }

  if (community.slug === "leetcode") {
    return "/code-arena";
  }

  return `/communities/${community.slug}`;
}

export default async function CommunityPreview() {
  const session = await auth();

  await dbConnect();

  const communities = await Community.find()
    .sort({ name: 1 })
    .limit(3)
    .lean();

  if (!communities.length) {
    return (
      <section className="bg-[#09090b] px-5 py-20 text-white md:px-10">
        <div className="mx-auto max-w-6xl text-center">
          <h2 className="text-3xl font-black">
            Build something together.
          </h2>
          <p className="mt-3 text-zinc-400">
            No communities are available yet. Check back soon.
          </p>
          <Link
            href="/communities"
            className="mt-6 inline-flex rounded-xl bg-yellow-400 px-5 py-3 font-bold text-black"
          >
            Explore communities
          </Link>
        </div>
      </section>
    );
  }

  const communityIds = communities.map((community) => community._id);

  const [memberships, counts] = await Promise.all([
    session?.user?.id
      ? CommunityMember.find({
          userId: session.user.id,
          status: "ACTIVE",
          communityId: { $in: communityIds },
        })
          .select("communityId")
          .lean()
      : Promise.resolve([]),

    CommunityMember.aggregate([
      {
        $match: {
          status: "ACTIVE",
          communityId: { $in: communityIds },
        },
      },
      {
        $group: {
          _id: "$communityId",
          count: { $sum: 1 },
        },
      },
    ]),
  ]);

  const joined = new Set(
    memberships.map((membership) =>
      String(membership.communityId)
    )
  );

  const countMap = new Map(
    counts.map((item) => [
      String(item._id),
      item.count,
    ])
  );

  return (
    <section className="relative overflow-hidden bg-[#09090b] px-5 py-20 text-white md:px-10 md:py-28">

      {/* Background decoration */}
      <div className="pointer-events-none absolute -left-40 top-20 h-80 w-80 rounded-full bg-yellow-400/[0.06] blur-[120px]" />
      <div className="pointer-events-none absolute -right-40 bottom-0 h-80 w-80 rounded-full bg-violet-500/[0.08] blur-[120px]" />

      <div className="relative mx-auto max-w-6xl">

        {/* Section heading */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-yellow-400/20 bg-yellow-400/[0.07] px-3 py-1.5 text-xs font-bold uppercase tracking-[.2em] text-yellow-400">
              <Sparkles size={14} />
              Build together
            </div>

            <h2 className="max-w-2xl text-4xl font-black tracking-tight md:text-6xl">
              Find your{" "}
              <span className="text-yellow-400">people.</span>
            </h2>

            <p className="mt-4 max-w-xl text-sm leading-7 text-zinc-400 md:text-base">
              Join communities around hackathons, coding,
              open source and student collaboration.
              Meet builders from anywhere.
            </p>
          </div>

          <Link
            href="/communities"
            className="group inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 px-5 py-3 text-sm font-semibold transition hover:border-yellow-400/50 hover:bg-yellow-400 hover:text-black"
          >
            Explore all communities
            <ArrowUpRight
              size={17}
              className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1"
            />
          </Link>
        </div>

        {/* Community cards */}
        <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {communities.map((community, index) => {
            const Icon = ICONS[community.type] || Users;

            const id = String(community._id);

            return (
              <article
                key={id}
                className="group relative overflow-hidden rounded-3xl border border-white/10 bg-[#121214] p-6 transition duration-300 hover:-translate-y-1 hover:border-yellow-400/30 hover:bg-[#18181b]"
              >
                <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-yellow-400/[0.04] blur-3xl transition group-hover:bg-yellow-400/[0.10]" />

                <div className="relative">

                  <div className="flex items-start justify-between">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-black transition group-hover:rotate-3">
                      <Icon size={25} />
                    </div>

                    <span className="text-xs font-semibold text-zinc-600">
                      0{index + 1}
                    </span>
                  </div>

                  <h3 className="mt-7 text-xl font-bold">
                    {community.name}
                  </h3>

                  <p className="mt-3 min-h-[72px] text-sm leading-6 text-zinc-400">
                    {community.description ||
                      "Meet students, share ideas and build together."}
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-xs text-zinc-500">
                    <Users size={15} />
                    {countMap.get(id) || 0} members
                  </div>

                  <div className="mt-6 flex items-center justify-between gap-3 border-t border-white/10 pt-5">
                    <CommunityJoinButton
                      communityId={id}
                      joined={joined.has(id)}
                      signedIn={Boolean(session?.user)}
                    />

                    <Link
                      href={getCommunityHref(community)}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-yellow-400 transition hover:text-yellow-300"
                    >
                      Explore
                      <ArrowUpRight size={15} />
                    </Link>
                  </div>

                </div>
              </article>
            );
          })}
        </div>

        <p className="mt-8 text-center text-xs text-zinc-600">
          Discover your community. Share knowledge. Build together.
        </p>

      </div>
    </section>
  );
}
