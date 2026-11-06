
"use client";

import { useState } from "react";
import Link from "next/link";

import {
  ArrowUpRight,
  CalendarDays,
  MapPin,
  Clock3,
  Sparkles,
} from "lucide-react";

function getDate(value) {
  if (!value) return { day: "--", month: "TBA" };

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return { day: "--", month: "TBA" };
  }

  return {
    day: date.toLocaleDateString("en-IN", {
      day: "2-digit",
      timeZone: "Asia/Kolkata",
    }),
    month: date.toLocaleDateString("en-IN", {
      month: "short",
      timeZone: "Asia/Kolkata",
    }).toUpperCase(),
  };
}

function formatTime(value) {
  if (!value) return "Time TBA";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "Time TBA";

  return date.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function getHref(event) {
  return event.slug
    ? `/events/${event.slug}`
    : "/events";
}

export default function CircularEventShowcase({ events = [] }) {
  const featuredEvents = events.slice(0, 6);

  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedEvent = featuredEvents[selectedIndex];

  if (!featuredEvents.length) {
    return (
      <section className="orbit-empty">
        <div className="orbit-empty-icon">
          <CalendarDays size={36} />
        </div>

        <p className="orbit-eyebrow">DISCOVERY RADAR</p>

        <h2>No events in orbit yet.</h2>

        <p>
          Published upcoming campus events will appear here.
        </p>

        <Link href="/events" className="orbit-explore">
          Explore EventVerse <ArrowUpRight size={16} />
        </Link>
      </section>
    );
  }

  return (
    <section className="orbit-section">

      {/* HEADING */}
      <div className="orbit-heading">
        <div>
          <div className="orbit-eyebrow">
            <span className="orbit-live-dot" />
            EVENTVERSE DISCOVERY
          </div>

          <h2>
            Explore your next
            <span> experience.</span>
          </h2>

          <p>
            Discover what's happening around your campus.
            Select an event floating around the experience.
          </p>
        </div>

        <Link href="/events" className="orbit-all-link">
          All events <ArrowUpRight size={17} />
        </Link>
      </div>

      {/* CIRCULAR ORBIT */}
      <div className="orbit-stage">

        {/* DECORATIVE CIRCLES */}
        <div className="orbit-decoration orbit-decoration-one" />
        <div className="orbit-decoration orbit-decoration-two" />

        {/* ROTATING RING */}
        <div className="orbit-track">
          {featuredEvents.map((event, index) => {
            const angle =
              (360 / featuredEvents.length) * index;

            const date = getDate(event.startsAt);

            return (
              <div
                className="orbit-item"
                key={String(event._id)}
                style={{
                  "--angle": `${angle}deg`,
                }}
              >

                {/* COUNTER-ROTATING CARD */}
                <div className="orbit-card-counter">

                  <button
                    type="button"
                    onClick={() => setSelectedIndex(index)}
                    aria-label={`Feature ${event.title}`}
                    aria-pressed={selectedIndex === index}
                    className={`orbit-event-card ${
                      selectedIndex === index
                        ? "orbit-event-active"
                        : ""
                    }`}
                  >

                    <div className="orbit-event-top">

                      {event.coverImage ? (
                        <img
                          src={event.coverImage}
                          alt=""
                          className="orbit-event-image"
                        />
                      ) : (
                        <div className="orbit-event-image orbit-event-placeholder">
                          <CalendarDays size={22} />
                        </div>
                      )}

                      <div className="orbit-date">
                        <strong>{date.day}</strong>
                        <span>{date.month}</span>
                      </div>

                    </div>

                    <div className="orbit-event-content">

                      <span className="orbit-event-category">
                        {event.category || "CAMPUS EVENT"}
                      </span>

                      <h3>{event.title}</h3>

                      <p>
                        <MapPin size={11} />
                        {event.city || "Campus"}
                      </p>

                    </div>

                    <span className="orbit-select-label">
                      {selectedIndex === index
                        ? "SELECTED"
                        : "EXPLORE ↗"}
                    </span>

                  </button>

                </div>
              </div>
            );
          })}
        </div>

        {/* CENTRAL FEATURE */}
        <div className="orbit-center">

          <div className="orbit-center-glow" />

          <div className="orbit-center-content">

            <div className="orbit-center-brand">
              <Sparkles size={13} />
              EVENTVERSE
            </div>

            <div className="orbit-center-symbol">
              <CalendarDays size={36} strokeWidth={1.2} />
            </div>

            <p className="orbit-center-label">
              NOW FEATURED
            </p>

            <h3 key={selectedEvent._id}>
              {selectedEvent.title}
            </h3>

            <div className="orbit-center-details">

              <span>
                <CalendarDays size={12} />
                {getDate(selectedEvent.startsAt).day}{" "}
                {getDate(selectedEvent.startsAt).month}
              </span>

              <span>
                <MapPin size={12} />
                {selectedEvent.city || "Campus"}
              </span>

            </div>

            <Link
              href={getHref(selectedEvent)}
              className="orbit-center-button"
            >
              Explore Event
              <ArrowUpRight size={15} />
            </Link>

          </div>
        </div>

        {/* BOTTOM INDICATORS */}
        <div className="orbit-indicators">
          {featuredEvents.map((event, index) => (
            <button
              key={String(event._id)}
              type="button"
              aria-label={`Select ${event.title}`}
              aria-pressed={selectedIndex === index}
              onClick={() => setSelectedIndex(index)}
              className={`orbit-indicator ${
                selectedIndex === index ? "active" : ""
              }`}
            />
          ))}
        </div>

      </div>

      {/* BOTTOM INFO */}
      <div className="orbit-footer">
        <span>
          <span className="orbit-live-dot" />
          {featuredEvents.length} EVENTS IN ORBIT
        </span>

        <span>SELECT A FLOATING CARD TO EXPLORE</span>

        <Link href="/events">
          VIEW EVENT DIRECTORY <ArrowUpRight size={12} />
        </Link>
      </div>

    </section>
  );
}
