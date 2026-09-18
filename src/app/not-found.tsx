import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 text-center">
      <div>
        <p className="font-display text-7xl font-black text-accent">404</p>
        <h1 className="mt-2 font-display text-2xl font-black text-ink-900">Off the board</h1>
        <p className="mx-auto mt-2 max-w-sm text-chalk-500">
          We couldn&apos;t find that page. The athlete may have been removed, or the link is wrong.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="btn-outline btn-md">Home</Link>
          <Link href="/search" className="btn-dark btn-md">Search athletes</Link>
        </div>
      </div>
    </div>
  );
}
