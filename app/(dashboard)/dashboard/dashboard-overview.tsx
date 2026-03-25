import Link from "next/link";
import {
  Users,
  TrendingUp,
  UserCheck,
  Heart,
  UserPlus,
  CalendarDays,
  UserCog,
  FileBarChart,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const STAT_CARDS = [
  {
    label: "Total Members",
    value: "248",
    sub: "+12 this month",
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "Active This Month",
    value: "187",
    sub: "75% attendance rate",
    icon: TrendingUp,
    color: "text-success",
    bg: "bg-success/10",
  },
  {
    label: "Guests",
    value: "34",
    sub: "8 awaiting follow-up",
    icon: UserCheck,
    color: "text-info",
    bg: "bg-info/10",
  },
  {
    label: "Enthronements",
    value: "91",
    sub: "+6 this quarter",
    icon: Heart,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
];

const QUICK_ACTIONS = [
  {
    label: "Encode Guest",
    href: "/dashboard/encode",
    icon: UserPlus,
    description: "Register a new guest",
  },
  {
    label: "Create Event",
    href: "/dashboard/events/new",
    icon: CalendarDays,
    description: "Schedule a new event",
  },
  {
    label: "Add Member",
    href: "/dashboard/admin/users/new",
    icon: UserCog,
    description: "Onboard a new member",
  },
  {
    label: "View Reports",
    href: "/dashboard/reports",
    icon: FileBarChart,
    description: "General assembly reports",
  },
];

const RECENT_ATTENDANCE = [
  { name: "Sunday Assembly", date: "Mar 9, 2026", count: 112 },
  { name: "Chapter Prayer", date: "Mar 5, 2026", count: 38 },
  { name: "Youth Formation", date: "Mar 1, 2026", count: 24 },
];

type FollowUpStatus = "pending" | "contacted" | "emailed" | "registered";

const GUEST_FOLLOWUP: { name: string; status: FollowUpStatus }[] = [
  { name: "Ana Santos", status: "pending" },
  { name: "Carlo Reyes", status: "contacted" },
  { name: "Maria Cruz", status: "emailed" },
  { name: "Jose Dela Cruz", status: "registered" },
];

const STATUS_BADGE: Record<FollowUpStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-muted text-muted-foreground border-transparent" },
  contacted: { label: "Contacted", className: "bg-info/10 text-info border-transparent" },
  emailed: { label: "Emailed", className: "bg-amber-500/10 text-amber-600 border-transparent" },
  registered: { label: "Registered", className: "bg-success/10 text-success border-transparent" },
};

const UPCOMING_EVENTS = [
  { name: "General Assembly", type: "Assembly", date: "Mar 16, 2026", chapter: "Quezon City" },
  { name: "Enthronement Ceremony", type: "Enthronement", date: "Mar 22, 2026", chapter: "Pasay" },
  { name: "Youth Formation Night", type: "Formation", date: "Mar 29, 2026", chapter: "Pasig" },
];

export function DashboardOverview() {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((stat) => (
          <Card key={stat.label}>
            <CardContent className="flex items-center gap-4 pt-6">
              <div className={`p-3 rounded-lg ${stat.bg} shrink-0`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
                <p className="text-2xl font-bold leading-tight">{stat.value}</p>
                <p className="text-xs text-muted-foreground truncate">{stat.sub}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {QUICK_ACTIONS.map((action) => (
          <Link key={action.label} href={action.href}>
            <Card className="hover:border-primary hover:shadow-sm transition-all cursor-pointer h-full">
              <CardContent className="flex flex-col items-center text-center gap-3 pt-6 pb-6">
                <div className="p-3 rounded-lg bg-primary/10">
                  <action.icon className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{action.description}</p>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Middle row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {RECENT_ATTENDANCE.map((evt) => (
              <div key={evt.name} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-medium">{evt.name}</p>
                  <p className="text-xs text-muted-foreground">{evt.date}</p>
                </div>
                <Badge variant="secondary" className="text-xs shrink-0">
                  {evt.count} attended
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Finance Snapshot</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">Income</p>
              <p className="font-semibold text-success">₱18,400</p>
            </div>
            <div className="flex items-center justify-between text-sm">
              <p className="text-muted-foreground">Expenses</p>
              <p className="font-semibold text-destructive">₱6,200</p>
            </div>
            <div className="border-t border-border pt-3 flex items-center justify-between text-sm">
              <p className="font-medium">Net</p>
              <p className="font-bold text-base">₱12,200</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Guest Follow-up Queue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {GUEST_FOLLOWUP.map((guest) => {
              const badge = STATUS_BADGE[guest.status];
              return (
                <div key={guest.name} className="flex items-center justify-between text-sm">
                  <p className="font-medium">{guest.name}</p>
                  <Badge className={`text-xs ${badge.className}`}>{badge.label}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {UPCOMING_EVENTS.map((evt) => (
              <div key={evt.name} className="flex items-start justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="font-medium truncate">{evt.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {evt.date} · {evt.chapter}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">
                  {evt.type}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
