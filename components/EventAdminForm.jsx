"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { UploadCloud, X, Loader2 } from "lucide-react";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), { ssr: false });

export default function EventAdminForm({ clubs = [], allowPlatformEvents = false }) { // <── Accept clubs prop
  const router = useRouter();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    city: "",
    venue: "",
    category: "HACKATHON",
    coverImage: "",
    startsAt: "",
    endsAt: "",
    aictePoints: 0,
    ticketPrice: 0,
    capacity: 0,
    location: null,
    clubId: "", // <── Add clubId to form state
  });

  const update = (key, val) => setForm((prev) => ({ ...prev, [key]: val }));
  const handleImageUpload = async (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  // 1. Validate file type
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp",
  ];

  if (!allowedTypes.includes(file.type)) {
    alert("Only JPG, PNG and WEBP images are allowed");
    return;
  }

  // 2. Validate file size (8 MB)
  if (file.size > 8 * 1024 * 1024) {
    alert("Image must be smaller than 8MB");
    return;
  }

  // 3. Show local preview
  const previewUrl = URL.createObjectURL(file);

  setImagePreview(previewUrl);

  // 4. Prepare FormData
  const formData = new FormData();

  formData.append("file", file);
  formData.append("folder", "events");

  try {
    setUploading(true);

    // 5. Send image to backend
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || data.message || "Upload failed");
    }

    // 6. Save Cloudinary URL in form state
    update("coverImage", data.url);

    console.log("Image uploaded:", data.url);

  } catch (error) {
    console.error("Image upload error:", error);
    alert(error.message);

    setImagePreview("");
  } finally {
    setUploading(false);
  }
};
  // ... (Image upload logic remains the same) ...

  async function submit(e) {
    e.preventDefault();
    
    // Validation for Admin
    if (clubs.length > 0 && !form.clubId && !allowPlatformEvents) {
      return alert("Please select a club for this event.");
    }

    if (uploading) return alert("Please wait for the image to finish uploading.");
    
    setLoading(true);
    
    const payload = {
      ...form,
      startsAt: new Date(form.startsAt).toISOString(),
      endsAt: new Date(form.endsAt).toISOString(),
    };

    const res = await fetch("/api/admin/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      setForm({ title: "", description: "", city: "", venue: "", category: "HACKATHON", coverImage: "", startsAt: "", endsAt: "", aictePoints: 0, ticketPrice: 0, capacity: 0, location: null, clubId: "" });
      setPreview("");
      router.refresh();
    } else {
      alert("Failed to create event");
    }
    setLoading(false);
  }

  return (
    <div className="rounded-3xl border border-white/5 bg-[#121214] p-6 shadow-xl">
      <h2 className="mb-6 text-xl font-bold text-white">Create New Event</h2>
      
      <form onSubmit={submit} className="grid gap-4 md:grid-cols-2">
        
        {/* ─── CLUB SELECTOR (Only shows if clubs are passed) ─── */}
        {(clubs.length > 0 || allowPlatformEvents) && (
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-yellow-400">
              Assign to Club
            </label>
            <select 
              required
              value={form.clubId} 
              onChange={(e) => update("clubId", e.target.value)} 
              className="w-full rounded-xl border border-yellow-400/30 bg-yellow-400/5 px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/60"
            >
              <option value="">{allowPlatformEvents ? "Platform-wide event (no club)" : "— Select a club —"}</option>
              {clubs.map((c) => (
                <option key={c._id} value={c._id}>{c.name} ({c.institution})</option>
              ))}
            </select>
          </div>
        )}

        {/* ... (Rest of the form fields: Title, Description, Image, etc.) ... */}
        
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">Event Title</label>
          <input required value={form.title} onChange={(e) => update("title", e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/50" placeholder="e.g. Smart India Hackathon" />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">Description</label>
          <textarea required value={form.description} onChange={(e) => update("description", e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/50" rows={3} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">Category</label>
          <select value={form.category} onChange={(e) => update("category", e.target.value)} className="w-full rounded-xl border border-white/10 bg-[#18181b] px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/50">
            <option value="HACKATHON">Hackathon</option>
            <option value="WORKSHOP">Workshop</option>
            <option value="CULTURAL">Cultural</option>
            <option value="SPORTS">Sports</option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">AICTE Points</label>
          <input type="number" value={form.aictePoints} onChange={(e) => update("aictePoints", Number(e.target.value))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/50" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">Ticket Price (₹) · 0 = Free</label>
          <input type="number" min="0" step="1" value={form.ticketPrice} onChange={(e) => update("ticketPrice", Math.max(0, Number(e.target.value)))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/50" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">Capacity · 0 = Unlimited</label>
          <input type="number" min="0" step="1" value={form.capacity} onChange={(e) => update("capacity", Math.max(0, Number(e.target.value)))} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/50" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">City</label>
          <input required value={form.city} onChange={(e) => update("city", e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/50" placeholder="e.g. Pune" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">Venue Name</label>
          <input required value={form.venue} onChange={(e) => update("venue", e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/50" placeholder="e.g. Main Auditorium" />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">Starts At</label>
          <input type="datetime-local" required value={form.startsAt} onChange={(e) => update("startsAt", e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/50" style={{ colorScheme: "dark" }} />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">Ends At</label>
          <input type="datetime-local" required value={form.endsAt} onChange={(e) => update("endsAt", e.target.value)} className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-yellow-400/50" style={{ colorScheme: "dark" }} />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-500">Cover Image</label>
          {!preview ? (
            <div onClick={() => fileInputRef.current?.click()} className="flex h-32 w-full cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/10 bg-white/[0.02] transition-colors hover:border-yellow-400/50 hover:bg-yellow-400/5">
              <UploadCloud size={24} className="text-zinc-500 mb-2" />
              <p className="text-xs font-semibold text-white">Click to upload</p>
            </div>
          ) : (
            <div className="relative h-40 w-full overflow-hidden rounded-xl border border-white/10">
              <img src={preview} alt="Preview" className="h-full w-full object-cover" />
              {uploading && <div className="absolute inset-0 flex items-center justify-center bg-black/60"><Loader2 className="animate-spin text-yellow-400" /></div>}
              <button type="button" onClick={() => { setPreview(""); update("coverImage", ""); }} className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-red-500"><X size={14} /></button>
            </div>
          )}
          <input type="file" accept="image/*" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
        </div>

        <div className="md:col-span-2">
          <LocationPicker value={form.location} onChange={(loc) => update("location", loc)} />
        </div>

        <div className="md:col-span-2 mt-4">
          <button disabled={loading || uploading} className="w-full rounded-xl bg-yellow-400 py-3 text-sm font-bold text-black transition-colors hover:bg-yellow-300 disabled:opacity-50">
            {loading ? "Creating..." : uploading ? "Uploading Image..." : "Create Event"}
          </button>
        </div>
      </form>
    </div>
  );
}