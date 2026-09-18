import { cn } from "@/lib/utils";
import {
  TRANSFER_STATUS_META,
  VERIFICATION_META,
  type TransferStatus,
  type VerificationLevel,
} from "@/lib/constants";

export function StatusBadge({
  status,
  size = "md",
  className,
}: {
  status: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const meta = TRANSFER_STATUS_META[status as TransferStatus] ?? TRANSFER_STATUS_META.OPEN;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-semibold ring-1 ring-inset",
        meta.badge,
        size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs",
        className
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", meta.dot)} />
      {meta.label}
    </span>
  );
}

export function VerificationBadge({
  level,
  className,
}: {
  level: string;
  className?: string;
}) {
  const meta = VERIFICATION_META[level as VerificationLevel];
  if (!meta || level === "SUBMITTED") return null;
  const portal = level === "PORTAL_VERIFIED";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset",
        portal
          ? "bg-accent-soft text-accent ring-accent/20"
          : "bg-blue-50 text-blue-700 ring-blue-600/20",
        className
      )}
    >
      <CheckSeal className="h-3 w-3" />
      {meta.short}
    </span>
  );
}

function CheckSeal({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M12 1.5l2.6 1.9 3.2-.3 1 3.1 2.7 1.8-1 3.1 1 3.1-2.7 1.8-1 3.1-3.2-.3L12 22.5l-2.6-1.9-3.2.3-1-3.1L2.5 16l1-3.1-1-3.1L5.2 8l1-3.1 3.2.3L12 1.5z" />
      <path d="M10.6 14.6l-2.1-2.1-1.3 1.3 3.4 3.4 5.8-5.8-1.3-1.3-4.5 4.5z" fill="#fff" />
    </svg>
  );
}
