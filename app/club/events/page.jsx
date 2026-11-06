import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import Club from "@/models/Club";
import ClubMember from "@/models/ClubMember";
import EventAdminForm from "@/components/EventAdminForm";
import PublishEvent from "@/components/PublishEvent";
import { MapPin, Calendar, Award, Image as ImageIcon, ScanLine } from "lucide-react";

export default async function ClubEventsPage() {
  const session = await auth();
  
  // 1. Safety check
  if (!session?.user) {
    redirect("/login");
  }

  await dbConnect();

  // Resolve clubs from ClubMember, not User.clubId.
  const isAdmin = session.user.role === "ADMIN";
  const memberships = isAdmin ? [] : await ClubMember.find({ userId: session.user.id, role: "ADMIN", status: "ACTIVE" }).select("clubId").lean();
  const clubIds = memberships.map((item) => item.clubId);
  if (!isAdmin && !clubIds.length) redirect("/dashboard");
  const clubs = isAdmin ? await Club.find().select("name institution").sort({ name: 1 }).lean() : await Club.find({ _id: { $in: clubIds } }).select("name institution").sort({ name: 1 }).lean();
  const query = isAdmin ? {} : { clubId: { $in: clubIds } };
  const events = await Event.find(query).sort({ createdAt: -1 }).lean();

  return (
    <div className="p-6 md:p-10">
      <div className="mx-auto max-w-6xl space-y-10">
        
        {/* ─── Header ─── */}
        <header>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-yellow-400">
            Club Workspace
          </p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
            Manage Events
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Create new events, set map locations, and track attendance.
          </p>
        </header>

        {/* ─── Create Form ─── */}
        <EventAdminForm clubs={JSON.parse(JSON.stringify(clubs.map((club) => ({ ...club, _id: String(club._id) }))))} allowPlatformEvents={isAdmin} />

        {/* ─── Events Grid ─── */}
        <div>
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Your Events ({events.length})
            </h2>
            <Link 
              href="/club/scanner" 
              className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-white/10"
            >
              <ScanLine size={16} className="text-yellow-400" /> 
              Check-in Desk
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {events.map((e) => (
              <div 
                key={String(e._id)} 
                className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#121214] transition-all hover:border-yellow-400/30"
              >
                {/* Cover Image */}
                <div className="relative h-40 w-full overflow-hidden bg-zinc-900">
                  {e.coverImage ? (
                    <img 
                      src={e.coverImage} 
                      alt={e.title} 
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" 
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-zinc-600">
                      <ImageIcon size={32} />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute left-3 top-3 flex gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-md ${
                      e.status === "PUBLISHED" ? "bg-emerald-500/80 text-white" 
                      : e.status === "DRAFT" ? "bg-yellow-400/80 text-black"
                      : e.status === "COMPLETED" ? "bg-blue-500/80 text-white"
                      : "bg-red-500/80 text-white"
                    }`}>
                      {e.status}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="line-clamp-1 text-lg font-bold text-white">{e.title}</h3>
                  <p className="mt-1 text-xs font-semibold text-yellow-400">{e.category}</p>
                  
                  <div className="mt-4 space-y-2 text-xs text-zinc-400">
                    <div className="flex items-center gap-2">
                      <Calendar size={14} className="text-zinc-500" />
                      {new Date(e.startsAt).toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" })}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-zinc-500" />
                      {e.venue || "Venue TBA"}, {e.city}
                    </div>
                    <div className="flex items-center gap-2">
                      <Award size={14} className="text-zinc-500" />
                      {e.aictePoints} AICTE Points
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-auto flex items-center justify-between border-t border-white/5 pt-4 mt-6">
                    <span className="text-xs font-semibold text-zinc-500">
                      {e.ticketPrice > 0 ? `₹${e.ticketPrice} / ticket` : "Free"}
                    </span>
                    
                    {/* Pass the status so the button renders correctly */}
                    <PublishEvent id={String(e._id)} status={e.status} />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {events.length === 0 && (
            <div className="rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-20 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-zinc-500">
                <Calendar size={28} />
              </div>
              <p className="mt-4 text-lg font-bold text-white">No events yet</p>
              <p className="mt-1 text-sm text-zinc-500">Create your first event using the form above.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
