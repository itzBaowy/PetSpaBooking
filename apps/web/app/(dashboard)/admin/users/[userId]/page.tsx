import { UserDetail } from "@/apis/admin/users/components/user-detail";

export default function UserDetailPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">User Details</h1>
      <UserDetail />
    </div>
  );
}
