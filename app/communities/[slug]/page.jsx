import { notFound } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Community from "@/models/Community";
import TeamPost from "@/models/TeamPost";
import LeetCodeProfile from "@/models/LeetCodeProfile";
import HackathonBoard from "@/components/HackathonBoard";
import SponsorForm from "@/components/SponsorForm";
import { 
  Users, Trophy, Megaphone, ArrowLeft, 
  Code2, Award, Target, Zap 
} from "lucide-react";

export default async function CommunityPage({ params }) {
  const { slug } = await params;
  await dbConnect();

  const community = await Community.findOne({ slug }).lean();
  if (!community) notFound();

  // ═══════════════════════════════════════
  // HACKATHON TEAM FINDER
  // ═══════════════════════════════════════
  if (slug === "hackathon") {
    const posts = await TeamPost.find({ status: "OPEN" })
      .populate("authorId", "name city")
      .sort({ createdAt: -1 })
      .lean();

    return (
      <div className="min-h-screen bg-[#09090b] p-6 text-white md:p-10">
        <div className="mx-auto max-w-5xl space-y-8">
          
          <BackLink />

          {/* Hero */}
          <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#121214] to-[#18181b] p-8 md:p-10">
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-black shadow-[0_0_40px_rgba(250,204,21,0.4)]">
                  <Users size={28} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.2em] text-yellow-400">
                    Community
                  </p>
                  <h1 className="text-3xl font-black md:text-4xl">Hackathon Team Finder</h1>
                </div>
              </div>
              
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-400">
                Find collaborators, share your skills, and apply to teams building at campus hackathons.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <StatPill icon={<Users size={14} />} label={`${posts.length} active teams`} />
                <StatPill icon={<Code2 size={14} />} label="Find teammates" />
                <StatPill icon={<Zap size={14} />} label="Ship faster" />
              </div>
            </div>
            
            {/* Decorative glow */}
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-yellow-400/10 blur-3xl" />
          </header>

          {/* Board */}
          <HackathonBoard posts={JSON.parse(JSON.stringify(posts))} />
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // LEETCODE LEADERBOARD
  // ═══════════════════════════════════════
  if (slug === "leetcode") {
    const rows = await LeetCodeProfile.find()
      .populate("userId", "name image")
      .sort({ totalSolved: -1, rating: -1 })
      .limit(50)
      .lean();

    return (
      <div className="min-h-screen bg-[#09090b] p-6 text-white md:p-10">
        <div className="mx-auto max-w-5xl space-y-8">
          
          <BackLink />

          {/* Hero */}
          <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#121214] to-[#18181b] p-8 md:p-10">
            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-black shadow-[0_0_40px_rgba(250,204,21,0.4)]">
                  <Trophy size={28} />
                </div>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[.2em] text-yellow-400">
                    Leaderboard
                  </p>
                  <h1 className="text-3xl font-black md:text-4xl">LeetCode Arena</h1>
                </div>
              </div>
              
              <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-400">
                Ranked by total problems solved. <span className="text-yellow-400">Note:</span> This is a demo leaderboard with seeded data, not live LeetCode statistics.
              </p>
            </div>
            
            <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-yellow-400/10 blur-3xl" />
          </header>

          {/* Leaderboard Table */}
          <div className="overflow-hidden rounded-3xl border border-white/5 bg-[#121214] shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white/[0.02] text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Student</th>
                    <th className="px-6 py-4 text-center">Total</th>
                    <th className="px-6 py-4 text-center">Easy</th>
                    <th className="px-6 py-4 text-center">Medium</th>
                    <th className="px-6 py-4 text-center">Hard</th>
                    <th className="px-6 py-4 text-right">Rating</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {rows.map((r, i) => {
                    const rank = i + 1;
                    const isTop3 = rank <= 3;

                    return (
                      <tr 
                        key={String(r._id)} 
                        className={`transition-colors hover:bg-white/[0.02] ${
                          isTop3 ? "bg-yellow-400/[0.03]" : ""
                        }`}
                      >
                        <td className="px-6 py-4">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black ${
                            rank === 1 ? "bg-yellow-400 text-black" 
                            : rank === 2 ? "bg-zinc-300 text-black"
                            : rank === 3 ? "bg-amber-600 text-white"
                            : "bg-white/5 text-zinc-400"
                          }`}>
                            {rank}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <p className="font-semibold text-white">{r.userId?.name || r.handle}</p>
                          <p className="text-xs text-zinc-500">@{r.handle}</p>
                        </td>
                        <td className="px-6 py-4 text-center font-bold text-white">{r.totalSolved}</td>
                        <td className="px-6 py-4 text-center text-emerald-400">{r.easySolved}</td>
                        <td className="px-6 py-4 text-center text-yellow-400">{r.mediumSolved}</td>
                        <td className="px-6 py-4 text-center text-red-400">{r.hardSolved}</td>
                        <td className="px-6 py-4 text-right font-semibold text-white">{r.rating}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {rows.length === 0 && (
              <div className="p-12 text-center text-sm text-zinc-500">
                No LeetCode profiles yet. Connect your account to appear on the leaderboard.
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════
  // SPONSORSHIP MARKETPLACE
  // ═══════════════════════════════════════
  return (
    <div className="min-h-screen bg-[#09090b] p-6 text-white md:p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        
        <BackLink />

        {/* Hero */}
        <header className="relative overflow-hidden rounded-3xl border border-white/5 bg-gradient-to-br from-[#121214] to-[#18181b] p-8 md:p-10">
          <div className="relative z-10">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-400 text-black shadow-[0_0_40px_rgba(250,204,21,0.4)]">
                <Megaphone size={28} />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-[.2em] text-yellow-400">
                  Advertising
                </p>
                <h1 className="text-3xl font-black md:text-4xl">Sponsorship Marketplace</h1>
              </div>
            </div>
            
            <p className="mt-6 max-w-xl text-sm leading-relaxed text-zinc-400">
              Buy targeted ad placements that show across the entire EventVerse platform. Your campaign is activated after admin approval.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <StatPill icon={<Target size={14} />} label="Targeted reach" />
              <StatPill icon={<Award size={14} />} label="3 tiers available" />
              <StatPill icon={<Zap size={14} />} label="Live in 24h" />
            </div>
          </div>

          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-yellow-400/10 blur-3xl" />
        </header>

        {/* Form */}
        <SponsorForm />
      </div>
    </div>
  );
}

// ─── Small helpers ───
function BackLink() {
  return (
    <Link 
      href="/communities"
      className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-yellow-400"
    >
      <ArrowLeft size={16} />
      All Communities
    </Link>
  );
}

function StatPill({ icon, label }) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-zinc-400">
      <span className="text-yellow-400">{icon}</span>
      {label}
    </div>
  );
}
export const dynamic = "force-dynamic";
