
"use client";

import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, LocateFixed, Loader2 } from "lucide-react";

// Default fallback: Mumbai
const DEFAULT_POSITION = {
  lat: 19.076,
  lng: 72.8777,
};

// Custom marker
const customIcon = L.divIcon({
  className: "custom-leaflet-marker",
  html: `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: #facc15;
      border: 3px solid #18181b;
      box-shadow: 0 0 16px rgba(250,204,21,0.9);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// Move map whenever selected position changes
function MapController({ position }) {
  const map = useMap();

  useEffect(() => {
    if (!position) return;

    map.setView(
      [position.lat, position.lng],
      Math.max(map.getZoom(), 14),
      { animate: true }
    );

    // Fix map rendering when its container becomes visible/resizes
    const frame = requestAnimationFrame(() => {
      map.invalidateSize();
    });

    return () => cancelAnimationFrame(frame);
  }, [map, position]);

  return null;
}

// Handle manual map clicks
function LocationMarker({ position, onSelect }) {
  useMapEvents({
    click(event) {
      onSelect({
        lat: event.latlng.lat,
        lng: event.latlng.lng,
      });
    },
  });

  return position ? (
    <Marker
      position={[position.lat, position.lng]}
      icon={customIcon}
    />
  ) : null;
}

export default function LocationPicker({ value, onChange }) {
  const [position, setPosition] = useState(
    value?.lat != null && value?.lng != null
      ? { lat: value.lat, lng: value.lng }
      : DEFAULT_POSITION
  );

  const [locationStatus, setLocationStatus] = useState(
    "Requesting your location..."
  );
  const [locating, setLocating] = useState(false);

  // Keep local marker synchronized with parent form state
  useEffect(() => {
    if (value?.lat != null && value?.lng != null) {
      setPosition({
        lat: value.lat,
        lng: value.lng,
      });
    }
  }, [value?.lat, value?.lng]);

  // Ask for browser location permission when the component mounts
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationStatus(
        "Geolocation is not supported. Select a location manually."
      );
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (result) => {
        const currentPosition = {
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        };

        setPosition(currentPosition);
        onChange?.(currentPosition);

        setLocationStatus("Your current location has been selected.");
        setLocating(false);
      },
      (error) => {
        let message = "Could not access your location. Select manually.";

        if (error.code === error.PERMISSION_DENIED) {
          message = "Location permission denied. Select manually on the map.";
        } else if (error.code === error.TIMEOUT) {
          message = "Location request timed out. Select manually.";
        }

        setLocationStatus(message);
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }, [onChange]);

  const handleSelect = (newPosition) => {
    setPosition(newPosition);
    onChange?.(newPosition);
    setLocationStatus("Location selected successfully.");
  };

  const requestLocationAgain = () => {
    if (!navigator.geolocation) {
      setLocationStatus("Geolocation is not supported by this browser.");
      return;
    }

    setLocating(true);
    setLocationStatus("Detecting your location...");

    navigator.geolocation.getCurrentPosition(
      (result) => {
        handleSelect({
          lat: result.coords.latitude,
          lng: result.coords.longitude,
        });

        setLocating(false);
      },
      () => {
        setLocationStatus(
          "Unable to get location. Check browser permissions."
        );
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  };

  return (
    <div className="w-full space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <label className="flex items-center gap-2 text-sm font-semibold text-white">
            <MapPin size={16} className="text-yellow-400" />
            Event Location
          </label>

          <p className="mt-1 text-xs text-zinc-400">
            Your location is requested automatically. You can also pin a
            different location on the map.
          </p>
        </div>

        <button
          type="button"
          onClick={requestLocationAgain}
          disabled={locating}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/10 disabled:opacity-50"
        >
          {locating ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <LocateFixed size={14} />
          )}

          {locating ? "Locating..." : "Use my location"}
        </button>
      </div>

      <div className="relative h-[340px] w-full overflow-hidden rounded-2xl border border-white/10 bg-zinc-900 sm:h-[400px]">
        <MapContainer
          center={[position.lat, position.lng]}
          zoom={14}
          scrollWheelZoom
          className="h-full w-full"
          style={{
            height: "100%",
            width: "100%",
            background: "#18181b",
          }}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>'
          />

          <MapController position={position} />

          <LocationMarker
            position={position}
            onSelect={handleSelect}
          />
        </MapContainer>

        <div className="pointer-events-none absolute bottom-3 left-3 z-[1000] rounded-lg border border-white/10 bg-black/75 px-3 py-2 text-xs text-white backdrop-blur-md">
          Click anywhere on the map to place your event pin
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-zinc-400">
          {locating && (
            <Loader2
              size={12}
              className="mr-1 inline animate-spin"
            />
          )}
          {locationStatus}
        </p>

        <p className="font-mono text-xs text-yellow-400">
          {position.lat.toFixed(6)}, {position.lng.toFixed(6)}
        </p>
      </div>
    </div>
  );
}
