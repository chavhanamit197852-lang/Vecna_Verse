"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle2, XCircle, Search, Loader2 } from "lucide-react";

export default function CheckinScanner() {
  const [scanResult, setScanResult] = useState(null); // { success, message }
  const [manualToken, setManualToken] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Process the Token (from camera or manual input) ───
  const processToken = async (token) => {
    if (!token || loading) return;
    setLoading(true);
    setScanResult(null);

    try {
      const res = await fetch("/api/attendance/checkin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        setScanResult({
          success: true,
          message: `Check-in successful! Awarded ${data.aicteAwarded || 0} AICTE points.`,
        });
      } else {
        setScanResult({
          success: false,
          message: data.error || "Invalid or already scanned QR.",
        });
      }
    } catch (err) {
      setScanResult({ success: false, message: "Network error. Try again." });
    } finally {
      setLoading(false);
      setManualToken("");
    }
  };

  // ─── Initialize Camera Scanner ───
  useEffect(() => {
    // Only initialize if no result is currently showing
    if (scanResult) return;

    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    });

    scanner.render(
      (decodedText) => {
        // Pause scanner while processing
        scanner.pause(true);
        processToken(decodedText);
      },
      (error) => {
        // Ignore frame-by-frame errors (happens when no QR is in view)
      }
    );

    // Cleanup function
    return () => {
      scanner.clear().catch((e) => console.error("Scanner cleanup error", e));
    };
  }, [scanResult]); // Re-run when scanResult changes (to reset scanner)

  return (
    <div className="space-y-6">
      {/* ─── Camera View ─── */}
      <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/50">
        {!scanResult && !loading && (
          <div id="reader" className="w-full [&_video]:rounded-2xl [&_button]:mt-4 [&_button]:rounded-xl [&_button]:bg-[#B9D957] [&_button]:px-4 [&_button]:py-2 [&_button]:text-sm [&_button]:font-bold [&_button]:text-black [&_select]:rounded-xl [&_select]:bg-[#222] [&_select]:p-2 [&_select]:text-white"></div>
        )}

        {loading && (
          <div className="flex h-64 flex-col items-center justify-center text-[#B9D957]">
            <Loader2 className="mb-4 h-10 w-10 animate-spin" />
            <p className="text-sm font-bold uppercase tracking-widest">Verifying Ticket...</p>
          </div>
        )}
      </div>

      {/* ─── Scan Result Feedback ─── */}
      {scanResult && (
        <div className={`flex flex-col items-center rounded-2xl border p-6 text-center ${
          scanResult.success 
            ? "border-emerald-500/30 bg-emerald-500/10" 
            : "border-red-500/30 bg-red-500/10"
        }`}>
          {scanResult.success ? (
            <CheckCircle2 className="mb-3 h-12 w-12 text-emerald-400" />
          ) : (
            <XCircle className="mb-3 h-12 w-12 text-red-400" />
          )}
          <p className={`text-lg font-bold ${scanResult.success ? "text-emerald-400" : "text-red-400"}`}>
            {scanResult.success ? "Success" : "Failed"}
          </p>
          <p className="mt-1 text-sm text-neutral-300">{scanResult.message}</p>
          
          <button
            onClick={() => setScanResult(null)}
            className="mt-6 rounded-xl bg-[#B9D957] px-6 py-2.5 text-sm font-bold text-black transition-colors hover:bg-[#a3c144]"
          >
            Scan Next Student
          </button>
        </div>
      )}

      {/* ─── Manual Entry Fallback ─── */}
      {!scanResult && !loading && (
        <div className="rounded-2xl border border-white/10 bg-[#141414] p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-400">
            Or enter token manually
          </p>
          <form 
            onSubmit={(e) => { e.preventDefault(); processToken(manualToken); }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={18} />
              <input
                type="text"
                placeholder="e.g. 550e8400-e29b..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-[#B9D957]/50"
              />
            </div>
            <button
              type="submit"
              disabled={!manualToken.trim()}
              className="rounded-xl bg-white/10 px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-white/20 disabled:opacity-50"
            >
              Verify
            </button>
          </form>
        </div>
      )}
    </div>
  );
}