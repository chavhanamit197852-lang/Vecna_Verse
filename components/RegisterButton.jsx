
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RegisterButton({
  eventId,
  pendingRegistrationId = null,
}) {
  const router = useRouter();

  const [message, setMessage] = useState(
    pendingRegistrationId
      ? "You have an unfinished demo checkout for this event."
      : ""
  );

  const [pendingId, setPendingId] = useState(pendingRegistrationId);
  const [busy, setBusy] = useState(false);

  async function register() {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ eventId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }

      if (data.requiresPayment) {
        setPendingId(data.registrationId);

        setMessage(
          `Demo checkout: ₹${Number(data.amount).toLocaleString("en-IN")}. No real money will be charged.`
        );

        return;
      }

      setMessage("Registration confirmed! Opening your ticket...");

      router.push("/dashboard/attendance");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function confirmDemoPayment() {
    setBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/events/register/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ registrationId: pendingId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Demo payment failed");
      }

      setMessage("Payment successful! Opening your QR ticket...");

      router.push("/dashboard/attendance");
      router.refresh();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-3">
      {!pendingId && (
        <button
          className="btn w-full"
          onClick={register}
          disabled={busy}
        >
          {busy ? "Please wait..." : "Register for event"}
        </button>
      )}

      {pendingId && (
        <div className="space-y-3 rounded-xl border border-yellow-400/20 bg-yellow-400/5 p-4">
          <p className="text-sm font-semibold text-yellow-300">
            Demo payment only
          </p>

          <p className="text-xs text-zinc-400">
            This simulates a successful checkout. No real money will be charged.
          </p>

          <button
            className="btn w-full"
            onClick={confirmDemoPayment}
            disabled={busy}
          >
            {busy ? "Confirming..." : "Simulate successful payment"}
          </button>
        </div>
      )}

      {message && (
        <p className="text-sm text-zinc-400" role="status">
          {message}
        </p>
      )}
    </div>
  );
}
