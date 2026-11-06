"use client";
import { useState } from "react";
export default function SponsorConnectForm({ clubs, initialClubId = "" }) {
  const [form, setForm] = useState({ clubId: initialClubId || clubs[0]?._id || "", sponsorName: "", contactEmail: "", message: "", budgetInr: "", eventId: "" });
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setStatus("");
    try {
      const response = await fetch("/api/sponsorship-inquiries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...form, budgetInr: Number(form.budgetInr || 0), eventId: form.eventId || null }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not send proposal");
      setStatus("Proposal sent successfully. The club can now review your request. Track updates in My proposals.");
      setForm((current) => ({ ...current, message: "", budgetInr: "", eventId: "" }));
    } catch (error) { setStatus(error.message); }
    finally { setBusy(false); }
  }
  return <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-[#121214] p-6">
    <label className="block text-sm">Select club<select required className="mt-2 w-full rounded-xl border border-white/10 bg-black p-3" value={form.clubId} onChange={(e) => setForm({ ...form, clubId: e.target.value })}>{clubs.map((club) => <option key={club._id} value={club._id}>{club.name} · {club.institution}</option>)}</select></label>
    <div className="grid gap-4 md:grid-cols-2"><label className="text-sm">Sponsor / Company name<input required maxLength={120} className="mt-2 w-full rounded-xl border border-white/10 bg-black p-3" value={form.sponsorName} onChange={(e) => setForm({ ...form, sponsorName: e.target.value })}/></label><label className="text-sm">Contact email<input required type="email" className="mt-2 w-full rounded-xl border border-white/10 bg-black p-3" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })}/></label></div>
    <label className="block text-sm">Proposed sponsorship amount (₹)<input type="number" min="1" required className="mt-2 w-full rounded-xl border border-white/10 bg-black p-3" value={form.budgetInr} onChange={(e) => setForm({ ...form, budgetInr: e.target.value })}/></label>
    <label className="block text-sm">Proposal details<textarea required minLength={20} maxLength={2000} rows={5} className="mt-2 w-full rounded-xl border border-white/10 bg-black p-3" placeholder="Tell the club about your brand, sponsorship goals and what you can offer…" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}/></label>
    <button disabled={busy || !clubs.length} className="rounded-xl bg-yellow-400 px-6 py-3 font-bold text-black disabled:opacity-50">{busy ? "Sending…" : "Send sponsorship proposal"}</button>
    {status && <p className="text-sm text-zinc-300" role="status">{status} <a className="text-yellow-300 underline" href="/sponsors/my-proposals">View proposals</a></p>}
    {!clubs.length && <p className="text-sm text-zinc-400">No clubs are available yet.</p>}
  </form>;
}
