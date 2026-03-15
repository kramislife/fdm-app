import { requireRole } from "@/lib/auth";
import { getUsers } from "@/lib/data/users";
import { parseTableParams, toPagination, type PageProps } from "@/lib/table";
import { AdminPage, type Column } from "@/components/admin";
import {
  DateCell,
  TextCell,
  UserStatusBadge,
  UserCell,
} from "@/components/shared/cells";

const columns: Column[] = [
  { key: "name", label: "Full Name", sortable: true },
  { key: "email", label: "Email", sortable: true },
  { key: "contact", label: "Contact Number" },
  { key: "birthday", label: "Birthday" },
  { key: "chapter", label: "Chapter" },
  { key: "role", label: "Role" },
  { key: "status", label: "Status" },
  { key: "createdAt", label: "Created At", sortable: true },
];

export default async function UsersPage({ searchParams }: PageProps) {
  await requireRole([
    "spiritual_director",
    "elder",
    "head_servant",
    "asst_head_servant",
  ]);

  const { search, page, perPage, sort, order } = parseTableParams(
    await searchParams,
    "created_at",
  );

  const result = await getUsers({
    search: search || undefined,
    page,
    perPage,
    sort,
    order,
  });

  const data = result.data.map((user) => ({
    name: <UserCell user={user} fallback="Unknown" />,
    email: user.email,
    contact: user.contact_number,
    birthday: <DateCell date={user.birthday} dateOnly />,
    chapter: <TextCell value={user.user_chapters[0]?.chapter?.name} />,
    role: <TextCell value={user.user_roles[0]?.role?.name} />,
    status: <UserStatusBadge status={user.status} />,
    createdAt: <DateCell date={user.created_at} />,
  }));

  return (
    <AdminPage
      title="Users"
      description="View all registered users in the system"
      columns={columns}
      data={data}
      pagination={toPagination(result)}
      defaultSort="created_at"
    />
  );
}
