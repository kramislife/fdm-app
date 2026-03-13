import type { StaticImageData } from "next/image";
import type { LucideIcon } from "lucide-react";
import type { IconType } from "react-icons";

// ---------------------------- Base Config Types ----------------------------

export interface BaseImage {
  src: StaticImageData;
  alt: string;
}

export interface BaseSection {
  eyebrow?: string;
  title: string;
}

export interface SectionWithDescription extends BaseSection {
  description: string;
}

export interface SectionWithImage extends SectionWithDescription {
  image: BaseImage;
}

// ---------------------------- Common UI Types ----------------------------

export interface NavLink {
  label: string;
  href: string;
}

export interface SocialLink {
  Icon: IconType;
  label: string;
  href: string;
}

export interface PillarItem {
  title: string;
  Icon: LucideIcon;
  description: string;
}

export interface ContactItem {
  Icon: LucideIcon;
  label: string;
  value: string;
}
