import type { Metadata } from "next";
import { DonationsHero } from "./_components/donations-hero";
import { DonationsCards } from "./_components/donations-cards";
import { DonationsSteps } from "./_components/donations-steps";

export const metadata: Metadata = {
  title: "Donations | FDM",
  description:
    "Support the mission of Friends of the Divine Mercy. Donate through GCash, Maya, or Security Bank.",
};

export default function DonationsPage() {
  return (
    <main className="min-h-screen">
      <DonationsHero />
      <DonationsCards />
      <DonationsSteps />
    </main>
  );
}
