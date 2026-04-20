import type { Metadata } from "next";
import { ChaptersHero } from "./_components/chapters-hero";
import { ChaptersFilterGrid } from "./_components/chapters-filter-grid";

export const metadata: Metadata = {
  title: "Chapters Around You | FDM",
  description:
    "Find a chapter near you and join our community in prayer and service.",
};

export default function ChaptersPage() {
  return (
    <main className="min-h-screen">
      <ChaptersHero />
      <ChaptersFilterGrid />
    </main>
  );
}
