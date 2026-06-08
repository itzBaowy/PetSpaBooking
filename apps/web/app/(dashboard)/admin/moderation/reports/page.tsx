import { ReportTable } from '@/apis/admin/moderation/components/report-table';

export default function Reports() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Content Reports</h1>
      <ReportTable />
    </div>
  );
}
