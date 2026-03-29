"use client";

import { useState, useEffect, useCallback } from "react";
import { LayoutDashboard, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "./dashboard-overview";
import { DashboardActivity } from "./dashboard-activity";
import type { ActivityLogItem } from "@/lib/data/activity-logs";

const STORAGE_KEY = "fdm_activity_seen_ids";
const MAX_STORED = 1000;

interface DashboardTabsProps {
  logs: ActivityLogItem[];
  total: number;
}

export function DashboardTabs({ logs, total }: DashboardTabsProps) {
  const [seenIds, setSeenIds] = useState<Set<number>>(new Set());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setSeenIds(new Set(JSON.parse(stored) as number[]));
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, []);

  const markSeen = useCallback((id: number) => {
    setSeenIds((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      // Prune oldest entries if over limit
      const arr = [...next];
      const pruned = arr.length > MAX_STORED ? arr.slice(-MAX_STORED) : arr;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(pruned));
      } catch {
        // ignore storage errors (quota, private mode)
      }
      return new Set(pruned);
    });
  }, []);

  const unseenCount = hydrated
    ? logs.filter((l) => !seenIds.has(l.id)).length
    : 0;

  return (
    <Tabs defaultValue="overview" className="flex-col">
      <div className="mb-5">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2 p-2">
            <LayoutDashboard className="size-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2 p-2">
            <Activity className="size-4" />
            <span>Activity Logs</span>
            {unseenCount > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-primary/10 text-primary text-[10px] font-bold w-4 h-4 leading-none">
                {unseenCount > 99 ? "99+" : unseenCount}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview">
        <DashboardOverview />
      </TabsContent>

      <TabsContent value="activity">
        <DashboardActivity
          logs={logs}
          total={total}
          seenIds={seenIds}
          onSeen={markSeen}
        />
      </TabsContent>
    </Tabs>
  );
}
