import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Registration from "@/models/Registration"; // or Attendance, depending on your model name
import { ticketQr } from "@/lib/qr";
import { 
  MapPin, Calendar, Award, CheckCircle2, 
  Clock, ArrowRight, Ticket, Download 
} from "lucide-react";

export default async function TicketsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  await dbConnect();

  // 1. Fetch tickets
  const rows = await Registration.find({ userId: session.user.id, status: { $in: ["REGISTERED", "CHECKED_IN"] } })
    .select("+qrToken")
    .populate("eventId")
    .sort({ createdAt: -1 })
    .lean();

  // 2. Generate QR Codes
  const tickets = await Promise.all(
    rows.map(async (r) => ({
      id: String(r._id),
      status: r.status, // e.g., "REGISTERED" or "CHECKED_IN"
      points: r.aicteAwarded || 0,
      event: r.eventId,
      qr: await ticketQr(r.qrToken),
    }))
  );

  return (
    <div className="min-h-screen bg-[#09090b] p-6 text-white md:p-10">
      <div className="mx-auto max-w-5xl space-y-8">
        
        {/* ─── Header ─── */}
        <header className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[.2em] text-yellow-400">
              Digital Passes
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-tight md:text-4xl">
              My Tickets
            </h1>
            <p className="mt-2 text-sm text-zinc-400">
              Show these QR codes at the entrance to verify your attendance.
            </p>
          </div>
          <Link 
            href="/events" 
            className="flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/10"
          >
            Find More Events <ArrowRight size={16} />
          </Link>
        </header>

        {/* ─── Tickets Grid ─── */}
        {tickets.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2">
            {tickets.map((t) => {
              const isCheckedIn = t.status === "CHECKED_IN";
              const eventDate = t.event?.startsAt ? new Date(t.event.startsAt) : null;

              return (
                <div 
                  key={t.id} 
                  className="relative flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-[#121214] shadow-xl transition-all hover:border-yellow-400/30"
                >
                  {/* ── Top Section (Event Info) ── */}
                  <div className="p-6 pb-8">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <span className="mb-2 inline-block rounded-full bg-yellow-400/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-yellow-400">
                          {t.event?.category || "Event"}
                        </span>
                        <h2 className="text-xl font-bold leading-tight text-white">
                          {t.event?.title || "Deleted Event"}
                        </h2>
                      </div>
                      
                      {/* Status Badge */}
                      {isCheckedIn ? (
                        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-400">
                          <CheckCircle2 size={14} /> Checked In
                        </span>
                      ) : (
                        <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-yellow-400/10 px-3 py-1.5 text-xs font-bold text-yellow-400">
                          <Clock size={14} /> Valid
                        </span>
                      )}
                    </div>

                    <div className="mt-4 space-y-2 text-sm text-zinc-400">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-zinc-500" />
                        {eventDate ? eventDate.toLocaleDateString("en-IN", { weekday: "short", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" }) : "Date TBA"}
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-zinc-500" />
                        {t.event?.venue || "Venue TBA"}, {t.event?.city || "Campus"}
                      </div>
                    </div>
                  </div>

                  {/* ── Ticket Cutout Effect ── */}
                  <div className="relative flex h-6 w-full items-center bg-[#09090b]">
                    <div className="absolute -left-3 h-6 w-6 rounded-full bg-[#09090b]" />
                    <div className="w-full border-t-2 border-dashed border-white/10" />
                    <div className="absolute -right-3 h-6 w-6 rounded-full bg-[#09090b]" />
                  </div>

                  {/* ── Bottom Section (QR & Points) ── */}
                  <div className="flex items-center justify-between bg-white/[0.02] p-6 pt-4">
                    <div className="flex items-center gap-4">
                      <div className={`rounded-xl bg-white p-2 ${isCheckedIn ? "opacity-50 grayscale" : ""}`}>
                        <img src={t.qr} alt="Check-in QR" className="h-24 w-24" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">Scan at entry</p>
                        <p className="mt-1 text-[10px] text-zinc-600 max-w-[120px]">
                          Present this code to the club organizer.
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="inline-flex flex-col items-center rounded-xl bg-white/5 p-3">
                        <Award size={20} className={isCheckedIn ? "text-emerald-400" : "text-yellow-400"} />
                        <p className="mt-1 text-lg font-black text-white">{t.points}</p>
                        <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">Points</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ─── Empty State ─── */
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 bg-white/[0.02] py-24 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-zinc-500">
              <Ticket size={40} />
            </div>
            <h2 className="mt-6 text-xl font-bold text-white">No tickets yet</h2>
            <p className="mt-2 max-w-sm text-sm text-zinc-500">
              When you register for an event, your digital pass and QR code will appear here.
            </p>
            <Link 
              href="/events" 
              className="mt-6 rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-yellow-300"
            >
              Discover Events
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
export const dynamic = "force-dynamic";
