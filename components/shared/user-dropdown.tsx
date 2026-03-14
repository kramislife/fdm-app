"use client";

import Link from "next/link";
import { LogOut, Loader2 } from "lucide-react";
import type { BaseUser } from "@/lib/types";
import { USER_NAV_ITEMS, DASHBOARD_NAV_ITEM } from "@/config/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { UserAvatar } from "@/components/shared/user-avatar";

export interface UserDropdownProps {
  user: BaseUser;
  showDashboardLink: boolean;
  onSignOut: () => void;
  isPending?: boolean;
}

export function UserDropdown({
  user: { name, initials, email },
  showDashboardLink,
  onSignOut,
  isPending = false,
}: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0 cursor-pointer hover:bg-transparent">
          <UserAvatar initials={initials} />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        {/* User identity */}
        <DropdownMenuLabel>
          <UserAvatar initials={initials} name={name} secondary={email} />
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        {/* Dashboard shortcut — non-members not already in /dashboard */}
        {showDashboardLink && (
          <>
            <DropdownMenuItem asChild>
              <Link href={DASHBOARD_NAV_ITEM.href}>
                <DASHBOARD_NAV_ITEM.icon className="mr-2 h-4 w-4" />
                {DASHBOARD_NAV_ITEM.label}
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
          </>
        )}

        {/* Account links */}
        {USER_NAV_ITEMS.map((item) => (
          <DropdownMenuItem key={item.href} asChild>
            <Link href={item.href}>
              <item.icon className="mr-2 h-4 w-4" />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />

        {/* Sign out */}
        <DropdownMenuItem
          onSelect={onSignOut}
          disabled={isPending}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          {isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          {isPending ? "Signing out…" : "Sign Out"}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
