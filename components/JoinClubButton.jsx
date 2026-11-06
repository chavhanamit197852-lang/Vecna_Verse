"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JoinClubButton({ clubId, membership, isAuthenticated }) {
  const [state, setState] = useState(membership);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  async function join() {
    setBusy(true); setMessage("");
    try {
      let data;
      if (state?.status === "PENDING" && state?.paymentStatus === "PENDING" && state?.id) {
        data = { requiresPayment: true, membershipId: state.id, amount: state.membershipFee, demo: true };
      } else {
        const response = await fetch(`/api/clubs/${clubId}/join`, { method: "POST" });
        data = await response.json();
        if (!response.ok) throw new Error(data.error || "Could not join club");
      }

      if (data.requiresPayment || data.status === "PENDING_PAYMENT") {
        setState({ id: data.membershipId, status: "PENDING", paymentStatus: "PENDING", membershipFee: data.amount });
        const accepted = window.confirm(`Demo membership payment: ₹${data.amount}. This is a simulation; no real money will be charged. Continue?`);
        if (!accepted) { setMessage("Demo checkout is ready. You can resume it from this club card."); return; }
        const paid = await fetch(`/api/clubs/${data.membershipId}/join`, { method: "PATCH" });
        const result = await paid.json();
        if (!paid.ok) throw new Error(result.error || "Demo payment failed");
        setState({ status: "ACTIVE", paymentStatus: "PAID" });
        setMessage(result.message);
        router.refresh();
      } else {
        setState({ status: data.status, paymentStatus: "NOT_REQUIRED" });
        setMessage(data.message);
        if (data.status === "ACTIVE") router.refresh();
      }
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  if (!isAuthenticated) return <a href="/login" className="block w-full rounded-xl bg-yellow-400 px-4 py-3 text-center text-sm font-bold text-black">Sign in to join</a>;
  const pendingPaid = state?.status === "PENDING" && state?.paymentStatus === "PENDING";
  const label = state?.status === "ACTIVE" ? "Already a member" : pendingPaid ? "Complete demo payment" : state?.status === "PENDING" ? "Request pending" : state?.status === "REJECTED" ? "Contact club admin" : "Join club";
  const disabled = busy || state?.status === "ACTIVE" || (state?.status === "PENDING" && !pendingPaid) || state?.status === "REJECTED";
  return <div><button onClick={join} disabled={disabled} className="w-full rounded-xl bg-yellow-400 px-4 py-3 text-sm font-bold text-black disabled:cursor-not-allowed disabled:opacity-50">{busy ? "Processing…" : label}</button>{message && <p className="mt-2 text-xs text-zinc-400" role="status">{message}</p>}</div>;
}
