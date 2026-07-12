import { ServiceForm } from "@/components/provider/services/service-form";

export default function CreateService() {
  return (
    <main className="p-4 sm:p-6 lg:p-8"><div className="mx-auto max-w-5xl"><ServiceForm mode="create" /></div></main>
  );
}
