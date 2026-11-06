"use client";
import { useEffect, useState } from "react";
const plans = [{ id: "BASIC", amount: 499, days: 7 }, { id: "STANDARD", amount: 1499, days: 14 }, { id: "PREMIUM", amount: 3999, days: 30 }];
const placements = [{ id: "HOMEPAGE", label: "Homepage spotlight", detail: "A sponsored card on the EventVerse homepage" }, { id: "EVENTS", label: "Events discovery", detail: "Promote your club alongside event discovery" }, { id: "CLUB_DIRECTORY", label: "Club directory", detail: "Feature your club in the club directory" }];
export default function ClubAdPurchaseForm({ clubId, initialAds }) {
  const [tier, setTier] = useState("STANDARD"); const [placement, setPlacement] = useState("HOMEPAGE");
  const [form, setForm] = useState({ title: "", body: "", targetUrl: "", imageUrl: "" });
  const [ads, setAds] = useState(initialAds || []); const [busy, setBusy] = useState(false); const [message, setMessage] = useState("");
  async function refresh() { const r = await fetch(`/api/club-ads/mine?clubId=${clubId}`, { cache: "no-store" }); const d = await r.json(); if (r.ok) setAds(Array.isArray(d) ? d : d.data || []); }
  useEffect(() => { refresh(); }, [clubId]);
  async function submit(e) { e.preventDefault(); setBusy(true); setMessage(""); try {
    const orderRes = await fetch("/api/club-ads/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, clubId, tier, placement }) }); const order = await orderRes.json(); if (!orderRes.ok) throw new Error(order.error || "Could not create ad order");
    const verifyRes = await fetch("/api/club-ads/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adId: order.adId, clubId }) }); const result = await verifyRes.json(); if (!verifyRes.ok) throw new Error(result.error || "Demo checkout failed");
    setMessage(result.message); setForm({ title: "", body: "", targetUrl: "", imageUrl: "" }); await refresh();
  } catch (e) { setMessage(e.message); } finally { setBusy(false); } }
  return <div className="space-y-8">
    <form onSubmit={submit} className="mt-7 space-y-5 rounded-3xl border border-white/10 bg-[#121214] p-6">
      <div><h2 className="text-xl font-black">Choose an ad package</h2><p className="mt-1 text-sm text-zinc-400">Prices are demo amounts in INR. No real payment is collected.</p></div>
      <div className="grid gap-3 md:grid-cols-3">{plans.map((p) => <button type="button" key={p.id} onClick={() => setTier(p.id)} className={`rounded-2xl border p-4 text-left ${tier === p.id ? "border-yellow-400 bg-yellow-400/10" : "border-white/10 bg-white/[0.02]"}`}><p className="text-xs font-bold text-zinc-400">{p.id}</p><p className="mt-2 text-2xl font-black">₹{p.amount.toLocaleString("en-IN")}</p><p className="mt-1 text-xs text-zinc-500">{p.days} days</p></button>)}</div>
      <div><label className="mb-2 block text-sm font-semibold">Ad placement</label><div className="grid gap-3 md:grid-cols-3">{placements.map((p) => <button type="button" key={p.id} onClick={() => setPlacement(p.id)} className={`rounded-xl border p-3 text-left ${placement === p.id ? "border-yellow-400" : "border-white/10"}`}><b className="text-sm">{p.label}</b><p className="mt-1 text-xs text-zinc-500">{p.detail}</p></button>)}</div></div>
      <div className="grid gap-4 md:grid-cols-2"><input className="rounded-xl border border-white/10 bg-black p-3 text-sm" placeholder="Advertisement title" required maxLength={90} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}/><input className="rounded-xl border border-white/10 bg-black p-3 text-sm" placeholder="Destination URL (https://...)" type="url" required value={form.targetUrl} onChange={(e) => setForm({ ...form, targetUrl: e.target.value })}/></div>
      <input className="w-full rounded-xl border border-white/10 bg-black p-3 text-sm" placeholder="Image URL (optional)" type="url" value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })}/>
      <textarea className="w-full rounded-xl border border-white/10 bg-black p-3 text-sm" placeholder="Describe what students will discover…" rows={4} required maxLength={420} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}/>
      <button disabled={busy} className="rounded-xl bg-yellow-400 px-6 py-3 text-sm font-black text-black disabled:opacity-50">{busy ? "Processing…" : `Simulate payment · ₹${plans.find((p) => p.id === tier).amount.toLocaleString("en-IN")}`}</button>
      {message && <p className="text-sm text-zinc-300" role="status">{message}</p>}
      <p className="text-xs text-zinc-500">Every paid demo campaign is queued for platform administrator approval before publication.</p>
    </form>
    <section><h2 className="text-xl font-black">Your club campaigns</h2><div className="mt-4 space-y-3">{ads.map((ad) => <article key={ad._id} className="rounded-2xl border border-white/10 bg-[#121214] p-5"><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-bold">{ad.title}</h3><p className="mt-1 text-xs text-zinc-500">{ad.placement.replaceAll("_", " ")} · {ad.tier} · ₹{ad.amountInr}</p></div><span className="h-fit rounded-full bg-white/10 px-3 py-1 text-xs font-bold">{ad.status}</span></div>{ad.status === "ACTIVE" && <p className="mt-3 text-xs text-zinc-400">{ad.impressions || 0} impressions · {ad.clicks || 0} clicks · ends {ad.endsAt ? new Date(ad.endsAt).toLocaleDateString("en-IN") : "—"}</p>}</article>)}{!ads.length && <p className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-zinc-500">No club ad campaigns yet.</p>}</div></section>
  </div>;
}
