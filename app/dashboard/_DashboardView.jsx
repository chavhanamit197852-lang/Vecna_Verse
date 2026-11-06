"use client";

import Link from "next/link";
import {
  LayoutDashboard, Calendar, Folder, Users, Settings, LogOut,
  Search, Bell, MessageSquare, ArrowUpRight, ArrowDownRight, Ticket, Award, Zap
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from "recharts";

// Mock sparkline data for the top cards
const sparkData1 = [{ v: 10 }, { v: 25 }, { v: 15 }, { v: 40 }, { v: 30 }, { v: 50 }];
const sparkData2 = [{ v: 40 }, { v: 30 }, { v: 45 }, { v: 20 }, { v: 35 }, { v: 50 }];

// Mock AICTE line chart data
const aicteLineData = [
  { name: "Aug", points: 10 }, { name: "Sep", points: 25 },
  { name: "Oct", points: 45 }, { name: "Nov", points: 60 },
  { name: "Dec", points: 85 }, { name: "Jan", points: 100 },
];

export default function DashboardView({ 
  user, totalTickets, checkedIn, upcomingEvents, aicteTotal, aictePct, attendanceRate 
}) {
  // Donut chart data
  const donutData = [
    { name: "Attended", value: checkedIn },
    { name: "Missed", value: Math.max(0, totalTickets - checkedIn) },
  ];
  const COLORS = ["#facc15", "#27272a"]; // Yellow-400 and Zinc-800

  return (
    <div className="flex min-h-screen bg-[#09090b] text-white">
      
      {/* ─── SIDEBAR ─── */}
      <aside className="fixed inset-y-0 left-0 z-50 flex w-20 flex-col items-center border-r border-white/5 bg-[#0c0c0e] py-8">
        {/* Logo */}
       

        {/* Nav Icons */}
        <nav className="flex flex-1 flex-col gap-6 text-zinc-500">
          <Link href="/dashboard" className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
            <LayoutDashboard size={20} />
            <span className="absolute -left-1 h-4 w-1 rounded-r-full bg-yellow-400" />
          </Link>
          <Link href="/events" className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-white/5 hover:text-white">
            <Calendar size={20} />
          </Link>
          <Link href="/dashboard/portfolio" className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-white/5 hover:text-white">
            <Folder size={20} />
          </Link>
          <Link href="/communities/hackathon" className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-white/5 hover:text-white">
            <Users size={20} />
          </Link>
        </nav>

        {/* Bottom Icons */}
        <div className="mt-auto flex flex-col gap-6 text-zinc-500">
          <button className="flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-white/5 hover:text-white">
            <Settings size={20} />
          </button>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl text-red-500/70 transition-colors hover:bg-red-500/10 hover:text-red-500">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="ml-20 flex-1 p-8">
        
        {/* Header */}
        <header className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold">Hello, {user?.name?.split(" ")[0] || "Student"}!</h1>
            <p className="mt-1 text-sm text-zinc-400">Explore information and activity about your events</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={16} />
              <input 
                type="text" 
                placeholder="Search events..." 
                className="w-64 rounded-full border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-yellow-400/50 focus:bg-yellow-400/5"
              />
            </div>
            <button className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-white">
              <MessageSquare size={18} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full border-2 border-[#09090b] bg-yellow-400" />
            </button>
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-zinc-400 hover:text-white">
              <Bell size={18} />
            </button>
          </div>
        </header>

        {/* ─── GRID LAYOUT ─── */}
        <div className="grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-12">
          
          {/* 1. TOP KPI ROW (4 Cards) */}
          <Card className="col-span-1 lg:col-span-3">
            <p className="text-sm font-medium text-zinc-400">Events Registered</p>
            <div className="mt-2 flex items-end justify-between">
              <h3 className="text-3xl font-bold">{totalTickets}</h3>
              <div className="h-10 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={sparkData1}>
                    <Bar dataKey="v" fill="#facc15" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          <Card className="col-span-1 lg:col-span-3">
            <p className="text-sm font-medium text-zinc-400">Events Attended</p>
            <div className="mt-2 flex items-end justify-between">
              <h3 className="text-3xl font-bold">{checkedIn}</h3>
              <div className="h-10 w-20">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData2}>
                    <Area type="monotone" dataKey="v" stroke="#facc15" fill="#facc15" fillOpacity={0.2} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          <Card className="col-span-1 lg:col-span-3">
            <p className="text-sm font-medium text-zinc-400">AICTE Points</p>
            <div className="mt-2 flex items-end justify-between">
              <h3 className="text-3xl font-bold">{aicteTotal}</h3>
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-400/10 text-yellow-400">
                <Award size={20} />
              </div>
            </div>
          </Card>

          {/* Highlighted Card */}
          <Card className="col-span-1 border-yellow-400 bg-yellow-400 lg:col-span-3">
            <p className="text-sm font-medium text-black/70">Overall Activity</p>
            <div className="mt-2 flex items-end justify-between">
              <h3 className="text-3xl font-bold text-black">{attendanceRate}%</h3>
              <div className="h-10 w-16">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={sparkData1}>
                    <Area type="monotone" dataKey="v" stroke="#000" fill="#000" fillOpacity={0.1} strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </Card>

          {/* 2. MIDDLE ROW */}
          
          {/* AICTE Progress Chart */}
          <Card className="col-span-1 lg:col-span-5 lg:row-span-2">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold">AICTE Tracker</h3>
                <p className="text-xs text-zinc-500">Points earned over time</p>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-400">+{aicteTotal} pts</span>
            </div>
            
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={aicteLineData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPoints" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#facc15" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#facc15" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                    itemStyle={{ color: "#facc15" }}
                  />
                  <Area type="monotone" dataKey="points" stroke="#facc15" strokeWidth={3} fillOpacity={1} fill="url(#colorPoints)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Attendance Donut */}
          <Card className="col-span-1 flex flex-col items-center justify-center lg:col-span-3">
            <div className="mb-2 self-start">
              <h3 className="text-lg font-bold">Attendance</h3>
              <p className="text-xs text-zinc-500">Event check-in rate</p>
            </div>
            <div className="relative h-[150px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={donutData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value" stroke="none">
                    {donutData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold">{attendanceRate}%</span>
              </div>
            </div>
          </Card>

          {/* Profile Card */}
          <Card className="col-span-1 flex flex-col items-center justify-center text-center lg:col-span-4">
            <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-yellow-400 p-1">
              {user?.image ? (
                <img src={user.image} alt="Profile" className="h-full w-full rounded-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center rounded-full bg-zinc-800 text-2xl font-bold text-yellow-400">
                  {user?.name?.charAt(0) || "S"}
                </div>
              )}
            </div>
            <h3 className="mt-4 text-lg font-bold">{user?.name || "Student"}</h3>
            <p className="text-xs text-zinc-500">{user?.email}</p>
            
            <div className="mt-6 flex w-full justify-between border-t border-white/5 pt-4 text-center">
              <div>
                <p className="text-lg font-bold">{totalTickets}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Events</p>
              </div>
              <div>
                <p className="text-lg font-bold">{aicteTotal}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">Points</p>
              </div>
              <div>
                <p className="text-lg font-bold">{user?.city || "—"}</p>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">City</p>
              </div>
            </div>
          </Card>

          {/* 3. BOTTOM ROW */}
          
          {/* Next Event / Ticket */}
          <Card className="col-span-1 flex flex-col justify-between overflow-hidden lg:col-span-6 lg:row-span-2">
            <div className="z-10 w-2/3">
              <h3 className="text-lg font-bold">Upcoming Event</h3>
              <p className="mt-1 text-sm text-zinc-400">
                {upcomingEvents[0]?.eventId?.title || "No upcoming events registered."}
              </p>
              
              {upcomingEvents[0] && (
                <div className="mt-6 flex flex-col gap-2 text-xs font-semibold text-zinc-400">
                  <span className="flex items-center gap-2">
                    <Calendar size={14} className="text-yellow-400" />
                    {new Date(upcomingEvents[0].eventId.startsAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                  <span className="flex items-center gap-2">
                    <Ticket size={14} className="text-yellow-400" />
                    {upcomingEvents[0].eventId.city || "Campus"}
                  </span>
                </div>
              )}
              
              <Link href="/dashboard/attendance" className="mt-6 inline-flex items-center gap-2 rounded-xl bg-yellow-400 px-4 py-2 text-sm font-bold text-black transition-colors hover:bg-yellow-300">
                View My Ticket <ArrowUpRight size={16} />
              </Link>
            </div>
            
            {/* Decorative floating ticket graphic (CSS only) */}
            <div className="absolute -right-10 bottom-0 top-0 w-1/2 opacity-20">
              <div className="absolute right-10 top-10 h-40 w-64 -rotate-12 rounded-2xl border-2 border-yellow-400 bg-[#18181b] p-4 shadow-2xl">
                <div className="h-2 w-1/3 rounded bg-yellow-400/50" />
                <div className="mt-4 h-2 w-2/3 rounded bg-white/20" />
                <div className="mt-2 h-2 w-1/2 rounded bg-white/20" />
              </div>
              <div className="absolute right-0 top-24 h-40 w-64 -rotate-6 rounded-2xl border-2 border-white/20 bg-[#18181b] p-4 shadow-2xl backdrop-blur">
                <div className="h-8 w-8 rounded-full bg-yellow-400/20" />
                <div className="mt-4 h-2 w-1/2 rounded bg-white/20" />
              </div>
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="col-span-1 lg:col-span-3">
            <h3 className="mb-4 text-lg font-bold">Recent Activity</h3>
            <div className="space-y-4">
              {upcomingEvents.slice(0, 3).map((ev, i) => (
                <div key={i} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/5">
                      <Ticket size={14} className="text-zinc-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">Registered</p>
                      <p className="text-[10px] text-zinc-500">{ev.eventId?.title || "Event"}</p>
                    </div>
                  </div>
                  <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">Success</span>
                </div>
              ))}
              {upcomingEvents.length === 0 && (
                <p className="text-xs text-zinc-500">No recent activity.</p>
              )}
            </div>
          </Card>

          {/* Portfolio / Certificate Nudge */}
          <Card className="col-span-1 flex flex-col items-center justify-center text-center lg:col-span-3">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
              <Award size={32} className="text-yellow-400" />
            </div>
            <h3 className="mt-4 text-lg font-bold">Build your Portfolio</h3>
            <p className="mt-1 text-xs text-zinc-500">Upload certificates and track achievements.</p>
            <Link href="/dashboard/portfolio" className="mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-white/10">
              Update Portfolio
            </Link>
          </Card>

        </div>
      </main>
    </div>
  );
}

// Reusable card component for the dark theme
function Card({ children, className = "" }) {
  return (
    <div className={`relative rounded-3xl border border-white/5 bg-[#121214] p-6 shadow-xl ${className}`}>
      {children}
    </div>
  );
}