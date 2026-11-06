
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Megaphone,
  Activity,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  XCircle,
  ExternalLink,
  TicketCheck,
  GraduationCap,
} from "lucide-react";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";


const COLORS = [
  "#B9D957",
  "#60A5FA",
  "#34D399",
  "#F97316",
  "#A78BFA",
  "#F472B6",
];

const NAV_GROUPS = [
  {
    label: "Overview",
    items: [
      {
        name: "Control Center",
        href: "/admin",
        icon: LayoutDashboard,
      },
      {
        name: "Analytics",
        href: "/admin/analytics",
        icon: Activity,
      },
    ],
  },
  {
    label: "Management",
    items: [
      {
        name: "Events",
        href: "/admin/events",
        icon: CalendarDays,
      },
      {
        name: "Users",
        href: "/admin/users",
        icon: Users,
      },
      {
        name: "Sponsorships",
        href: "/admin/ads",
        icon: Megaphone,
      },
    ],
  },
  {
    label: "Platform",
    items: [
      {
        name: "Browse Events",
        href: "/events",
        icon: ExternalLink,
      },
    ],
  },
];


function formatNumber(value) {
  return Number(value || 0).toLocaleString("en-IN");
}

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

function formatDate(value) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getAttendanceMeta(registration) {
  const attendanceStatus = String(
    registration.attendanceStatus || ""
  ).toUpperCase();

  const registrationStatus = String(
    registration.status || ""
  ).toUpperCase();

  // Current Registration model
  if (
    attendanceStatus === "PRESENT" ||
    ["ATTENDED", "CHECKED_IN"].includes(registrationStatus)
  ) {
    return {
      label: "Checked In",
      icon: CheckCircle2,
      className:
        "bg-emerald-400/10 text-emerald-400 border-emerald-400/20",
    };
  }

  if (
    attendanceStatus === "ABSENT" ||
    registrationStatus === "ABSENT"
  ) {
    return {
      label: "Absent",
      icon: XCircle,
      className:
        "bg-red-400/10 text-red-400 border-red-400/20",
    };
  }

  if (registrationStatus === "CANCELLED") {
    return {
      label: "Cancelled",
      icon: XCircle,
      className:
        "bg-neutral-400/10 text-neutral-400 border-white/10",
    };
  }

  return {
    label: "Registered",
    icon: Clock3,
    className:
      "bg-[#B9D957]/10 text-[#B9D957] border-[#B9D957]/20",
  };
}

// --------------------------------------------------
// MAIN COMPONENT
// --------------------------------------------------

