
import Link from "next/link";
import { redirect } from "next/navigation";


import {
  LayoutDashboard,
  CalendarDays,
  Users,
  Megaphone,
  UserCog,
  ScanLine,
  GraduationCap,
  Award,
  FolderOpen,
  Globe,
  Code2,
  Trophy,
  Handshake,
  Home,
  LogIn,
  UserPlus,
  TicketCheck,
  ShieldCheck,
    MapPinned,  Achievement,  Clock3,  CheckCircle2,  ArrowUpRight,Activity
} from "lucide-react";

import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";

import Event from "@/models/Event";
import User from "@/models/User";
import SponsorAd from "@/models/SponsorAd";

export const dynamic = "force-dynamic";





const ADMIN_ROUTE_GROUPS = [
  {
    title: "Administration",
    description: "Complete platform management",
    routes: [
      {
        name: "Admin overview",
        path: "/admin",
        href: "/admin",
        icon: LayoutDashboard,
        description: "Platform control center",
      },
      {
        name: "Event management",
        path: "/admin/events",
        href: "/admin/events",
        icon: CalendarDays,
        description: "Create, edit, publish and extend event deadlines",
      },
      {
        name: "User management",
        path: "/admin/users",
        href: "/admin/users",
        icon: Users,
        description: "Students, club admins and role permissions",
      },
      {
        name: "Advertisement review",
        path: "/admin/ads",
        href: "/admin/ads",
        icon: Megaphone,
        description: "Review paid sponsorship advertisements",
      },
      {
        name: "Club ad review",
        path: "/admin/club-ads",
        href: "/admin/club-ads",
        icon: Megaphone,
        description: "Approve paid promotional campaigns created by clubs",
      },
    ],
  },

  {
    title: "Club operations",
    description: "Club and event logistics",
    routes: [
      {
        name: "Club dashboard",
        path: "/club",
        href: "/club",
        icon: LayoutDashboard,
        description: "Club activity and event overview",
      },
      {
        name: "Club events",
        path: "/club/events",
        href: "/club/events",
        icon: CalendarDays,
        description: "Create and manage club events",
      },
      {
        name: "QR check-in desk",
        path: "/club/checkin",
        href: "/club/checkin",
        icon: ScanLine,
        description: "Scan or enter student ticket tokens",
      },
    ],
  },

  {
    title: "Student workspace",
    description: "Student profiles and participation",
    routes: [
      {
        name: "Student dashboard",
        path: "/dashboard",
        href: "/dashboard",
        icon: GraduationCap,
        description: "Student dashboard and account overview",
      },
      {
        name: "Attendance & tickets",
        path: "/dashboard/attendance",
        href: "/dashboard/attendance",
        icon: TicketCheck,
        description: "Event registrations and QR tickets",
      },
      {
        name: "AICTE tracker",
        path: "/dashboard/aicte",
        href: "/dashboard/aicte",
        icon: Award,
        description: "Verified student activity points",
      },
      {
        name: "Student portfolio",
        path: "/dashboard/portfolio",
        href: "/dashboard/portfolio",
        icon: FolderOpen,
        description: "Achievements, certificates and event notes",
      },
    ],
  },

  {
    title: "Communities & discovery",
    description: "Public EventVerse sections",
    routes: [
      {
        name: "Homepage",
        path: "/",
        href: "/",
        icon: Home,
        description: "Public EventVerse homepage",
      },
      {
        name: "Discover events",
        path: "/events",
        href: "/events",
        icon: CalendarDays,
        description: "Browse published events",
      },
      {
        name: "Event details",
        path: "/events/[slug]",
        href: "/events",
        icon: Globe,
        description: "Open an individual event from Discover events",
      },
      {
        name: "Hackathon team finder",
        path: "/communities/hackathon",
        href: "/communities/hackathon",
        icon: Code2,
        description: "Find teammates and manage applications",
      },
      {
        name: "LeetCode Arena",
        path: "/communities/leetcode",
        href: "/communities/leetcode",
        icon: Trophy,
        description: "Coding leaderboard",
      },
      {
        name: "Sponsorship marketplace",
        path: "/sponsors",
        href: "/sponsors",
        icon: Handshake,
        description: "Sponsors discover and fund campus clubs",
      },
    ],
  },


];


export default async function AdminPage() {
  // Authentication and authorization
  const session = await auth();
console.log("ADMIN SESSION:", {
  id: session?.user?.id,
  role: session?.user?.role,
  email: session?.user?.email,
});
  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    
    redirect("/");

    console.log(session.user.role);
  }

  await dbConnect();

  const thirtyDaysAgo = new Date( 
    Date.now() - 30 * 24 * 60 * 60 * 1000
  );
