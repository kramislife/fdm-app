"use client";

import { Bell, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardHeaderProps {
  onMenuClick: () => void;
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  return (
    <header className="flex items-center justify-between h-16 px-5 border-b border-border shrink-0">
      {/* Left: hamburger + title + breadcrumbs */}
      <div className="flex items-center gap-3 min-w-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuClick}
          className="lg:hidden h-9 w-9 shrink-0 cursor-pointer"
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>

      {/* Right: bell + user avatar + chapter badge */}
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 text-muted-foreground hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}

// "use client";

// import { Bell, Menu } from "lucide-react";
// import { usePathname } from "next/navigation";
// import { Button } from "@/components/ui/button";
// import { Avatar, AvatarFallback } from "@/components/ui/avatar";
// import { Badge } from "@/components/ui/badge";
// import { useUser } from "@/lib/context/user-context";
// import { ROLE_LABELS } from "@/config/sidebar-navigation";

// const PAGE_TITLES: Record<string, string> = {
//   "/dashboard": "Dashboard",
//   "/dashboard/members": "Members",
//   "/dashboard/guests": "Guests",
//   "/dashboard/clusters": "Clusters",
//   "/dashboard/ministries": "Ministries",
//   "/dashboard/events": "Events",
//   "/dashboard/attendance": "Attendance",
//   "/dashboard/encode": "Guest Encode",
//   "/dashboard/enthronements": "Enthronements",
//   "/dashboard/finance": "Finance",
//   "/dashboard/announcements": "Announcements",
//   "/dashboard/reports": "General Assembly",
//   "/dashboard/my-qr": "My QR Code",
//   "/dashboard/my-attendance": "My Attendance",
//   "/dashboard/admin/users": "Users",
//   "/dashboard/admin/chapters": "Chapters",
//   "/dashboard/admin/areas": "Areas & Clusters",
//   "/dashboard/admin/ministries": "Ministries",
//   "/dashboard/admin/ministry-types": "Ministry Types",
//   "/dashboard/admin/event-types": "Event Types",
//   "/dashboard/admin/roles": "Roles",
// };

// interface DashboardHeaderProps {
//   onMenuClick: () => void;
// }

// export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
//   const { user } = useUser();
//   const pathname = usePathname();
//   const title = PAGE_TITLES[pathname] ?? "Dashboard";

//   return (
//     <header className="flex items-center justify-between h-16 px-5 border-b border-border shrink-0">
//       {/* Left: hamburger + title + breadcrumbs */}
//       <div className="flex items-center gap-3 min-w-0">
//         <Button
//           variant="ghost"
//           size="icon"
//           onClick={onMenuClick}
//           className="lg:hidden h-9 w-9 shrink-0"
//           aria-label="Open menu"
//         >
//           <Menu className="h-5 w-5" />
//         </Button>

//         <div className="flex items-center gap-2 min-w-0">
//           <h1 className="text-base md:text-lg font-semibold truncate">
//             {title}
//           </h1>
//         </div>
//       </div>

//       {/* Right: bell + user avatar + chapter badge */}
//       <div className="flex items-center gap-2 shrink-0">
//         <Button
//           variant="ghost"
//           size="icon"
//           className="h-9 w-9 text-muted-foreground hover:text-foreground"
//           aria-label="Notifications"
//         >
//           <Bell className="h-5 w-5" />
//         </Button>

//         <div className="hidden sm:flex items-center gap-2">
//           <div className="text-right">
//             <p className="text-sm font-medium leading-tight">{user.name}</p>
//             <p className="text-xs text-muted-foreground leading-tight">
//               {ROLE_LABELS[user.role]}
//             </p>
//           </div>
//           <Avatar className="h-8 w-8">
//             <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
//               {user.initials}
//             </AvatarFallback>
//           </Avatar>
//         </div>

//         <Badge
//           variant="outline"
//           className="hidden md:inline-flex text-xs shrink-0"
//         >
//           {user.chapter}
//         </Badge>
//       </div>
//     </header>
//   );
// }
