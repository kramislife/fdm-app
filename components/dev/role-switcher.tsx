"use client";

import { ChevronUp } from "lucide-react";
import { ROLE_LABELS, type AppRole } from "@/config/sidebar-navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const ALL_ROLES = (Object.keys(ROLE_LABELS) as AppRole[]).filter(
  (r) => r !== "member",
);

interface RoleSwitcherProps {
  activeRole: AppRole;
  onRoleChange: (role: AppRole) => void;
}

// DEV ONLY — overrides the sidebar UI display only.
// Does NOT affect server-side role checks (requireAuth / requireRole).
// Switching role here will NOT bypass protected pages or server actions.
export function RoleSwitcher({ activeRole, onRoleChange }: RoleSwitcherProps) {
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
            className="shadow-lg border-2 border-primary/40 bg-background gap-2 font-medium"
          >
            <span className="text-xs text-muted-foreground">Role:</span>
            <span className="text-xs font-semibold text-primary">
              {ROLE_LABELS[activeRole]}
            </span>
            <ChevronUp className="h-3 w-3 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" side="top" className="w-52">
          <DropdownMenuLabel className="text-xs text-muted-foreground">
            Dev — Switch Role
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {ALL_ROLES.map((role) => (
            <DropdownMenuItem
              key={role}
              onClick={() => onRoleChange(role)}
              className="text-sm cursor-pointer"
            >
              <span
                className={
                  activeRole === role ? "font-semibold text-primary" : ""
                }
              >
                {ROLE_LABELS[role]}
              </span>
              {activeRole === role && (
                <span className="ml-auto text-xs text-muted-foreground">
                  active
                </span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
