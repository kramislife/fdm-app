"use client";

import { useState } from "react";
import { UserProvider } from "@/lib/context/user-context";
import { Sidebar } from "@/components/layout/sidebar";
import { DashboardHeader } from "@/components/layout/dashboard-header";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { RoleSwitcher } from "@/components/dev/role-switcher";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <UserProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Desktop sidebar — fixed, hidden on mobile */}
        <div className="hidden lg:flex shrink-0">
          <Sidebar />
        </div>

        {/* Mobile sidebar — Sheet drawer */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent
            side="left"
            className="data-[side=left]:w-1/2 bg-sidebar overflow-hidden"
          >
            <SheetTitle className="sr-only">Navigation</SheetTitle>
            <Sidebar isMobile onMobileClose={() => setMobileOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          <DashboardHeader onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto p-5">{children}</main>
        </div>
      </div>
      <RoleSwitcher />
    </UserProvider>
  );
}
