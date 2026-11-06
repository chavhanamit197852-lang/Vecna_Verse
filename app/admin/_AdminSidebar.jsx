
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Megaphone,
  Activity,
  ExternalLink,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";

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

function NavItem({ item, pathname }) {
  const Icon = item.icon;

  const active =
    pathname === item.href ||
    (item.href !== "/admin" &&
      pathname.startsWith(`${item.href}/`));

  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={`group relative flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-semibold transition-all duration-200 ${
        active
          ? "bg-[#B9D957]/10 text-[#B9D957]"
          : "text-neutral-500 hover:bg-white/[0.05] hover:text-white"
      }`}
    >
      {active && (
        <span className="absolute bottom-2 left-0 top-2 w-[3px] rounded-r-full bg-[#B9D957]" />
      )}

      <Icon
        size={18}
        className={
          active
            ? "text-[#B9D957]"
            : "text-neutral-500 group-hover:text-white"
        }
      />

      <span>{item.name}</span>

      {active && (
        <ChevronRight
          size={14}
          className="ml-auto text-[#B9D957]"
        />
      )}
    </Link>
  );
}

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <>
      {/* DESKTOP SIDEBAR */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-white/[0.07] bg-[#101010] lg:flex">

        {/* BRAND */}
        <Link
          href="/admin"
          className="flex h-20 shrink-0 items-center gap-3 border-b border-white/[0.07] px-6"
        >
         

          <div>
            <h2 className="text-sm font-black tracking-[0.12em] text-white">
              EVENTVERSE
            </h2>

            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.2em] text-neutral-500">
              Administration
            </p>
          </div>
        </Link>

        {/* NAVIGATION */}
        <nav className="flex-1 space-y-7 overflow-y-auto px-4 py-7">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-neutral-600">
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

        {/* ADMIN PROFILE */}
        <div className="shrink-0 border-t border-white/[0.07] p-4">
          <div className="flex items-center gap-3 rounded-xl border border-white/[0.06] bg-white/[0.035] p-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#B9D957] text-sm font-black text-black">
              A
            </div>

            <div className="min-w-0">
              <p className="text-xs font-bold text-white">
                Administrator
              </p>

              <p className="mt-1 text-[10px] text-neutral-500">
                Full platform access
              </p>
            </div>

            <span className="ml-auto h-2 w-2 shrink-0 rounded-full bg-[#B9D957]" />
          </div>
        </div>
      </aside>

      {/* MOBILE NAVIGATION */}
      <div className="sticky top-0 z-50 border-b border-white/[0.07] bg-[#101010]/95 px-3 py-3 backdrop-blur-xl lg:hidden">

        <div className="mb-3 flex items-center gap-2">
          

          <span className="text-xs font-black tracking-wider text-white">
            EVENTVERSE
          </span>

          <span className="ml-auto rounded-full bg-[#B9D957]/10 px-2.5 py-1 text-[9px] font-bold uppercase text-[#B9D957]">
            Admin
          </span>
        </div>

        <nav className="flex gap-2 overflow-x-auto pb-1">
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
                className={`flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[11px] font-semibold transition ${
                  active
                    ? "bg-[#B9D957]/10 text-[#B9D957]"
                    : "bg-white/[0.035] text-neutral-500"
                }`}
              >
                <Icon size={14} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}
