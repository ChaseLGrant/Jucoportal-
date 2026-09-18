import Link from "next/link";
import { cn } from "@/lib/utils";

export function Logo({
  className,
  mark = true,
  href = "/",
}: {
  className?: string;
  mark?: boolean;
  href?: string | null;
}) {
  const content = (
    <span className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      {mark && (
        <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-ink-900 shadow-sm">
          <span className="absolute inset-x-1.5 top-1.5 h-[3px] rounded-full bg-accent" />
          <span className="font-display text-[15px] font-black leading-none text-white">JP</span>
        </span>
      )}
      <span className="font-display text-[17px] font-extrabold uppercase leading-none tracking-[0.02em] text-ink-900">
        The<span className="text-accent"> JUCO </span>Portal
      </span>
    </span>
  );
  if (href === null) return content;
  return (
    <Link href={href} aria-label="The JUCO Portal home">
      {content}
    </Link>
  );
}
