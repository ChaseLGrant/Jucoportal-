// Centralized "enum" values (stored as strings for SQLite portability).

export const ROLES = ["ADMIN", "COACH", "ATHLETE"] as const;
export type Role = (typeof ROLES)[number];

export const TRANSFER_STATUSES = [
  "ACTIVELY_SEEKING",
  "OPEN",
  "RETURNING",
  "COMMITTED",
] as const;
export type TransferStatus = (typeof TRANSFER_STATUSES)[number];

export const TRANSFER_STATUS_META: Record<
  TransferStatus,
  { label: string; short: string; dot: string; badge: string }
> = {
  ACTIVELY_SEEKING: {
    label: "Actively Seeking",
    short: "Actively Seeking",
    dot: "bg-green-500",
    badge: "bg-green-50 text-green-700 ring-green-600/20",
  },
  OPEN: {
    label: "Open to Opportunities",
    short: "Open",
    dot: "bg-amber-400",
    badge: "bg-amber-50 text-amber-700 ring-amber-600/20",
  },
  RETURNING: {
    label: "Returning to JUCO",
    short: "Returning",
    dot: "bg-slate-300",
    badge: "bg-slate-100 text-slate-600 ring-slate-500/20",
  },
  COMMITTED: {
    label: "Committed",
    short: "Committed",
    dot: "bg-blue-500",
    badge: "bg-blue-50 text-blue-700 ring-blue-600/20",
  },
};

export const VERIFICATION_LEVELS = [
  "SUBMITTED",
  "COACH_VERIFIED",
  "PORTAL_VERIFIED",
] as const;
export type VerificationLevel = (typeof VERIFICATION_LEVELS)[number];

export const VERIFICATION_META: Record<
  VerificationLevel,
  { label: string; short: string }
> = {
  SUBMITTED: { label: "Athlete Submitted", short: "Submitted" },
  COACH_VERIFIED: { label: "Coach Verified", short: "Coach Verified" },
  PORTAL_VERIFIED: { label: "JUCO Portal Verified", short: "Portal Verified" },
};

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
];

export const CLASS_YEARS = ["Freshman", "Sophomore"];
export const SEMESTERS = ["Fall", "Spring"];
