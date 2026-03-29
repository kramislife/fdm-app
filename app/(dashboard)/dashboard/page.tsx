import { getActivityLogs } from "@/lib/data/activity-logs";
import { DashboardTabs } from "./dashboard-tabs";

export default async function DashboardPage() {
  const { data: logs, total } = await getActivityLogs({ perPage: 20 });
  return <DashboardTabs logs={logs} total={total} />;
}
