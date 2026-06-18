import { ServiceTable } from "@/apis/provider/services/components/service-table";

export default function Services() {
  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Services</h1>
        <a
          href="/dashboard/provider/services/create"
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          Add Service
        </a>
      </div>
      <ServiceTable />
    </div>
  );
}
