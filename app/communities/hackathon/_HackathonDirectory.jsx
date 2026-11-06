"use client";

import { useState } from "react";
import { ArrowLeft, Search, Filter, Check, MapPin, Code2, Trophy, Plus } from "lucide-react";
import Link from "next/link";

const FILTER_CHIPS = ["All Roles", "Frontend", "Backend", "UI/UX", "AI/ML", "Mobile"];

export default function HackathonDirectory({ initialPosts }) {
  const [activeTab, setActiveTab] = useState("directory");
  const [activeChip, setActiveChip] = useState("All Roles");
  const [search, setSearch] = useState("");

  // Filter logic
  const filteredPosts = initialPosts.filter((post) => {
    const matchesSearch =
      post.title.toLowerCase().includes(search.toLowerCase()) ||
      post.skills.toLowerCase().includes(search.toLowerCase()) ||
      (post.authorId?.name || "").toLowerCase().includes(search.toLowerCase());

    const matchesChip =
      activeChip === "All Roles" ||
      post.skills.toLowerCase().includes(activeChip.toLowerCase());

    return matchesSearch && matchesChip;
  });

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      {/* ─── Top Navigation ─── */}
      <header className="sticky top-0 z-20 border-b border-white/5 bg-[#09090b]/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-5 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link
                href="/communities"
                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 text-zinc-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <ArrowLeft size={18} />
              </Link>
              <h1 className="text-xl font-bold tracking-tight">Teammates</h1>
            </div>

            {/* Pill Tabs */}
            <div className="flex items-center rounded-full bg-white/5 p-1">
              <button
                onClick={() => setActiveTab("directory")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "directory"
                    ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                Directory
              </button>
              <button
                onClick={() => setActiveTab("applications")}
                className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all ${
                  activeTab === "applications"
                    ? "bg-yellow-400 text-black shadow-lg shadow-yellow-400/20"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                My Applications
              </button>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {FILTER_CHIPS.map((chip) => (
              <button
                key={chip}
                onClick={() => setActiveChip(chip)}
                className={`whitespace-nowrap rounded-full border px-4 py-1.5 text-xs font-bold transition-all ${
                  activeChip === chip
                    ? "border-yellow-400/50 bg-yellow-400/10 text-yellow-400"
                    : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-white"
                }`}
              >
                {chip}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="mx-auto max-w-5xl px-5 py-8">
        
        {/* Search & Action Bar */}
        <div className="mb-6 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Search by name, skill, or hackathon..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-2xl border border-white/5 bg-[#121214] py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-500 outline-none transition-colors focus:border-yellow-400/50"
            />
          </div>
          <button className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white/5 text-white transition-colors hover:bg-white/10">
            <Filter size={18} />
          </button>
          <button className="hidden items-center gap-2 rounded-2xl bg-white/5 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 sm:flex">
            <Plus size={16} /> Post Request
          </button>
        </div>

        {/* ─── Cards List ─── */}
        <div className="space-y-4">
          {filteredPosts.map((post, i) => (
            <div
              key={post._id || i}
              className="group relative flex flex-col gap-4 rounded-3xl border border-white/5 bg-[#121214] p-5 transition-all hover:border-yellow-400/30 sm:flex-row sm:items-center sm:gap-6"
            >
              {/* Avatar Area */}
              <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-zinc-700 to-zinc-900 text-xl font-bold text-white shadow-inner">
                {post.authorId?.name?.charAt(0) || "U"}
              </div>

              {/* Info Area */}
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white transition-colors group-hover:text-yellow-400">
                      {post.authorId?.name || "Anonymous Student"}
                    </h3>
                    <p className="text-xs text-zinc-500">{post.hackathonName || "Hackathon Project"}</p>
                  </div>
                  <span className="flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Looking for team
                  </span>
                </div>

                {/* Details Grid (Skills, Event, Location) */}
                <div className="mt-4 grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Skills</p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-semibold text-zinc-300">
                      <Code2 size={14} className="text-yellow-400" />
                      {post.skills}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Status</p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-semibold text-zinc-300">
                      <Trophy size={14} className="text-yellow-400" />
                      {post.status === "OPEN" ? "Accepting" : "Closed"}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500">Location</p>
                    <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-semibold text-zinc-300">
                      <MapPin size={14} className="text-yellow-400" />
                      {post.authorId?.city || "Remote"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex items-center sm:ml-4">
                <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/5 px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-yellow-400 hover:text-black sm:w-auto">
                  <Check size={16} /> Invite
                </button>
              </div>
            </div>
          ))}

          {/* Empty State */}
          {filteredPosts.length === 0 && (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-zinc-500">
                <Search size={28} />
              </div>
              <h3 className="mt-4 text-lg font-bold text-white">No teammates found</h3>
              <p className="mt-1 text-sm text-zinc-500">
                Try adjusting your search or filter to find more builders.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}