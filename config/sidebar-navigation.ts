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
import type { RoleKey } from "@/lib/constants/app-roles";

export interface NavItem {
  label: string;
  href: string;
  icon: ComponentType<{ className?: string }>;
  roles: RoleKey[];
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
          "director_adviser",
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
          "director_adviser",
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
          "director_adviser",
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
          "director_adviser",
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
          "director_adviser",
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
        href: "/dashboard/admin/events",
        icon: BsCalendar2DateFill,
        roles: ["director_adviser", "elder", "head_servant"],
      },
      {
        label: "Attendance",
        href: "/dashboard/attendance",
        icon: FaUserCheck,
        roles: [
          "director_adviser",
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
          "director_adviser",
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
        roles: [
          "director_adviser",
          "elder",
          "head_servant",
          "finance_head",
          "finance",
        ],
      },
      {
        label: "Announcements",
        href: "/dashboard/announcements",
        icon: IoMdMegaphone,
        roles: [
          "director_adviser",
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
        roles: ["director_adviser", "elder", "head_servant"],
      },
    ],
  },
  {
    group: "CONFIGURATION",
    items: [
      {
        label: "Users",
        href: "/dashboard/admin/users",
        icon: FaUsers,
        roles: [
          "director_adviser",
          "elder",
          "head_servant",
          "asst_head_servant",
        ],
      },
      {
        label: "Chapter Ministries",
        href: "/dashboard/admin/chapter-ministries",
        icon: FaChurch,
        roles: ["director_adviser", "elder", "head_servant"],
      },
      {
        label: "Chapters",
        href: "/dashboard/admin/chapters",
        icon: FaBuildingUser,
        roles: ["director_adviser", "elder"],
      },
      {
        label: "Ministry Types",
        href: "/dashboard/admin/ministry-types",
        icon: FaHandHoldingMedical,
        roles: ["director_adviser", "elder"],
      },
      {
        label: "Event Types",
        href: "/dashboard/admin/event-types",
        icon: BsCalendar2HeartFill,
        roles: ["director_adviser", "elder"],
      },
      {
        label: "Roles",
        href: "/dashboard/admin/roles",
        icon: GoPasskeyFill,
        roles: ["director_adviser", "elder"],
      },
    ],
  },
];