console.log(session.user)
  const [
    totalEvents,
    publishedEvents,
    totalUsers,
    students,
    clubAdmins,
    admins,
    newUsers,
    pendingAds,
  ] = await Promise.all([
    Event.countDocuments(),

    Event.countDocuments({
      isPublished: true,
    }),

    User.countDocuments(),

    User.countDocuments({
      role: "STUDENT",
    }),

    User.countDocuments({
      role: "CLUB_ADMIN",
    }),

    User.countDocuments({
      role: "ADMIN",
    }),

    User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    }),

    SponsorAd.countDocuments({
      status: "PENDING_REVIEW",
    }),
  ]);

  const draftEvents = Math.max(0, totalEvents - publishedEvents);

  const metrics = [
    {
      label: "Total events",
      value: totalEvents,
      detail: `${publishedEvents} published`,
      icon: CalendarDays,
      color: "lime",
    },
    {
      label: "Total users",
      value: totalUsers,
      detail: `${newUsers} joined in 30 days`,
      icon: Users,
      color: "blue",
    },
    {
      label: "Club admins",
      value: clubAdmins,
      detail: `${admins} platform admins`,
      icon: ShieldCheck,
      color: "purple",
    },
    {
      label: "Pending sponsorships",
      value: pendingAds,
      detail: "Awaiting admin review",
      icon: Megaphone,
      color: "orange",
    },
  ];

  return (
    <main className="min-h-screen bg-[#090909] px-4 py-7 text-white sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1500px] space-y-8">

        {/* HEADER */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#B9D957]" />
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B9D957]">
                EventVerse / Control Center
              </p>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Platform overview
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-500">
              Monitor events, students, club administrators and
              sponsorship operations from one place.
            </p>
          </div>

          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#141414] px-4 py-3">
            <div className="rounded-lg bg-[#B9D957]/10 p-2">
              <LayoutDashboard className="h-4 w-4 text-[#B9D957]" />
            </div>

            <div>
              <p className="text-xs font-semibold text-white">
                Administrator access
              </p>
              <p className="text-[10px] text-neutral-500">
                Full platform permissions
              </p>
            </div>
          </div>
        </header>

        {/* KPI CARDS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </section>

        {/* PLATFORM BREAKDOWN */}
        <section className="grid gap-4 lg:grid-cols-3">

          {/* USER DISTRIBUTION */}
          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">
                  User distribution
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Breakdown by account permissions
                </p>
              </div>

              <Users className="h-5 w-5 text-[#B9D957]" />
            </div>

            <div className="mt-7 space-y-6">
              <RoleBar
                label="Students"
                value={students}
                total={totalUsers}
                color="bg-[#B9D957]"
              />

              <RoleBar
                label="Club administrators"
                value={clubAdmins}
                total={totalUsers}
                color="bg-blue-400"
              />

              <RoleBar
                label="Platform administrators"
                value={admins}
                total={totalUsers}
                color="bg-purple-400"
              />
            </div>

            <div className="mt-7 flex flex-wrap gap-3 border-t border-white/10 pt-5">
              <span className="rounded-lg bg-white/[0.04] px-3 py-2 text-xs text-neutral-400">
                {totalUsers.toLocaleString("en-IN")} total accounts
              </span>

              <span className="rounded-lg bg-[#B9D957]/10 px-3 py-2 text-xs text-[#B9D957]">
                +{newUsers.toLocaleString("en-IN")} new users
              </span>
            </div>
          </div>

          {/* EVENT STATUS */}
          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-bold text-white">
                  Event overview
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Publication status
                </p>
              </div>

              <Activity className="h-5 w-5 text-[#B9D957]" />
            </div>

            <div className="mt-6">
              <p className="text-4xl font-bold tracking-tight">
                {totalEvents.toLocaleString("en-IN")}
              </p>
              <p className="mt-1 text-xs text-neutral-500">
                Total created events
              </p>
            </div>

            <div className="mt-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#B9D957]" />
                  <span className="text-xs text-neutral-400">
                    Published
                  </span>
                </div>

                <span className="text-sm font-bold text-white">
                  {publishedEvents}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock3 className="h-4 w-4 text-orange-400" />
                  <span className="text-xs text-neutral-400">
                    Unpublished
                  </span>
                </div>

                <span className="text-sm font-bold text-white">
                  {draftEvents}
                </span>
              </div>
            </div>

            <Link
              href="/admin/events"
              className="mt-7 flex w-full items-center justify-center gap-2 rounded-xl bg-[#B9D957] px-4 py-3 text-xs font-bold text-black transition hover:bg-[#d0ed70]"
            >
              Manage events
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        {/* MANAGEMENT MODULES */}
        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B9D957]">
                Platform management
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Manage your platform
              </h2>

              <p className="mt-1 text-xs text-neutral-500">
                Access the different administrative modules.
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <ManagementCard
              href="/admin/events"
              icon={CalendarDays}
              title="Event management"
              description="Create, publish, edit events and extend registration deadlines."
              label="Events"
            />

            <ManagementCard
              href="/admin/users"
              icon={Users}
              title="User management"
              description="View students, promote club admins and manage account access."
              label="Users & roles"
            />

            <ManagementCard
              href="/admin/ads"
              icon={Megaphone}
              title="Sponsorship management"
              description="Review sponsor submissions and approve verified advertisements."
              label={`${pendingAds} pending reviews`}
            />

            <ManagementCard
              href="/admin/users"
              icon={UserCog}
              title="Club administrators"
              description="Manage club-admin accounts and their permissions."
              label={`${clubAdmins} club admins`}
            />

            <ManagementCard
              href="/admin/events"
              icon={MapPinned}
              title="Event operations"
              description="Access event management for schedules, deadlines and logistics."
              label="Event operations"
            />

            <ManagementCard
              href="/admin/events"
              icon={TicketCheck}
              title="Registration & attendance"
              description="Manage event registrations and access event check-in operations."
              label="Attendance"
            />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-5 text-[10px] uppercase tracking-wider text-neutral-600">
          <span>EventVerse administration</span>
          <span>Platform control center</span>
        </footer>

      </div>
    </main>
  );
}


