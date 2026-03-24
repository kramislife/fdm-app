"use client";

import { Bell, Menu } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

import type { DashboardSessionUser } from "@/lib/types/types";

import { UserDropdown } from "@/components/shared/user-dropdown";
import { useSignOut } from "@/hooks/use-sign-out";
import { ROLE_LABELS } from "@/lib/constants/app-roles";
import { useUser } from "@/lib/context/user-context";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const sessionUser = useUser();
  const signOut = useSignOut();
  const [isPending, startTransition] = useTransition();

  function handleSignOut() {
    startTransition(async () => {
      await signOut();
    });
  }

  return (
    <header className="flex items-center justify-between h-16 px-5 border-b border-border shrink-0 shadow-sm">
      {/* Left: hamburger */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9 shrink-0"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right: bell + avatar dropdown */}
      <div className="flex items-center gap-1 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>

        <UserDropdown
          user={sessionUser}
          showDashboardLink={false}
          onSignOut={handleSignOut}
          isPending={isPending}
          fallbackSecondary={ROLE_LABELS[sessionUser.roles[0]]}
          memberQr={sessionUser.memberQr}
        />
      </div>
    </header>
  );
}
