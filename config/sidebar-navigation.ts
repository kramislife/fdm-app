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
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type AppRole =
  | "spiritual_director"
  | "elder"
  | "head_servant"
  | "asst_head_servant"
  | "ministry_head"
  | "builder"
  | "cluster_head"
  | "ministry_coordinator"
  | "finance"
  | "member";

export const ROLE_LABELS: Record<AppRole, string> = {
  spiritual_director: "Spiritual Director",
  elder: "Elder",
  head_servant: "Head Servant",
  asst_head_servant: "Asst. Head Servant",
  ministry_head: "Ministry Head",
  builder: "Builder",
  cluster_head: "Cluster Head",
  ministry_coordinator: "Master of Ceremonies",
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
          "spiritual_director",
          "elder",
          "head_servant",
          "asst_head_servant",
          "ministry_head",
          "builder",
          "cluster_head",
          "ministry_coordinator",
          "finance",
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
        roles: [
          "spiritual_director",
          "elder",
          "head_servant",
          "asst_head_servant",
          "ministry_head",
        ],
      },
      {
        label: "Guests",
        href: "/dashboard/guests",
        icon: UserCheck,
        roles: [
          "spiritual_director",
          "elder",
          "head_servant",
          "asst_head_servant",
        ],
      },
      {
        label: "Clusters",
        href: "/dashboard/clusters",
        icon: Network,
        roles: [
          "spiritual_director",
          "elder",
          "head_servant",
          "asst_head_servant",
          "builder",
          "cluster_head",
        ],
      },
      {
        label: "Ministries",
        href: "/dashboard/ministries",
        icon: Church,
        roles: [
          "spiritual_director",
          "elder",
          "head_servant",
          "ministry_coordinator",
          "ministry_head",
        ],
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
        roles: [
          "spiritual_director",
          "elder",
          "head_servant",
          "asst_head_servant",
        ],
      },
      {
        label: "Attendance",
        href: "/dashboard/attendance",
        icon: ClipboardList,
        roles: [
          "spiritual_director",
          "elder",
          "head_servant",
          "asst_head_servant",
        ],
      },
      {
        label: "Guest Encode",
        href: "/dashboard/encode",
        icon: UserPlus,
        roles: ["asst_head_servant"],
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
        roles: [
          "spiritual_director",
          "elder",
          "head_servant",
          "builder",
          "cluster_head",
        ],
      },
      {
        label: "Finance",
        href: "/dashboard/finance",
        icon: DollarSign,
        roles: ["spiritual_director", "elder", "head_servant", "finance"],
      },
      {
        label: "Announcements",
        href: "/dashboard/announcements",
        icon: Megaphone,
        roles: [
          "spiritual_director",
          "elder",
          "head_servant",
          "asst_head_servant",
        ],
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
        roles: ["spiritual_director", "elder", "head_servant"],
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
        roles: [
          "spiritual_director",
          "elder",
          "head_servant",
          "asst_head_servant",
        ],
      },
      {
        label: "Chapters",
        href: "/dashboard/admin/chapters",
        icon: Building2,
        roles: ["spiritual_director", "elder"],
      },
      {
        label: "Areas & Clusters",
        href: "/dashboard/admin/areas",
        icon: MapPin,
        roles: [
          "spiritual_director",
          "elder",
          "head_servant",
          "asst_head_servant",
        ],
      },
      {
        label: "Ministries",
        href: "/dashboard/admin/ministries",
        icon: Church,
        roles: ["spiritual_director", "elder", "head_servant"],
      },
      {
        label: "Ministry Types",
        href: "/dashboard/admin/ministry-types",
        icon: Tag,
        roles: ["spiritual_director", "elder"],
      },
      {
        label: "Event Types",
        href: "/dashboard/admin/event-types",
        icon: Calendar,
        roles: ["spiritual_director", "elder"],
      },
      {
        label: "Roles",
        href: "/dashboard/admin/roles",
        icon: ShieldCheck,
        roles: ["spiritual_director", "elder"],
      },
    ],
  },
];
