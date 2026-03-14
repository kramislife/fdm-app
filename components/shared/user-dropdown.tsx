import Link from "next/link";
import { LogOut } from "lucide-react";
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export interface UserDropdownProps {
  user: BaseUser;
  showDashboardLink: boolean;
  onSignOut: () => void;
}

export function UserDropdown({
  user: { name, initials, email },
  showDashboardLink,
  onSignOut,
}: UserDropdownProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="p-0 cursor-pointer hover:bg-transparent">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="bg-primary text-white text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-52">
        {/* User identity */}
        <DropdownMenuLabel>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 shrink-0">
              <AvatarFallback className="bg-primary text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-bold truncate mb-1">{name}</p>
              <p className="text-xs text-muted-foreground truncate">{email}</p>
            </div>
          </div>
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
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
