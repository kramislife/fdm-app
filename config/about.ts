import type { StaticImageData } from "next/image";
import { Heart, Users, Plus, type LucideIcon } from "lucide-react";

import heroImage from "@/app/assets/media/god-mercy.jpg";

import qcImage from "@/app/assets/media/chapters/qc.png";
import bataanImage from "@/app/assets/media/chapters/bataan.png";
import caviteImage from "@/app/assets/media/chapters/cavite.png";
import pasayImage from "@/app/assets/media/chapters/pasay.png";
import pasigImage from "@/app/assets/media/chapters/pasig.png";
import talaImage from "@/app/assets/media/chapters/tala.png";

import communityImage from "@/app/assets/media/faces-of-faith.jpg";
import storyImage from "@/app/assets/media/story-of-mercy.jpg";

import prayerImage from "@/app/assets/media/missions/3-o-clock.png";
import bigasImage from "@/app/assets/media/missions/biyayang-bigas.png";
import coffeeImage from "@/app/assets/media/missions/cup-of-coffee.png";
import sanctuaryImage from "@/app/assets/media/missions/healing-sanctuary.png";
import jacobsImage from "@/app/assets/media/missions/jacobs-well.png";
import enthronementImage from "@/app/assets/media/missions/mdm-enthronement.png";
import romImage from "@/app/assets/media/missions/rays-of-mercy.png";
import yfaImage from "@/app/assets/media/missions/yfa.png";
import aralImage from "@/app/assets/media/missions/aral-at-kwento.png";
import sisterImage from "@/app/assets/media/missions/friends-sister.png";
import breadImage from "@/app/assets/media/missions/daily-bread.png";

// ---------------------------- Base Interfaces ----------------------------

export interface BaseSection {
  eyebrow: string;
  title: string;
}

export interface SectionWithDescription extends BaseSection {
  description: string;
}

export interface BaseImage {
  src: StaticImageData;
  alt: string;
}

export interface SectionWithImage extends SectionWithDescription {
  image: BaseImage;
}

// ---------------------------- Specific Section Interfaces ----------------------------

export interface HeroContent extends Omit<SectionWithDescription, "eyebrow"> {
  badge: string; // Hero uses 'badge' instead of 'eyebrow'
  image: BaseImage;
}

export interface MissionContent extends SectionWithDescription {
  items: BaseImage[];
}

export interface PillarItem {
  title: string;
  icon: LucideIcon;
  description: string;
}

export interface PillarsContent extends BaseSection {
  items: PillarItem[];
}

export interface Chapter {
  id: string;
  name: string;
  location: string;
  day: string;
  description: string;
  image: BaseImage;
}

export interface ChaptersContent extends SectionWithDescription {
  items: Chapter[];
}

export interface CommunityGallery extends SectionWithImage {}

export interface Stat {
  value: string;
  label: string;
}

export interface StoryContent extends BaseSection {
  paragraphs: string[];
  image: BaseImage;
}

export interface BibleQuote {
  text: string;
  reference: string;
}

export interface CtaButton {
  label: string;
  href: string;
}

export interface CtaContent extends SectionWithDescription {
  bibleQuotes: BibleQuote[];
  primaryButton: CtaButton;
  secondaryButton: CtaButton;
}

// ---------------------------- Hero Section -----------------------------

export const heroContent: HeroContent = {
  badge: "Friends of the Divine Mercy",
  title: "Bearing Witness to God's Mercy",
  description:
    "A growing community across Metro Manila and nearby provinces, united in prayer, service, and the mission — bringing God’s mercy to life through corporal and spiritual works of mercy for those experiencing both material and spiritual poverty.",
  image: {
    src: heroImage,
    alt: "Friends of the Divine Mercy",
  },
};

// ---------------------------- Mission Section ----------------------------

export const missionContent: MissionContent = {
  eyebrow: "Our Mission",
  title: "Spreading God’s Mercy through Faith, Service, and Community",
  description:
    "Guided by the spirituality of Saint Faustina Kowalska, FDM forms and accompanies the faithful in deepening their trust in God’s mercy and in sharing the message of Divine Mercy with others.",
  items: [
    { src: prayerImage, alt: "3 o'clock Prayer" },
    { src: bigasImage, alt: "Biyayang Bigas" },
    { src: coffeeImage, alt: "Cup of Coffee" },
    { src: sanctuaryImage, alt: "Healing Sanctuary" },
    { src: jacobsImage, alt: "Jacob's Well" },
    { src: enthronementImage, alt: "MDM Enthronement" },
    { src: romImage, alt: "Rays of Mercy" },
    { src: yfaImage, alt: "Young Friends in Action" },
    { src: aralImage, alt: "Aral at Kwento" },
    { src: sisterImage, alt: "Friend's Sisters" },
    { src: breadImage, alt: "Daily Bread" },
  ],
};

