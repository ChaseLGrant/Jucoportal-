"use client";

import { useState } from "react";

/**
 * Renders contact details behind a click to reduce raw scraping of the page.
 * The email/phone are only assembled into links after the user opts in.
 */
export function ContactReveal({
  email,
  phone,
  label,
  accent = false,
}: {
  email?: string | null;
  phone?: string | null;
  label: string;
  accent?: boolean;
}) {
  const [revealed, setRevealed] = useState(false);

  if (!email && !phone) {
    return (
      <p className="text-sm text-chalk-400">Contact not publicly listed.</p>
    );
  }

  if (!revealed) {
    return (
      <button
        onClick={() => setRevealed(true)}
        className={accent ? "btn-primary btn-md w-full" : "btn-dark btn-md w-full"}
      >
        {label}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      {email && (
        <a
          href={`mailto:${email}`}
          className={accent ? "btn-primary btn-md w-full" : "btn-dark btn-md w-full"}
        >
          ✉ {email}
        </a>
      )}
      {phone && (
        <a href={`tel:${phone.replace(/[^\d+]/g, "")}`} className="btn-outline btn-md w-full">
          ☎ {phone}
        </a>
      )}
    </div>
  );
}
