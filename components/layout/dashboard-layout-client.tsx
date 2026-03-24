"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";

import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { RoleSwitcher } from "@/components/dev/role-switcher";
import { UserProvider } from "@/lib/context/user-context";

import { useMobileSheet } from "@/hooks/use-mobile-sheet";

import type { RoleKey } from "@/lib/constants/app-roles";
import type { DashboardSessionUser } from "@/lib/types/types";

interface DashboardLayoutClientProps {
  children: React.ReactNode;
  sessionUser: DashboardSessionUser;
}

export function DashboardLayoutClient({
  children,
  sessionUser,
}: DashboardLayoutClientProps) {
  const { open, setOpen } = useMobileSheet();
  const [devRole, setDevRole] = useState<RoleKey | null>(null);

  // In dev, the switcher can override the active role for sidebar filtering
  const activeRoles = devRole ? [devRole] : sessionUser.roles;
  const effectiveUser = { ...sessionUser, roles: activeRoles };

  return (
    <UserProvider user={effectiveUser}>
      <div className="flex h-screen max-w-480 mx-auto overflow-hidden border-x">
        {/* Admin Sidebar for Desktop */}
        <div className="hidden lg:flex shrink-0">
          <Sidebar />
        </div>

        {/* Mobile Sidebar */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent
            side="left"
            showCloseButton={false}
            className="data-[side=left]:w-4/5"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Sidebar
              isMobile
              onMobileClose={() => setOpen(false)}
            />
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <DashboardHeader
            onMenuClick={() => setOpen(true)}
          />
          <main className="flex-1 overflow-y-auto p-5">{children}</main>
        </div>

        {/* <RoleSwitcher
          activeRole={devRole ?? sessionUser.roles[0]}
          onRoleChange={setDevRole}
        /> */}
      </div>
    </UserProvider>
  );
}
