
"use client";

import { useEffect, useState, useCallback, useRef } from "react";

import {
  Search,
  Users,
  GraduationCap,
  Shield,
  ShieldCheck,
  MapPin,
  Clock3,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  UserRound,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Filter,
  ArrowUpDown,
} from "lucide-react";

const ROLE_META = {
  STUDENT: {
    label: "Student",
    icon: GraduationCap,
    className: "border-[#B9D957]/20 bg-[#B9D957]/10 text-[#C5E46C]",
    dot: "bg-[#B9D957]",
  },

  SPONSOR: {
    label: "Sponsor",
    icon: Users,
    className: "border-purple-400/20 bg-purple-400/10 text-purple-400",
    dot: "bg-purple-400",
  },

  CLUB_ADMIN: {
    label: "Club Admin",
    icon: ShieldCheck,
    className: "border-blue-400/20 bg-blue-400/10 text-blue-400",
    dot: "bg-blue-400",
  },

  ADMIN: {
    label: "Admin",
    icon: Shield,
    className: "border-purple-400/20 bg-purple-400/10 text-purple-400",
    dot: "bg-purple-400",
  },
};

const ROLES = ["STUDENT", "SPONSOR", "CLUB_ADMIN", "ADMIN"];

function getInitials(name = "") {
  return (
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join("") || "U"
  );
}

