"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import { Logo } from "@/components/ui/logo";
import { UserDropdown } from "@/components/shared/user-dropdown";
import { MobileNav } from "@/components/layout/mobile-nav";

import { navLinks } from "@/config/navigation";
import { ROLE_LABELS, type RoleKey } from "@/lib/app-roles";
import { useSignOut } from "@/hooks/use-sign-out";
import { useMobileSheet } from "@/hooks/use-mobile-sheet";

import type { BaseUser } from "@/lib/types";

interface SessionUser extends BaseUser {
  isMember: boolean;
  roles: RoleKey[];
}

interface PublicHeaderProps {
  sessionUser: SessionUser | null;
}

export function PublicHeader({ sessionUser }: PublicHeaderProps) {
  const pathname = usePathname();
  const { open, setOpen } = useMobileSheet();
  const signOut = useSignOut();
  const [isPending, startTransition] = useTransition();

  const isInDashboard = pathname.startsWith("/dashboard");
  const showDashboardLink =
    !!sessionUser && !sessionUser.isMember && !isInDashboard;
  const roleFallback = sessionUser?.roles[0]
    ? ROLE_LABELS[sessionUser.roles[0]]
    : undefined;

  function handleSignOut() {
    startTransition(async () => {
      setOpen(false);
      await signOut();
    });
  }

  return (
    <header className="fixed top-0 left-1/2 -translate-x-1/2 z-50 max-w-480 w-full border-b bg-background shadow-sm">
      <div className="mx-auto flex h-15 items-center justify-between px-5">
        <Logo size="w-20" />

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-5 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === link.href
                  ? "text-primary"
                  : "text-muted-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {sessionUser ? (
            <div className="hidden md:block">
              <UserDropdown
                user={sessionUser}
                showDashboardLink={showDashboardLink}
                onSignOut={handleSignOut}
                isPending={isPending}
                fallbackSecondary={roleFallback}
              />
            </div>
          ) : (
            <Button asChild className="hidden md:flex" size="lg">
              <Link href="/login">Sign In</Link>
            </Button>
          )}

          <MobileNav
            sessionUser={sessionUser}
            open={open}
            onOpenChange={setOpen}
            pathname={pathname}
            showDashboardLink={showDashboardLink}
            onSignOut={handleSignOut}
            roleFallback={roleFallback}
          />
        </div>
      </div>
    </header>
  );
}
