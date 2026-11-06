
import Link from "next/link";

import {
  Search,
  MapPin,
  CalendarDays,
  ArrowUpRight,
  Sparkles,
  SlidersHorizontal,
  Navigation,
} from "lucide-react";

import { dbConnect } from "@/lib/db";
import Event from "@/models/Event";
import MapWrapper from "@/components/MapWrapper";
import ClubAdSpotlight from "@/components/ClubAdSpotlight";

export const dynamic = "force-dynamic";

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function getParam(value) {
  return typeof value === "string" ? value.trim() : "";
}

function formatDate(value) {
  if (!value) return "Date to be announced";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date to be announced";
  }

  return date.toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export default async function Events({ searchParams }) {
  const params = await searchParams;

  const search = getParam(params?.q);
  const city = getParam(params?.city);
  const category = getParam(params?.category);
  const type = getParam(params?.type).toLowerCase(); // "free" | "paid"

  await dbConnect();

  // Support either publication convention in your Event model.
  const filter = {
    $and: [
      {
        $or: [
          { status: "PUBLISHED" },
          { isPublished: true },
        ],
      },
    ],
  };

  // Keep upcoming and currently-running events visible. Older records may not have endsAt.
  const now = new Date();
  filter.$and.push({
    $or: [
      { startsAt: { $gte: now } },
      { endsAt: { $gte: now } },
      { endsAt: { $exists: false } },
      { endsAt: null },
    ],
  });

  if (type === "free") filter.$and.push({ $or: [{ ticketPrice: 0 }, { ticketPrice: { $exists: false } }] });
  if (type === "paid") filter.$and.push({ ticketPrice: { $gt: 0 } });

  if (city) {
    filter.$and.push({
      city: new RegExp(escapeRegex(city), "i"),
    });
  }

  if (category) {
    filter.$and.push({
      category: new RegExp(escapeRegex(category), "i"),
    });
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");

    filter.$and.push({
      $or: [
        { title: regex },
        { description: regex },
        { city: regex },
        { category: regex },
      ],
    });
  }

  const events = await Event.find(filter)
    .sort({ startsAt: 1 })
    .limit(100)
    .lean();

  // Serialize MongoDB values before passing them to the client map.
  const safeEvents = JSON.parse(JSON.stringify(events));

  return (
    <main className="min-h-screen overflow-x-hidden bg-[#090909] text-white">
      <ClubAdSpotlight placement="EVENTS" />

      {/* BACKGROUND DECORATION */}
      <div className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -right-40 top-0 h-[500px] w-[500px] rounded-full bg-[#B9D957]/[0.035] blur-[130px]" />
        <div className="absolute -left-40 top-[500px] h-[400px] w-[400px] rounded-full bg-blue-500/[0.025] blur-[120px]" />
      </div>

      <div className="relative mx-auto max-w-[1800px] px-4 py-7 sm:px-6 lg:px-8">

        {/* HEADER */}
        <header className="mb-7 flex flex-col justify-between gap-5 border-b border-white/[0.07] pb-7 lg:flex-row lg:items-end">

          <div>
            <div className="mb-4 flex items-center gap-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-[#B9D957]" />

              <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#B9D957]">
                EVENTVERSE / DISCOVERY
              </p>
            </div>

            <h1 className="max-w-3xl text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">
              Discover events.
              <span className="block text-neutral-500">
                Find your next experience.
              </span>
            </h1>

            <p className="mt-4 max-w-xl text-sm leading-6 text-neutral-400">
              Explore hackathons, workshops, competitions and campus
              experiences happening around you.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#141414] px-4 py-3">
              <Sparkles size={16} className="text-[#B9D957]" />

              <div>
                <p className="text-xs font-bold text-white">
                  {events.length} events found
                </p>
                <p className="mt-0.5 text-[10px] text-neutral-500">
                  Based on your filters
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-[#B9D957]/15 bg-[#B9D957]/[0.06] px-4 py-3">
              <Navigation size={15} className="text-[#B9D957]" />
              <span className="text-xs font-semibold text-[#B9D957]">
                Nearby discovery
              </span>
            </div>

          </div>
        </header>

        {/* FILTER BAR */}
        <section className="mb-7 rounded-2xl border border-white/[0.08] bg-[#121212] p-3 sm:p-4">

          <form
            action="/events"
            method="GET"
            className="grid gap-3 lg:grid-cols-[1.5fr_1fr_1fr_1fr_auto]"
          >

            {/* SEARCH */}
            <div className="relative">
              <Search
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              />

              <input
                name="q"
                type="search"
                placeholder="Search events, workshops, hackathons..."
                defaultValue={search}
                className="h-12 w-full rounded-xl border border-white/[0.07] bg-[#191919] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-[#B9D957]/40 focus:ring-2 focus:ring-[#B9D957]/10"
              />
            </div>

            {/* CITY */}
            <div className="relative">
              <MapPin
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              />

              <input
                name="city"
                placeholder="City"
                defaultValue={city}
                className="h-12 w-full rounded-xl border border-white/[0.07] bg-[#191919] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-[#B9D957]/40"
              />
            </div>

            {/* CATEGORY */}
            <div className="relative">
              <SlidersHorizontal
                size={17}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-500"
              />

              <input
                name="category"
                placeholder="Category"
                defaultValue={category}
                className="h-12 w-full rounded-xl border border-white/[0.07] bg-[#191919] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-[#B9D957]/40"
              />
            </div>

            {/* EVENT TYPE */}
            <select
              name="type"
              defaultValue={type}
              className="h-12 w-full rounded-xl border border-white/[0.07] bg-[#191919] px-4 text-sm text-white outline-none transition focus:border-[#B9D957]/40"
            >
              <option value="">All event types</option>
              <option value="free">Free events</option>
              <option value="paid">Paid events</option>
            </select>

            {/* SUBMIT */}
            <button
              type="submit"
              className="flex h-12 items-center justify-center gap-2 rounded-xl bg-[#B9D957] px-7 text-sm font-bold text-black transition hover:bg-[#d0ed70]"
            >
              <Search size={16} />
              Search
            </button>

          </form>

          {/* ACTIVE FILTERS */}
          {(search || city || category || type) && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/[0.06] pt-3">

              <span className="mr-1 text-[10px] font-semibold uppercase tracking-wider text-neutral-500">
                Active filters
              </span>

              {search && <FilterTag label={`Search: ${search}`} />}
              {city && <FilterTag label={`City: ${city}`} />}
              {category && <FilterTag label={`Category: ${category}`} />}
              {type && <FilterTag label={`Type: ${type}`} />}

              <Link
                href="/events"
                className="ml-auto text-xs font-semibold text-[#B9D957] hover:text-white"
              >
                Clear all
              </Link>

            </div>
          )}

        </section>

        {/* SPLIT VIEW: EVENTS LEFT + MAP RIGHT */}
        <section className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(400px,0.95fr)] xl:grid-cols-[minmax(0,1.05fr)_minmax(480px,0.95fr)]">

          {/* LEFT: EVENT LIST */}
          <div className="min-w-0 space-y-4">

            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-white">
                  Explore events
                </h2>

                <p className="mt-1 text-xs text-neutral-500">
                  Select an event to view its details.
                </p>
              </div>

              <span className="rounded-lg border border-white/[0.08] bg-white/[0.035] px-3 py-2 text-[10px] font-bold text-neutral-400">
                {events.length} RESULTS
              </span>
            </div>
          {
            console.log(events)
          }
            {events.length > 0 ? (

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">

                {events.map((event) => (
                  <EventCard
                    key={String(event._id)}
                    event={event}
                  />
                ))}

              </div>

            ) : (

              <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-[#121212] px-6 text-center">

                <div className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
                  <Search size={28} className="text-neutral-500" />
                </div>

                <h3 className="mt-5 text-lg font-bold text-white">
                  No events found
                </h3>

                <p className="mt-2 max-w-xs text-sm leading-6 text-neutral-500">
                  Try another keyword, city or category to discover more events.
                </p>

                <Link
                  href="/events"
                  className="mt-5 rounded-xl bg-[#B9D957] px-5 py-3 text-xs font-bold text-black hover:bg-[#d0ed70]"
                >
                  Clear filters
                </Link>

              </div>

            )}

          </div>

          {/* RIGHT: STICKY MAP */}
          <aside className="min-w-0 lg:sticky lg:top-5">

            <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[#121212]">

              <div className="flex items-center justify-between gap-3 border-b border-white/[0.07] px-4 py-4 sm:px-5">

                <div>
                  <div className="flex items-center gap-2">
                    <MapPin size={16} className="text-[#B9D957]" />

                    <h2 className="text-sm font-bold text-white">
                      Explore nearby
                    </h2>
                  </div>

                  <p className="mt-1 text-[10px] text-neutral-500">
                    Event locations on the map
                  </p>
                </div>

                <span className="rounded-lg bg-[#B9D957]/10 px-3 py-1.5 text-[10px] font-bold text-[#B9D957]">
                  LIVE MAP
                </span>

              </div>

              <div className="h-[420px] sm:h-[520px] lg:h-[calc(100vh-165px)] lg:min-h-[550px] lg:max-h-[850px]">
                <MapWrapper events={safeEvents} />
              </div>

              <div className="flex items-center justify-between gap-3 border-t border-white/[0.07] px-4 py-3 sm:px-5">
                <p className="text-[10px] text-neutral-500">
                  Allow location access to find events around you.
                </p>

                <span className="flex shrink-0 items-center gap-1.5 text-[10px] font-semibold text-[#B9D957]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#B9D957]" />
                  Interactive
                </span>
              </div>

            </div>

          </aside>

        </section>

        {/* FOOTER */}
        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-white/[0.07] pt-6 text-[10px] text-neutral-600">
          <span>EVENTVERSE DISCOVERY</span>
          <span>Discover. Participate. Connect.</span>
        </footer>

      </div>
    </main>
  );
}

// --------------------------------------------------
// EVENT CARD
// --------------------------------------------------

function EventCard({ event }) {
  const eventHref = `/events/${event.slug || event._id}`;

  const date = formatDate(event.startsAt);

  return (
    <Link
      href={eventHref}
      className="group flex min-h-[225px] flex-col overflow-hidden rounded-2xl border border-white/[0.07] bg-[#141414] transition duration-300 hover:-translate-y-1 hover:border-[#B9D957]/30 hover:bg-[#181818]"
    >

      {/* CARD VISUAL */}
      <div className="relative h-24 overflow-hidden border-b border-white/[0.05] bg-[radial-gradient(circle_at_80%_20%,rgba(185,217,87,0.17),transparent_40%),linear-gradient(135deg,#20251a,#141414_70%)] p-4">

        <div className="absolute -right-5 -top-10 h-32 w-32 rounded-full border border-[#B9D957]/10" />
        <div className="absolute -right-1 -top-5 h-24 w-24 rounded-full border border-[#B9D957]/10" />

        <div className="relative flex items-start justify-between">
          <span className="rounded-lg border border-[#B9D957]/20 bg-black/30 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[#B9D957]">
            {event.category || "Campus event"}
          </span>

          <span className="rounded-full bg-[#B9D957] p-2 text-black transition group-hover:rotate-45">
            <ArrowUpRight size={15} />
          </span>
        </div>

      </div>

      {/* CARD CONTENT */}
      <div className="flex flex-1 flex-col p-4">

        <h3 className="line-clamp-2 text-base font-bold leading-6 text-white transition group-hover:text-[#B9D957]">
          {event.title || "Untitled event"}
        </h3>

        <p className="mt-2 line-clamp-2 text-xs leading-5 text-neutral-500">
          {event.description || "Discover the event and view more details."}
        </p>

        <div className="mt-auto space-y-2 border-t border-white/[0.06] pt-4">

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <CalendarDays size={14} className="shrink-0 text-[#B9D957]" />
            <span>{date}</span>
          </div>

          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <MapPin size={14} className="shrink-0 text-[#B9D957]" />
            <span className="truncate">
              {event.city || "Location to be announced"}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 text-[10px] font-bold uppercase tracking-wider">
            <span className="text-[#B9D957]">{Number(event.ticketPrice || 0) > 0 ? `₹${Number(event.ticketPrice).toLocaleString("en-IN")}` : "Free entry"}</span>
            <span className="text-neutral-500">{Number(event.capacity || 0) > 0 ? `${Math.max(0, event.capacity - (event.registeredCount || 0))} seats left` : "Open registration"}</span>
          </div>

        </div>

      </div>

    </Link>
  );
}

// --------------------------------------------------
// FILTER TAG
// --------------------------------------------------

function FilterTag({ label }) {
  return (
    <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2.5 py-1.5 text-[10px] font-medium text-neutral-300">
      {label}
    </span>
  );
}
