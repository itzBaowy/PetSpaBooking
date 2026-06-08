import { ReportTable } from '@/apis/admin/moderation/components/report-table';

export default function Moderation() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Moderation & Reports</h1>
      <ReportTable />
    </div>
  );
}
