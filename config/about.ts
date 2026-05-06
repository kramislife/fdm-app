import { Heart, Users, Plus } from "lucide-react";

import heroImage from "@/app/assets/media/god-mercy.jpg";

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
import diaryImage from "@/app/assets/media/missions/diary.png";

import type {
  BaseSection,
  SectionWithDescription,
  BaseImage,
  SectionWithImage,
  PillarItem,
  NavLink,
} from "@/lib/types/types";

// ---------------------------- Specific Section Interfaces ----------------------------

export interface HeroContent extends Omit<SectionWithDescription, "eyebrow"> {
  badge: string; // Hero uses 'badge' instead of 'eyebrow'
  image: BaseImage;
}

export interface MissionContent extends SectionWithDescription {
  items: BaseImage[];
}

export interface PillarsContent extends BaseSection {
  items: PillarItem[];
}

export interface ChaptersContent extends SectionWithDescription {}

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

export interface CtaContent extends SectionWithDescription {
  bibleQuotes: BibleQuote[];
  primaryButton: NavLink;
  secondaryButton: NavLink;
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

// ---------------------------- Stats --------------------------------------------

export const communityStats: Stat[] = [
  { value: "50+", label: "Chapters" },
  { value: "5,000+", label: "Members" },
  { value: "30+", label: "Years of Service" },
  { value: "100,000+", label: "Enthronement" },
];

// ---------------------------- Mission Section ----------------------------

export const missionContent: MissionContent = {
  eyebrow: "Our Mission",
  title: "Spreading God’s Mercy through Faith, Service, and Community",
  description:
    "To live out the message of Jesus to St. Faustina to exercise mercy to our neighbor always and everywhere by deed, word, and prayer. We carry out corporal and spiritual acts of mercy, evangelization, propagation, and building communities.",
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
    { src: diaryImage, alt: "Diary of St. Faustina" },
  ],
};

export const pillarsContent: PillarsContent = {
  eyebrow: "What Guides Us",
  title: "Grounded in Three Pillars",
  items: [
    {
      title: "Faith",
      Icon: Plus,
      description:
        "Centered on the message of Divine Mercy, we nurture a deeper trust in God through prayer, devotion, and spiritual formation.",
    },
    {
      title: "Service",
      Icon: Heart,
      description:
        "Inspired by mercy in action, we respond to the needs of others through outreach programs, charitable initiatives, and acts of compassion.",
    },
    {
      title: "Community",
      Icon: Users,
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
};

// ------------------------------- Community / Gallery ----------------------------------

export const communityGallery: CommunityGallery = {
  eyebrow: "Our Community",
  title: "Faces of Faith",
  description:
    "Hundreds of members across different chapters — each one a living witness to the mercy and love of God. We are a family united in faith, dedicated to spreading the message of compassion and hope.",
  image: { src: communityImage, alt: "Faces of Faith - FDM Community Gallery" },
};

// ---------------------------- Story --------------------------------------------

export const story: StoryContent = {
  eyebrow: "Our Story",
  title: "Three Decades of Mercy",
  paragraphs: [
    "The Friends of the Divine Mercy began in 1991 when Bro. Rene Tumang, a veteran of the charismatic movement, formed a small community devoted to prayer and the message of Divine Mercy.",
    "A humble group of young professionals grew into a mission of devotion, evangelization, and outreach, culminating in the establishment of the Friends of the Divine Mercy Foundation in 2021 to continue spreading God’s mercy through works of compassion and service.",
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
