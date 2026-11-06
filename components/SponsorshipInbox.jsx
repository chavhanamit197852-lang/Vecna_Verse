"use client";
import { useState } from "react";
export default function SponsorshipInbox({ initialItems }) {
  const [items, setItems] = useState(initialItems);
  const [busy, setBusy] = useState(null);
  const [message, setMessage] = useState("");
  async function update(item, status) {
    const clubId = item.clubId?._id;
    if (!clubId) { setMessage("Club information is missing for this proposal."); return; }
    setBusy(item._id); setMessage("");
    try {
      const response = await fetch(`/api/clubs/${clubId}/sponsorship-inquiries`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ inquiryId: item._id, status }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Update failed");
      setItems((current) => current.map((entry) => entry._id === item._id ? { ...entry, status } : entry));
    } catch (error) { setMessage(error.message); }
    finally { setBusy(null); }
  }
  return <div className="mt-8 space-y-4">{message && <p className="text-sm text-red-400">{message}</p>}{items.map((item) => <article key={item._id} className="rounded-2xl border border-white/10 bg-[#121214] p-5"><div className="flex flex-wrap items-start justify-between gap-3"><div><h2 className="text-lg font-bold">{item.sponsorName}</h2><p className="mt-1 text-xs text-zinc-500">{item.contactEmail} · {item.clubId?.name || "Club"}</p></div><span className="rounded-full bg-yellow-400/10 px-3 py-1 text-xs font-bold text-yellow-300">{item.status}</span></div><p className="mt-4 whitespace-pre-wrap text-sm text-zinc-300">{item.message}</p><p className="mt-3 text-sm text-zinc-400">Proposed budget: ₹{Number(item.budgetInr || 0).toLocaleString("en-IN")}{item.eventId?.title ? ` · Event: ${item.eventId.title}` : ""}</p>{["PENDING", "CONTACTED"].includes(item.status) && <div className="mt-4 flex flex-wrap gap-2"><button disabled={busy === item._id} onClick={() => update(item, "CONTACTED")} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold">Mark contacted</button><button disabled={busy === item._id} onClick={() => update(item, "ACCEPTED")} className="rounded-lg bg-yellow-400 px-3 py-2 text-xs font-bold text-black">Accept proposal</button><button disabled={busy === item._id} onClick={() => update(item, "REJECTED")} className="rounded-lg border border-red-500/20 px-3 py-2 text-xs font-bold text-red-400">Reject</button></div>}</article>)}{!items.length && <div className="rounded-2xl border border-dashed border-white/10 py-16 text-center text-sm text-zinc-500">No sponsor proposals yet.</div>}</div>;
}
