import {
  Home,
  Info,
  MapPin,
  Phone,
  QrCode,
  CalendarCheck,
  User,
  LayoutDashboard,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { NavLink } from "@/lib/types";

export interface UserNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

// ------------------------- Public Navigation Links -------------------------------
export const navLinks: NavLink[] = [
  { label: "Home", href: "/", icon: Home },
  { label: "About", href: "/about", icon: Info },
  { label: "Chapters", href: "/chapters", icon: MapPin },
  { label: "Contact Us", href: "/contact-us", icon: Phone },
];

// ------------------------- User Navigation Links -------------------------------
export const USER_NAV_ITEMS: UserNavItem[] = [
  { label: "My QR Code", href: "/my-qr", icon: QrCode },
  { label: "My Attendance", href: "/my-attendance", icon: CalendarCheck },
  { label: "My Profile", href: "/profile", icon: User },
];

// ------------------------- Admin Dashboard Navigation Link -------------------------------
export const DASHBOARD_NAV_ITEM: UserNavItem = {
  label: "Dashboard",
  href: "/dashboard",
  icon: LayoutDashboard,
};
