import { MapPin, Mail, Phone } from "lucide-react";
import { FaFacebookF, FaInstagram, FaTiktok, FaYoutube } from "react-icons/fa";

import churchImage from "@/app/assets/media/home-of-mercy.jpg";

import type {
  BaseImage,
  ContactItem,
  SocialLink,
  SectionWithDescription,
  BaseSection,
} from "@/lib/types/types";

export interface ContactSection {
  title: string;
  image: BaseImage & { badge: string };
  items: ContactItem[];
}

export interface InquiryType {
  value: string;
  label: string;
}

export interface MapContent extends BaseSection {
  address: string;
  src: string;
}

export interface FormContent extends SectionWithDescription {
  submitLabel: string;
}

// ----------------------------------- Hero ------------------------------------

export const heroContent: SectionWithDescription = {
  title: "Connect With Us",
  description:
    "Seeking guidance, sharing a prayer request, or looking to serve? Our hearts and doors are always open to you. Connect with us and let us walk together in the light of the Divine Mercy.",
};

// ----------------------------------- Contact ------------------------------------

export const contactSection: ContactSection = {
  title: "Contact Information",
  image: {
    src: churchImage,
    alt: "Home of Mercy - Pasay City",
    badge: "Home of Mercy · Pasay City",
  },
  items: [
    {
      Icon: MapPin,
      label: "Address",
      value: "1839 Leogardo St., Corner Sandejas St. Pasay City, Philippines",
      href: "https://maps.app.goo.gl/Moso5kYr7AVe1w8D6",
    },
    {
      Icon: Mail,
      label: "Email",
      value: "socialmediafriends2017@gmail.com",
      href: "mailto:socialmediafriends2017@gmail.com",
    },
    {
      Icon: Phone,
      label: "Mobile",
      value: "+63 917 798 3366",
    },
  ],
};

// ----------------------------------- Inquiry Types ------------------------------------

export const inquiryTypes: InquiryType[] = [
  { value: "general_inquiry", label: "General Inquiry" },
  { value: "prayer_request", label: "Prayer Request" },
  { value: "enthronement", label: "Enthronement" },
  { value: "donations", label: "Donations" },
  { value: "other", label: "Other" },
];

// ----------------------------------- Social Links ------------------------------------

export const socialLinks: SocialLink[] = [
  {
    Icon: FaFacebookF,
    label: "Facebook",
    href: "https://www.facebook.com/friendsofdivinemercy",
  },

  {
    Icon: FaTiktok,
    label: "TikTok",
    href: "https://tiktok.com/@friendsofthedivinemercy",
  },
  {
    Icon: FaYoutube,
    label: "YouTube",
    href: "https://youtube.com/@friendsofthedivinemercyfou456",
  },
  {
    Icon: FaInstagram,
    label: "Instagram",
    href: "https://instagram.com/friendsofdivinemercy",
  },
  {
    Icon: Mail,
    label: "Email",
    href: "mailto:socialmediafriends2017@gmail.com",
  },
];

// ----------------------------------- Map ------------------------------------

export const mapContent: MapContent = {
  title: "Our Location",
  address: "1839 Leogardo St., Corner Sandejas St., Pasay City",
  src: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3861.7219355131297!2d120.99510767468269!3d14.557887385923445!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3397c97a9540ef3b%3A0x31236da4b0bf1d1d!2sFriends%20of%20the%20Divine%20Mercy!5e0!3m2!1sen!2sph!4v1778036895287!5m2!1sen!2sph",
};

// ----------------------------------- Form ------------------------------------

export const formContent: FormContent = {
  title: "Send a Message",
  description: "Our team will get back to you within 24 hours.",
  submitLabel: "Send Message",
};