// --------------------------------------------------
// METRIC CARD
// --------------------------------------------------

function MetricCard({ label, value, detail, icon: Icon, color }) {
  const styles = {
    lime: "bg-[#B9D957]/10 text-[#B9D957]",
    blue: "bg-blue-400/10 text-blue-400",
    purple: "bg-purple-400/10 text-purple-400",
    orange: "bg-orange-400/10 text-orange-400",
  };

  return (
    <div className="group rounded-2xl border border-white/10 bg-[#141414] p-5 transition duration-300 hover:-translate-y-1 hover:border-white/20">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">
          {label}
        </p>

        <div className={`rounded-xl p-2.5 ${styles[color]}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-6 text-3xl font-bold tracking-tight text-white">
        {value.toLocaleString("en-IN")}
      </p>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-neutral-500">{detail}</p>
        <ArrowUpRight className="h-4 w-4 text-neutral-700 transition group-hover:text-[#B9D957]" />
      </div>
    </div>
  );
}


// --------------------------------------------------
// ROLE DISTRIBUTION BAR
// --------------------------------------------------

function RoleBar({ label, value, total, color }) {
  const percentage =
    total > 0 ? (value / total) * 100 : 0;

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium text-neutral-400">
          {label}
        </span>

        <span className="text-xs font-bold text-white">
          {value.toLocaleString("en-IN")}
          <span className="ml-2 font-normal text-neutral-500">
            {percentage.toFixed(1)}%
          </span>
        </span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}


// --------------------------------------------------
// MANAGEMENT CARD
// --------------------------------------------------

function ManagementCard({
    href,
}) {
  return (
    


<section className="space-y-6">

  <div>
    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#B9D957]">
      Navigation / All routes
    </p>

    <h2 className="mt-2 text-xl font-bold text-white">
      Platform route directory
    </h2>

    <p className="mt-1 text-xs text-neutral-500">
      Explore all registered EventVerse sections and management pages.
    </p>
  </div>

  {ADMIN_ROUTE_GROUPS.map((group) => (

    <div
      key={group.title}
      className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]"
    >

      {/* GROUP HEADER */}
      <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">

        <div>
          <h3 className="text-sm font-bold text-white">
            {group.title}
          </h3>

          <p className="mt-1 text-xs text-neutral-500">
            {group.description}
          </p>
        </div>

        <span className="rounded-lg bg-white/[0.05] px-3 py-1.5 text-[10px] text-neutral-400">
          {group.routes.length} routes
        </span>

      </div>

      {/* ROUTES */}
      <div className="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">

        {group.routes.map((route) => {

          const Icon = route.icon;

          return (
            <Link
              key={route.path}
              href={route.href}
              className="group rounded-xl border border-white/[0.07] bg-[#1A1A1A] p-4 transition-all duration-300 hover:-translate-y-1 hover:border-[#B9D957]/40 hover:bg-[#202020]"
            >

              <div className="flex items-center justify-between">

                <div className="rounded-xl border border-white/10 bg-white/[0.04] p-3 transition group-hover:border-[#B9D957]/20 group-hover:bg-[#B9D957]/10">

                  <Icon className="h-5 w-5 text-neutral-400 transition group-hover:text-[#B9D957]" />

                </div>

                <ArrowUpRight className="h-4 w-4 text-neutral-600 transition group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-[#B9D957]" />

              </div>

              <h4 className="mt-4 text-sm font-bold text-white">
                {route.name}
              </h4>

              <p className="mt-2 min-h-10 text-xs leading-5 text-neutral-500">
                {route.description}
              </p>

              <div className="mt-4 border-t border-white/[0.06] pt-3">

                <code className="text-[10px] text-[#B9D957]">
                  {route.path}
                </code>

              </div>

            </Link>
          );

        })}

      </div>

    </div>

  ))}

</section>

  );
}
