import { prisma } from "@/lib/prisma";
import { ROLE_KEYS } from "@/lib/app-roles";
import type { RoleKey } from "@/lib/app-roles";
import { formatName, getNameInitials } from "@/lib/format";

/** Prisma include shape for a user with their active roles */
const userWithRoles = {
  user_roles: {
    where: { is_active: true },
    include: { role: true },
  },
} as const;

/** Fetch a user with their active roles by Supabase auth ID */
export async function getUserWithRoles(authId: string) {
  return prisma.user.findUnique({
    where: { auth_id: authId },
    include: userWithRoles,
  });
}

type UserWithRoles = NonNullable<Awaited<ReturnType<typeof getUserWithRoles>>>;

/** Extract the role keys from a fetched user */
export function getRoleKeys(dbUser: UserWithRoles): RoleKey[] {
  return dbUser.user_roles.map((ur) => ur.role.key as RoleKey);
}

/** True when the user has roles and ALL of them are ROLE_KEYS.MEMBER */
export function isMemberOnly(roleKeys: RoleKey[]): boolean {
  return roleKeys.length > 0 && roleKeys.every((k) => k === ROLE_KEYS.MEMBER);
}

/** Build the session user object passed to client components */
export function buildSessionUser(dbUser: UserWithRoles) {
  const roles = getRoleKeys(dbUser);
  return {
    name: formatName(dbUser),
    initials: getNameInitials(dbUser),
    email: dbUser.email,
    photoUrl: dbUser.photo_url,
    roles,
    isMember: isMemberOnly(roles),
    memberQr: dbUser.member_qr,
  };
}
