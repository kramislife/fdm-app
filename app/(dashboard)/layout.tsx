import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/config";
import { getUserWithRole } from "@/lib/auth/roles";
import { ROLE_KEYS } from "@/lib/constants/app-roles";
import { formatName, getNameInitials } from "@/lib/utils/format";
import { DashboardLayoutClient } from "@/components/layout/dashboard-layout-client";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authUser = await requireAuth();
  const data = await getUserWithRole(authUser.id);

  if (!data || data.roles.every((r) => r === ROLE_KEYS.MEMBER)) redirect("/");

  const { user, roles } = data;
  const sessionUser = {
    name: formatName(user),
    initials: getNameInitials(user),
    email: user.email,
    photoUrl: user.photo_url,
    roles,
    memberQr: user.member_qr,
  };

  return (
    <DashboardLayoutClient sessionUser={sessionUser}>
      {children}
    </DashboardLayoutClient>
  );
}
