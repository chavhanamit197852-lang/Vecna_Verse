"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export default function CommunityJoinButton({ communityId, joined = false, signedIn = false }) {
  const [active, setActive] = useState(joined);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();
  async function toggle() {
    if (!signedIn) { router.push("/login"); return; }
    setBusy(true); setMessage("");
    try {
      const response = await fetch(`/api/communities/${communityId}/join`, { method: active ? "DELETE" : "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not update membership");
      setActive(Boolean(data.joined));
      router.refresh();
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }
  return <div><button onClick={toggle} disabled={busy} className={`rounded-xl px-4 py-2 text-sm font-bold ${active ? "border border-white/15 bg-white/5 text-zinc-200" : "bg-yellow-400 text-black"}`}>{busy ? "Please wait…" : active ? "Joined · Leave" : "Join community"}</button>{message && <p className="mt-1 text-xs text-red-400">{message}</p>}</div>;
}
