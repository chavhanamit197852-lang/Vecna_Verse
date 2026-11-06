import { NextResponse } from "next/server";

// Simple in-memory cache — avoids hammering Nominatim on repeated clicks
const cache = new Map();
const CACHE_MS = 10 * 60 * 1000;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const lat = parseFloat(searchParams.get("lat"));
  const lng = parseFloat(searchParams.get("lng"));

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }

  const key = `${lat.toFixed(3)},${lng.toFixed(3)}`;
  const hit = cache.get(key);
  if (hit && Date.now() - hit.at < CACHE_MS) {
    return NextResponse.json(hit.data);
  }

  try {
    // Nominatim requires a descriptive User-Agent per their usage policy
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1`;
    const res = await fetch(url, {
      headers: {
        "User-Agent": "EventVerse/1.0 (contact@eventverse.local)",
        "Accept-Language": "en",
      },
    });
    if (!res.ok) throw new Error("Geocoder failed");

    const data = await res.json();
    const a = data.address || {};
    const city =
      a.city ||
      a.town ||
      a.village ||
      a.suburb ||
      a.county ||
      a.state_district ||
      a.state ||
      null;

    const result = {
      city,
      state: a.state || null,
      country: a.country || null,
      displayName: data.display_name || null,
    };

    cache.set(key, { data: result, at: Date.now() });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: "Could not resolve city" }, { status: 502 });
  }
}