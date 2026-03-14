import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

import {
  getUserWithRoles,
  buildSessionUser,
  isMemberOnly,
  getRoleKeys,
} from "@/lib/auth/session";

import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const dbUser = await getUserWithRoles(user.id);
  if (!dbUser || isMemberOnly(getRoleKeys(dbUser))) redirect("/");

  const sessionUser = buildSessionUser(dbUser);

  return (
    <DashboardLayoutClient sessionUser={sessionUser}>
      {children}
    </DashboardLayoutClient>
  );
}
