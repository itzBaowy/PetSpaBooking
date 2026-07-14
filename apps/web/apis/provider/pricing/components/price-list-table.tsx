"use client";

import Link from "next/link";
import type { ProviderServiceApi } from "@/types/provider-api";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/feedback-provider";
import {
  ProviderBadge,
  ProviderEmpty,
  ProviderError,
  ProviderLoading,
  ProviderPageHeader,
  providerErrorText,
  providerMoney,
} from "@/apis/provider/_shared/provider-ui";
import { usePricing, useTogglePricingService } from "../queries";

export function PriceListTable() {
  const query = usePricing();
  const toggle = useTogglePricingService();
  const { showToast } = useToast();
  const services = query.data?.items ?? [];

  const toggleService = (service: ProviderServiceApi) => {
    toggle.mutate(service.id, {
      onSuccess: () => showToast("Service visibility updated.", "success"),
      onError: (error) => showToast(providerErrorText(error), "error"),
    });
  };

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError) {
    return <ProviderError error={query.error} retry={() => void query.refetch()} />;
  }

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Bang gia"
        description="Danh sach gia dich vu duoc lay tu API /services/my cua provider."
        action={
          <Link
            className="inline-flex min-h-11 items-center rounded-xl bg-brand px-5 py-2 text-sm font-bold text-white hover:bg-brand-hover"
            href="/provider/services/create"
          >
            Tao dich vu
          </Link>
        }
      />

      {services.length === 0 ? (
        <ProviderEmpty text="Chua co dich vu nao de hien thi bang gia." />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-border-subtle bg-surface shadow-sm">
          <table className="min-w-[920px] w-full text-left">
            <thead className="bg-surface-muted text-xs font-extrabold uppercase text-subtle">
              <tr>
                {["Dich vu", "Danh muc", "Gia", "Thoi luong", "Trang thai", "Thao tac"].map((title) => (
                  <th className="px-4 py-3 last:text-right" key={title}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {services.map((service) => (
                <tr className="hover:bg-surface-muted/50" key={service.id}>
                  <td className="px-4 py-4">
                    <p className="font-extrabold text-foreground">{service.name}</p>
                    {service.description ? (
                      <p className="mt-1 line-clamp-2 max-w-md text-xs leading-5 text-muted">
                        {service.description}
                      </p>
                    ) : null}
                  </td>
                  <td className="px-4 py-4 text-sm font-semibold text-muted">
                    {service.category?.name ?? "Chua phan loai"}
                  </td>
                  <td className="px-4 py-4 font-black">
                    {providerMoney.format(service.price)}
                  </td>
                  <td className="px-4 py-4 text-sm">{service.duration} phut</td>
                  <td className="px-4 py-4">
                    <ProviderBadge value={serviceStatusLabel(service)} />
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        className="inline-flex min-h-10 items-center rounded-xl border border-border-muted px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-muted"
                        href={`/provider/services/${service.id}/edit`}
                      >
                        Sua
                      </Link>
                      <Button
                        disabled={toggle.isLoading || service.isHiddenByAdmin}
                        onClick={() => toggleService(service)}
                        variant="outline"
                      >
                        {service.isActive ? "An" : "Hien"}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function serviceStatusLabel(service: ProviderServiceApi) {
  if (service.isHiddenByAdmin) return "An boi admin";
  return service.isActive ? "Dang hien thi" : "Dang an";
}
