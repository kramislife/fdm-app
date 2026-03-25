import {
  UserCog,
  UserRound,
  ClipboardList,
  DollarSign,
  LogIn,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type ActivityType = "check-in" | "guest" | "member" | "finance" | "event";

const ACTIVITY_LOG: {
  id: number;
  type: ActivityType;
  message: string;
  detail: string;
  time: string;
  isNew: boolean;
}[] = [
  {
    id: 1,
    type: "check-in",
    message: "Ana Santos checked in",
    detail: "Sunday Assembly · Quezon City Chapter",
    time: "2 min ago",
    isNew: true,
  },
  {
    id: 2,
    type: "guest",
    message: "New guest encoded: Carlo Reyes",
    detail: "Referred by Jose Dela Cruz",
    time: "15 min ago",
    isNew: true,
  },
  {
    id: 3,
    type: "member",
    message: "Maria Cruz completed onboarding",
    detail: "Password changed on first login",
    time: "42 min ago",
    isNew: true,
  },
  {
    id: 4,
    type: "event",
    message: "General Assembly event created",
    detail: "Scheduled for Mar 16, 2026",
    time: "1 hr ago",
    isNew: false,
  },
  {
    id: 5,
    type: "finance",
    message: "Finance record submitted",
    detail: "₱4,200 income · Pasay Chapter",
    time: "3 hrs ago",
    isNew: false,
  },
  {
    id: 6,
    type: "check-in",
    message: "58 members attended Chapter Prayer",
    detail: "Pasig Chapter · Mar 5, 2026",
    time: "Yesterday",
    isNew: false,
  },
  {
    id: 7,
    type: "guest",
    message: "Guest Jose Santos followed up",
    detail: "Status changed to Contacted",
    time: "Yesterday",
    isNew: false,
  },
];

const ACTIVITY_ICON: Record<ActivityType, { icon: typeof LogIn; color: string; bg: string }> = {
  "check-in": { icon: LogIn, color: "text-success", bg: "bg-success/10" },
  guest: { icon: UserRound, color: "text-info", bg: "bg-info/10" },
  member: { icon: UserCog, color: "text-primary", bg: "bg-primary/10" },
  finance: { icon: DollarSign, color: "text-amber-600", bg: "bg-amber-500/10" },
  event: { icon: ClipboardList, color: "text-muted-foreground", bg: "bg-muted" },
};

export const ACTIVITY_NEW_COUNT = ACTIVITY_LOG.filter((a) => a.isNew).length;

export function DashboardActivity() {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Live Activity Log</CardTitle>
          {ACTIVITY_NEW_COUNT > 0 && (
            <Badge className="bg-destructive/10 text-destructive border-transparent text-xs">
              {ACTIVITY_NEW_COUNT} new
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-1 p-0">
        {ACTIVITY_LOG.map((entry, idx) => {
          const meta = ACTIVITY_ICON[entry.type];
          return (
            <div
              key={entry.id}
              className={`flex items-start gap-3 px-6 py-3 text-sm ${
                entry.isNew ? "bg-primary/5" : ""
              } ${idx !== ACTIVITY_LOG.length - 1 ? "border-b border-border" : ""}`}
            >
              <div className={`mt-0.5 p-1.5 rounded-md ${meta.bg} shrink-0`}>
                <meta.icon className={`size-3.5 ${meta.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium leading-snug">{entry.message}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{entry.detail}</p>
              </div>
              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-xs text-muted-foreground">{entry.time}</span>
                {entry.isNew && (
                  <span className="text-[10px] font-semibold text-destructive">NEW</span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
