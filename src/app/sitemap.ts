import type { MetadataRoute } from "next";
import { prisma } from "@/lib/db";
import { SPORTS } from "@/lib/sports";
import { absoluteUrl } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [athletes, schools] = await Promise.all([
    prisma.athlete.findMany({ where: { published: true }, select: { slug: true, updatedAt: true }, take: 5000 }),
    prisma.school.findMany({ select: { slug: true } }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), priority: 1, changeFrequency: "daily" },
    { url: absoluteUrl("/search"), priority: 0.9, changeFrequency: "daily" },
    { url: absoluteUrl("/list-athlete"), priority: 0.6 },
    { url: absoluteUrl("/upload-roster"), priority: 0.6 },
  ];

  const sportPages: MetadataRoute.Sitemap = SPORTS.map((s) => ({
    url: absoluteUrl(`/${s.slug}`),
    priority: 0.8,
    changeFrequency: "daily",
  }));

  const schoolPages: MetadataRoute.Sitemap = schools.map((s) => ({
    url: absoluteUrl(`/schools/${s.slug}`),
    priority: 0.6,
    changeFrequency: "weekly",
  }));

  const athletePages: MetadataRoute.Sitemap = athletes.map((a) => ({
    url: absoluteUrl(`/athletes/${a.slug}`),
    lastModified: a.updatedAt,
    priority: 0.7,
    changeFrequency: "weekly",
  }));

  return [...staticPages, ...sportPages, ...schoolPages, ...athletePages];
}
