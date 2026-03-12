"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu } from "lucide-react";
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
import { navLinks } from "@/config/navigation";
import { Logo } from "@/components/ui/logo";
import { useCloseOnResize } from "@/hooks/use-close-on-resize";

export function PublicHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Close mobile menu when resizing to desktop using custom hook
  useCloseOnResize(open, setOpen);

  // Shared Auth Link component
  const AuthAction = ({
    className,
    onClick,
  }: {
    className?: string;
    onClick?: () => void;
  }) => (
    <Button asChild className={className} size="lg">
      <Link href="/login" onClick={onClick}>
        Sign In
      </Link>
    </Button>
  );

  // Shared Navigation component
  const NavLinks = ({
    itemClassName,
    activeClassName,
    onClick,
  }: {
    itemClassName?: string;
    activeClassName?: string;
    onClick?: () => void;
  }) => (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onClick}
          className={cn(
            itemClassName,
            pathname === link.href ? activeClassName : "text-muted-foreground",
          )}
        >
          {link.label}
        </Link>
      ))}
    </>
  );

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background shadow-sm">
      <div className="mx-auto flex h-16 items-center justify-between px-5">
        <Logo size="w-20" />

        {/* Desktop nav */}
        <nav className="hidden items-center gap-5 md:flex">
          <NavLinks
            itemClassName="text-sm font-medium transition-colors hover:text-primary"
            activeClassName="text-primary"
          />
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <AuthAction className="hidden md:flex" />

          {/* Mobile hamburger */}
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden cursor-pointer"
                aria-label="Open menu"
                title="Open menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader className="border-b pb-5 text-left">
                <SheetTitle>
                  <Logo size="w-16" />
                </SheetTitle>
                <SheetDescription className="sr-only">
                  Navigation Menu
                </SheetDescription>
              </SheetHeader>

              <nav className="flex flex-col gap-2 px-2">
                <NavLinks
                  onClick={() => setOpen(false)}
                  itemClassName="flex h-12 items-center rounded-md px-5 font-medium"
                  activeClassName="bg-accent-foreground text-white"
                />
              </nav>

              <SheetFooter className="border-t">
                <AuthAction
                  className="w-full cursor-pointer h-12"
                  onClick={() => setOpen(false)}
                />
              </SheetFooter>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
