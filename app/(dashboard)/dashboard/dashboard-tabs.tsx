"use client";

import { LayoutDashboard, Activity } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardOverview } from "./dashboard-overview";
import { DashboardActivity, ACTIVITY_NEW_COUNT } from "./dashboard-activity";

export function DashboardTabs() {
  return (
    <Tabs defaultValue="overview" className="flex-col">
      {/* Tab Bar */}
      <div className="mb-5">
        <TabsList>
          <TabsTrigger value="overview" className="gap-2 p-2">
            <LayoutDashboard className="size-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-2 p-2">
            <Activity className="size-4" />
            <span>Activity Logs</span>
            {ACTIVITY_NEW_COUNT > 0 && (
              <span className="inline-flex items-center justify-center rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4 leading-none">
                {ACTIVITY_NEW_COUNT}
              </span>
            )}
          </TabsTrigger>
        </TabsList>
      </div>

      <TabsContent value="overview">
        <DashboardOverview />
      </TabsContent>

      <TabsContent value="activity">
        <DashboardActivity />
      </TabsContent>
    </Tabs>
  );
}
