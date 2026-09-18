import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getSession } from "@/lib/auth";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "The JUCO Portal — The National Database for Junior College Athletes",
    template: "%s | The JUCO Portal",
  },
  description:
    "The free national database connecting junior-college athletes with four-year programs. Search available JUCO athletes by sport, position, academics, performance and transfer status.",
  keywords: [
    "JUCO", "junior college athletes", "JUCO transfers", "college recruiting",
    "JUCO baseball", "JUCO basketball", "JUCO soccer", "transfer portal",
  ],
  openGraph: {
    title: "The JUCO Portal",
    description: "Every JUCO athlete. One database. Completely free.",
    type: "website",
    url: siteUrl,
    siteName: "The JUCO Portal",
  },
  twitter: { card: "summary_large_image", title: "The JUCO Portal" },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen flex flex-col antialiased">
        <SiteHeader session={session} />
        <main className="flex-1">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
