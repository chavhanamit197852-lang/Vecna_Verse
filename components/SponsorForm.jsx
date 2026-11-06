"use client";
import { useState } from "react";

const plans = [{ id: "BASIC", price: 999, days: 7 }, { id: "STANDARD", price: 2499, days: 30 }, { id: "PREMIUM", price: 5999, days: 90 }];

export default function SponsorForm() {
  const [tier, setTier] = useState("STANDARD");
  const [form, setForm] = useState({ title: "", body: "", targetUrl: "" });
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [created, setCreated] = useState(false);

  async function submit(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const orderResponse = await fetch("/api/ads/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, tier }) });
      const order = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(order.error || "Could not create demo order");
      const verifyResponse = await fetch("/api/ads/verify", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ adId: order.adId }) });
      const result = await verifyResponse.json();
      if (!verifyResponse.ok) throw new Error(result.error || "Could not confirm demo payment");
      setCreated(true); setMessage("Demo payment recorded. Your ad is now waiting for administrator approval. No real money was charged.");
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  return <form className="panel mt-6 space-y-4" onSubmit={submit}>
    <div className="rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-3 text-sm text-yellow-300">Demo checkout is enabled. This does not collect real money.</div>
    <div className="grid gap-3 md:grid-cols-3">{plans.map((plan) => <button type="button" key={plan.id} onClick={() => setTier(plan.id)} className={`rounded-xl border p-4 text-left ${tier === plan.id ? "border-yellow-500 bg-yellow-50/10" : "border-slate-200/20"}`}><b>{plan.id}</b><p className="mt-1 text-xl font-bold">₹{plan.price}</p><p className="muted">{plan.days} days</p></button>)}</div>
    <input className="input" placeholder="Advertisement title" required maxLength={80} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
    <textarea className="input" placeholder="Advertisement description" required maxLength={400} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
    <input className="input" type="url" placeholder="Destination URL (https://...)" required value={form.targetUrl} onChange={(e) => setForm({ ...form, targetUrl: e.target.value })} />
    <button className="btn" disabled={busy || created}>{busy ? "Processing demo…" : created ? "Submitted for review" : `Simulate payment · ₹${plans.find((plan) => plan.id === tier).price}`}</button>
    {message && <p className="text-sm text-slate-600" role="status">{message}</p>}
  </form>;
}
