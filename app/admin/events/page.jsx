import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import Club from "@/models/Club";
import EventAdminForm from "@/components/EventAdminForm";
import PublishEvent from "@/components/PublishEvent";
// 1. Removed the invalid 'Ad' icon
import { MapPin, Calendar, Award, Image as ImageIcon } from "lucide-react";
import AdminSidebar from "../_AdminSidebar";

export default async function AdminEventsPage() {
  await dbConnect();
  const [events, clubs] = await Promise.all([
    Event.find().populate("clubId", "name").sort({ createdAt: -1 }).lean(),
    Club.find().select("name institution").sort({ name: 1 }).lean(),
  ]);

  return (
    // 2. Changed to a flex container so the sidebar sits on the left
    <div className="flex min-h-screen bg-[#09090b] text-white">
      
      {/* Sidebar stays fixed on the left */}
      <AdminSidebar />

      {/* 3. Main Content Area (pushed right to make room for the sidebar) */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10 ml-20"> 
        <div className="mx-auto max-w-6xl space-y-10">
          
          {/* Header */}
          <header>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-yellow-400">Admin</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">Manage Events</h1>
            <p className="mt-2 text-sm text-zinc-400">
              Create new events, set exact map locations, and publish them to the campus.
            </p>
          </header>

          {/* Create Form (This includes the map picker and image upload) */}
          <EventAdminForm clubs={JSON.parse(JSON.stringify(clubs.map((club) => ({ ...club, _id: String(club._id) }))))} allowPlatformEvents />

          {/* Events Grid */}
          <div>
            <h2 className="mb-6 text-xl font-bold text-white">All Events ({events.length})</h2>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((e) => (
                <div key={String(e._id)} className="group relative flex flex-col overflow-hidden rounded-3xl border border-white/5 bg-[#121214] transition-all hover:border-yellow-400/30">
                  
                  {/* Cover Image Thumbnail */}
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
                        e.status === "PUBLISHED" ? "bg-emerald-500/80 text-white" : "bg-yellow-400/80 text-black"
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

                    {/* Action Area */}
                    <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                      <span className="text-xs font-semibold text-zinc-500">
                        By {e.clubId?.name || "Admin"}
                      </span>
                      
                      {e.status === "DRAFT" ? (
                        <PublishEvent id={String(e._id)} />
                      ) : (
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">
                          Live
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {events.length === 0 && (
              <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 py-20 text-center">
                <p className="text-zinc-500">No events found. Create your first one above.</p>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
export const dynamic = "force-dynamic";