function timeAgo(value) {
  if (!value) return "Never logged in";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Unknown";

  const diff = Math.max(0, Math.floor((Date.now() - date.getTime()) / 1000));

  if (diff < 60) return "Just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 2592000) return `${Math.floor(diff / 86400)}d ago`;

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function RoleBadge({ role }) {
  const meta = ROLE_META[role] || ROLE_META.STUDENT;
  const Icon = meta.icon;

  return (
    <span
      className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider ${meta.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {meta.label}
    </span>
  );
}

export default function UsersTable({ currentUserId = "" }) {
  const [rows, setRows] = useState([]);

  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    pages: 1,
    byRole: {},
  });

  const [q, setQ] = useState("");
  const [roleFilter, setRoleFilter] = useState("");

  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [banner, setBanner] = useState(null);

  const abortRef = useRef(null);

  // --------------------------------------------------
  // LOAD USERS
  // --------------------------------------------------

  const load = useCallback(
    async (page = 1) => {
      abortRef.current?.abort();

      const controller = new AbortController();
      abortRef.current = controller;

      setLoading(true);

      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
      });

      if (q.trim()) params.set("q", q.trim());
      if (roleFilter) params.set("role", roleFilter);

      try {
        const res = await fetch(`/api/admin/users?${params}`, {
          method: "GET",
          cache: "no-store",
          signal: controller.signal,
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(data.error || "Failed to load users.");
        }

        if (controller.signal.aborted) return;

        setRows(Array.isArray(data.users) ? data.users : []);

        setMeta({
          total: Number(data.total) || 0,
          page: Number(data.page) || page,
          pages: Math.max(1, Number(data.pages) || 1),
          byRole: data.byRole || {},
        });

      } catch (error) {
        if (error.name === "AbortError") return;

        setBanner({
          type: "error",
          text: error.message || "Something went wrong.",
        });

      } finally {
        if (abortRef.current === controller) {
          setLoading(false);
        }
      }
    },
    [q, roleFilter]
  );

  // Debounced search and filter loading
  useEffect(() => {
    const timer = setTimeout(() => {
      load(1);
    }, 350);

    return () => {
      clearTimeout(timer);
      abortRef.current?.abort();
    };
  }, [load]);

  // Cancel pending fetch on unmount
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // --------------------------------------------------
  // CHANGE USER ROLE
  // --------------------------------------------------

  async function changeRole(user, newRole) {
    if (user.role === newRole || busyId) return;

    const userId = user.id || user._id?.toString();

    if (!userId) {
      setBanner({
        type: "error",
        text: "User ID is missing.",
      });
      return;
    }

    const name = user.name || user.email || "this user";
    const targetRole = ROLE_META[newRole]?.label || newRole;

    let message = `Change ${name}'s role to ${targetRole}?`;

    if (newRole === "ADMIN") {
      message +=
        "\n\nThis grants full platform administration privileges.";
    } else if (newRole === "CLUB_ADMIN") {
      message +=
        "\n\nThis grants club management privileges. Make sure a club is assigned.";
    } else {
      message += "\n\nThis removes their elevated permissions.";
    }

    if (!window.confirm(message)) return;

    setBusyId(userId);
    setBanner(null);

    try {
      const res = await fetch(`/api/admin/users/${userId}/role`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ role: newRole }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Unable to change user role.");
      }

      setBanner({
        type: "success",
        text: `${name} is now ${targetRole}.`,
      });

      // Refresh from database. A changed role may no longer
      // match the currently selected role filter.
      await load(meta.page);

    } catch (error) {
      setBanner({
        type: "error",
        text: error.message || "Role update failed.",
      });
    } finally {
      setBusyId(null);
    }
  }

  // --------------------------------------------------
  // PAGINATION
  // --------------------------------------------------

  function changePage(nextPage) {
    if (
      loading ||
      nextPage < 1 ||
      nextPage > meta.pages ||
      nextPage === meta.page
    ) {
      return;
    }

    load(nextPage);
  }

  // --------------------------------------------------
  // UI
  // --------------------------------------------------

  return (
    <section className="space-y-5 text-white">

      {/* SEARCH + FILTERS */}
      <div className="flex flex-col justify-between gap-3 xl:flex-row">

        <div className="flex flex-1 flex-col gap-3 sm:flex-row">

          {/* SEARCH */}
          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

            <input
              type="search"
              placeholder="Search name, email or city..."
              value={q}
              onChange={(e) => setQ(e.target.value)}
              className="h-11 w-full rounded-xl border border-white/10 bg-[#1B1B1B] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-[#B9D957]/50 focus:ring-2 focus:ring-[#B9D957]/10"
            />
          </div>

          {/* ROLE FILTER */}
          <div className="relative w-full sm:w-48">
            <Filter className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />

            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="h-11 w-full appearance-none rounded-xl border border-white/10 bg-[#1B1B1B] pl-10 pr-4 text-sm text-neutral-300 outline-none transition focus:border-[#B9D957]/50"
            >
              <option value="">All roles</option>
              <option value="STUDENT">Students</option>
              <option value="SPONSOR">Sponsors</option>
              <option value="CLUB_ADMIN">Club admins</option>
              <option value="ADMIN">Admins</option>
            </select>
          </div>

        </div>

        {/* RESULTS + REFRESH */}
        <div className="flex items-center justify-between gap-3 sm:justify-end">

          <span className="text-xs text-neutral-500">
            {meta.total.toLocaleString("en-IN")} users found
          </span>

          <button
            type="button"
            onClick={() => load(meta.page)}
            disabled={loading}
            aria-label="Refresh users"
            className="flex h-10 items-center gap-2 rounded-xl border border-white/10 bg-[#1B1B1B] px-3 text-xs font-semibold text-neutral-300 transition hover:border-[#B9D957]/40 hover:text-[#B9D957] disabled:opacity-50"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>

        </div>
      </div>

      {/* STATUS MESSAGE */}
      {banner && (
        <div
          role="status"
          className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${
            banner.type === "error"
              ? "border-red-400/20 bg-red-400/10 text-red-300"
              : "border-[#B9D957]/20 bg-[#B9D957]/10 text-[#C5E46C]"
          }`}
        >
          {banner.type === "error" ? (
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          ) : (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          )}

          <span>{banner.text}</span>

          <button
            type="button"
            onClick={() => setBanner(null)}
            className="ml-auto text-current opacity-70 hover:opacity-100"
            aria-label="Dismiss message"
          >
            ×
          </button>
        </div>
      )}

      {/* USERS TABLE */}
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#111111]">

        {/* TABLE HEADER */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-5 py-4">

          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-[#B9D957]/10 p-2.5">
              <Users className="h-4 w-4 text-[#B9D957]" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-white">
                User directory
              </h3>
              <p className="mt-0.5 text-[11px] text-neutral-500">
                Manage accounts and access levels
              </p>
            </div>
          </div>

          <span className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-400">
            Page {meta.page} / {meta.pages}
          </span>
        </div>

        {/* RESPONSIVE TABLE */}
        <div className="overflow-x-auto">

          <table className="w-full min-w-[850px] text-left">

            <thead className="border-b border-white/10 bg-white/[0.025]">
              <tr className="text-[10px] font-bold uppercase tracking-[0.15em] text-neutral-500">

                <th className="px-5 py-4">User</th>
                <th className="px-5 py-4">Location</th>
                <th className="px-5 py-4">Access role</th>
                <th className="px-5 py-4">Last login</th>
                <th className="px-5 py-4 text-right">Manage access</th>

              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.06]">

              {/* LOADING */}
              {loading && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">

                    <div className="flex flex-col items-center gap-3 text-neutral-500">
                      <Loader2 className="h-6 w-6 animate-spin text-[#B9D957]" />
                      <span className="text-xs">
                        Loading user directory...
                      </span>
                    </div>

                  </td>
                </tr>
              )}

              {/* EMPTY */}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-16 text-center">

                    <div className="flex flex-col items-center gap-3">
                      <div className="rounded-2xl bg-white/[0.04] p-4">
                        <UserRound className="h-7 w-7 text-neutral-600" />
                      </div>

                      <div>
                        <p className="text-sm font-semibold text-neutral-300">
                          No users found
                        </p>
                        <p className="mt-1 text-xs text-neutral-500">
                          Try another search or change your filters.
                        </p>
                      </div>
                    </div>

                  </td>
                </tr>
              )}

              {/* USER ROWS */}
              {!loading &&
                rows.map((u) => {
                  const userId = String(u.id || u._id || "");
                  const isSelf =
                    u.isSelf ||
                    (currentUserId && userId === String(currentUserId));

                  const busy = busyId === userId;
                  const active = u.recentlyActive;
                  const name = u.name || "Unnamed user";

                  return (
                    <tr
                      key={userId}
                      className={`group transition-colors hover:bg-white/[0.025] ${
                        isSelf ? "bg-[#B9D957]/[0.035]" : ""
                      }`}
                    >

                      {/* USER */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          {/* AVATAR */}
                          <div className="relative shrink-0">

                            {u.image ? (
                              <img
                                src={u.image}
                                alt=""
                                className="h-10 w-10 rounded-xl border border-white/10 object-cover"
                              />
                            ) : (
                              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-[#252525] text-xs font-bold text-[#B9D957]">
                                {getInitials(name)}
                              </div>
                            )}

                            {active && (
                              <span className="absolute -bottom-1 -right-1 h-3 w-3 rounded-full border-2 border-[#111111] bg-[#B9D957]" />
                            )}

                          </div>

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">

                              <p className="max-w-[190px] truncate text-sm font-semibold text-neutral-100">
                                {name}
                              </p>

                              {isSelf && (
                                <span className="rounded-md bg-[#B9D957]/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-[#B9D957]">
                                  You
                                </span>
                              )}

                            </div>

                            <p className="mt-1 max-w-[220px] truncate text-xs text-neutral-500">
                              {u.email || "No email"}
                            </p>
                          </div>

                        </div>
                      </td>

                      {/* CITY */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-neutral-600" />
                          {u.city || "Not specified"}
                        </div>

                        {u.college && (
                          <p className="mt-1 max-w-[180px] truncate pl-5 text-[10px] text-neutral-600">
                            {u.college}
                          </p>
                        )}

                      </td>

                      {/* ROLE */}
                      <td className="px-5 py-4">
                        <RoleBadge role={u.role} />

                        {active && (
                          <p className="mt-1.5 flex items-center gap-1.5 text-[10px] text-[#B9D957]">
                            <span className="h-1.5 w-1.5 rounded-full bg-[#B9D957]" />
                            Recently active
                          </p>
                        )}
                      </td>

                      {/* LAST LOGIN */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2 text-xs text-neutral-400">
                          <Clock3 className="h-3.5 w-3.5 text-neutral-600" />
                          {timeAgo(u.lastLoginAt)}
                        </div>

                      </td>

                      {/* ROLE MANAGEMENT */}
                      <td className="px-5 py-4 text-right">

                        {isSelf ? (
                          <span className="text-xs text-neutral-600">
                            Current account
                          </span>
                        ) : (

                          <div className="flex items-center justify-end gap-2">

                            {busy && (
                              <Loader2 className="h-3.5 w-3.5 animate-spin text-[#B9D957]" />
                            )}

                            <select
                              disabled={busy || !!busyId}
                              value={u.role}
                              onChange={(e) =>
                                changeRole(u, e.target.value)
                              }
                              aria-label={`Change role for ${name}`}
                              className="max-w-[145px] cursor-pointer rounded-xl border border-white/10 bg-[#1C1C1C] px-3 py-2 text-xs font-semibold text-neutral-300 outline-none transition hover:border-[#B9D957]/40 focus:border-[#B9D957]/60 focus:ring-2 focus:ring-[#B9D957]/10 disabled:cursor-not-allowed disabled:opacity-50"
                            >

                              {ROLES.map((role) => (
                                <option key={role} value={role}>
                                  {ROLE_META[role].label}
                                </option>
                              ))}

                            </select>

                          </div>
                        )}

                      </td>

                    </tr>
                  );
                })}

            </tbody>
          </table>

        </div>

        {/* TABLE FOOTER */}
        <div className="flex flex-col justify-between gap-3 border-t border-white/10 px-5 py-4 sm:flex-row sm:items-center">

          <p className="text-xs text-neutral-500">
            Showing{" "}
            <span className="font-semibold text-neutral-300">
              {rows.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-neutral-300">
              {meta.total}
            </span>{" "}
            users
          </p>

          <div className="flex items-center gap-2">

            <button
              type="button"
              onClick={() => changePage(meta.page - 1)}
              disabled={loading || meta.page <= 1}
              className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-[#1B1B1B] px-3 text-xs font-semibold text-neutral-400 transition hover:border-[#B9D957]/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
              Previous
            </button>

            <span className="min-w-[65px] text-center text-xs font-semibold text-neutral-400">
              {meta.page} / {meta.pages}
            </span>

            <button
              type="button"
              onClick={() => changePage(meta.page + 1)}
              disabled={loading || meta.page >= meta.pages}
              className="flex h-9 items-center gap-2 rounded-lg border border-white/10 bg-[#1B1B1B] px-3 text-xs font-semibold text-neutral-400 transition hover:border-[#B9D957]/30 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-3.5 w-3.5" />
            </button>

          </div>
        </div>

      </div>

      {/* ACCESS INFORMATION */}
      <div className="flex items-start gap-3 rounded-xl border border-[#B9D957]/10 bg-[#B9D957]/[0.035] p-4">

        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#B9D957]" />

        <div>
          <p className="text-xs font-semibold text-neutral-300">
            Access management
          </p>
          <p className="mt-1 text-[11px] leading-5 text-neutral-500">
            Role changes affect platform permissions. Club administrators
            should also have a valid club assignment. All permission
            changes must be validated by the server.
          </p>
        </div>

      </div>

    </section>
  );
}
