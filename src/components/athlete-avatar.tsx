import { cn, initials } from "@/lib/utils";

const GRADIENTS = [
  "from-orange-500 to-rose-500",
  "from-blue-600 to-indigo-600",
  "from-emerald-500 to-teal-600",
  "from-violet-600 to-purple-600",
  "from-amber-500 to-orange-600",
  "from-sky-500 to-blue-600",
  "from-fuchsia-500 to-pink-600",
  "from-slate-600 to-slate-800",
];

function gradientFor(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0xffff;
  return GRADIENTS[h % GRADIENTS.length];
}

export function AthleteAvatar({
  first,
  last,
  photoUrl,
  className,
  textClass = "text-base",
}: {
  first: string;
  last: string;
  photoUrl?: string | null;
  className?: string;
  textClass?: string;
}) {
  if (photoUrl) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={photoUrl}
        alt={`${first} ${last}`}
        className={cn("object-cover", className)}
      />
    );
  }
  return (
    <div
      className={cn(
        "grid place-items-center bg-gradient-to-br font-display font-black text-white",
        gradientFor(`${first}${last}`),
        textClass,
        className
      )}
      aria-hidden
    >
      {initials(first, last)}
    </div>
  );
}
