import {
  LayoutDashboard,
  Users,
  UserCheck,
  Network,
  Church,
  CalendarDays,
  ClipboardList,
  UserPlus,
  Heart,
  DollarSign,
  Megaphone,
  FileBarChart,
  UserCog,
  Building2,
  MapPin,
  Tag,
  Calendar,
  ShieldCheck,
  QrCode,
  CalendarCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AppRole =
  | "sd"
  | "elder"
  | "hs"
  | "ahs"
  | "mh"
  | "builder"
  | "cluster_head"
  | "mc"
  | "finance"
  | "member";

export const ROLE_LABELS: Record<AppRole, string> = {
  sd: "Spiritual Director",
  elder: "Elder",
  hs: "Head Servant",
  ahs: "Asst. Head Servant",
  mh: "Ministry Head",
  builder: "Builder",
  cluster_head: "Cluster Head",
  mc: "Master of Ceremonies",
  finance: "Finance Officer",
  member: "Member",
};

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: AppRole[];
}

export interface NavGroup {
  group: string;
  items: NavItem[];
}

export const SIDEBAR_NAV: NavGroup[] = [
  {
    group: "OVERVIEW",
    items: [
      {
        label: "Dashboard",
        href: "/dashboard",
        icon: LayoutDashboard,
        roles: [
          "sd",
          "elder",
          "hs",
          "ahs",
          "mh",
          "builder",
          "cluster_head",
          "mc",
          "finance",
          "member",
        ],
      },
    ],
  },
  {
    group: "COMMUNITY",
    items: [
      {
        label: "Members",
        href: "/dashboard/members",
        icon: Users,
        roles: ["sd", "elder", "hs", "ahs", "mh"],
      },
      {
        label: "Guests",
        href: "/dashboard/guests",
        icon: UserCheck,
        roles: ["sd", "elder", "hs", "ahs"],
      },
      {
        label: "Clusters",
        href: "/dashboard/clusters",
        icon: Network,
        roles: ["sd", "elder", "hs", "ahs", "builder", "cluster_head"],
      },
      {
        label: "Ministries",
        href: "/dashboard/ministries",
        icon: Church,
        roles: ["sd", "elder", "hs", "mc", "mh"],
      },
    ],
  },
  {
    group: "EVENTS",
    items: [
      {
        label: "Events",
        href: "/dashboard/events",
        icon: CalendarDays,
        roles: ["sd", "elder", "hs", "ahs"],
      },
      {
        label: "Attendance",
        href: "/dashboard/attendance",
        icon: ClipboardList,
        roles: ["sd", "elder", "hs", "ahs"],
      },
      {
        label: "Guest Encode",
        href: "/dashboard/encode",
        icon: UserPlus,
        roles: ["ahs"],
      },
    ],
  },
  {
    group: "RECORDS",
    items: [
      {
        label: "Enthronements",
        href: "/dashboard/enthronements",
        icon: Heart,
        roles: ["sd", "elder", "hs", "builder", "cluster_head"],
      },
      {
        label: "Finance",
        href: "/dashboard/finance",
        icon: DollarSign,
        roles: ["sd", "elder", "hs", "finance"],
      },
      {
        label: "Announcements",
        href: "/dashboard/announcements",
        icon: Megaphone,
        roles: ["sd", "elder", "hs", "ahs"],
      },
    ],
  },
  {
    group: "REPORTS",
    items: [
      {
        label: "General Assembly",
        href: "/dashboard/reports",
        icon: FileBarChart,
        roles: ["sd", "elder", "hs"],
      },
    ],
  },
  {
    group: "ADMIN",
    items: [
      {
        label: "Users",
        href: "/dashboard/admin/users",
        icon: UserCog,
        roles: ["sd", "elder", "hs", "ahs"],
      },
      {
        label: "Chapters",
        href: "/dashboard/admin/chapters",
        icon: Building2,
        roles: ["sd", "elder"],
      },
      {
        label: "Areas & Clusters",
        href: "/dashboard/admin/areas",
        icon: MapPin,
        roles: ["sd", "elder", "hs", "ahs"],
      },
      {
        label: "Ministries",
        href: "/dashboard/admin/ministries",
        icon: Church,
        roles: ["sd", "elder", "hs"],
      },
      {
        label: "Ministry Types",
        href: "/dashboard/admin/ministry-types",
        icon: Tag,
        roles: ["sd", "elder"],
      },
      {
        label: "Event Types",
        href: "/dashboard/admin/event-types",
        icon: Calendar,
        roles: ["sd", "elder"],
      },
      {
        label: "Roles",
        href: "/dashboard/admin/roles",
        icon: ShieldCheck,
        roles: ["sd", "elder"],
      },
    ],
  },
  {
    group: "MY ACCOUNT",
    items: [
      {
        label: "My QR Code",
        href: "/dashboard/my-qr",
        icon: QrCode,
        roles: ["member"],
      },
      {
        label: "My Attendance",
        href: "/dashboard/my-attendance",
        icon: CalendarCheck,
        roles: ["member"],
      },
    ],
  },
];
