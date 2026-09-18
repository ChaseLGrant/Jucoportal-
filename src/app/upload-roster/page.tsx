import type { Metadata } from "next";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { RosterUploader } from "@/components/roster-uploader";

export const metadata: Metadata = {
  title: "Upload Your Roster",
  description:
    "JUCO coaches: put your entire roster in front of four-year programs. Upload a CSV or XLSX and we'll create the profiles automatically.",
};

export const dynamic = "force-dynamic";

export default async function UploadRosterPage() {
  const session = await getSession();
  const isCoach = session?.role === "COACH";

  return (
    <div className="bg-chalk-50">
      <div className="bg-ink-950 text-white">
        <div className="container-narrow py-10">
          <p className="eyebrow">JUCO Coaches</p>
          <h1 className="mt-2 font-display text-3xl font-black tracking-tight sm:text-4xl">
            Upload your roster
          </h1>
          <p className="mt-2 max-w-xl text-white/70">
            Put your entire roster in front of four-year programs in minutes. Upload the spreadsheet
            you already use — we&apos;ll map the columns and create every profile automatically.
          </p>
        </div>
      </div>

      <div className="container-narrow py-8">
        {isCoach ? (
          <RosterUploader />
        ) : (
          <div className="card p-8 text-center">
            <h2 className="font-display text-xl font-bold text-ink-900">
              Sign in as a JUCO coach to upload
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm text-chalk-500">
              Roster uploads are tied to your program so athletes are verified and you can manage them
              from your dashboard. It&apos;s free.
            </p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Link href="/signup" className="btn-primary btn-md">Create free coach account</Link>
              <Link href="/login" className="btn-outline btn-md">Log in</Link>
            </div>
            <p className="mt-4 text-xs text-chalk-400">
              Demo: log in with <span className="font-semibold">coach@jucoportal.com</span> / password123
            </p>
          </div>
        )}

        {/* how it works */}
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <HowStep n="1" title="Upload any spreadsheet" body="CSV or XLSX — even the roster you already keep. No template required." />
          <HowStep n="2" title="We map the columns" body="“Player” → Name, “POS” → Position, “AVG” → Batting Average. Auto-detected." />
          <HowStep n="3" title="Publish in one click" body="Every athlete gets a profile. They can claim and update it later." />
        </div>
      </div>
    </div>
  );
}

function HowStep({ n, title, body }: { n: string; title: string; body: string }) {
  return (
    <div className="card p-5">
      <div className="font-display text-2xl font-black text-accent">{n}</div>
      <h3 className="mt-1 font-bold text-ink-900">{title}</h3>
      <p className="mt-1 text-sm text-chalk-500">{body}</p>
    </div>
  );
}
