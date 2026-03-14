"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import webIcon from "@/app/assets/media/web-icon.png";
import { usePathname } from "next/navigation";
import { PanelLeftClose, PanelLeftOpen, LogOut } from "lucide-react";
import { SIDEBAR_NAV, ROLE_LABELS } from "@/config/sidebar-navigation";
import { useUser } from "@/lib/context/user-context";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onMobileClose?: () => void;
  isMobile?: boolean;
}

export function Sidebar({ onMobileClose, isMobile = false }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useUser();
  const pathname = usePathname();

  const isCollapsed = collapsed && !isMobile;

  const visibleGroups = SIDEBAR_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => item.roles.includes(user.role)),
  })).filter((group) => group.items.length > 0);

  return (
    <TooltipProvider delayDuration={0}>
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
          <div
            className={cn(
              "flex items-center gap-2 transition-all duration-300 overflow-hidden",
              isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
            )}
          >
            <Link href="/" className="shrink-0" title="Navigate to Home">
              <Image
                src={webIcon}
                alt="FDM Logo"
                className="h-8 w-8 rounded-sm object-contain"
              />
            </Link>
            <div className="flex flex-col justify-center">
              <p className="text-sm font-bold text-sidebar-foreground leading-tight whitespace-nowrap">
                FDM
              </p>
              <p className="text-xs text-sidebar-foreground/60 leading-tight mt-1 italic whitespace-nowrap">
                Management System
              </p>
            </div>
          </div>

          {/* Collapse toggle — desktop only */}
          {!isMobile && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  onClick={() => setCollapsed(!collapsed)}
                  className="h-10 w-10 shrink-0 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer"
                  aria-label={
                    isCollapsed ? "Expand sidebar" : "Collapse sidebar"
                  }
                >
                  {isCollapsed ? (
                    <PanelLeftOpen className="h-5 w-5" />
                  ) : (
                    <PanelLeftClose className="h-5 w-5" />
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
        <div className="flex-1 min-h-0 overflow-y-auto px-2 py-3">
          <nav className="flex flex-col gap-1">
            {visibleGroups.map((group) => (
              <div key={group.group} className="">
                {!isCollapsed ? (
                  <p className="px-3 mb-2 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/50">
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
                          : "text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent",
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

        {/* Footer — user info + sign out */}
        <div className="border-t border-sidebar-border p-3 shrink-0">
          {!isCollapsed ? (
            <div className="flex items-center gap-3 p-2">
              <Avatar className="h-8 w-8 shrink-0">
                <AvatarFallback className="bg-sidebar-primary/30 text-sidebar-foreground text-xs font-semibold">
                  {user.initials}
                </AvatarFallback>
              </Avatar>
              <div
                className={cn(
                  "flex-1 min-w-0 transition-all duration-300 overflow-hidden",
                  isCollapsed ? "w-0 opacity-0" : "w-auto opacity-100",
                )}
              >
                <p className="text-sm font-medium truncate text-sidebar-foreground whitespace-nowrap">
                  {user.name}
                </p>
                <span className="text-xs mt-1 border-sidebar-border text-sidebar-foreground/70 whitespace-nowrap">
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 shrink-0 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign Out</TooltipContent>
              </Tooltip>
            </div>
          ) : (
            <div className="flex justify-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    className="h-10 w-10 shrink-0 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent cursor-pointer"
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">Sign Out</TooltipContent>
              </Tooltip>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
