"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import webIcon from "@/app/assets/media/web-icon.png";
import { UserAvatar } from "@/components/shared/user-avatar";

import type { DashboardSessionUser } from "@/lib/types";
import { SIDEBAR_NAV, ROLE_LABELS } from "@/config/sidebar-navigation";
import {
  TbLayoutSidebarLeftCollapseFilled,
  TbLayoutSidebarRightCollapseFilled,
} from "react-icons/tb";

interface SidebarProps {
  sessionUser: DashboardSessionUser;
  onMobileClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({
  sessionUser,
  onMobileClose,
  isMobile = false,
}: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const isCollapsed = collapsed && !isMobile;

  const visibleGroups = SIDEBAR_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.roles.some((r) => sessionUser.roles.includes(r)),
    ),
  })).filter((group) => group.items.length > 0);

  return (
    <TooltipProvider>
      <aside
        className={cn(
          "flex flex-col h-full bg-sidebar/50 text-sidebar-foreground border-r border-sidebar-border transition-all duration-200",
          isMobile ? "w-full" : isCollapsed ? "w-16" : "w-68",
        )}
      >
        {/* Brand header + collapse toggle */}
        <div
          className={cn(
            "flex items-center h-16 border-b border-sidebar-border shrink-0 px-2",
            isCollapsed ? "justify-center" : "justify-between",
          )}
        >
          {/* Brand — left aligned */}
          <Link
            href="/"
            title="Navigate to Home"
            className={cn(
              "group flex items-center gap-2 transition-all duration-300 overflow-hidden cursor-pointer",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100 ml-2",
            )}
          >
            <Image
              src={webIcon}
              alt="FDM Logo"
              className="h-8 w-8 shrink-0 object-cover"
            />
            <div className="flex flex-col justify-center">
              <p className="text-sm font-bold text-sidebar-foreground group-hover:text-primary transition-colors whitespace-nowrap">
                FDM
              </p>
              <p className="text-xs text-sidebar-foreground/60 group-hover:text-primary transition-colors mt-1 whitespace-nowrap">
                Management System
              </p>
            </div>
          </Link>

          {/* Collapse toggle — desktop only */}
          {!isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => setCollapsed(!collapsed)}
                  className="h-10 w-10 shrink-0 hover:bg-sidebar-accent cursor-pointer"
                  aria-label={
                    isCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                >
                  {isCollapsed ? (
                    <TbLayoutSidebarRightCollapseFilled className="h-5 w-5 text-primary" />
                  ) : (
                    <TbLayoutSidebarLeftCollapseFilled className="h-5 w-5 text-primary" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {isCollapsed ? "Expand" : "Collapse"}
              </TooltipContent>
            </Tooltip>
          )}
        </div>

        {/* Nav items */}
        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-2">
          <nav className="flex flex-col gap-3">
            {visibleGroups.map((group) => (
              <div key={group.group}>
                {!isCollapsed ? (
                  <p className="px-3 my-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
                    {group.group}
                  </p>
                ) : (
                  <Separator className="my-2 bg-sidebar-border" />
                )}

                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/dashboard" &&
                      pathname.startsWith(item.href + "/"));

                  const linkNav = (
                    <Link
                      href={item.href}
                      onClick={onMobileClose}
                      className={cn(
                        "flex items-center p-3 rounded-md text-sm font-medium transition-colors mb-1",
                        isCollapsed ? "justify-center px-0" : "gap-3 px-3",
                        isActive
                          ? "bg-sidebar-primary text-sidebar-primary-foreground"
                          : "text-sidebar-foreground/80 hover:text-primary hover:bg-sidebar-accent",
                      )}
                    >
                      <item.icon className="h-5 w-5 shrink-0" />
                      <span
                        className={cn(
                          "transition-all duration-300 overflow-hidden whitespace-nowrap",
                          isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );

                  if (isCollapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger asChild>{linkNav}</TooltipTrigger>
                        <TooltipContent side="right">
                          {item.label}
                        </TooltipContent>
                      </Tooltip>
                    );
                  }

                  return <div key={item.href}>{linkNav}</div>;
                })}
              </div>
            ))}
          </nav>
        </div>

        {/* Footer — user info */}
        <div
          className={cn(
            "border-t border-sidebar-border p-4",
            isCollapsed && "flex justify-center",
          )}
        >
          <UserAvatar
            initials={sessionUser.initials}
            photoUrl={sessionUser.photoUrl}
            name={isCollapsed ? undefined : sessionUser.name}
            secondary={
              sessionUser.roles[0]
                ? ROLE_LABELS[sessionUser.roles[0]]
                : sessionUser.email
            }
          />
        </div>
      </aside>
    </TooltipProvider>
  );
}
