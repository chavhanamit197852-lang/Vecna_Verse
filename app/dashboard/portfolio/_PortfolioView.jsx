"use client";

import { useState } from "react";
import { 
  Award, FileText, Settings, LogOut, ChevronDown, 
  TrendingUp, Bookmark, MessageSquare, Share2, Plus, AlertCircle
} from "lucide-react";
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area } from "recharts";
import Link from "next/link";

export default function PortfolioView({  user, 
  achievements = [], 
  certificates = [], 
  radarData = [], 
  totalEvents = 0  }) {
  const [activeTab, setActiveTab] = useState("My Portfolio");
  const [activeFilter, setActiveFilter] = useState("All");

  // Combine achievements and certificates into one "feed"
    const feed = [
    ...(certificates || []).map(c => ({ ...c, type: "CERTIFICATE", date: c.issuedAt || c.createdAt })),
    ...(achievements || []).map(a => ({ ...a, type: "ACHIEVEMENT", date: a.date || a.createdAt }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  const filteredFeed = feed.filter(item => {
    if (activeFilter === "All") return true;
    return item.type === activeFilter;
  });

  const aicteTotal = user?.aicteTotal || 0;
  const aictePct = Math.min(100, Math.round((aicteTotal / 100) * 100)); // Assume 100 is goal

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* ─── Top Navbar ─── */}
      <nav className="sticky top-0 z-30 flex items-center justify-between border-b border-white/5 bg-[#09090b] px-6 py-4">
        <div className="flex items-center gap-6 text-sm font-semibold text-zinc-400">
          <Link href="/dashboard" className="hover:text-white">Dashboard</Link>
          <Link href="/events" className="hover:text-white">Events</Link>
          <Link href="/dashboard/portfolio" className="text-white">Portfolio</Link>
        </div>
        <div className="flex items-center gap-4">
          <button className="rounded-lg bg-yellow-400 px-4 py-2 text-xs font-bold text-black hover:bg-yellow-300">
            Create Post
          </button>
          <div className="group relative">
            <button className="flex items-center gap-2 rounded-full border border-white/10 bg-[#121214] px-3 py-1.5 hover:bg-white/5">
              <span className="text-sm font-semibold">{user?.name?.split(" ")[0] || "User"}</span>
              <ChevronDown size={14} className="text-zinc-500" />
            </button>
            {/* Dropdown menu (Simulated) */}
            <div className="absolute right-0 top-full mt-2 hidden w-48 rounded-xl border border-white/10 bg-[#121214] p-2 shadow-2xl group-hover:block">
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-zinc-400 hover:bg-white/5 hover:text-white"><Settings size={14} /> Settings</button>
              <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"><LogOut size={14} /> Log out</button>
            </div>
          </div>
        </div>
      </nav>

      {/* ─── Main Content ─── */}
      <main className="mx-auto grid max-w-6xl grid-cols-1 gap-8 px-6 py-10 lg:grid-cols-[1fr_380px]">
        
        {/* ══════════════════════════════════════
            LEFT COLUMN — Profile & Feed
        ══════════════════════════════════════ */}
        <div>
          {/* Profile Header */}
          <div className="mb-10 flex items-start gap-6">
            <div className="h-24 w-24 overflow-hidden rounded-full border border-white/10 bg-[#121214]">
              {user?.image ? (
                <img src={user.image} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-3xl font-bold text-yellow-400">
                  {user?.name?.charAt(0) || "S"}
                </div>
              )}
            </div>
            <div>
              <h1 className="text-2xl font-black">{user?.name || "Student"}</h1>
              <p className="text-sm text-zinc-500">{user?.email}</p>
              
              <div className="mt-3 flex gap-2">
                <span className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                  <TrendingUp size={12} className="text-yellow-400" /> Top {aictePct}%
                </span>
                <span className="flex items-center gap-1 rounded bg-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider">
                  <Award size={12} className="text-yellow-400" /> {totalEvents} Events
                </span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6 flex items-center gap-8 border-b border-white/10 text-sm font-bold">
            {["My Portfolio", "Bookmarked"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 transition-colors ${
                  activeTab === tab ? "border-b-2 border-yellow-400 text-white" : "text-zinc-500 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Sub-Filters */}
          <div className="mb-6 flex items-center justify-between">
            <div className="flex gap-2">
              {["All", "CERTIFICATE", "ACHIEVEMENT"].map((f) => (
                <button
                  key={f}
                  onClick={() => setActiveFilter(f)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-colors ${
                    activeFilter === f ? "bg-white/10 text-white" : "text-zinc-500 hover:text-white"
                  }`}
                >
                  {f === "All" ? "Recent" : f.charAt(0) + f.slice(1).toLowerCase() + "s"}
                </button>
              ))}
            </div>
          </div>

          {/* Feed */}
          <div className="space-y-4">
            {filteredFeed.map((item) => (
              <div key={item._id} className="group rounded-2xl border border-white/5 bg-[#121214] p-5 transition-colors hover:border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-400">
                      {item.type === "CERTIFICATE" ? <FileText size={18} /> : <Award size={18} />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{item.title}</h3>
                      <p className="text-xs text-zinc-500">
                        {new Date(item.date).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })} 
                        {item.issuer && ` · ${item.issuer}`}
                      </p>
                    </div>
                  </div>
                  
                  {/* Fake Sparkline for visual flair (like the trading dashboard) */}
                  <div className="hidden h-8 w-24 sm:block">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={[{v: 10}, {v: 25}, {v: 15}, {v: 30}, {v: 40}]}>
                        <Area type="monotone" dataKey="v" stroke="#facc15" fill="#facc15" fillOpacity={0.1} strokeWidth={2} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4 text-xs font-semibold text-zinc-500">
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1.5 text-yellow-400">
                      {item.type === "CERTIFICATE" ? "Verified" : "Added"}
                    </span>
                  </div>
                  <div className="flex gap-4">
                    <button className="hover:text-white"><MessageSquare size={14} /></button>
                    <button className="hover:text-white"><Share2 size={14} /></button>
                    <button className="hover:text-white"><Bookmark size={14} /></button>
                  </div>
                </div>
              </div>
            ))}
            
            {filteredFeed.length === 0 && (
              <div className="rounded-2xl border border-dashed border-white/10 bg-white/5 py-12 text-center text-sm text-zinc-500">
                No {activeFilter.toLowerCase()}s found.
              </div>
            )}
          </div>
        </div>

        {/* ══════════════════════════════════════
            RIGHT COLUMN — Stats & Charts
        ══════════════════════════════════════ */}
        <aside className="space-y-6">
          
          {/* Radar Chart Card */}
          <div className="rounded-2xl border border-white/5 bg-[#121214] p-6">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Compare with: Average User</p>
            </div>
            
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                  <PolarGrid stroke="#27272a" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: "#71717a", fontSize: 10 }} />
                  <Radar name="Student" dataKey="A" stroke="#facc15" fill="#facc15" fillOpacity={0.3} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            
            <p className="mt-2 text-center text-[10px] font-bold text-zinc-500">TOTAL POINTS</p>
            <p className="text-center text-2xl font-black text-white">{aicteTotal}</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <StatBox label="Avg. Attendance" value={`${Math.min(100, (totalEvents * 10))}%`} />
            <StatBox label="Total Events" value={totalEvents} />
          </div>

          {/* Progress Bars */}
          <div className="rounded-2xl border border-white/5 bg-[#121214] p-6">
            <div className="mb-4">
              <div className="flex justify-between text-xs font-bold text-zinc-400 mb-2">
                <span>AICTE Goal</span>
                <span className="text-white">{aictePct}%</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-yellow-400" style={{ width: `${aictePct}%` }} />
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between text-xs font-bold text-zinc-400 mb-2">
                <span>Certificates Uploaded</span>
                <span className="text-white">{certificates.length}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                <div className="h-full bg-white/40" style={{ width: `${Math.min(100, certificates.length * 20)}%` }} />
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="rounded-2xl border border-yellow-400/20 bg-yellow-400/5 p-6 text-center">
            <AlertCircle className="mx-auto mb-2 text-yellow-400" size={24} />
            <h3 className="text-sm font-bold text-white">Need more points?</h3>
            <p className="mt-1 text-xs text-zinc-400">Register for upcoming technical events to boost your stats.</p>
            <Link href="/events" className="mt-4 block w-full rounded-xl bg-yellow-400 py-2 text-xs font-bold text-black hover:bg-yellow-300">
              Find Events
            </Link>
          </div>

        </aside>
      </main>
    </div>
  );
}

function StatBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#121214] p-4">
      <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">{label}</p>
      <p className="mt-1 text-xl font-black text-white">{value}</p>
    </div>
  );
}