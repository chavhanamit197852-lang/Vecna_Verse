"use client";

import { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom marker
const customIcon = L.divIcon({
  className: "custom-leaflet-marker",
  html: `<div class="h-4 w-4 rounded-full border-2 border-black bg-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={customIcon} />
  );
}

export default function LocationPicker({ value, onChange }) {
  // Default to Mumbai if no value
  const [position, setPosition] = useState(
    value?.lat && value?.lng ? { lat: value.lat, lng: value.lng } : { lat: 19.0760, lng: 72.8777 }
  );

  return (
    <div className="space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-zinc-500">
        Pin Location on Map (Click to set)
      </label>
      
      {/* The Map Container */}
      <div className="h-64 w-full overflow-hidden rounded-xl border border-white/10">
        <MapContainer
          center={position}
          zoom={12}
          scrollWheelZoom={true}
          style={{ height: "100%", width: "100%", background: "#121214" }}
        >
          {/* These are the free OpenStreetMap tiles */}
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CartoDB</a>'
          />
          <LocationMarker
            position={position}
            setPosition={(pos) => {
              setPosition(pos);
              onChange({ lat: pos.lat, lng: pos.lng });
            }}
          />
        </MapContainer>
      </div>
      
      <p className="text-[10px] text-zinc-500 text-right">
        Lat: {position.lat.toFixed(4)}, Lng: {position.lng.toFixed(4)}
      </p>
    </div>
  );
}