export default function AdminDashboardView({
  kpis = {},
  recentRegistrations = [],
  categories = [],
}) {
  const pathname = usePathname();

  const chartCategories = categories.filter(
    (category) => Number(category.value) > 0
  );

  const safeRegistrations = Array.isArray(recentRegistrations)
    ? recentRegistrations
    : [];

  const metrics = [
    {
      title: "Total Users",
      value: kpis.totalUsers,
      icon: Users,
      detail: "Registered platform accounts",
      color: "lime",
    },
    {
      title: "Published Events",
      value: kpis.totalEvents,
      icon: CalendarDays,
      detail: "Currently published events",
      color: "blue",
    },
    {
      title: "Registrations",
      value: kpis.totalRegistrations,
      icon: TicketCheck,
      detail: "Non-cancelled registrations",
      color: "purple",
    },
    {
      title: "Check-in Rate",
      value: `${Number(kpis.checkInRate || 0)}%`,
      icon: CheckCircle2,
      detail: `${formatNumber(kpis.checkedInCount)} students checked in`,
      color: "orange",
    },
  ];

  return (
    <div className="min-h-screen bg-[#090909] text-white">

      {/* ==========================================
          DESKTOP SIDEBAR
      ========================================== */}

      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/[0.07] bg-[#101010] lg:flex">

        {/* BRAND */}
        <div className="flex h-20 items-center gap-3 border-b border-white/[0.07] px-6">
         

          <div>
            <h2 className="text-sm font-black tracking-wider">
              EVENTVERSE
            </h2>
            <p className="mt-0.5 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              Administration
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-7">

          {NAV_GROUPS.map((group) => (
            <div key={group.label}>

              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-neutral-600">
                {group.label}
              </p>

              <div className="space-y-1">

                {group.items.map((item) => (
                  <NavItem
                    key={item.href}
                    item={item}
                    pathname={pathname}
                  />
                ))}

              </div>
            </div>
          ))}

        </nav>

        {/* ADMIN ACCOUNT */}
        <div className="border-t border-white/[0.07] p-4">
          <div className="flex items-center gap-3 rounded-xl bg-white/[0.035] p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B9D957] text-sm font-black text-black">
              A
            </div>

            <div>
              <p className="text-xs font-bold text-white">
                Administrator
              </p>
              <p className="mt-0.5 text-[10px] text-neutral-500">
                Full platform access
              </p>
            </div>

            <span className="ml-auto h-2 w-2 rounded-full bg-[#B9D957]" />
          </div>
        </div>
      </aside>

      {/* ==========================================
          MAIN CONTENT
      ========================================== */}

      <div className="lg:pl-64">

        {/* HEADER */}
        <header className="sticky top-0 z-30 flex min-h-[76px] items-center justify-between border-b border-white/[0.07] bg-[#090909]/90 px-4 backdrop-blur-xl sm:px-7">

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B9D957]">
              EVENTVERSE / ANALYTICS
            </p>

            <h1 className="mt-1 text-lg font-bold tracking-tight sm:text-xl">
              Command Center
            </h1>
          </div>

          <div className="flex items-center gap-3">

            <span className="hidden items-center gap-2 rounded-full border border-[#B9D957]/20 bg-[#B9D957]/[0.07] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#B9D957] sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-[#B9D957]" />
              Admin Mode
            </span>

            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#B9D957]/30 bg-[#B9D957]/10 text-xs font-bold text-[#B9D957]">
              AD
            </div>

          </div>
        </header>

        <div className="overflow-x-auto border-b border-white/[0.07] bg-[#101010] px-3 py-3 lg:hidden">

          <div className="flex min-w-max items-center gap-2">

            {NAV_GROUPS.flatMap((group) => group.items).map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/admin" &&
                  pathname.startsWith(`${item.href}/`));

              const Icon = item.icon;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-[#B9D957]/10 text-[#B9D957]"
                      : "text-neutral-500 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <Icon size={15} />
                  {item.name}
                </Link>
              );
            })}

          </div>
        </div>

        {/* PAGE */}
        <main className="mx-auto max-w-[1600px] space-y-6 p-4 sm:p-6 xl:p-8">

          {/* PAGE INTRO */}
          <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">

            <div>
              <div className="mb-3 flex items-center gap-2">
                <span className="h-2 w-2 animate-pulse rounded-full bg-[#B9D957]" />
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-500">
                  Platform performance
                </p>
              </div>

              <h2 className="text-2xl font-black tracking-tight sm:text-3xl">
                Analytics Overview
              </h2>

              <p className="mt-2 max-w-xl text-xs leading-5 text-neutral-500 sm:text-sm">
                Monitor students, published events, registrations
                and attendance across EventVerse.
              </p>
            </div>

            <Link
              href="/admin/events"
              className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#B9D957] px-4 py-3 text-xs font-bold text-black transition hover:bg-[#cce876]"
            >
              Manage Events
              <ArrowUpRight size={15} />
            </Link>

          </section>

          {/* ========================================
              KPI CARDS
          ======================================== */}

          <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

            {metrics.map((metric) => (
              <KpiCard
                key={metric.title}
                {...metric}
              />
            ))}

          </section>

          {/* ========================================
              CONTENT GRID
          ======================================== */}

          <section className="grid gap-5 2xl:grid-cols-3">

            {/* RECENT REGISTRATIONS */}
            <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-[#121212] 2xl:col-span-2">

              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/[0.07] p-5 sm:p-6">

                <div>
                  <h3 className="text-base font-bold">
                    Recent Registrations
                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">
                    Latest students registering for events
                  </p>
                </div>

                <Link
                  href="/admin/events"
                  className="flex items-center gap-1.5 text-xs font-bold text-[#B9D957] hover:text-white"
                >
                  Manage Events
                  <ArrowUpRight size={14} />
                </Link>

              </div>

              <div className="overflow-x-auto">

                <table className="w-full min-w-[680px] text-left text-sm">

                  <thead className="bg-white/[0.025] text-[10px] font-bold uppercase tracking-wider text-neutral-500">
                    <tr>
                      <th className="px-5 py-4">Student</th>
                      <th className="px-5 py-4">Event</th>
                      <th className="px-5 py-4">Attendance</th>
                      <th className="px-5 py-4">Registered</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/[0.06]">

                    {safeRegistrations.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-14 text-center"
                        >
                          <div className="flex flex-col items-center gap-3">
                            <TicketCheck className="h-8 w-8 text-neutral-600" />

                            <p className="text-sm font-semibold text-neutral-400">
                              No registrations yet
                            </p>

                            <p className="text-xs text-neutral-600">
                              New event registrations will appear here.
                            </p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      safeRegistrations.map((reg) => {
                        const attendance = getAttendanceMeta(reg);
                        const StatusIcon = attendance.icon;

                        return (
                          <tr
                            key={reg._id}
                            className="transition hover:bg-white/[0.025]"
                          >

                            {/* STUDENT */}
                            <td className="px-5 py-4">

                              <div className="flex items-center gap-3">

                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#242424] text-xs font-bold text-[#B9D957]">
                                  {getInitials(reg.userName)}
                                </div>

                                <div className="min-w-0">
                                  <p className="truncate text-xs font-bold text-white">
                                    {reg.userName || "Unknown Student"}
                                  </p>

                                  <p className="mt-1 max-w-[180px] truncate text-[10px] text-neutral-500">
                                    {reg.userEmail || "No email"}
                                  </p>
                                </div>

                              </div>
                            </td>

                            {/* EVENT */}
                            <td className="px-5 py-4">
                              <p className="max-w-[180px] truncate text-xs font-semibold text-neutral-200">
                                {reg.eventTitle || "Deleted Event"}
                              </p>

                              <p className="mt-1 text-[10px] text-neutral-500">
                                {reg.eventCity || "Location unavailable"}
                              </p>
                            </td>

                            {/* ATTENDANCE STATUS */}
                            <td className="px-5 py-4">

                              <span
                                className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[10px] font-bold ${attendance.className}`}
                              >
                                <StatusIcon size={12} />
                                {attendance.label}
                              </span>

                            </td>

                            {/* DATE */}
                            <td className="px-5 py-4">
                              <p className="text-xs text-neutral-400">
                                {formatDate(reg.createdAt)}
                              </p>
                            </td>

                          </tr>
                        );
                      })
                    )}

                  </tbody>
                </table>

              </div>

              <div className="border-t border-white/[0.06] px-5 py-3">
                <p className="text-[10px] text-neutral-600">
                  Showing the latest {safeRegistrations.length} registrations.
                </p>
              </div>

            </div>

            {/* RIGHT COLUMN */}
            <div className="space-y-5">

              {/* CATEGORY ANALYTICS */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#121212] p-5 sm:p-6">

                <div>
                  <h3 className="text-base font-bold">
                    Event Categories
                  </h3>

                  <p className="mt-1 text-xs text-neutral-500">
                    Published events by category
                  </p>
                </div>

                {chartCategories.length > 0 ? (
                  <>
                    <div className="mt-4 h-[220px] w-full">

                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>

                          <Pie
                            data={chartCategories}
                            cx="50%"
                            cy="50%"
                            innerRadius={58}
                            outerRadius={86}
                            paddingAngle={4}
                            dataKey="value"
                            nameKey="name"
                            stroke="none"
                          >
                            {chartCategories.map((category, index) => (
                              <Cell
                                key={category.name}
                                fill={COLORS[index % COLORS.length]}
                              />
                            ))}
                          </Pie>

                          <Tooltip
                            contentStyle={{
                              backgroundColor: "#181818",
                              border: "1px solid rgba(255,255,255,0.1)",
                              borderRadius: "12px",
                              color: "#fff",
                            }}
                            itemStyle={{ color: "#fff" }}
                          />

                        </PieChart>
                      </ResponsiveContainer>

                    </div>

                    <div className="mt-3 space-y-3">

                      {chartCategories.map((category, index) => (
                        <div
                          key={category.name}
                          className="flex items-center justify-between gap-3"
                        >

                          <div className="flex min-w-0 items-center gap-2">
                            <span
                              className="h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{
                                backgroundColor: COLORS[index % COLORS.length],
                              }}
                            />

                            <span className="truncate text-xs text-neutral-400">
                              {category.name}
                            </span>
                          </div>

                          <span className="text-xs font-bold text-white">
                            {formatNumber(category.value)}
                          </span>

                        </div>
                      ))}

                    </div>
                  </>
                ) : (
                  <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-center">
                    <CalendarDays className="h-8 w-8 text-neutral-600" />
                    <p className="text-xs font-semibold text-neutral-400">
                      No category data
                    </p>
                    <p className="text-[10px] text-neutral-600">
                      Published event categories will appear here.
                    </p>
                  </div>
                )}

              </div>

              {/* QUICK ACTIONS */}
              <div className="rounded-2xl border border-white/[0.07] bg-[#121212] p-5 sm:p-6">

                <h3 className="text-base font-bold">
                  Quick Actions
                </h3>

                <p className="mt-1 text-xs text-neutral-500">
                  Frequently used administration pages
                </p>

                <div className="mt-5 space-y-3">

                  <QuickAction
                    href="/admin/users"
                    title="Manage Users"
                    description="Students and administrator roles"
                    icon={Users}
                  />

                  <QuickAction
                    href="/admin/events"
                    title="Manage Events"
                    description="Schedules, dates and registrations"
                    icon={CalendarDays}
                  />

                  <QuickAction
                    href="/admin/ads"
                    title="Review Sponsorships"
                    description="Paid advertisement approvals"
                    icon={Megaphone}
                  />

                  <QuickAction
                    href="/events"
                    title="Browse Public Events"
                    description="View the student-facing event listing"
                    icon={GraduationCap}
                  />

                </div>

              </div>

            </div>

          </section>

          {/* ROUTE DIRECTORY */}
          <section className="rounded-2xl border border-white/[0.07] bg-[#121212] p-5 sm:p-6">

            <div className="mb-5">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#B9D957]">
                Navigation
              </p>

              <h3 className="mt-2 text-lg font-bold">
                All Admin Routes
              </h3>

              <p className="mt-1 text-xs text-neutral-500">
                Direct access to the confirmed platform administration pages.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

              {NAV_GROUPS.flatMap((group) => group.items)
                .map((item) => {
                  const Icon = item.icon;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center justify-between rounded-xl border border-white/[0.07] bg-[#191919] p-4 transition hover:border-[#B9D957]/30 hover:bg-[#202020]"
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4 w-4 text-[#B9D957]" />

                        <span className="text-xs font-semibold text-neutral-300">
                          {item.name}
                        </span>
                      </div>

                      <ArrowUpRight className="h-4 w-4 text-neutral-600" />
                    </Link>
                  );
                })}

            </div>

          </section>

          {/* FOOTER */}
          <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-5 text-[10px] text-neutral-600">
            <span>EVENTVERSE ADMINISTRATION</span>
            <span>Platform Analytics & Operations</span>
          </footer>

        </main>
      </div>
    </div>
  );
}


function NavItem({ item, pathname }) {
  const Icon = item.icon;

  const active =
    pathname === item.href ||
    (item.href !== "/admin" &&
      pathname.startsWith(`${item.href}/`));

  return (
    <Link
      href={item.href}
      className={`relative flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold transition ${
        active
          ? "bg-[#B9D957]/10 text-[#B9D957]"
          : "text-neutral-500 hover:bg-white/[0.04] hover:text-white"
      }`}
    >
      {active && (
        <span className="absolute bottom-2 left-0 top-2 w-0.5 rounded-r-full bg-[#B9D957]" />
      )}

      <Icon size={17} />
      {item.name}

      {active && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#B9D957]" />
      )}
    </Link>
  );
}


function KpiCard({
  title,
  value,
  icon: Icon,
  detail,
  color,
}) {
  const styles = {
    lime: "bg-[#B9D957]/10 text-[#B9D957]",
    blue: "bg-blue-400/10 text-blue-400",
    purple: "bg-purple-400/10 text-purple-400",
    orange: "bg-orange-400/10 text-orange-400",
  };

  return (
    <div className="group rounded-2xl border border-white/[0.07] bg-[#121212] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20">

      <div className="flex items-center justify-between">

        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">
          {title}
        </p>

        <div className={`rounded-xl p-2.5 ${styles[color]}`}>
          <Icon size={19} />
        </div>

      </div>

      <h3 className="mt-6 text-3xl font-black tracking-tight text-white">
        {typeof value === "number"
          ? formatNumber(value)
          : value}
      </h3>

      <div className="mt-2 flex items-center justify-between gap-2">
        <p className="text-[10px] text-neutral-500">
          {detail}
        </p>

        <ArrowUpRight
          size={15}
          className="shrink-0 text-neutral-700 transition group-hover:text-[#B9D957]"
        />
      </div>

    </div>
  );
}

// --------------------------------------------------
// QUICK ACTION
// --------------------------------------------------

function QuickAction({
  href,
  title,
  description,
  icon: Icon,
}) {
  return (
    <Link
      href={href}
      className="group flex items-center justify-between rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5 transition hover:border-[#B9D957]/30 hover:bg-[#B9D957]/[0.04]"
    >
      <div className="flex items-center gap-3">

        <div className="rounded-lg bg-white/[0.05] p-2.5 transition group-hover:bg-[#B9D957]/10">
          <Icon
            size={17}
            className="text-neutral-400 transition group-hover:text-[#B9D957]"
          />
        </div>

        <div>
          <p className="text-xs font-bold text-neutral-200 group-hover:text-white">
            {title}
          </p>

          <p className="mt-1 text-[10px] text-neutral-500">
            {description}
          </p>
        </div>

      </div>

      <ArrowUpRight
        size={15}
        className="text-neutral-600 transition group-hover:text-[#B9D957]"
      />
    </Link>
  );
}
