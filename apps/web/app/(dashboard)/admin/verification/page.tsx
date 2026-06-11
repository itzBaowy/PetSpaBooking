import { VerificationTable } from "@/apis/admin/verification/components/verification-table";

export default function Verification() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Provider Verification</h1>
      <VerificationTable />
    </div>
  );
}
