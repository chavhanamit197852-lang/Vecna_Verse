"use client";
import { useState } from "react";

export default function RegisterButton({ eventId, pendingRegistrationId = null }) {
  const [message, setMessage] = useState("");
  const [pendingId, setPendingId] = useState(pendingRegistrationId);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [initialMessage] = useState(pendingRegistrationId ? "You have an unfinished demo checkout for this event." : "");

  async function register() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/events/register", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Registration failed");
      if (data.requiresPayment) {
        setPendingId(data.registrationId);
        setMessage(`Demo checkout: ₹${Number(data.amount).toLocaleString("en-IN")}. No real money will be charged.`);
      } else {
        setConfirmed(true);
        setMessage("Registration confirmed. Your QR ticket is ready.");
      }
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  async function confirmDemoPayment() {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/events/register/confirm", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: pendingId }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Demo payment failed");
      setConfirmed(true); setPendingId(null);
      setMessage("Demo payment successful. Your QR ticket is ready.");
    } catch (error) { setMessage(error.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-3">
      {!confirmed && !pendingId && <button className="btn w-full" onClick={register} disabled={busy}>{busy ? "Please wait…" : "Register for event"}</button>}
      {pendingId && <div className="space-y-3 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
        <p className="text-sm font-semibold text-yellow-300">Demo payment only</p>
        <p className="text-xs text-zinc-400">This simulates a successful checkout. No Razorpay request or real charge is made.</p>
        <button className="btn w-full" onClick={confirmDemoPayment} disabled={busy}>{busy ? "Confirming…" : "Simulate successful payment"}</button>
      </div>}
      {confirmed && <a href="/dashboard/attendance" className="btn block w-full text-center">View my QR ticket</a>}
      {(message || initialMessage) && <p className="text-sm text-zinc-400" role="status">{message || initialMessage}</p>}
    </div>
  );
}
