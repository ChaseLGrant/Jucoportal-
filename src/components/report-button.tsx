"use client";

import { useState } from "react";

const REASONS = [
  "Incorrect statistics",
  "Wrong school / roster",
  "Outdated transfer status",
  "Not the athlete's real info",
  "Duplicate profile",
  "Other",
];

export function ReportButton({ athleteId }: { athleteId: string }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setLoading(true);
    try {
      await fetch("/api/report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ athleteId, reason, details }),
      });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-xs font-semibold text-chalk-400 underline-offset-2 hover:text-accent hover:underline"
      >
        Report incorrect information
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] grid place-items-center bg-ink-950/50 p-4" onClick={() => setOpen(false)}>
          <div
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-pop"
            onClick={(e) => e.stopPropagation()}
          >
            {sent ? (
              <div className="text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-green-50 text-green-600">
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <h3 className="mt-3 font-display text-lg font-bold text-ink-900">Report submitted</h3>
                <p className="mt-1 text-sm text-chalk-500">
                  Thanks — our team will review this profile.
                </p>
                <button onClick={() => setOpen(false)} className="btn-dark btn-md mt-4 w-full">
                  Close
                </button>
              </div>
            ) : (
              <>
                <h3 className="font-display text-lg font-bold text-ink-900">Report this profile</h3>
                <p className="mt-1 text-sm text-chalk-500">Help us keep the database accurate.</p>
                <div className="mt-4">
                  <span className="label">Reason</span>
                  <select value={reason} onChange={(e) => setReason(e.target.value)} className="select">
                    {REASONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="mt-3">
                  <span className="label">Details (optional)</span>
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={3}
                    className="input h-auto py-2"
                    placeholder="What's incorrect?"
                  />
                </div>
                <div className="mt-5 flex gap-2">
                  <button onClick={() => setOpen(false)} className="btn-outline btn-md flex-1">
                    Cancel
                  </button>
                  <button onClick={submit} disabled={loading} className="btn-dark btn-md flex-1">
                    {loading ? "Sending…" : "Submit report"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
