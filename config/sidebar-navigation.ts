import type { ComponentType } from "react";
import { BsCalendar2DateFill, BsCalendar2HeartFill } from "react-icons/bs";
import { GoPasskeyFill } from "react-icons/go";
import {
  FaChurch,
  FaCodeBranch,
  FaHandHoldingMedical,
  FaUserCheck,
  FaUsers,
  FaUserSecret,
} from "react-icons/fa";
import { RiHandCoinFill } from "react-icons/ri";
import { FaBuildingUser, FaPeopleGroup, FaUsersGear } from "react-icons/fa6";
import { BiSolidCalendarCheck } from "react-icons/bi";
import { IoMdMegaphone } from "react-icons/io";
import { GiCrownOfThorns } from "react-icons/gi";
import { MdChurch, MdDashboardCustomize } from "react-icons/md";

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
  icon: ComponentType<{ className?: string }>;
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
        icon: MdDashboardCustomize,
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
        icon: FaPeopleGroup,
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
        icon: FaUsersGear,
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
        icon: FaCodeBranch,
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
        icon: MdChurch,
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
        icon: BsCalendar2DateFill,
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
        icon: FaUserCheck,
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
        icon: FaUserSecret,
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
        icon: GiCrownOfThorns,
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
        icon: RiHandCoinFill,
        roles: ["spiritual_director", "elder", "head_servant", "finance"],
      },
      {
        label: "Announcements",
        href: "/dashboard/announcements",
        icon: IoMdMegaphone,
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
        icon: BiSolidCalendarCheck,
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
        icon: FaUsers,
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
        icon: FaChurch,
        roles: ["spiritual_director", "elder", "head_servant"],
      },
      {
        label: "Chapters",
        href: "/dashboard/admin/chapters",
        icon: FaBuildingUser,
        roles: ["spiritual_director", "elder"],
      },
      {
        label: "Ministry Types",
        href: "/dashboard/admin/ministry-types",
        icon: FaHandHoldingMedical,
        roles: ["spiritual_director", "elder"],
      },
      {
        label: "Event Types",
        href: "/dashboard/admin/event-types",
        icon: BsCalendar2HeartFill,
        roles: ["spiritual_director", "elder"],
      },
      {
        label: "Roles",
        href: "/dashboard/admin/roles",
        icon: GoPasskeyFill,
        roles: ["spiritual_director", "elder"],
      },
    ],
  },
];
