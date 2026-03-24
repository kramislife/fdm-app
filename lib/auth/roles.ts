import "server-only";
import { cache } from "react";
import { prisma } from "@/lib/db/prisma";
import { ROLE_KEYS, type RoleKey } from "@/lib/constants/app-roles";

/** Get the first active role key for a user by Supabase auth ID */
export const getUserRole = cache(async (authId: string): Promise<RoleKey | null> => {
  const user = await prisma.user.findUnique({
    where: { auth_id: authId },
    include: {
      user_roles: {
        where: { is_active: true },
        include: { role: true },
        take: 1,
      },
    },
  });

  if (!user || user.user_roles.length === 0) return null;
  return user.user_roles[0].role.key as RoleKey;
});

/** Get user with all active roles and primary chapter by Supabase auth ID */
export const getUserWithRole = cache(async (authId: string) => {
  const user = await prisma.user.findUnique({
    where: { auth_id: authId },
    include: {
      user_roles: {
        where: { is_active: true },
        include: { role: true, chapter: true },
      },
      user_chapters: {
        where: { is_primary: true },
        include: { chapter: true },
        take: 1,
      },
    },
  });

  if (!user || user.deactivated_at) return null;

  const roles = user.user_roles.map((ur) => ur.role.key as RoleKey);
  const chapter = user.user_chapters[0]?.chapter ?? null;

  return { user, roles, chapter };
});

/** Check if a role string is in the allowed list */
export function hasRole(userRole: string, allowed: string[]): boolean {
  return allowed.includes(userRole);
}

/** Returns true if the role is anything other than ROLE_KEYS.MEMBER */
export function isAdminRole(role: string): boolean {
  return role !== ROLE_KEYS.MEMBER;
}
