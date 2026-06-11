import { UserTable } from "@/apis/admin/users/components/user-table";

export default function Users() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      <UserTable />
    </div>
  );
}
