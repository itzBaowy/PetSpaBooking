import { ServiceForm } from "@/apis/provider/services/components/service-form";

export default function CreateService() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Service</h1>
      <div className="max-w-2xl">
        <ServiceForm />
      </div>
    </div>
  );
}
