import { AdminPage, type Column } from "@/components/admin";

const columns: Column[] = [
  { key: "name", label: "Name" },
  { key: "scope", label: "Scope" },
];

const data = [
  { name: "Spiritual Director", scope: "Community" },
  { name: "Elder", scope: "Community" },
  { name: "Head Server", scope: "Chapter" },
  { name: "Asst. Head Server", scope: "Chapter" },
  { name: "Ministry Head", scope: "Ministry" },
];

export default function Page() {
  return (
    <AdminPage
      title="Role Management"
      description="Manage community roles and their scopes."
      columns={columns}
      data={data}
      action={{ label: "Create Role" }}
    />
  );
}