export const pillarsContent: PillarsContent = {
  eyebrow: "What Guides Us",
  title: "Grounded in Three Pillars",
  items: [
    {
      title: "Faith",
      icon: Plus,
      description:
        "Centered on the message of Divine Mercy, we nurture a deeper trust in God through prayer, devotion, and spiritual formation.",
    },
    {
      title: "Service",
      icon: Heart,
      description:
        "Inspired by mercy in action, we respond to the needs of others through outreach programs, charitable initiatives, and acts of compassion.",
    },
    {
      title: "Community",
      icon: Users,
      description:
        "Across our chapters, we foster unity and belonging by growing together in faith, mission, and shared spiritual life.",
    },
  ],
};

// ---------------------------- Chapter Section ----------------------------

export const chaptersContent: ChaptersContent = {
  eyebrow: "The Chapters",
  title: "Communities United in Mercy",
  description:
    "Across different areas, our chapters gather weekly for the Believers Fellowship — a time of prayer, worship, and formation centered on the message of Divine Mercy.",
  items: [
    {
      id: "quezon-city",
      name: "Quezon City",
      location: "Metro Manila",
      day: "Saturday",
      description:
        "One of FDM's founding chapters. Gathers every Saturday for the Believers Fellowship — prayer, formation, and community in the heart of QC.",
      image: { src: qcImage, alt: "Quezon City Chapter gathering" },
    },
    {
      id: "bataan",
      name: "Bataan",
      location: "Luzon Province",
      day: "Saturday",
      description:
        "Bringing Divine Mercy to the province of Bataan. Members gather every Saturday for fellowship, sharing faith across the historic province.",
      image: { src: bataanImage, alt: "Bataan Chapter community" },
    },
    {
      id: "cavite",
      name: "Cavite",
      location: "Cavite Province",
      day: "Friday",
      description:
        "A Friday chapter rooted in service and prayer. The Cavite community gathers weekly, bringing the message of mercy to their province.",
      image: { src: caviteImage, alt: "Cavite Chapter gathering" },
    },
    {
      id: "pasay",
      name: "Pasay",
      location: "Metro Manila",
      day: "Thursday",
      description:
        "Every Thursday, the Pasay chapter gathers in the heart of Metro Manila — a community anchored in mercy, fellowship, and service.",
      image: { src: pasayImage, alt: "Pasay Chapter community" },
    },
    {
      id: "pasig",
      name: "Pasig",
      location: "Metro Manila",
      day: "Saturday",
      description:
        "Covering Sta. Clara and Sta. Martha areas. Two vibrant communities, one heart — united every Saturday under the banner of Divine Mercy.",
      image: { src: pasigImage, alt: "Pasig Chapter gathering" },
    },
    {
      id: "tala",
      name: "Tala",
      location: "Caloocan City",
      day: "Wednesday",
      description:
        "A mid-week gathering every Wednesday in Tala, Caloocan. A community devoted to prayer, service, and the daily living of God's mercy.",
      image: { src: talaImage, alt: "Tala Chapter community" },
    },
  ],
};

// ------------------------------- Community / Gallery ----------------------------------

export const communityGallery: CommunityGallery = {
  eyebrow: "Our Community",
  title: "Faces of Faith",
  description:
    "Hundreds of members across different chapters — each one a living witness to the mercy and love of God. We are a family united in faith, dedicated to spreading the message of compassion and hope.",
  image: { src: communityImage, alt: "Faces of Faith - FDM Community Gallery" },
};

// ---------------------------- Stats --------------------------------------------

export const communityStats: Stat[] = [
  { value: "6", label: "Chapters" },
  { value: "500+", label: "Members" },
  { value: "30+", label: "Years of Service" },
  { value: "50+", label: "Events per Year" },
];

// ---------------------------- Story --------------------------------------------

export const story: StoryContent = {
  eyebrow: "Our Story",
  title: "Three Decades of Mercy",
  paragraphs: [
    "The Friends of the Divine Mercy began in 1991 when Bro. Rene Tumang, a veteran of the charismatic movement, formed a small community devoted to prayer and the message of Divine Mercy.",
    "What started as a humble group of young professionals grew into a mission of devotion, evangelization, and outreach — culminating in the establishment of the Friends of the Divine Mercy Foundation in 2021 to continue spreading God’s mercy through works of compassion and service.",
  ],
  image: { src: storyImage, alt: "The Story of Community" },
};

// ---------------------------- CTA --------------------------------------------

export const ctaContent: CtaContent = {
  eyebrow: "Join the Community",
  title: "Walk with Us in Faith",
  description:
    "Whether you are seeking community, deepening your faith, or serving others — there is a place for you in Friends of the Divine Mercy.",
  bibleQuotes: [
    {
      text: "“Blessed are the merciful, for they shall obtain mercy.”",
      reference: "Matthew 5:7",
    },
    {
      text: "“The Lord is gracious and merciful, slow to anger and abounding in steadfast love.”",
      reference: "Psalm 145:8",
    },
    {
      text: "“Be merciful, just as your Father is merciful.”",
      reference: "Luke 6:36",
    },
  ],
  primaryButton: {
    label: "Find a Chapter",
    href: "/chapters",
  },
  secondaryButton: {
    label: "Contact Us",
    href: "/contact-us",
  },
};
