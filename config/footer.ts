import type { NavLink, BaseImage, SocialLink } from "@/lib/types/types";

import divineMercy from "@/app/assets/media/divine-mercy-footer.png";

import { navLinks } from "@/config/navigation";
import { socialLinks } from "@/config/contact";

export interface FooterQuote {
  text: string;
  attribution: string;
}

export interface FooterColumn {
  heading: string;
  links: NavLink[];
}

export interface FooterBrandColumn {
  heading: string;
  description: string;
  quote: FooterQuote;
  socials: SocialLink[];
}

export interface FooterConfig {
  backgroundImage: BaseImage;
  navigation: FooterColumn;
  quickLinks: FooterColumn;
  brand: FooterBrandColumn;
}

export const footerConfig: FooterConfig = {
  backgroundImage: {
    src: divineMercy,
    alt: "Divine Mercy Image",
  },
  navigation: {
    heading: "Navigation",
    links: navLinks,
  },
  quickLinks: {
    heading: "Quick Links",
    links: [
      { label: "Find a Chapter", href: "/chapters" },
      // { label: "Member Login", href: "/login" },
      { label: "Prayer Requests", href: "/contact-us" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Use", href: "/terms-of-use" },
    ],
  },
  brand: {
    heading: "About FDM",
    description:
      "A community united in faith, service, and the mission of spreading God's mercy across Metro Manila and nearby provinces.",
    quote: {
      text: "Jesus, I trust in You.",
      attribution: "St. Faustina",
    },
    socials: socialLinks,
  },
};
