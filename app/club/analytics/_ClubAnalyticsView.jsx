"use client";

import { Users, IndianRupee, Handshake, Megaphone } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

export default function ClubAnalyticsView({ stats, chartData, sponsors }) {
  return (
    <div className="min-h-screen bg-[#09090b] p-6 text-white md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        
        <header>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-yellow-400">Club Dashboard</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Analytics & Revenue</h1>
        </header>

        {/* KPIs */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard title="Students Attended" value={stats.totalStudents} icon={<Users size={20} />} />
          <KpiCard title="Total Income" value={`₹${stats.totalIncome}`} icon={<IndianRupee size={20} />} accent />
          <KpiCard title="Sponsorships" value={`₹${stats.totalSponsors}`} icon={<Handshake size={20} />} />
          <KpiCard title="Ad Spend" value={`₹${stats.totalAdSpend}`} icon={<Megaphone size={20} />} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Chart */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 shadow-xl">
            <h3 className="mb-6 text-lg font-bold">Attendance by Event</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#52525b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip cursor={{ fill: "rgba(255,255,255,0.05)" }} contentStyle={{ backgroundColor: "#18181b", border: "none" }} />
                  <Bar dataKey="students" fill="#facc15" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Sponsors List */}
          <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-bold">Recent Sponsors</h3>
              <button className="text-xs font-bold text-yellow-400 hover:text-yellow-300">+ Add Sponsor</button>
            </div>
            <div className="space-y-3">
              {sponsors.map(s => (
                <div key={s._id} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-4">
                  <div>
                    <p className="font-bold">{s.name}</p>
                    <p className="text-xs text-zinc-500">{s.tier} Tier</p>
                  </div>
                  <p className="font-bold text-emerald-400">₹{s.amount}</p>
                </div>
              ))}
              {sponsors.length === 0 && <p className="text-sm text-zinc-500">No sponsors yet.</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({ title, value, icon, accent }) {
  return (
    <div className={`rounded-3xl border p-6 shadow-xl ${accent ? "border-yellow-400/30 bg-yellow-400/10" : "border-white/5 bg-[#121214]"}`}>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-zinc-400">{title}</p>
        <div className={`rounded-xl p-2 ${accent ? "bg-yellow-400 text-black" : "bg-white/5 text-zinc-400"}`}>{icon}</div>
      </div>
      <h3 className="mt-4 text-3xl font-black text-white">{value}</h3>
    </div>
  );
}