import type { Metadata } from "next";

import { AboutHero } from "./_components/about-hero";
import { AboutStats } from "./_components/about-stats";
import { AboutMission } from "./_components/about-mission";
import { AboutPillars } from "./_components/about-pillars";
import { AboutChapters } from "./_components/about-chapters";
import { AboutGallery } from "./_components/about-gallery";
import { AboutStory } from "./_components/about-story";
import { AboutCTA } from "./_components/about-cta";

export const metadata: Metadata = {
  title: "About Us | FDM",
  description:
    "Learn about our mission, story, and the community of faith dedicated to spreading God's mercy.",
};

export default function AboutPage() {
  return (
    <main className="overflow-x-hidden">
      <AboutHero />
      <AboutStats />
      <AboutMission />
      <AboutPillars />
      <AboutChapters />
      <AboutGallery />
      <AboutStory />
      <AboutCTA />
    </main>
  );
}
