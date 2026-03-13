import { navLinks } from "@/config/navigation";
import { chaptersContent } from "@/config/about";

export { navLinks };

export const footerChapters = chaptersContent.items.map((c) => c.name);

import type { NavLink as QuickLink } from "@/lib/types";

export const quickLinks: QuickLink[] = [
  { label: "Find a Chapter", href: "/chapters" },
  { label: "Member Login", href: "/login" },
  { label: "Prayer Requests", href: "/contact-us" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms of Use", href: "/terms-of-use" },
];

export const footerBrand = {
  heading: "Spreading God's Mercy to All",
  description:
    "A community united in faith, service, and the mission of spreading God's mercy across Metro Manila and nearby provinces.",
  quote: {
    text: "Jesus, I trust in You.",
    attribution: "St. Faustina Kowalska",
  },
};
