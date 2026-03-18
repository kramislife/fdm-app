import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getUserWithRole } from "@/lib/roles";
import { prisma } from "@/lib/prisma";
import type { RoleKey } from "@/lib/app-roles";

/** Returns the current Supabase auth user or null — verified via network call */
export const getAuthUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

/** Returns the full DB user row with roles and chapter, or null */
export const getUser = cache(async () => {
  const authUser = await getAuthUser();
  if (!authUser) return null;
  return getUserWithRole(authUser.id);
});

/**
 * Asserts the user is authenticated.
 * Redirects to /login if not. Returns the Supabase auth user.
 */
export async function requireAuth() {
  const user = await getAuthUser();
  if (!user) redirect("/login");
  return user;
}

/**
 * Asserts the user has one of the allowed roles.
 * Redirects to /login if not authenticated, /dashboard if role not allowed.
 * Returns the full user data with roles and chapter.
 */
export async function requireRole(roles: RoleKey[]) {
  const authUser = await requireAuth();
  const data = await getUserWithRole(authUser.id);

  if (!data) redirect("/login");

  const allowed = data.roles.some((role) => roles.includes(role));
  if (!allowed) redirect("/dashboard");

  return data;
}

/**
 * Signs out the current user server-side.
 * Caller must revalidate and redirect after this returns.
 */
export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}

/**
 * Links existing guest_log records to a newly registered user.
 * Finds guest_logs by email where linked_user_id is null, updates
 * the corresponding attendance.user_id and sets linked_user_id.
 */
export async function backfillAttendance(
  email: string,
  userId: number,
): Promise<void> {
  const guestLogs = await prisma.guestLog.findMany({
    where: { email, linked_user_id: null },
    select: { id: true, attendance_id: true },
  });

  for (const log of guestLogs) {
    await prisma.$transaction([
      prisma.attendance.updateMany({
        where: { id: log.attendance_id, user_id: null },
        data: { user_id: userId },
      }),
      prisma.guestLog.update({
        where: { id: log.id },
        data: { linked_user_id: userId },
      }),
    ]);
  }
}
