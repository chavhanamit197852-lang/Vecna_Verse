"use client";
import { useState } from "react";
export default function ClubMembershipSettings({ club }) {
  const [fee, setFee] = useState(String(club.membershipFee));
  const [approval, setApproval] = useState(club.membershipApprovalRequired);
  const [isPrivate, setIsPrivate] = useState(Boolean(club.isPrivate));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  async function save(event) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/clubs/${club.id}/settings`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ membershipFee: Number(fee), membershipApprovalRequired: approval || isPrivate, isPrivate }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not save settings");
      setMessage("Membership settings saved.");
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <form onSubmit={save} className="mt-8 space-y-5 rounded-3xl border border-white/10 bg-[#121214] p-6"><h2 className="text-xl font-bold">{club.name}</h2><label className="block text-sm font-semibold">Membership fee (₹)<input type="number" min="0" max="1000000" step="1" value={fee} onChange={(e) => setFee(e.target.value)} className="mt-2 w-full rounded-xl border border-white/10 bg-black px-4 py-3 text-white"/><span className="mt-1 block text-xs text-zinc-500">Set 0 for free membership. Paid membership uses demo checkout only.</span></label><label className="flex items-start gap-3 rounded-xl border border-white/10 p-4"><input type="checkbox" checked={approval} onChange={(e) => setApproval(e.target.checked)} className="mt-1"/><span><span className="block text-sm font-semibold">Require approval for free membership requests</span><span className="mt-1 block text-xs text-zinc-500">When enabled, free members remain pending until a Club Admin approves them. Paid demo memberships activate after simulated checkout.</span></span></label><label className="flex items-start gap-3 rounded-xl border border-white/10 p-4"><input type="checkbox" checked={isPrivate} onChange={(e) => setIsPrivate(e.target.checked)} className="mt-1"/><span><span className="block text-sm font-semibold">Private club</span><span className="mt-1 block text-xs text-zinc-500">Private clubs are hidden from the public directory and every join request needs approval.</span></span></label><button disabled={busy} className="rounded-xl bg-yellow-400 px-6 py-3 text-sm font-bold text-black disabled:opacity-50">{busy ? "Saving…" : "Save membership settings"}</button>{message && <p className="text-sm text-zinc-300" role="status">{message}</p>}</form>;
}
