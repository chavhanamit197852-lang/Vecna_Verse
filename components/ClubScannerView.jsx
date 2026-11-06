"use client";

import { useEffect, useState, useRef } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { CheckCircle2, XCircle, Search, Loader2, ScanLine, History } from "lucide-react";

export default function ClubScannerView({ clubName }) {
  const [scanResult, setScanResult] = useState(null); // { success, message, student, event }
  const [manualToken, setManualToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [recentScans, setRecentScans] = useState([]);

  // ─── Process the Token ───
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
          message: `Check-in successful! Awarded ${data.aicteAwarded} AICTE pts.`,
          student: data.student,
          event: data.event,
        });
        
        // Add to recent scans list
        setRecentScans((prev) => [
          { name: data.student.name, time: new Date().toLocaleTimeString(), status: "Success" },
          ...prev.slice(0, 4), // Keep last 5
        ]);
      } else {
        setScanResult({
          success: false,
          message: data.error || "Invalid or already scanned QR.",
        });
        
        setRecentScans((prev) => [
          { name: "Unknown", time: new Date().toLocaleTimeString(), status: "Failed", error: data.error },
          ...prev.slice(0, 4),
        ]);
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
    if (scanResult) return; // Don't scan while showing a result

    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
    });

    scanner.render(
      (decodedText) => {
        scanner.pause(true);
        processToken(decodedText);
      },
      (error) => {} // Ignore frame-by-frame errors
    );

    return () => {
      scanner.clear().catch(() => {});
    };
  }, [scanResult]);

  return (
    <div className="mx-auto max-w-md space-y-6">
      
      {/* ─── Active Club Indicator ─── */}
      <div className="flex items-center justify-between rounded-xl border border-yellow-400/20 bg-yellow-400/5 px-4 py-3">
        <div className="flex items-center gap-2">
          <ScanLine className="text-yellow-400" size={18} />
          <span className="text-sm font-bold text-white">Check-in Desk</span>
        </div>
        <span className="text-xs font-bold text-yellow-400 uppercase">{clubName}</span>
      </div>

      {/* ─── Camera View ─── */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-black shadow-2xl">
        {!scanResult && !loading && (
          <div 
            id="reader" 
            className="w-full [&_video]:rounded-3xl [&_button]:mt-4 [&_button]:rounded-xl [&_button]:bg-yellow-400 [&_button]:px-4 [&_button]:py-2 [&_button]:text-sm [&_button]:font-bold [&_button]:text-black [&_select]:rounded-xl [&_select]:bg-[#222] [&_select]:p-2 [&_select]:text-white" 
          />
        )}

        {loading && (
          <div className="flex h-72 flex-col items-center justify-center text-yellow-400">
            <Loader2 className="mb-4 h-10 w-10 animate-spin" />
            <p className="text-sm font-bold uppercase tracking-widest">Verifying Ticket...</p>
          </div>
        )}
      </div>

      {/* ─── Scan Result Feedback ─── */}
      {scanResult && (
        <div className={`flex flex-col items-center rounded-3xl border p-6 text-center animate-in fade-in zoom-in duration-300 ${
          scanResult.success 
            ? "border-emerald-500/30 bg-emerald-500/10" 
            : "border-red-500/30 bg-red-500/10"
        }`}>
          {scanResult.success ? (
            <>
              <CheckCircle2 className="mb-3 h-16 w-16 text-emerald-400" />
              <h3 className="text-2xl font-black text-emerald-400">Welcome!</h3>
              <p className="mt-1 text-xl font-bold text-white">{scanResult.student.name}</p>
              <p className="mt-1 text-sm text-zinc-400">{scanResult.event}</p>
              <p className="mt-4 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400">
                {scanResult.message}
              </p>
            </>
          ) : (
            <>
              <XCircle className="mb-3 h-16 w-16 text-red-400" />
              <h3 className="text-2xl font-black text-red-400">Access Denied</h3>
              <p className="mt-2 text-sm text-zinc-300">{scanResult.message}</p>
            </>
          )}
          
          <button
            onClick={() => setScanResult(null)}
            className="mt-8 w-full rounded-xl bg-white px-6 py-3 text-sm font-bold text-black transition-colors hover:bg-zinc-200"
          >
            Scan Next Student
          </button>
        </div>
      )}

      {/* ─── Manual Entry (Fallback) ─── */}
      {!scanResult && !loading && (
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5">
          <p className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
            Or enter ticket token manually
          </p>
          <form 
            onSubmit={(e) => { e.preventDefault(); processToken(manualToken); }}
            className="flex gap-2"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Paste QR token..."
                value={manualToken}
                onChange={(e) => setManualToken(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 py-3 pl-10 pr-4 text-sm text-white outline-none focus:border-yellow-400/50"
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

      {/* ─── Recent Scans Log ─── */}
      {recentScans.length > 0 && !scanResult && (
        <div className="rounded-2xl border border-white/10 bg-[#121214] p-5">
          <div className="mb-3 flex items-center gap-2">
            <History size={14} className="text-zinc-500" />
            <p className="text-xs font-bold uppercase tracking-wider text-zinc-500">Recent Scans</p>
          </div>
          <div className="space-y-2">
            {recentScans.map((scan, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-white/[0.02] p-3 text-sm">
                <span className="font-semibold text-white">{scan.name}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-zinc-500">{scan.time}</span>
                  <span className={`text-[10px] font-bold uppercase ${
                    scan.status === "Success" ? "text-emerald-400" : "text-red-400"
                  }`}>{scan.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}