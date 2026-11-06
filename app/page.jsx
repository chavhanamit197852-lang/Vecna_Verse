
import Link from "next/link";
import { auth } from "@/auth";

import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Clock3,
  Users,
  Sparkles,
  Ticket,
  Building2,
  Code2,
  Trophy,
  Handshake,
  ShieldCheck,
  GraduationCap,
} from "lucide-react";

import { dbConnect } from "@/lib/db";
import EventCarousel from "@/app/EventCarousel";
import Event from "@/models/Event";
import User from "@/models/User";
import Club from "@/models/Club";
import ClubMember from "@/models/ClubMember";
import SponsorAd from "@/models/SponsorAd";
import ClubAdSpotlight from "@/components/ClubAdSpotlight";
import JoinClubButton from "@/components/JoinClubButton";
import CircularCarousel from "@/components/CircularCarousel";

function safeExternalUrl(value) {
  try {
    const url = new URL(value);

    return ["https:", "http:"].includes(url.protocol)
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

async function getHomeData() {
  try {
    await dbConnect();

    const now = new Date();

    const [
      events,
      sponsors,
      clubs,
      users,
      featuredClubs,
    ] = await Promise.all([

      Event.find({
        $and: [
          {
            $or: [
              { status: "PUBLISHED" },
              { isPublished: true },
            ],
          },
          {
            $or: [
              { startsAt: { $gte: now } },
              { endsAt: { $gte: now } },
            ],
          },
        ],
      })
        .select(
          "title slug category city venue description coverImage startsAt endsAt registrationDeadline capacity registeredCount ticketPrice"
        )
        .sort({ startsAt: 1 })
        .lean(),

      SponsorAd.find({
        status: "ACTIVE",
        paymentVerifiedAt: { $ne: null },
        startsAt: { $lte: now },
        endsAt: { $gt: now },
      })
        .select(
          "title body targetUrl tier startsAt endsAt"
        )
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),

      Club.countDocuments(),

      User.countDocuments(),

      Club.find({ isPrivate: { $ne: true } })
        .select("name slug institution city membershipFee membershipApprovalRequired")
        .sort({ createdAt: -1 })
        .limit(3)
        .lean(),

    ]);

    const safeSponsors = sponsors.map((s) => ({
      _id: String(s._id),
      title: s.title,
      body: s.body,
      tier: s.tier,
      targetUrl: safeExternalUrl(s.targetUrl),
      startsAt: s.startsAt
        ? new Date(s.startsAt).toISOString()
        : null,
      endsAt: s.endsAt
        ? new Date(s.endsAt).toISOString()
        : null,
    }));

    return {
      events: JSON.parse(JSON.stringify(events)),
      sponsors: safeSponsors,
      clubs: JSON.parse(JSON.stringify(featuredClubs)),
      stats: {
        clubs,
        users,
        events: events.length,
      },
      dbError: false,
    };

  } catch (error) {
    console.error("EventVerse homepage:", error);

    return {
      events: [],
      sponsors: [],
      clubs: [],
      stats: {
        clubs: 0,
        users: 0,
        events: 0,
      },
      dbError: true,
    };
  }
}

// --------------------------------------------------
// HELPERS
// --------------------------------------------------

function formatDate(value) {
  if (!value) return "Date TBA";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Date TBA";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

function formatTime(value) {
  if (!value) return "Time TBA";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Time TBA";
  }

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function eventHref(event) {
  return `/events/${event.slug || event._id}`;
}

function getCategoryClass(category) {
  const styles = {
    HACKATHON: "bg-violet-100 text-violet-800",
    WORKSHOP: "bg-emerald-100 text-emerald-800",
    CULTURAL: "bg-pink-100 text-pink-800",
    SPORTS: "bg-orange-100 text-orange-800",
    TECH: "bg-sky-100 text-sky-800",
    TECHNICAL: "bg-sky-100 text-sky-800",
    COMPETITION: "bg-amber-100 text-amber-800",
  };

  return styles[category?.toUpperCase()] ||
    "bg-[#E8E9D8] text-[#46553E]";
}

// --------------------------------------------------
// HOMEPAGE
// --------------------------------------------------

export default async function Home() {
  
  const [session, homeData] = await Promise.all([auth(), getHomeData()]);
  const {
    events,
    sponsors,
    clubs,
    stats,
    dbError,
  } = homeData;

  const featuredEvent = events[0] || null;
  const clubIds = clubs.map((club) => club._id);
  const [clubCounts, myClubMemberships] = clubIds.length
    ? await Promise.all([
        ClubMember.aggregate([
          { $match: { clubId: { $in: clubIds }, status: "ACTIVE" } },
          { $group: { _id: "$clubId", count: { $sum: 1 } } },
        ]),
        session?.user
          ? ClubMember.find({ userId: session.user.id, clubId: { $in: clubIds } })
              .select("clubId status role membershipFee paymentStatus")
              .lean()
          : Promise.resolve([]),
      ])
    : [[], []];
  const clubCountMap = new Map(clubCounts.map((item) => [String(item._id), item.count]));
  const clubMembershipMap = new Map(myClubMemberships.map((item) => [String(item.clubId), item]));
  const otherEvents = events.slice(3);
  const featuredSponsor = sponsors[0] || null;

  return (
    <div className="min-h-screen overflow-hidden bg-[#F8F7EF] text-[#172419]">

      {/* ==========================================
          NAVIGATION
      ========================================== */}

      <nav className="sticky top-0 z-50 border-b border-[#263D2D]/10 bg-[#F8F7EF]/95 px-4 backdrop-blur-xl sm:px-8">

        <div className="mx-auto flex h-[76px] max-w-[1500px] items-center justify-between">

          {/* BRAND */}
          <Link
            href="/"
            className="flex items-center gap-3"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4A5D4E] text-lg font-black text-white">
              E
            </div>

            <div>
              <h1 className="font-display text-lg font-black tracking-tight">
                EventVerse.
              </h1>
              <p className="text-[8px] font-bold uppercase tracking-[0.22em] text-[#7C836E]">
                Campus ecosystem
              </p>
            </div>
          </Link>

          {/* NAV LINKS */}
          <div className="hidden items-center gap-8 text-xs font-bold text-[#65715E] md:flex">

            <Link href="/events" className="transition hover:text-[#293B2A]">
              Events
            </Link>

            <a href="#clubs" className="transition hover:text-[#293B2A]">
              Clubs
            </a>

            <a href="#communities" className="transition hover:text-[#293B2A]">
              Communities
            </a>

            <a href="#sponsors" className="transition hover:text-[#293B2A]">
              Partners
            </a>

            <Link
              href="/code-arena"
              className="transition hover:text-[#293B2A]"
            >
              Code Arena
            </Link>

          </div>

          {/* ACTIONS */}
          <div className="flex items-center gap-3">

            {session?.user ? (
              <>
                <Link
                  href="/dashboard/attendance"
                  className="hidden items-center gap-2 text-xs font-bold text-[#4A5D4E] transition hover:text-black sm:flex"
                >
                  <Ticket size={15} /> My tickets
                </Link>
                <Link
                  href="/dashboard"
                  className="flex items-center gap-2 rounded-full bg-[#4A5D4E] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#354738] active:scale-95"
                >
                  My dashboard <ArrowUpRight size={14} />
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="hidden text-xs font-bold text-[#4A5D4E] transition hover:text-black sm:block"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="flex items-center gap-2 rounded-full bg-[#4A5D4E] px-5 py-3 text-xs font-bold text-white transition hover:bg-[#354738] active:scale-95"
                >
                  Join EventVerse <ArrowUpRight size={14} />
                </Link>
              </>
            )}

          </div>

        </div>
      </nav>

      <main className="mx-auto max-w-[1500px] px-4 sm:px-6 lg:px-8">

        {/* ========================================
            BENTO HERO
        ======================================== */}

        <section className="pt-7 sm:pt-10">

          <div className="grid gap-4 lg:grid-cols-12">

            {/* MAIN FEATURED EVENT */}
            <div className="group relative min-h-[480px] overflow-hidden rounded-[28px] bg-[#F5C362] p-6 sm:p-10 lg:col-span-8 lg:min-h-[535px]">

              {/* DECORATION */}
              <div className="pointer-events-none absolute -right-20 -top-24 h-[420px] w-[420px] rounded-full border border-white/25" />

              <div className="pointer-events-none absolute -right-8 -top-12 h-[320px] w-[320px] rounded-full border border-white/25" />

              <div className="absolute -bottom-20 left-1/4 h-60 w-60 rounded-full bg-[#DB963C]/20 blur-[70px]" />

              {/* EVENT IMAGE */}
              {featuredEvent?.coverImage && (
                <div className="absolute bottom-0 right-0 top-0 w-[54%] overflow-hidden">

                  <img
                    src={featuredEvent.coverImage}
                    alt={featuredEvent.title}
                    className="h-full w-full object-cover object-center transition duration-700 group-hover:scale-105"
                  />

                  <div className="absolute inset-0 bg-gradient-to-r from-[#F5C362] via-[#F5C362]/35 to-transparent" />

                </div>
              )}

              {/* CONTENT */}
              <div className="relative z-10 flex min-h-[430px] max-w-[500px] flex-col justify-between sm:min-h-[455px]">

                <div>

                  <div className="inline-flex items-center gap-2 rounded-full border border-[#4A5D4E]/20 bg-white/25 px-4 py-2 text-[9px] font-black uppercase tracking-[0.18em] text-[#3F523D]">
                    <Sparkles size={13} />
                    Campus spotlight
                  </div>

                  <p className="mt-9 text-[10px] font-black uppercase tracking-[0.18em] text-[#6B552E]">
                    YOUR NEXT BIG EXPERIENCE
                  </p>

                  <h2 className="mt-4 max-w-[490px] font-display text-5xl font-black leading-[0.92] tracking-[-0.065em] text-[#233525] sm:text-6xl xl:text-[76px]">
                    {featuredEvent
                      ? featuredEvent.title
                      : "MAKE YOUR CAMPUS MOMENT."}
                  </h2>

                  <p className="mt-5 max-w-[330px] text-sm font-medium leading-6 text-[#66552F]">
                    {featuredEvent?.description ||
                      "Discover events, meet ambitious people and build something extraordinary."}
                  </p>

                </div>

                <div className="mt-8 flex flex-wrap items-center gap-3">

                  <Link
                    href={featuredEvent ? eventHref(featuredEvent) : "/events"}
                    className="group/button inline-flex items-center gap-3 rounded-full bg-[#314C38] px-6 py-4 text-xs font-black text-white transition hover:bg-[#223A29]"
                  >
                    {featuredEvent ? "Explore Event" : "Discover Events"}
                    <ArrowUpRight
                      size={16}
                      className="transition group-hover/button:-translate-y-0.5 group-hover/button:translate-x-0.5"
                    />
                  </Link>

                  {featuredEvent && (
                    <span className="rounded-full border border-[#4A5D4E]/20 bg-white/30 px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[#43533B]">
                      {featuredEvent.category || "Campus Event"}
                    </span>
                  )}

                </div>

              </div>

              {/* DATE STICKER */}
              {featuredEvent && (
                <div className="absolute bottom-7 right-7 z-20 hidden h-[100px] w-[100px] flex-col items-center justify-center rounded-full bg-[#4A5D4E] text-white shadow-xl sm:flex">
                  <CalendarDays size={17} className="mb-1" />
                  <strong className="text-lg leading-none">
                    {new Date(featuredEvent.startsAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      timeZone: "Asia/Kolkata",
                    })}
                  </strong>
                  <span className="mt-1 text-[9px] font-bold uppercase">
                    {new Date(featuredEvent.startsAt).toLocaleDateString("en-IN", {
                      month: "short",
                      timeZone: "Asia/Kolkata",
                    })}
                  </span>
                </div>
              )}

            </div>

            {/* RIGHT SIDE PANELS */}
            <div className="grid gap-4 sm:grid-cols-2 lg:col-span-4 lg:grid-cols-1">

              {/* COMMUNITY PANEL */}
              <Link
                href="/communities"
                className="group relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#99C5E8] p-7 text-[#20394A] transition duration-300 hover:-translate-y-1"
              >

                <div className="absolute -right-12 -top-12 h-48 w-48 rounded-full border border-white/40" />

                <div className="relative flex items-center justify-between">

                  <span className="rounded-full border border-[#31546D]/20 bg-white/25 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider">
                    Meet your people
                  </span>

                  <Code2 size={25} />
                </div>

                <div className="relative">

                  <h3 className="max-w-[270px] font-display text-3xl font-black leading-none tracking-tight">
                    BUILD YOUR DREAM TEAM.
                  </h3>

                  <p className="mt-3 max-w-[250px] text-xs font-medium leading-5 text-[#38566A]">
                    Find developers, designers and innovators for your next hackathon.
                  </p>

                  <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                    Find teammates
                    <ArrowUpRight
                      size={15}
                      className="transition group-hover:translate-x-1"
                    />
                  </div>

                </div>

              </Link>

              {/* SPONSOR PANEL */}
              {featuredSponsor ? (
                <SponsorHeroPanel sponsor={featuredSponsor} />
              ) : (
                <Link
                  href="/sponsors"
                  className="group relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#EE925B] p-7 text-[#4B2719] transition duration-300 hover:-translate-y-1"
                >

                  <div className="flex items-center justify-between">
                    <span className="rounded-full bg-white/25 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider">
                      Partnerships
                    </span>

                    <Handshake size={25} />
                  </div>

                  <div>
                    <h3 className="font-display text-3xl font-black leading-none">
                      SUPPORT THE NEXT GENERATION.
                    </h3>

                    <p className="mt-3 text-xs font-medium text-[#663F2A]">
                      Give student ideas the platform they deserve.
                    </p>

                    <div className="mt-5 flex items-center gap-2 text-xs font-black uppercase tracking-wider">
                      Become a sponsor
                      <ArrowUpRight size={15} />
                    </div>
                  </div>

                </Link>
              )}

            </div>

          </div>

          {/* BOTTOM STRIP */}
          <div className="mt-4 grid grid-cols-2 gap-3 rounded-2xl border border-[#42553B]/10 bg-white p-4 sm:grid-cols-4 sm:p-5">

            <Stat
              icon={Users}
              label="Community members"
              value={stats.users}
            />

            <Stat
              icon={Building2}
              label="Campus clubs"
              value={stats.clubs}
            />

            <Stat
              icon={CalendarDays}
              label="Upcoming events"
              value={events.length}
            />

            <Stat
              icon={Handshake}
              label="Active partners"
              value={sponsors.length}
            />

          </div>

        </section>

<ClubAdSpotlight />

        {/* ========================================
            UPCOMING EVENTS
        ======================================== */}

        <section id="events" className="scroll-mt-24 py-24">

          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

            <div>
              <SectionLabel>01 / Campus experiences</SectionLabel>

              <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[#263C2C] sm:text-5xl">
                Pick your next
                <span className="text-[#D79838]"> adventure.</span>
              </h2>

              <p className="mt-3 max-w-xl text-sm leading-6 text-[#79806B]">
                Explore every published event and hackathon in one place,
                from technical competitions to creative workshops.
              </p>
            </div>

            <Link
              href="/events"
              className="inline-flex items-center gap-2 text-xs font-black text-[#4A5D4E] transition hover:text-[#9B792D]"
            >
              Explore all events
              <ArrowRight size={15} />
            </Link>

          </div>

          {dbError && (
            <div className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-sm text-red-700">
              Event data is temporarily unavailable. Check your database connection.
            </div>
          )}

          {events.length > 0 ? (

            <div className="grid gap-5 md:grid-cols-3">
         
 <EventCarousel events={events} />

              

              {events.slice(0, 3).map((event, index) => (
                <EventCard
                  key={String(event._id)}
                  event={event}
                  index={index}
                />
              ))}

            </div>

          ) : (

            <EmptyPanel
              title="The next experience is waiting."
              description="New campus events will be displayed here as soon as they are published."
              href="/events"
              action="Explore event directory"
            />

          )}

          {/* MORE EVENTS ROW */}
          {otherEvents.length > 0 && (
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {otherEvents.map((event) => (
                <CompactEventCard
                  key={String(event._id)}
                  event={event}
                />
              ))}
            </div>
          )}

        </section>

        {/* ========================================
            CAMPUS CLUBS
        ======================================== */}

        <section id="clubs" className="scroll-mt-24 py-20">
          <div className="mb-10 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
            <div>
              <SectionLabel>02 / Find your community</SectionLabel>
              <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[#263C2C] sm:text-5xl">
                Join a club. <span className="text-[#D79838]">Find your people.</span>
              </h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-[#79806B]">
                Explore campus communities, meet people with shared interests and unlock club-only events.
              </p>
            </div>
            <Link href="/clubs" className="inline-flex items-center gap-2 text-xs font-black text-[#4A5D4E] transition hover:text-[#9B792D]">
              Explore all clubs <ArrowRight size={15} />
            </Link>
          </div>

          {clubs.length ? (
            <div className="grid gap-5 md:grid-cols-3">
              {clubs.map((club) => {
                const membership = clubMembershipMap.get(String(club._id));
                return (
                  <article key={String(club._id)} className="flex flex-col rounded-[26px] border border-[#42553B]/10 bg-white p-6 shadow-[0_12px_35px_rgba(35,53,37,0.05)]">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E8EEDB] text-lg font-black text-[#4A5D4E]">
                        {club.name?.[0]?.toUpperCase() || "C"}
                      </div>
                      <span className="rounded-full bg-[#EFF3E8] px-3 py-1.5 text-[9px] font-black uppercase tracking-wider text-[#4A5D4E]">
                        {club.membershipFee > 0 ? `₹${club.membershipFee} membership` : "Free to join"}
                      </span>
                    </div>
                    <h3 className="mt-5 text-xl font-black text-[#263C2C]">{club.name}</h3>
                    <p className="mt-1 text-xs font-semibold text-[#89907D]">{club.institution}{club.city ? ` · ${club.city}` : ""}</p>
                    <p className="mt-4 flex items-center gap-2 text-xs text-[#79806B]">
                      <Users size={14} /> {clubCountMap.get(String(club._id)) || 0} active members
                    </p>
                    <div className="mt-auto pt-5">
                      <JoinClubButton
                        clubId={String(club._id)}
                        isAuthenticated={Boolean(session?.user)}
                        membership={membership ? {
                          id: String(membership._id),
                          status: membership.status,
                          role: membership.role,
                          membershipFee: membership.membershipFee,
                          paymentStatus: membership.paymentStatus,
                        } : null}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <EmptyPanel
              title="Your campus community starts here."
              description="No public clubs have been listed yet. Explore the club directory to see what's available."
              href="/clubs"
              action="Explore clubs"
            />
          )}
        </section>

        {/* ========================================
            SPONSORS
        ======================================== */}

        <section id="sponsors" className="scroll-mt-24 py-20">

          <div className="rounded-[32px] bg-[#4A5D4E] p-6 text-[#F8F7EF] sm:p-10 lg:p-12">

            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-end">

              <div>
                <SectionLabel light>
                  02 / Powered by partners
                </SectionLabel>

                <h2 className="mt-4 max-w-2xl font-display text-4xl font-black tracking-tight sm:text-5xl">
                  Big ideas need
                  <span className="text-[#F5C362]"> great partners.</span>
                </h2>

                <p className="mt-4 max-w-xl text-sm leading-7 text-[#D5DFCE]">
                  Meet the brands and organisations supporting campus
                  innovation, creativity and student opportunities.
                </p>
              </div>

              <Link
                href="/sponsors"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-full bg-[#F5C362] px-6 py-4 text-xs font-black text-[#30422D] transition hover:bg-[#FFE09A]"
              >
                Become a partner
                <ArrowUpRight size={15} />
              </Link>

            </div>

            {/* PARTNER CAMPAIGNS */}
            <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">

              {sponsors.length > 0 ? (

                sponsors.slice(0, 3).map((sponsor) => (
                  <SponsorCard
                    key={sponsor._id}
                    sponsor={sponsor}
                  />
                ))

              ) : (

                <div className="rounded-2xl border border-white/15 bg-white/[0.06] p-7 md:col-span-2 xl:col-span-3">
                  <Handshake size={28} className="text-[#F5C362]" />

                  <h3 className="mt-5 text-xl font-black">
                    No active campaigns yet
                  </h3>

                  <p className="mt-2 max-w-xl text-xs leading-6 text-[#D5DFCE]">
                    Your organisation can become one of the first
                    partners featured on EventVerse.
                  </p>

                  <Link
                    href="/sponsors"
                    className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#F5C362] px-5 py-3 text-xs font-black text-[#30422D]"
                  >
                    Explore sponsorship
                    <ArrowUpRight size={14} />
                  </Link>

                </div>

              )}

            </div>

            <div className="mt-7 flex flex-wrap gap-5 border-t border-white/15 pt-6 text-[9px] font-bold uppercase tracking-wider text-[#D5DFCE]">
              <span className="flex items-center gap-2">
                <ShieldCheck size={13} />
                Payment verified
              </span>

              <span className="flex items-center gap-2">
                <ShieldCheck size={13} />
                Admin approved
              </span>

              <span className="flex items-center gap-2">
                <Clock3 size={13} />
                Active campaigns
              </span>
            </div>

          </div>

        </section>

        {/* ========================================
            COMMUNITIES
        ======================================== */}

        <section id="communities" className="scroll-mt-24 py-20">

          <div className="mb-9">
            <SectionLabel>03 / Join the movement</SectionLabel>

            <h2 className="mt-4 font-display text-4xl font-black tracking-tight text-[#263C2C] sm:text-5xl">
              Find your circle.
            </h2>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">

            <CommunityCard
              href="/communities"
              icon={Code2}
              title="Find your team"
              description="Meet builders who can turn your hackathon idea into reality."
              bg="#F3C76F"
              color="#49331F"
              label="HACKATHON"
            />

            <CommunityCard
              href="/code-arena"
              icon={Trophy}
              title="Code Arena"
              description="Track coding achievements and compete on the campus leaderboard."
              bg="#B8D4E9"
              color="#284456"
              label="LEETCODE"
            />

            <CommunityCard
              href="/sponsors"
              icon={Handshake}
              title="Brand connections"
              description="Bring sponsors, organisations and student communities together."
              bg="#F1A16E"
              color="#542F1E"
              label="PARTNERSHIPS"
            />

          </div>

        </section>

        {/* ========================================
            JOIN CTA
        ======================================== */}

        <section className="pb-20 pt-10">

          <div className="relative overflow-hidden rounded-[32px] bg-[#EDE9D8] px-6 py-16 text-center sm:px-12 sm:py-20">

            <div className="pointer-events-none absolute -right-20 -top-32 h-80 w-80 rounded-full border border-[#4A5D4E]/10" />
            <div className="pointer-events-none absolute -left-24 -bottom-40 h-96 w-96 rounded-full border border-[#4A5D4E]/10" />

            <div className="relative z-10 mx-auto max-w-3xl">

              <SectionLabel>04 / Your campus, reimagined</SectionLabel>

              <h2 className="mt-5 font-display text-4xl font-black tracking-tight text-[#263C2C] sm:text-6xl">
                Don't just show up.
                <span className="block text-[#9C782F]">
                  Make an impact.
                </span>
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-[#737A65]">
                Discover opportunities, build your network and
                turn your ideas into something real.
              </p>

              <Link
                href="/register"
                className="mt-8 inline-flex items-center gap-3 rounded-full bg-[#4A5D4E] px-8 py-4 text-xs font-black text-white transition hover:bg-[#314738]"
              >
                Join EventVerse
                <ArrowUpRight size={16} />
              </Link>

            </div>

          </div>

        </section>

      </main>

      {/* ==========================================
          FOOTER
      ========================================== */}

      <footer className="border-t border-[#263D2D]/10 bg-[#F2F0E6] px-5 py-9">

        <div className="mx-auto flex max-w-[1500px] flex-col justify-between gap-6 md:flex-row md:items-center">

          <div>
            <Link
              href="/"
              className="font-display text-xl font-black text-[#263C2C]"
            >
              EventVerse.
            </Link>

            <p className="mt-2 text-[10px] text-[#858A78]">
              Your campus. Your community. Your opportunities.
            </p>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 text-[10px] font-bold uppercase tracking-wider text-[#737A65]">
            <Link href="/events" className="hover:text-[#263C2C]">
              Events
            </Link>

            <Link href="/clubs" className="hover:text-[#263C2C]">
              Clubs
            </Link>

            <Link href="/code-arena" className="hover:text-[#263C2C]">
              Code Arena
            </Link>

            <Link href="/communities" className="hover:text-[#263C2C]">
              Communities
            </Link>

            <Link href="/sponsors" className="hover:text-[#263C2C]">
              Partners
            </Link>

            <Link href="/login" className="hover:text-[#263C2C]">
              Login
            </Link>
          </div>

        </div>

        <div className="mx-auto mt-7 max-w-[1500px] border-t border-[#263D2D]/10 pt-5 text-[10px] text-[#969988]">
          © {new Date().getFullYear()} EventVerse. All rights reserved.
        </div>

      </footer>

    </div>
  );
}

// --------------------------------------------------
// SPONSOR FEATURE PANEL
// --------------------------------------------------

function SponsorHeroPanel({ sponsor }) {
  const content = (
    <>
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-white/25 px-3 py-1.5 text-[9px] font-black uppercase tracking-wider">
          FEATURED PARTNER
        </span>

        <ShieldCheck size={22} />
      </div>

      <div className="mt-6">
        <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#542F1E]/15 bg-white/30">
          <Building2 size={22} />
        </div>

        <h3 className="mt-4 font-display text-3xl font-black leading-none">
          {sponsor.title}
        </h3>

        <p className="mt-3 line-clamp-2 text-xs leading-5 text-[#714832]">
          {sponsor.body}
        </p>

        <div className="mt-5 flex items-center gap-2 text-[10px] font-black uppercase tracking-wider">
          Meet our partner
          <ArrowUpRight size={14} />
        </div>
      </div>
    </>
  );

  const className =
    "group relative flex min-h-[250px] flex-col justify-between overflow-hidden rounded-[28px] bg-[#EF9564] p-7 text-[#542F1E] transition duration-300 hover:-translate-y-1";

  return sponsor.targetUrl ? (
    <a
      href={sponsor.targetUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
    >
      {content}
    </a>
  ) : (
    <div className={className}>
      {content}
    </div>
  );
}

// --------------------------------------------------
// EVENT CARD
// --------------------------------------------------

function EventCard({ event, index }) {
  const categoryClass = getCategoryClass(event.category);

  return (
    <Link
      href={eventHref(event)}
      className={`group flex min-h-[400px] flex-col overflow-hidden rounded-[25px] border border-[#384936]/10 bg-white transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
        index === 1 ? "lg:translate-y-6" : ""
      }`}
    >

      {/* IMAGE */}
      <div className="relative h-[200px] overflow-hidden bg-[#EAE9D9]">

        {event.coverImage ? (
          <img
            src={event.coverImage}
            alt={event.title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[#E9E4D1]">
            <CalendarDays size={50} strokeWidth={1.1} className="text-[#88966E]" />
          </div>
        )}

        <div className="absolute left-4 top-4">
          <span className={`rounded-full px-3 py-1.5 text-[9px] font-black uppercase tracking-wider ${categoryClass}`}>
            {event.category || "CAMPUS EVENT"}
          </span>
        </div>

        <div className="absolute bottom-4 right-4 rounded-xl bg-[#4A5D4E] px-3 py-2 text-center text-white shadow-lg">
          <p className="text-lg font-black leading-none">
            {new Date(event.startsAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              timeZone: "Asia/Kolkata",
            })}
          </p>
          <p className="mt-1 text-[9px] font-bold uppercase">
            {new Date(event.startsAt).toLocaleDateString("en-IN", {
              month: "short",
              timeZone: "Asia/Kolkata",
            })}
          </p>
        </div>

      </div>

      {/* CONTENT */}
      <div className="flex flex-1 flex-col p-6">

        <h3 className="font-display text-xl font-black leading-tight text-[#293D2D] transition group-hover:text-[#8A7138]">
          {event.title}
        </h3>

        <p className="mt-3 line-clamp-2 text-xs leading-6 text-[#818775]">
          {event.description || "Explore this campus experience and view more details."}
        </p>

        <div className="mt-auto space-y-3 border-t border-[#384936]/10 pt-5">

          <div className="flex items-center gap-2 text-xs font-semibold text-[#65715E]">
            <CalendarDays size={14} />
            {formatDate(event.startsAt)}
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold text-[#65715E]">
            <MapPin size={14} />
            {event.venue || event.city || "Venue TBA"}
          </div>

          <div className="flex items-center justify-between text-[10px] font-bold text-[#65715E]">
            <span>{Number(event.ticketPrice || 0) > 0 ? `₹${Number(event.ticketPrice).toLocaleString("en-IN")}` : "FREE ENTRY"}</span>
            <span>{Number(event.capacity || 0) > 0 ? `${Math.max(0, event.capacity - (event.registeredCount || 0))} seats left` : "Open registration"}</span>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[9px] font-black uppercase tracking-widest text-[#9B9A55]">
              Discover event
            </span>

            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#4A5D4E] text-white transition group-hover:rotate-45 group-hover:bg-[#B9D957] group-hover:text-black">
              <ArrowUpRight size={16} />
            </span>
          </div>

        </div>

      </div>

    </Link>
  );
}

// --------------------------------------------------
// COMPACT EVENT
// --------------------------------------------------

function CompactEventCard({ event }) {
  return (
    <Link
      href={eventHref(event)}
      className="group flex items-center gap-4 rounded-2xl border border-[#384936]/10 bg-white p-4 transition hover:border-[#9B9A55]/40"
    >

      <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-[#F5C362] text-[#3B492E]">
        <span className="text-lg font-black leading-none">
          {new Date(event.startsAt).toLocaleDateString("en-IN", {
            day: "2-digit",
            timeZone: "Asia/Kolkata",
          })}
        </span>

        <span className="mt-1 text-[9px] font-black uppercase">
          {new Date(event.startsAt).toLocaleDateString("en-IN", {
            month: "short",
            timeZone: "Asia/Kolkata",
          })}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="truncate text-sm font-black text-[#293D2D]">
          {event.title}
        </h3>

        <p className="mt-1 truncate text-[10px] text-[#828775]">
          {event.city || "Campus"} · {event.category || "Event"}
        </p>
      </div>

      <ArrowUpRight
        size={17}
        className="shrink-0 text-[#7B866B] transition group-hover:text-[#4A5D4E]"
      />

    </Link>
  );
}

// --------------------------------------------------
// SPONSOR CARD
// --------------------------------------------------

function SponsorCard({ sponsor }) {
  const tierStyles = {
    PREMIUM: "bg-[#F5C362] text-[#4A3A1B]",
    STANDARD: "bg-[#99C5E8] text-[#274457]",
    BASIC: "bg-white/15 text-white",
  };

  const content = (
    <>
      <div className="flex items-center justify-between gap-3">

        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10">
          <Building2 size={21} />
        </div>

        <span className={`rounded-full px-3 py-1.5 text-[8px] font-black tracking-wider ${tierStyles[sponsor.tier] || tierStyles.BASIC}`}>
          {sponsor.tier || "PARTNER"}
        </span>

      </div>

      <h3 className="mt-6 text-xl font-black">
        {sponsor.title}
      </h3>

      <p className="mt-3 line-clamp-3 text-xs leading-6 text-[#D5DFCE]">
        {sponsor.body}
      </p>

      <div className="mt-auto flex items-center justify-between border-t border-white/15 pt-5">
        <span className="text-[9px] font-black uppercase tracking-wider text-[#F5C362]">
          VERIFIED PARTNER
        </span>

        <ArrowUpRight size={16} />
      </div>
    </>
  );

  const className =
    "group flex min-h-[215px] flex-col rounded-2xl border border-white/15 bg-white/[0.05] p-5 transition hover:-translate-y-1 hover:bg-white/[0.09]";

  return sponsor.targetUrl ? (
    <a
      href={sponsor.targetUrl}
      target="_blank"
      rel="noopener noreferrer sponsored"
      className={className}
    >
      {content}
    </a>
  ) : (
    <div className={className}>
      {content}
    </div>
  );
}

// --------------------------------------------------
// STATS
// --------------------------------------------------

function Stat({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-2 sm:justify-center">

      <div className="rounded-xl bg-[#E9EDDF] p-2.5 text-[#4A5D4E]">
        <Icon size={17} />
      </div>

      <div>
        <p className="text-xl font-black leading-none text-[#293D2D]">
          {value.toLocaleString("en-IN")}
        </p>

        <p className="mt-1 text-[9px] font-bold uppercase tracking-wider text-[#858A78]">
          {label}
        </p>
      </div>

    </div>
  );
}

// --------------------------------------------------
// COMMUNITY CARD
// --------------------------------------------------

function CommunityCard({
  href,
  icon: Icon,
  title,
  description,
  bg,
  color,
  label,
}) {
  return (
    <Link
      href={href}
      style={{ backgroundColor: bg, color }}
      className="group relative flex min-h-[300px] flex-col justify-between overflow-hidden rounded-[28px] p-7 transition duration-300 hover:-translate-y-1"
    >

      <div className="absolute -right-14 -top-14 h-52 w-52 rounded-full border border-current/10 transition duration-700 group-hover:scale-125" />

      <div className="relative flex items-center justify-between">

        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-current/10 bg-white/20">
          <Icon size={23} />
        </div>

        <span className="text-[9px] font-black uppercase tracking-widest opacity-50">
          {label}
        </span>

      </div>

      <div className="relative mt-12">

        <h3 className="font-display text-3xl font-black tracking-tight">
          {title}
        </h3>

        <p className="mt-3 max-w-sm text-xs leading-6 opacity-75">
          {description}
        </p>

        <div className="mt-7 inline-flex items-center gap-2 text-xs font-black uppercase tracking-wider">
          Explore
          <ArrowUpRight size={15} className="transition group-hover:-translate-y-1 group-hover:translate-x-1" />
        </div>

      </div>

    </Link>
  );
}

// --------------------------------------------------
// SECTION LABEL
// --------------------------------------------------

function SectionLabel({ children, light = false }) {
  return (
    <div className={`flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] ${
      light ? "text-[#F5C362]" : "text-[#8A783C]"
    }`}>
      <span className={`h-[2px] w-6 ${light ? "bg-[#F5C362]" : "bg-[#8A783C]"}`} />
      {children}
    </div>
  );
}

// --------------------------------------------------
// EMPTY STATE
// --------------------------------------------------

function EmptyPanel({ title, description, href, action }) {
  return (
    <div className="rounded-3xl border border-dashed border-[#4A5D4E]/20 bg-white/60 px-6 py-16 text-center">

      <CalendarDays size={32} className="mx-auto text-[#8A966C]" />

      <h3 className="mt-5 text-xl font-black text-[#293D2D]">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-xs leading-6 text-[#818775]">
        {description}
      </p>

      <Link
        href={href}
        className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#4A5D4E] px-6 py-3 text-xs font-bold text-white transition hover:bg-[#344839]"
      >
        {action}
        <ArrowRight size={14} />
      </Link>

    </div>
  );
}

export const dynamic = "force-dynamic";
