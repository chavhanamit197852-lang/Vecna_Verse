"use client";

import dynamic from "next/dynamic";

// The dynamic import with ssr: false now lives safely inside a Client Component
const EventMap = dynamic(() => import("@/components/EventMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[70vh] w-full animate-pulse items-center justify-center rounded-3xl border border-white/10 bg-[#121214] text-sm font-bold text-zinc-500">
      Loading interactive map...
    </div>
  ),
});

export default function MapWrapper({ events }) {
  return <EventMap events={events} />;
}