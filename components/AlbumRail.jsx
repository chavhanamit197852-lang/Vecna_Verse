
"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, CalendarDays, MapPin, Users } from "lucide-react";

export default function AlbumRail({ albums = [], className = "" }) {
  const [activeIndex, setActiveIndex] = useState(0);

  if (!albums.length) return null;

  const activeEvent = albums[activeIndex];

  const getEventHref = (event) => {
    return event.slug
      ? `/events/${event.slug}`
      : `/events/${event._id || event.id}`;
  };

  const nextAlbum = () => {
    setActiveIndex((prev) => (prev + 1) % albums.length);
  };

  const previousAlbum = () => {
    setActiveIndex((prev) => (prev - 1 + albums.length) % albums.length);
  };

  const selectAlbum = (index) => {
    setActiveIndex(index);
  };

  const getOffset = (index) => {
    let offset = index - activeIndex;
    const half = Math.floor(albums.length / 2);

    if (offset > half) offset -= albums.length;
    if (offset < -half) offset += albums.length;

    return offset;
  };

  return (
    <section
      className={`relative w-full overflow-hidden bg-transparent py-12 text-[#263C2C] sm:py-16 ${className}`}
    >
      <div className="mx-auto max-w-7xl px-4">

        {/* Event Carousel */}
        <div className="relative mx-auto flex h-[300px] w-full max-w-5xl items-center justify-center sm:h-[390px]">

          {albums.map((event, index) => {
            const offset = getOffset(index);

            if (Math.abs(offset) > 3) return null;

            const isActive = offset === 0;
            const distance = Math.abs(offset);

            return (
              <button
                key={event._id || event.id}
                type="button"
                aria-label={`Select ${event.title}`}
                aria-pressed={isActive}
                onClick={() => selectAlbum(index)}
                className="absolute left-1/2 top-1/2 outline-none transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
                style={{
                  zIndex: 20 - distance,
                  transform: `
                    translate(-50%, -50%)
                    translateX(${offset * 76}px)
                    translateY(${distance * 9}px)
                    rotateY(${offset * -7}deg)
                    rotateZ(${offset * 5}deg)
                    scale(${1 - distance * 0.085})
                  `,
                  opacity: distance > 2 ? 0.65 : 1,
                  pointerEvents: distance > 2 ? "none" : "auto",
                }}
              >
                <div
                  className={`
                    relative aspect-[4/5] w-[175px] overflow-hidden
                    rounded-2xl border bg-transparent
                    shadow-2xl transition-all duration-700
                    sm:w-[235px]
                    ${
                      isActive
                        ? "border-[#D79838]/70 shadow-[0_25px_80px_rgba(177,158,239,0.18)]"
                        : "border-[#42553B]/10 brightness-75"
                    }
                  `}
                >
                  {event.coverImage ? (
                    <img
                      src={event.coverImage}
                      alt={event.title}
                      draggable="false"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-[#E8EEDB] p-4">
                      <span className="text-center text-2xl font-bold text-[#263C2C]">
                        {event.title}
                      </span>
                    </div>
                  )}

                  {!isActive && (
                    <div className="absolute inset-0 bg-black/20" />
                  )}

                  {isActive && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4 text-left">
                      <p className="text-xs font-bold uppercase tracking-wider text-white">
                        Featured Event
                      </p>
                      <p className="mt-1 line-clamp-2 text-sm font-black text-white">
                        {event.title}
                      </p>
                    </div>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Event Details */}
        <div className="relative z-30 mx-auto mt-5 max-w-xl text-center">

          <h3
            key={activeEvent._id || activeEvent.id}
            className="animate-in fade-in duration-500 text-2xl font-black text-[#263C2C] sm:text-3xl"
          >
            {activeEvent.title}
          </h3>

          {activeEvent.description && (
            <p className="mx-auto mt-3 line-clamp-2 max-w-lg text-sm leading-6 text-[#79806B]">
              {activeEvent.description}
            </p>
          )}

          <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-[#79806B]">

            {activeEvent.startsAt && (
              <span className="flex items-center gap-2">
                <CalendarDays size={14} />
                {new Date(activeEvent.startsAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            )}

            {activeEvent.venue && (
              <span className="flex items-center gap-2">
                <MapPin size={14} />
                {activeEvent.venue}
              </span>
            )}

            {activeEvent.clubName && (
              <span className="flex items-center gap-2">
                <Users size={14} />
                {activeEvent.clubName}
              </span>
            )}

          </div>

          {/* Join Event */}
          <Link
            href={getEventHref(activeEvent)}
            className="group mt-7 inline-flex items-center gap-3 rounded-full bg-[#263C2C] px-7 py-3.5 text-sm font-black text-white shadow-lg transition duration-300 hover:-translate-y-1 hover:bg-[#D79838] hover:text-[#263C2C]"
          >
            View & Join Event
            <ArrowRight
              size={17}
              className="transition-transform group-hover:translate-x-1"
            />
          </Link>

        </div>

        {/* Controls */}
        <div className="mx-auto mt-9 flex max-w-md items-center justify-center gap-5">

          <button
            onClick={previousAlbum}
            aria-label="Previous event"
            className="text-3xl text-[#89907D] transition hover:text-[#263C2C]"
          >
            ‹
          </button>

          {/* Indicators */}
          <div className="flex items-center gap-2">
            {albums.map((event, index) => (
              <button
                key={event._id || event.id}
                onClick={() => selectAlbum(index)}
                aria-label={`Go to event ${index + 1}`}
                aria-current={index === activeIndex ? "true" : undefined}
                className={`
                  h-1 rounded-full transition-all duration-300
                  ${
                    index === activeIndex
                      ? "w-8 bg-[#D79838]"
                      : "w-3 bg-[#C8CEBD] hover:bg-[#89907D]"
                  }
                `}
              />
            ))}
          </div>

          <button
            onClick={nextAlbum}
            aria-label="Next event"
            className="text-3xl text-[#89907D] transition hover:text-[#263C2C]"
          >
            ›
          </button>

        </div>

        {/* Counter */}
        <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.35em] text-[#89907D]">
          {String(activeIndex + 1).padStart(2, "0")} /{" "}
          {String(albums.length).padStart(2, "0")}
        </p>

      </div>
    </section>
  );
}
