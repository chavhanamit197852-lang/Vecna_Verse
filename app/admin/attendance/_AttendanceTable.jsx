"use client";

import { useState, useMemo } from "react";
import { Search, Filter, Download, CheckCircle2, Clock, MapPin,CalendarDays,Users } from "lucide-react";
import AdminSidebar from "../_AdminSidebar";

function getAttendanceStatus(record) {
  if (record.status === "CHECKED_IN" || record.status === "ATTENDED" || record.attendance?.status === "PRESENT") return "CHECKED_IN";
  if (record.status === "ABSENT" || record.attendance?.status === "ABSENT") return "ABSENT";
  if (record.status === "CANCELLED") return "CANCELLED";
  return "REGISTERED";
}

export default function AttendanceTable({ initialRecords = [], events = [], showAdminSidebar = false }) {
  const [records, setRecords] = useState(initialRecords);
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [isUpdating, setIsUpdating] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const filteredRecords = useMemo(() => {
    return records.filter((r) => {
      const matchesSearch = 
        r.user.name.toLowerCase().includes(search.toLowerCase()) ||
        r.user.email.toLowerCase().includes(search.toLowerCase());
      
      const matchesEvent = eventFilter ? r.event.slug === eventFilter : true;
      const matchesStatus = statusFilter ? r.status === statusFilter : true;

      return matchesSearch && matchesEvent && matchesStatus;
    });
  }, [records, search, eventFilter, statusFilter]);

  const exportCSV = () => {
    const headers = ["Student Name", "Email", "Event", "Status", "Check-in Time", "AICTE Points"];
    const rows = filteredRecords.map(r => [
      r.user.name, r.user.email, r.event.title, r.status,
      r.checkedInAt ? new Date(r.checkedInAt).toLocaleString() : "—", r.aicteAwarded
    ]);
    const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `attendance_export_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleCheckIn = async (qrToken) => {
    setIsUpdating(qrToken);
    setErrorMsg("");
    
    // ─── Call your EXISTING route ───
    const res = await fetch("/api/attendance/checkin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: qrToken }) 
    });

    const data = await res.json().catch(() => ({}));

    if (res.ok) {
      // Update local UI state
      setRecords(prev => prev.map(r => 
        r.qrToken === qrToken 
          ? { 
              ...r, 
              status: "CHECKED_IN", 
              checkedInAt: new Date().toISOString(),
              aicteAwarded: data.aicteAwarded || r.aicteAwarded
            } 
          : r
      ));
    } else {
      setErrorMsg(data.error || "Failed to check in.");
    }
    setIsUpdating(null);




  };

  return (
  

  <div className="min-h-screen bg-[#09090b] text-white">

    {/* LEFT NAVIGATION */}
    {showAdminSidebar && <AdminSidebar />}

    {/* MAIN CONTENT */}
    <main className={`min-h-screen px-4 py-6 md:px-8 md:py-10 ${showAdminSidebar ? "lg:ml-64" : ""}`}>

      <div className="mx-auto max-w-[1500px] space-y-6">

        {/* HEADER */}
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#B9D957]">
              Administration / Event Operations
            </p>

            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              Student Attendance
            </h1>

            <p className="mt-2 text-sm text-zinc-500">
              Monitor registrations, verify student check-ins and manage event attendance.
            </p>
          </div>

          <button
            type="button"
            onClick={exportCSV}
            className="flex items-center justify-center gap-2 rounded-xl bg-[#B9D957] px-5 py-3 text-sm font-bold text-black transition hover:bg-[#d0ed70]"
          >
            <Download size={16} />
            Export CSV
          </button>

        </header>

        {/* ERROR */}
        {errorMsg && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-semibold text-red-400">
            ⚠ {errorMsg}
          </div>
        )}

        {/* FILTERS */}
        <section className="grid gap-3 rounded-2xl border border-white/[0.07] bg-[#121212] p-4 md:grid-cols-4">

          {/* SEARCH */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={16}
            />

            <input
              type="search"
              placeholder="Search student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-9 pr-4 text-sm text-white outline-none transition focus:border-[#B9D957]/50"
            />
          </div>

          {/* EVENT FILTER */}
          <div className="relative">
            <CalendarDays
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={16}
            />

            <select
              value={eventFilter}
              onChange={(e) => setEventFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-[#191919] py-3 pl-9 pr-4 text-sm text-white outline-none focus:border-[#B9D957]/50"
            >
              <option value="">All Events</option>

              {events.map((e) => (
                <option
                  key={e._id}
                  value={e.slug}
                  className="bg-[#191919]"
                >
                  {e.title}
                </option>
              ))}
            </select>
          </div>

          {/* STATUS FILTER */}
          <div className="relative">
            <CheckCircle2
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
              size={16}
            />

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full appearance-none rounded-xl border border-white/10 bg-[#191919] py-3 pl-9 pr-4 text-sm text-white outline-none focus:border-[#B9D957]/50"
            >
              <option value="">All Statuses</option>
              <option value="REGISTERED">Registered</option>
              <option value="CHECKED_IN">Checked In</option>
              <option value="ABSENT">Absent</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>

          {/* COUNT */}
          <div className="flex items-center justify-between rounded-xl border border-white/[0.05] bg-white/[0.025] px-4 text-xs font-semibold text-zinc-400">
            <span>Matching records</span>
            <span className="text-[#B9D957]">
              {filteredRecords.length}
            </span>
          </div>

        </section>

        {/* ATTENDANCE TABLE */}
        <section className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121212] shadow-xl">

          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] px-5 py-5">

            <div>
              <h2 className="text-base font-bold text-white">
                Attendance Records
              </h2>

              <p className="mt-1 text-xs text-zinc-500">
                Student-wise event registration and check-in information
              </p>
            </div>

            <span className="rounded-lg bg-[#B9D957]/10 px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-[#B9D957]">
              {filteredRecords.length} Records
            </span>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px] text-left text-sm">

              <thead className="bg-white/[0.025] text-[10px] font-bold uppercase tracking-wider text-zinc-500">
                <tr>
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Event</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Check-in Time</th>
                  <th className="px-6 py-4 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.06]">

                {filteredRecords.map((r) => {

                  // Supports populated user/event aliases
                  const user = r.user || r.userId || {};
                  const event = r.event || r.eventId || {};

                  const userName = user.name || "Unknown Student";
                  const userEmail = user.email || "No email";
                  const eventTitle = event.title || "Deleted Event";
                  const eventCity = event.city || "Location unavailable";

                  const status = getAttendanceStatus(r);

                  const checkedInAt =
                    r.attendance?.checkedInAt ||
                    r.checkedInAt ||
                    null;

                  const isCheckedIn = status === "CHECKED_IN";

                  const canCheckIn =
                    status === "REGISTERED" && Boolean(r.qrToken);

                  const busy = isUpdating === r.qrToken;

                  return (
                    <tr
                      key={r._id}
                      className="transition-colors hover:bg-white/[0.025]"
                    >

                      {/* STUDENT */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#B9D957]/10 bg-[#B9D957]/10 text-xs font-bold text-[#B9D957]">
                            {userName.charAt(0).toUpperCase()}
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-xs font-bold text-white">
                              {userName}
                            </p>

                            <p className="mt-1 truncate text-xs text-zinc-500">
                              {userEmail}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* EVENT */}
                      <td className="px-6 py-4">

                        <p className="font-semibold text-neutral-200">
                          {eventTitle}
                        </p>

                        <p className="mt-1 flex items-center gap-1 text-xs text-zinc-500">
                          <MapPin size={11} />
                          {eventCity}
                        </p>

                      </td>

                      {/* STATUS */}
                      <td className="px-6 py-4">

                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold text-emerald-400">
                            <CheckCircle2 size={12} />
                            Checked In
                          </span>
                        ) : status === "ABSENT" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/20 bg-red-500/10 px-3 py-1.5 text-[10px] font-bold text-red-400">
                            <XCircle size={12} />
                            Absent
                          </span>
                        ) : status === "CANCELLED" ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-neutral-400">
                            <XCircle size={12} />
                            Cancelled
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-[#B9D957]/20 bg-[#B9D957]/10 px-3 py-1.5 text-[10px] font-bold text-[#B9D957]">
                            <Clock3 size={12} />
                            Registered
                          </span>
                        )}

                      </td>

                      {/* CHECK-IN TIME */}
                      <td className="px-6 py-4 text-xs text-zinc-400">

                        {checkedInAt
                          ? new Date(checkedInAt).toLocaleString(
                              "en-IN",
                              {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "—"}

                      </td>

                      {/* ACTION */}
                      <td className="px-6 py-4 text-right">

                        {isCheckedIn ? (
                          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                            <ShieldCheck size={14} />
                            Verified
                          </span>
                        ) : canCheckIn ? (
                          <button
                            type="button"
                            onClick={() => handleCheckIn(r.qrToken)}
                            disabled={Boolean(isUpdating)}
                            className="rounded-lg bg-[#B9D957]/10 px-3 py-2 text-xs font-bold text-[#B9D957] transition hover:bg-[#B9D957] hover:text-black disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            {busy ? "Checking..." : "Check In"}
                          </button>
                        ) : (
                          <span className="text-xs text-zinc-600">
                            {status === "CANCELLED" ? "Unavailable" : "No ticket"}
                          </span>
                        )}

                      </td>

                    </tr>
                  );

                })}

              </tbody>

            </table>

          </div>

          {/* EMPTY STATE */}
          {filteredRecords.length === 0 && (
            <div className="flex flex-col items-center justify-center px-5 py-16 text-center">

              <div className="rounded-2xl bg-white/[0.04] p-4">
                <Users className="h-7 w-7 text-zinc-600" />
              </div>

              <p className="mt-4 text-sm font-bold text-zinc-300">
                No attendance records found
              </p>

              <p className="mt-1 text-xs text-zinc-500">
                Try changing your student, event or attendance filters.
              </p>

            </div>
          )}

        </section>

      </div>
    </main>

  </div>


  );
}