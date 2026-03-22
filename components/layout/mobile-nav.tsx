"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

import { UserAvatar } from "@/components/shared/user-avatar";
import { Logo } from "@/components/ui/logo";
import { UserQRDialog } from "@/components/shared/qr-code";

import {
  navLinks,
  USER_NAV_ITEMS,
  DASHBOARD_NAV_ITEM,
} from "@/config/navigation";

interface SessionUser {
  name: string;
  initials: string;
  email: string | null;
  isMember: boolean;
  photoUrl?: string | null;
}

interface MobileNavProps {
  sessionUser: SessionUser | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pathname: string;
  showDashboardLink: boolean;
  onSignOut: () => void;
  roleFallback?: string;
  memberQr?: string | null;
}

interface NavItemProps {
  href: string;
  label: string;
  icon?: LucideIcon;
  active: boolean;
  onClick: () => void;
}

// ------------------- Reusable Navigation Item Component -------------------------------
function NavItem({ href, label, icon: Icon, active, onClick }: NavItemProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center p-3 rounded-md text-sm font-medium transition-colors mb-1",
        active
          ? "bg-accent-foreground text-white"
          : "text-muted-foreground hover:text-primary hover:bg-muted",
      )}
    >
      {Icon && <Icon className="mr-2 h-4 w-4 shrink-0" />}
      {label}
    </Link>
  );
}

export function MobileNav({
  sessionUser,
  open,
  onOpenChange,
  pathname,
  showDashboardLink,
  onSignOut,
  roleFallback,
  memberQr,
}: MobileNavProps) {
  const [qrOpen, setQrOpen] = useState(false);
  const close = () => onOpenChange(false);

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Open menu"
            title="Open menu"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          showCloseButton={false}
          className="data-[side=right]:w-4/5"
        >
          {/* Header: Avatar, Name, Email when logged in, Logo when not */}
          <SheetHeader className="border-b pb-4 text-left">
            <SheetTitle>
              {sessionUser ? (
                <UserAvatar
                  initials={sessionUser.initials}
                  photoUrl={sessionUser.photoUrl}
                  name={sessionUser.name}
                  secondary={sessionUser.email ?? roleFallback}
                />
              ) : (
                <Logo size="w-16" />
              )}
            </SheetTitle>
            <SheetDescription className="sr-only">
              Navigation Menu
            </SheetDescription>
          </SheetHeader>

          {/* Nav: public links, then auth links separated by a line */}
          <nav className="flex flex-col px-2">
            {navLinks.map((link) => (
              <NavItem
                key={link.href}
                href={link.href}
                label={link.label}
                icon={link.icon}
                active={pathname === link.href}
                onClick={close}
              />
            ))}

            {sessionUser && (
              <>
                <div className="my-2 h-px bg-border" />

                {showDashboardLink && (
                  <NavItem
                    href={DASHBOARD_NAV_ITEM.href}
                    label={DASHBOARD_NAV_ITEM.label}
                    icon={DASHBOARD_NAV_ITEM.icon}
                    active={pathname === DASHBOARD_NAV_ITEM.href}
                    onClick={close}
                  />
                )}

                {USER_NAV_ITEMS.map((item) =>
                  item.href === "/my-qr" ? (
                    <button
                      key={item.href}
                      type="button"
                      disabled={!memberQr}
                      onClick={() => {
                        if (memberQr) {
                          close();
                          setQrOpen(true);
                        }
                      }}
                      className="flex items-center p-3 rounded-md text-sm font-medium transition-colors mb-1 text-muted-foreground hover:text-primary hover:bg-muted cursor-pointer"
                    >
                      <item.icon className="mr-2 h-4 w-4 shrink-0" />
                      {item.label}
                    </button>
                  ) : (
                    <NavItem
                      key={item.href}
                      href={item.href}
                      label={item.label}
                      icon={item.icon}
                      active={pathname === item.href}
                      onClick={close}
                    />
                  ),
                )}
              </>
            )}
          </nav>

          {/* Footer: Sign Out or Sign In */}
          <SheetFooter className="border-t">
            {sessionUser ? (
              <Button onClick={onSignOut} className="w-full h-12">
                Sign Out
              </Button>
            ) : (
              <Button asChild className="w-full h-12">
                <Link href="/login" onClick={close}>
                  Sign In
                </Link>
              </Button>
            )}
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {memberQr && sessionUser && (
        <UserQRDialog
          memberQr={memberQr}
          userName={sessionUser.name}
          open={qrOpen}
          onOpenChange={setQrOpen}
        />
      )}
    </>
  );
}
