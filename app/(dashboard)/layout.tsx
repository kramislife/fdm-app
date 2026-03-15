import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth";
import { getUserWithRole } from "@/lib/roles";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await requireAuth();
  const data = await getUserWithRole(authUser.id);

  if (!data || data.roles.every((r) => r === "member")) redirect("/");

  const { user, roles } = data;
  const sessionUser = {
    name: `${user.first_name} ${user.last_name}`,
    initials: `${user.first_name[0]}${user.last_name[0]}`.toUpperCase(),
    email: user.email,
    photoUrl: user.photo_url,
    roles,
  };

  return (
    <DashboardLayoutClient sessionUser={sessionUser}>
      {children}
    </DashboardLayoutClient>
  );
}
