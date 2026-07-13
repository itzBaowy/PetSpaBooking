"use client";

import { ProviderEmpty, ProviderError, ProviderLoading } from "@/apis/provider/_shared/provider-ui";
import { useCustomer } from "../queries";

export function PetList({ customerId }: { customerId: string }) {
  const query = useCustomer(customerId);

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError) {
    return <ProviderError error={query.error} retry={() => void query.refetch()} />;
  }

  const pets = query.data?.pets ?? [];
  if (pets.length === 0) return <ProviderEmpty text="Chưa có dữ liệu thú cưng." />;

  return (
    <div className="rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm">
      <h3 className="font-extrabold">Thú cưng của khách</h3>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {pets.map((pet, index) => (
          <div key={`${pet.name ?? "pet"}-${index}`} className="rounded-xl bg-surface-muted p-4">
            <p className="font-extrabold">{pet.name ?? "Thú cưng"}</p>
            <p className="mt-1 text-sm text-muted">
              {[pet.species, pet.breed].filter(Boolean).join(" / ") || "Chưa có giống loài"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
