import type { Metadata } from "next";
import { DevotionsHero } from "./_components/devotions-hero";

export const metadata: Metadata = {
  title: "Devotions | FDM",
  description:
    "The Divine Mercy Devotion — discover the Image, Feast, Hour of Great Mercy, Chaplet, and Novena revealed through St. Faustina.",
};

export default function DevotionsPage() {
  return (
    <main className="min-h-screen">
      <DevotionsHero />
    </main>
  );
}
