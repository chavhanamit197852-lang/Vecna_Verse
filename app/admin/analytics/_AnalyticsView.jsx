"use client";

import { Users, Calendar, Activity, CheckCircle } from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, Legend
} from "recharts";
import Link from "next/link";

const COLORS = ["#facc15", "#3b82f6", "#10b981", "#ef4444", "#8b5cf6"];

export default function AnalyticsView({ kpis, regByDay, topEvents, categories }) {
  return (
    <div className="min-h-screen bg-[#09090b] px-4 py-10 text-white">
      {/* ─── Narrow Centered Container ─── */}
      <div className="mx-auto max-w-3xl space-y-8">
        
        {/* Header */}
        <header className="text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-yellow-400">
            Admin Insights
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
            Analytics Overview
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            A focused view of campus engagement and event metrics.
          </p>
        </header>

        {/* ─── KPI Cards (2x2 Grid for narrow width) ─── */}
        <div className="grid grid-cols-2 gap-3">
          <KpiCard 
            title="Users" 
            value={kpis.totalUsers} 
            icon={<Users size={18} />} 
          />
          <KpiCard 
            title="Events" 
            value={kpis.totalEvents} 
            icon={<Calendar size={18} />} 
          />
          <KpiCard 
            title="Registrations" 
            value={kpis.totalRegistrations} 
            icon={<Activity size={18} />} 
          />
          <KpiCard 
            title="Check-in Rate" 
            value={`${kpis.checkInRate}%`} 
            icon={<CheckCircle size={18} />} 
            accent
          />
        </div>

        {/* ─── Registrations Chart (Full Width) ─── */}
        <div className="rounded-3xl border border-white/5 bg-[#121214] p-5 shadow-xl">
          <h3 className="mb-4 text-base font-bold">Registration Trend (7 Days)</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={regByDay} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorReg" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#facc15" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#facc15" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="day" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px" }}
                  itemStyle={{ color: "#facc15" }}
                />
                <Area type="monotone" dataKey="registrations" stroke="#facc15" strokeWidth={2} fillOpacity={1} fill="url(#colorReg)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── Categories Chart (Full Width) ─── */}
        <div className="rounded-3xl border border-white/5 bg-[#121214] p-5 shadow-xl">
          <h3 className="mb-4 text-base font-bold">Events by Category</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#18181b", border: "none", borderRadius: "8px" }}
                />
                <Legend verticalAlign="bottom" height={36} iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── Top Events Chart (Full Width) ─── */}
        <div className="rounded-3xl border border-white/5 bg-[#121214] p-5 shadow-xl">
          <h3 className="mb-4 text-base font-bold">Top 5 Events</h3>
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEvents} layout="vertical" margin={{ top: 0, right: 0, left: 10, bottom: 0 }}>
                <XAxis type="number" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis dataKey="title" type="category" stroke="#a1a1aa" fontSize={10} tickLine={false} axisLine={false} width={90} />
                <Tooltip
                  cursor={{ fill: "rgba(255,255,255,0.05)" }}
                  contentStyle={{ backgroundColor: "#18181b", border: "none", borderRadius: "8px" }}
                />
                <Bar dataKey="count" fill="#facc15" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ─── Quick Actions ─── */}
        <div className="rounded-3xl border border-white/5 bg-[#121214] p-5 shadow-xl">
          <h3 className="mb-4 text-base font-bold">Admin Tools</h3>
          <div className="space-y-3">
            <Link href="/admin/users" className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:border-yellow-400/50 hover:bg-yellow-400/5">
              <div>
                <p className="text-sm font-bold text-white">User Management</p>
                <p className="text-[11px] text-zinc-500">Promote students to admins</p>
              </div>
              <span className="text-yellow-400">→</span>
            </Link>
            <Link href="/admin/attendance" className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 transition-colors hover:border-yellow-400/50 hover:bg-yellow-400/5">
              <div>
                <p className="text-sm font-bold text-white">Attendance Logs</p>
                <p className="text-[11px] text-zinc-500">View all student check-ins</p>
              </div>
              <span className="text-yellow-400">→</span>
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, accent }) {
  return (
    <div className={`rounded-2xl border p-4 shadow-xl ${
      accent ? "border-yellow-400/30 bg-yellow-400/10" : "border-white/5 bg-[#121214]"
    }`}>
      <div className="flex items-center gap-2 text-zinc-400">
        {icon}
        <p className="text-xs font-semibold">{title}</p>
      </div>
      <h3 className="mt-3 text-2xl font-black text-white">{value}</h3>
    </div>
  );
}