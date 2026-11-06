"use client";

import { useEffect, useMemo } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import "leaflet/dist/leaflet.css";

const customIcon = L.divIcon({
  className: "custom-leaflet-marker",
  html: `
    <div class="relative flex h-8 w-8 items-center justify-center">
      <div class="absolute h-full w-full animate-ping rounded-full bg-yellow-400 opacity-20"></div>
      <div class="relative h-4 w-4 rounded-full border-2 border-black bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]"></div>
    </div>
  `,
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  popupAnchor: [0, -16],
});

export default function EventMap({ events }) {
  const defaultCenter = [20.5937, 78.9629]; // India

  // Calculate center and zoom dynamically
  const { center, zoom } = useMemo(() => {
    const withCoords = events.filter(e => e.location?.lat && e.location?.lng);
    if (withCoords.length === 0) return { center: defaultCenter, zoom: 5 };
    
    // If only 1 event, center on it and zoom in tight
    if (withCoords.length === 1) {
      return { 
        center: [withCoords[0].location.lat, withCoords[0].location.lng], 
        zoom: 14 
      };
    }
    
    // If multiple events, find the average center and zoom out a bit
    const lat = withCoords.reduce((sum, e) => sum + e.location.lat, 0) / withCoords.length;
    const lng = withCoords.reduce((sum, e) => sum + e.location.lng, 0) / withCoords.length;
    return { center: [lat, lng], zoom: 6 };
  }, [events]);

  return (
    <div className="h-full w-full overflow-hidden">
      <MapContainer
        center={center}
        zoom={zoom}
        scrollWheelZoom={false} // Prevents page scrolling from getting stuck on the map
        style={{ height: "100%", width: "100%", background: "#121214" }}
      >
       <TileLayer
  url="https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}{r}.png"
  attribution='&copy; <a href="https://stadiamaps.com/">Stadia Maps</a> &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
/>

        {events.map((event) => {
          if (!event.location?.lat || !event.location?.lng) return null;

          return (
            <Marker
              key={event._id}
              position={[event.location.lat, event.location.lng]}
              icon={customIcon}
            >
              <Popup className="event-popup">
                <div className="p-1 min-w-[150px]">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-yellow-600">
                    {event.category || "Event"}
                  </p>
                  <h3 className="mt-1 text-sm font-bold text-white leading-tight">
                    {event.title}
                  </h3>
                  <p className="mt-1 text-xs text-zinc-400">
                    {event.venue || "Venue TBA"}
                  </p>
                  {event.slug && (
                    <Link
                      href={`/events/${event.slug}`}
                      className="mt-3 block w-full rounded bg-yellow-400 py-1.5 text-center text-xs font-bold text-black hover:bg-yellow-300"
                    >
                      View Event
                    </Link>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}