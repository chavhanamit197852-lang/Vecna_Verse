import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import Registration from "@/models/Registration"; // or Attendance
import { 
  Award, Code, Palette, Music, Trophy, 
  BookOpen, CheckCircle2, ShieldCheck, TrendingUp 
} from "lucide-react";

// Change this based on your university's actual requirement
const AICTE_TARGET = 100; 

const CATEGORY_ICONS = {
  Technical: Code,
  Cultural: Palette,
  Sports: Trophy,
  Social: Music,
  Workshop: BookOpen,
  Other: Award,
};

export default async function AictePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await dbConnect();

  const [user, rows] = await Promise.all([
    User.findById(session.user.id).lean(),
    Registration.find({ userId: session.user.id, status: "CHECKED_IN" })
      .populate("eventId", "title aicteCategory")
      .lean()
  ]);

  // Group points by category
  const groups = {};
  for (const r of rows) {
    const k = r.eventId?.aicteCategory || "Other";
    groups[k] = (groups[k] || 0) + (r.aicteAwarded || 0);
  }

  const totalPoints = user?.aicteTotal || 0;
  const progressPercent = Math.min(100, Math.round((totalPoints / AICTE_TARGET) * 100));

  return (
    <div className="min-h-screen bg-[#09090b] p-6 text-white md:p-10">
      <div className="mx-auto max-w-4xl space-y-8">
        
        {/* ─── Header ─── */}
        <header>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-yellow-400">
            Activity Tracker
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
            AICTE Points
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Verified points earned from attending and checking into events.
          </p>
        </header>

        {/* ─── Main Progress Card ─── */}
        <div className="relative overflow-hidden rounded-3xl border border-white/5 bg-[#121214] p-6 shadow-xl md:p-8">
          <div className="relative z-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
            <div>
              <p className="flex items-center gap-2 text-sm font-semibold text-zinc-400">
                <TrendingUp size={16} className="text-yellow-400" />
                Total Points Earned
              </p>
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-5xl font-black text-white">{totalPoints}</span>
                <span className="text-lg font-semibold text-zinc-500">/ {AICTE_TARGET}</span>
              </div>
            </div>
            
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-yellow-400/20 bg-yellow-400/10">
              <span className="text-xl font-black text-yellow-400">{progressPercent}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="relative z-10 mt-6 h-3 w-full overflow-hidden rounded-full bg-white/5">
            <div 
              className="h-full rounded-full bg-yellow-400 transition-all duration-1000 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Background Decorative Glow */}
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-yellow-400/5 blur-3xl" />
        </div>

        {/* ─── Category Breakdown ─── */}
        <div>
          <h2 className="mb-4 text-xl font-bold text-white">Points by Category</h2>
          
          {Object.keys(groups).length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Object.entries(groups).map(([category, points]) => {
                const Icon = CATEGORY_ICONS[category] || CATEGORY_ICONS.Other;
                const categoryPercent = Math.round((points / totalPoints) * 100) || 0;

                return (
                  <div key={category} className="rounded-2xl border border-white/5 bg-[#121214] p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-yellow-400">
                          <Icon size={20} />
                        </div>
                        <div>
                          <p className="font-bold text-white">{category}</p>
                          <p className="text-xs text-zinc-500">{categoryPercent}% of total</p>
                        </div>
                      </div>
                      <p className="text-2xl font-black text-white">{points}</p>
                    </div>
                    
                    {/* Mini Progress Bar */}
                    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-white/5">
                      <div 
                        className="h-full rounded-full bg-yellow-400/50"
                        style={{ width: `${categoryPercent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-12 text-center">
              <Award size={32} className="mx-auto mb-3 text-zinc-500" />
              <p className="font-bold text-white">No verified points yet</p>
              <p className="mt-1 text-sm text-zinc-500">Attend events and get your QR scanned to earn points.</p>
            </div>
          )}
        </div>

        {/* ─── Disclaimer / Info Box ─── */}
        <div className="flex items-start gap-4 rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-5">
          <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-yellow-400" />
          <div>
            <p className="text-sm font-bold text-yellow-400">Official Verification Required</p>
            <p className="mt-1 text-xs leading-relaxed text-zinc-400">
              Points shown here are tracked based on verified QR check-ins by event organizers. 
              Your institution's AICTE curriculum guidelines will ultimately determine the final 
              applicable credits. Please cross-reference with your department.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
