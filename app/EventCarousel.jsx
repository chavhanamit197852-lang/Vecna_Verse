"use client";

import { useRouter } from "next/navigation";
import CircularCarousel from "@/components/CircularCarousel";

export default function EventCarousel({ events }) {
  const router = useRouter();

  return (
    <CircularCarousel
      items={events.map((event) => ({
        src: event.coverImage,
        alt: event.title,
        title: event.title,
        subtitle: event.category,
        slug: event.slug,
      }))}
      preset="cylinder"
      cardWidth={220}
      aspectRatio={1}
      captions={false}
      autoplay="drift"
      draggable
      focusOnClick
      onItemClick={(item) => {
        if (item.slug) {
          router.push(`/events/${item.slug}`);
        }
      }}
    />
  );
}