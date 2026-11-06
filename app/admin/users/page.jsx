
import {
  
  Users,
    Shield,
    UserPlus,
    ShieldCheck,
  Activity,
  ArrowUpRight,GraduationCap,
} from "lucide-react";


import { dbConnect } from "@/lib/db";
import User from "@/models/User";
import UsersTable from "./_UsersTable";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "../_AdminSidebar";
export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
//   await dbConnect();

  const session = await auth();
   if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "ADMIN") {
    redirect("/dashboard");
  }
  await dbConnect();

  const currentUserId = session?.user?.id || "";

  const now = new Date();
  const thirtyDaysAgo = new Date(
    now.getTime() - 30 * 24 * 60 * 60 * 1000
  );

  const [
    students,
    clubAdmins,
    admins,
    total,
    activeUsers,
    newUsers,
  ] = await Promise.all([
    User.countDocuments({ role: "STUDENT" }),
    User.countDocuments({ role: "CLUB_ADMIN" }),
    User.countDocuments({ role: "ADMIN" }),
    User.countDocuments(),
    User.countDocuments({
      lastLoginAt: { $gte: thirtyDaysAgo },
    }),
    User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo },
    }),
  ]);

  const roleStats = [
    {
      label: "Students",
      value: students,
      icon: GraduationCap,
      color: "text-[#B9D957]",
      bg: "bg-[#B9D957]/10",
      bar: "bg-[#B9D957]",
    },
    {
      label: "Club admins",
      value: clubAdmins,
      icon: ShieldCheck,
      color: "text-blue-400",
      bg: "bg-blue-400/10",
      bar: "bg-blue-400",
    },
    {
      label: "Admins",
      value: admins,
      icon: Shield,
      color: "text-purple-400",
      bg: "bg-purple-400/10",
      bar: "bg-purple-400",
    },
  ];

  return (
   <div className="min-h-screen overflow-x-hidden bg-[#090909] text-white">
        <AdminSidebar/>

    <main className="min-h-screen w-full px-4 py-6 sm:px-6 lg:ml-64 lg:w-[calc(100%-16rem)] lg:px-8">
        <div className="mx-auto max-w-[1500px] space-y-8">
      

        {/* HEADER */}
        <header className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#B9D957]" />
              <p className="text-[11px] font-bold uppercase tracking-[0.25em] text-[#B9D957]">
                EventVerse / Administration
              </p>
            </div>

            <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Users & Access
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-neutral-400">
              Manage students, club administrators and platform permissions
              from one central dashboard.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3">
            <Activity className="h-4 w-4 text-[#B9D957]" />
            <div>
              <p className="text-xs font-semibold text-white">
                Platform activity
              </p>
              <p className="text-[11px] text-neutral-500">
                Last 30 days
              </p>
            </div>
          </div>
        </header>

        {/* KPI CARDS */}
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            label="Total users"
            value={total}
            icon={Users}
            description="All registered accounts"
            accent="lime"
          />

          <MetricCard
            label="Students"
            value={students}
            icon={GraduationCap}
            description="Student accounts"
            accent="lime"
          />

          <MetricCard
            label="Club admins"
            value={clubAdmins}
            icon={ShieldCheck}
            description="Club management access"
            accent="blue"
          />

          <MetricCard
            label="Platform admins"
            value={admins}
            icon={Shield}
            description="Full platform access"
            accent="purple"
          />
        </section>

        {/* ACTIVITY + ROLE DISTRIBUTION */}
        <section className="grid gap-4 lg:grid-cols-3">

          {/* ACTIVITY */}
          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 lg:col-span-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  User activity
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Account activity overview
                </p>
              </div>

              <Activity className="h-5 w-5 text-[#B9D957]" />
            </div>

            <div className="mt-6 space-y-5">
              <ActivityRow
                label="Active users"
                value={activeUsers}
                icon={Activity}
                color="text-[#B9D957]"
              />

              <ActivityRow
                label="New registrations"
                value={newUsers}
                icon={UserPlus}
                color="text-blue-400"
              />
            </div>

            <div className="mt-6 border-t border-white/10 pt-4">
              <p className="text-[11px] leading-5 text-neutral-500">
                Active users are accounts with a recorded login in the
                last 30 days.
              </p>
            </div>
          </div>

          {/* ROLE DISTRIBUTION */}
          <div className="rounded-2xl border border-white/10 bg-[#141414] p-5 lg:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-white">
                  Role distribution
                </p>
                <p className="mt-1 text-xs text-neutral-500">
                  Platform account breakdown
                </p>
              </div>

              <span className="rounded-lg bg-white/[0.05] px-3 py-1.5 text-xs text-neutral-400">
                {total} accounts
              </span>
            </div>

            <div className="mt-7 space-y-6">
              {roleStats.map((role) => {
                const percentage =
                  total > 0
                    ? (role.value / total) * 100
                    : 0;

                const Icon = role.icon;

                return (
                  <div key={role.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`rounded-lg p-2 ${role.bg}`}>
                          <Icon className={`h-4 w-4 ${role.color}`} />
                        </div>

                        <span className="text-sm font-medium text-neutral-300">
                          {role.label}
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-sm font-bold text-white">
                          {role.value.toLocaleString("en-IN")}
                        </span>
                        <span className="ml-2 text-xs text-neutral-500">
                          {percentage.toFixed(1)}%
                        </span>
                      </div>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${role.bar}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* USER TABLE */}
        <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#141414]">
          <div className="flex flex-col justify-between gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-bold text-white">
                All users
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                Search accounts and manage platform roles.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <span className="h-2 w-2 rounded-full bg-[#B9D957]" />
              {total.toLocaleString("en-IN")} accounts
            </div>
          </div>

          <div className="p-3 sm:p-5">
            <UsersTable currentUserId={currentUserId} />
          </div>
        </section>

        {/* FOOTER */}
        <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-white/10 pt-5 text-[11px] text-neutral-600">
          <p>EVENTVERSE ADMINISTRATION</p>
          <p>Role-based access management</p>
        </footer>

      </div>
    </main>
    </div>
  );
}

function MetricCard({
  label,
  value,
  icon: Icon,
  description,
  accent,
}) {
  const styles = {
    lime: {
      icon: "bg-[#B9D957]/10 text-[#B9D957]",
      glow: "group-hover:border-[#B9D957]/30",
    },
    blue: {
      icon: "bg-blue-400/10 text-blue-400",
      glow: "group-hover:border-blue-400/30",
    },
    purple: {
      icon: "bg-purple-400/10 text-purple-400",
      glow: "group-hover:border-purple-400/30",
    },
  };

  const style = styles[accent];

  return (
    <div
      className={`group rounded-2xl border border-white/10 bg-[#141414] p-5 transition duration-300 hover:-translate-y-1 ${style.glow}`}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-wider text-neutral-500">
          {label}
        </p>

        <div className={`rounded-xl p-2.5 ${style.icon}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-5 text-3xl font-bold tracking-tight text-white">
        {value.toLocaleString("en-IN")}
      </p>

      <div className="mt-2 flex items-center justify-between">
        <p className="text-xs text-neutral-500">
          {description}
        </p>

        <ArrowUpRight className="h-4 w-4 text-neutral-600 transition group-hover:text-white" />
      </div>
    </div>
  );
}

function ActivityRow({ label, value, icon: Icon, color }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-white/[0.05] p-2.5">
          <Icon className={`h-4 w-4 ${color}`} />
        </div>

        <span className="text-sm text-neutral-400">
          {label}
        </span>
      </div>

      <span className="text-xl font-bold text-white">
        {value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

