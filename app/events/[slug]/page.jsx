import { notFound } from "next/navigation";
import mongoose from "mongoose";
import Link from "next/link";
import { Calendar, MapPin, Award, ArrowLeft, CheckCircle2 } from "lucide-react";
import { auth } from "@/auth";
import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import Registration from "@/models/Registration";
import ClubMember from "@/models/ClubMember";
import RegisterButton from "@/components/RegisterButton";
import JoinClubButton from "@/components/JoinClubButton";
import Club from "@/models/Club";
import MapWrapper from "@/components/MapWrapper"; // Import the Map

function formatDate(d) {
  return new Date(d).toLocaleDateString("en-IN", {
    weekday: "long", month: "long", day: "numeric", year: "numeric",
  });
}

function formatTime(d) {
  return new Date(d).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });
}

export default async function EventDetail({ params }) {
  const { slug } = await params;
  await dbConnect();

  const eventIdentity = mongoose.isValidObjectId(slug)
    ? { $or: [{ slug }, { _id: slug }] }
    : { slug };

  const event = await Event.findOne({
    ...eventIdentity,
    $and: [
      { $or: [{ status: "PUBLISHED" }, { isPublished: true }] },
    ],
  }).populate("clubId", "name slug membershipFee membershipApprovalRequired").lean();
  if (!event) notFound();

  const session = await auth();
  const userId = session?.user?.id;

  let existingRegistration = null;
  let clubMembership = null;
  if (userId && event.clubId?._id) {
    clubMembership = await ClubMember.findOne({
      clubId: event.clubId._id,
      userId,
    }).select("status role membershipType membershipFee paymentStatus").lean();
  }
  if (userId) {
    existingRegistration = await Registration.findOne({
      eventId: event._id,
      userId,
      status: { $in: ["PAYMENT_PENDING", "REGISTERED", "CHECKED_IN"] },
    }).select("status payment.amount").lean();
  }
  const isRegistered = ["REGISTERED", "CHECKED_IN"].includes(existingRegistration?.status);
  const hasPendingPayment = existingRegistration?.status === "PAYMENT_PENDING";
  const canRegister = !event.clubId || clubMembership?.status === "ACTIVE";
  const registrationClosed = Boolean(
    event.registrationDeadline && new Date(event.registrationDeadline) <= new Date()
  ) || new Date(event.startsAt) <= new Date();
  const isFull = Number(event.capacity || 0) > 0 && Number(event.registeredCount || 0) >= Number(event.capacity);

  // Check if event has coordinates before rendering map
  const hasLocation = event.location?.lat && event.location?.lng;

  return (
    <div className="min-h-screen bg-[#09090b] text-white">
      <main className="mx-auto max-w-6xl px-5 py-10">
        
        <Link
          href="/events"
          className="mb-8 inline-flex items-center gap-2 text-sm font-semibold text-zinc-400 transition-colors hover:text-yellow-400"
        >
          <ArrowLeft size={16} /> Back to events
        </Link>

        <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
          
          {/* ══════════════════════════════════════
              LEFT COLUMN — Event Info & Map
          ══════════════════════════════════════ */}
          <div className="space-y-8">
            
            {/* Header / Hero */}
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-yellow-400">
                  {event.category || "Event"}
                </span>
                {event.city && (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-zinc-400">
                    <MapPin size={14} className="text-yellow-400" /> {event.city}
                  </span>
                )}
              </div>
              
              <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight md:text-5xl">
                {event.title}
              </h1>
              
              <p className="mt-4 text-lg text-zinc-400">
                Hosted by <span className="font-semibold text-white">{event.clubId?.name || "Campus Club"}</span>
              </p>
            </div>

            {/* Description */}
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 md:p-8">
              <h2 className="mb-4 text-xl font-bold">About this event</h2>
              <p className="whitespace-pre-wrap leading-relaxed text-zinc-400">
                {event.description || "No description provided."}
              </p>
            </div>

            {/* ─── NEW: Event Location Map ─── */}
            {hasLocation && (
              <div className="rounded-3xl border border-white/5 bg-[#121214] overflow-hidden">
                <div className="p-6 pb-4 border-b border-white/5">
                  <h2 className="text-xl font-bold">Location</h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    {event.venue ? `${event.venue}, ` : ""}{event.city || "On Campus"}
                  </p>
                </div>
                {/* Map Container with fixed height */}
                <div className="h-[350px] w-full">
                  <MapWrapper events={[JSON.parse(JSON.stringify(event))]} />
                </div>
              </div>
            )}

          </div>

          {/* ══════════════════════════════════════
              RIGHT COLUMN — Sticky Action Panel
          ══════════════════════════════════════ */}
          <aside className="lg:sticky lg:top-10 h-fit space-y-4">
            
            <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 shadow-xl">
              
              <div className="space-y-4 border-b border-white/5 pb-6">
                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-yellow-400/10 text-yellow-400">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{formatDate(event.startsAt)}</p>
                    <p className="text-sm text-zinc-500">
                      {formatTime(event.startsAt)} – {formatTime(event.endsAt || event.startsAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">{event.venue || "Location TBA"}</p>
                    <p className="text-sm text-zinc-500">{event.city}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-zinc-400">
                    <Award size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-white">AICTE Points</p>
                    <p className="text-sm text-zinc-500">Earn {event.aictePoints || 0} verified points</p>
                  </div>
                </div>
                <div className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-zinc-500">Entry fee</span>
                  <strong className="text-white">{Number(event.ticketPrice || 0) > 0 ? `₹${Number(event.ticketPrice).toLocaleString("en-IN")}` : "Free"}</strong>
                </div>
                <div className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-zinc-500">Register by</span>
                  <strong className="text-right text-white">{event.registrationDeadline ? `${formatDate(event.registrationDeadline)}, ${formatTime(event.registrationDeadline)}` : "Until the event starts"}</strong>
                </div>
                <div className="flex items-start justify-between gap-4 text-sm">
                  <span className="text-zinc-500">Availability</span>
                  <strong className="text-white">{Number(event.capacity || 0) > 0 ? `${Math.max(0, event.capacity - (event.registeredCount || 0))} / ${event.capacity} seats left` : "Open registration"}</strong>
                </div>
              </div>

              {/* Registration Action */}
              <div className="pt-6">
                {!session?.user ? (
                  <div className="text-center">
                    <p className="mb-4 text-sm text-zinc-400">Sign in to register for this event.</p>
                    <Link
                      href="/login"
                      className="flex w-full items-center justify-center rounded-xl bg-yellow-400 py-3.5 text-sm font-bold text-black transition-colors hover:bg-yellow-300"
                    >
                      Sign in to register
                    </Link>
                  </div>
                ) : isRegistered ? (
                  <div className="flex flex-col items-center justify-center rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                    <CheckCircle2 className="mb-2 text-emerald-400" size={24} />
                    <p className="font-bold text-emerald-400">You're registered!</p>
                    <Link href="/dashboard/attendance" className="mt-2 text-xs font-semibold text-emerald-500 underline hover:text-emerald-400">
                      View your QR ticket
                    </Link>
                  </div>
                ) : !canRegister ? (
                  <div className="space-y-3 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
                    <p className="text-sm font-semibold text-yellow-300">Club membership required</p>
                    <p className="text-xs leading-5 text-zinc-400">Join {event.clubId?.name || "this club"} and activate your membership before registering for its events.</p>
                    <JoinClubButton
                      clubId={String(event.clubId._id)}
                      isAuthenticated={Boolean(session?.user)}
                      membership={clubMembership ? {
                        id: String(clubMembership._id),
                        status: clubMembership.status,
                        role: clubMembership.role,
                        membershipType: clubMembership.membershipType,
                        membershipFee: clubMembership.membershipFee,
                        paymentStatus: clubMembership.paymentStatus,
                      } : null}
                    />
                  </div>
                ) : registrationClosed && !hasPendingPayment ? (
                  <p className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center text-sm font-semibold text-red-300">Registration is closed for this event.</p>
                ) : isFull && !hasPendingPayment ? (
                  <p className="rounded-xl border border-red-500/20 bg-red-500/5 p-4 text-center text-sm font-semibold text-red-300">This event is fully booked.</p>
                ) : (
                  <div>
                    <RegisterButton eventId={String(event._id)} pendingRegistrationId={existingRegistration?.status === "PAYMENT_PENDING" ? String(existingRegistration._id) : null} />
                    <p className="mt-3 text-center text-[11px] leading-5 text-zinc-500">After registration, your QR ticket will be available in My Tickets.</p>
                  </div>
                )}
              </div>

            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
export const dynamic = "force-dynamic";
