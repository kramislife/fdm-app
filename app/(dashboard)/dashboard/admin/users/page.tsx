import { requireRole } from "@/lib/auth";
import { getUsers } from "@/lib/data/users";
import { getChaptersForSelect } from "@/lib/data/chapters";
import { getRolesForSelect } from "@/lib/data/roles";
import { PERMISSION_ROLES } from "@/lib/app-roles";
import { formatName, getNameInitials } from "@/lib/format";
import { parseTableParams, toPagination, type PageProps } from "@/lib/table";
import { UsersClient, type UserRow } from "./users-client";

export default async function UsersPage({ searchParams }: PageProps) {
  await requireRole([...PERMISSION_ROLES.USERS_VIEW]);

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
  );

  const [result, chapters, roles] = await Promise.all([
    getUsers({ search: search || undefined, page, perPage, sort, order }),
    getChaptersForSelect(),
    getRolesForSelect(),
  ]);

  const users: UserRow[] = result.data.map((user) => ({
    id: user.id,
    name: formatName(user),
    initials: getNameInitials(user),
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    contact_number: user.contact_number,
    address: user.address,
    birthday: user.birthday?.toISOString() ?? null,
    account_status: user.account_status,
    photo_url: user.photo_url,
    photoUrl: user.photo_url,
    has_qr: user.has_qr,
    member_qr: user.member_qr,
    user_chapters: user.user_chapters,
    user_roles: user.user_roles,
    created_at: user.created_at.toISOString(),
    creator: user.creator,
    updated_at: user.updated_at.toISOString(),
    updated_by_user: user.updated_by_user ?? null,
    deactivated_at: user.deactivated_at?.toISOString() ?? null,
  }));

  return (
    <UsersClient
      users={users}
      pagination={toPagination(result)}
      chapters={chapters}
      roles={roles}
    />
  );
}
