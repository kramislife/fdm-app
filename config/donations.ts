import type { SectionWithDescription } from "@/lib/types/types";

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  number: string;
  accountName: string;
  numberLabel: string;
  gradient: string;
  shadow: string;
  purpose?: string;
}

export interface DonationStep {
  number: string;
  title: string;
  description: string;
}

// ----------------------------------- Hero ------------------------------------

export const heroContent: SectionWithDescription = {
  title: "Donate & Support Our Mission",
  description:
    "Support our community programs, spiritual activities, and outreach. Every gift — big or small — keeps the mission alive.",
};

// ----------------------------------- Payment Methods ------------------------------------

export const paymentMethods: PaymentMethod[] = [
  {
    id: "gcash",
    name: "GCash",
    type: "e-Wallet",
    number: "0917 798 3366",
    accountName: "Nihra Owe",
    numberLabel: "MOBILE NUMBER",
    gradient: "linear-gradient(135deg, #004BD4 0%, #0066FF 50%, #0052E8 100%)",
    shadow: "0 14px 36px 0 rgba(0, 102, 255, 0.21)",
  },
  {
    id: "gcash-biyayang-bigas",
    name: "GCash",
    type: "e-Wallet",
    number: "0927 370 8350",
    accountName: "Nihra Owe",
    numberLabel: "MOBILE NUMBER",
    gradient: "linear-gradient(135deg, #004BD4 0%, #0066FF 50%, #0052E8 100%)",
    shadow: "0 14px 36px 0 rgba(0, 102, 255, 0.21)",
    purpose: "Biyayang Bigas",
  },
  {
    id: "security-bank",
    name: "Security Bank",
    type: "Savings Account",
    number: "00000 4478 3520",
    accountName: "Friends of the Divine Mercy Missionaries Foundation, Inc.",
    numberLabel: "ACCOUNT NUMBER",
    gradient: "linear-gradient(135deg, #8B0000 0%, #C0001A 50%, #7A0016 100%)",
    shadow: "0 14px 36px 0 rgba(192, 0, 26, 0.21)",
  },
];

// ----------------------------------- Steps ------------------------------------

export const stepsContent: DonationStep[] = [
  {
    number: "1",
    title: "Choose a Channel",
    description:
      "Select GCash or Security Bank transfer based on your preferred payment method.",
  },
  {
    number: "2",
    title: "Copy Account Details",
    description:
      "Tap the account number on the card to copy it instantly. Paste directly into your banking app.",
  },
  {
    number: "3",
    title: "Send & Notify",
    description:
      "Complete the transfer then send a screenshot to your chapter coordinator for confirmation.",
  },
];
