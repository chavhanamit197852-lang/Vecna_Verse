"use client";
import ClubSwitcher from "./ClubSwitcher";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Calendar, 
  ScanLine, 
  Users, 
  Handshake, 
  Megaphone,
  LogOut,
  Settings
} from "lucide-react";
import { signOut } from "next-auth/react";

export default function ClubSidebar() {
  const pathname = usePathname();

  const menuItems = [
    { name: "Analytics", href: "/club/analytics", icon: LayoutDashboard },
    { name: "Manage Events", href: "/club/events", icon: Calendar },
    { name: "Members & Committee", href: "/club/members", icon: Users },
    { name: "My Club", href: "/club/member", icon: Users },
    { name: "QR Scanner", href: "/club/scanner", icon: ScanLine },
    { name: "Committee Workspace", href: "/club/committee", icon: Users },
    { name: "Attendance", href: "/club/attendance", icon: Users },
    { name: "Sponsor proposals", href: "/club/sponsors", icon: Handshake },
    { name: "Club advertisements", href: "/club/ads", icon: Megaphone },
    { name: "Membership Settings", href: "/club/settings", icon: Settings },
  ];

  return (
    <aside className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-white/5 bg-[#0c0c0e]">
      {/* Brand / Logo */}
    <ClubSwitcher />

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        <p className="mb-2 px-2 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
          Club Management
        </p>
        {menuItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive
                  ? "bg-yellow-400/10 text-yellow-400"
                  : "text-zinc-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              <Icon size={18} className={isActive ? "text-yellow-400" : "text-zinc-500"} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer / Settings */}
      <div className="border-t border-white/5 p-4 space-y-1">
        
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-red-500/70 transition-colors hover:bg-red-500/10 hover:text-red-400"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </aside>
  );
}