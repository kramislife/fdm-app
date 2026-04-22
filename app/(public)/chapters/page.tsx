import type { Metadata } from "next";
import { getPublicChapters } from "@/lib/data/chapters";
import { ChaptersHero } from "./_components/chapters-hero";
import { ChaptersFilterGrid } from "./_components/chapters-filter-grid";

export const metadata: Metadata = {
  title: "Chapters Around You | FDM",
  description:
    "Find a chapter near you and join our community in prayer and service.",
};

export default async function ChaptersPage() {
  const chapters = await getPublicChapters();

  return (
    <main className="min-h-screen">
      <ChaptersHero />
      <ChaptersFilterGrid chapters={chapters} />
    </main>
  );
}
