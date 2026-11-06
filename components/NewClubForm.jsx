"use client";
import { useState } from "react";

export default function NewClubForm() {
  const [form, setForm] = useState({ name: "", institution: "", city: "", membershipFee: "0", membershipApprovalRequired: true, isPrivate: false });
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setMessage("");
    try {
      const res = await fetch("/api/clubs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, membershipFee: Number(form.membershipFee) || 0 }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create club");
      window.location.href = "/club";
    } catch (err) { setMessage(err.message); }
    finally { setBusy(false); }
  }

  const input = "w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm outline-none focus:border-yellow-400";
  return (
    <form onSubmit={submit} className="mt-8 space-y-4 rounded-3xl border border-white/10 bg-[#121214] p-6">
      <input required className={input} placeholder="Club name" value={form.name} onChange={(e) => set("name", e.target.value)} />
      <input required className={input} placeholder="College / institution" value={form.institution} onChange={(e) => set("institution", e.target.value)} />
      <input className={input} placeholder="City" value={form.city} onChange={(e) => set("city", e.target.value)} />
      <label className="block text-sm font-semibold">Membership fee (₹, 0 = free)
        <input type="number" min="0" className={input + " mt-2"} value={form.membershipFee} onChange={(e) => set("membershipFee", e.target.value)} />
      </label>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.membershipApprovalRequired} onChange={(e) => set("membershipApprovalRequired", e.target.checked)} /> Require approval for join requests</label>
      <label className="flex items-center gap-3 text-sm"><input type="checkbox" checked={form.isPrivate} onChange={(e) => set("isPrivate", e.target.checked)} /> Private club (hidden from directory)</label>
      <button disabled={busy} className="w-full rounded-xl bg-yellow-400 px-6 py-3 text-sm font-black text-black disabled:opacity-50">{busy ? "Creating…" : "Create club"}</button>
      {message && <p className="text-sm text-red-300" role="alert">{message}</p>}
    </form>
  );
}
