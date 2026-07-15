"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { MoneyInput } from "@/components/ui/money-input";
import { ServiceImageUpload } from "./service-image-upload";
import { useToast } from "@/components/ui/feedback-provider";
import {
  ProviderError,
  ProviderLoading,
  ProviderPageHeader,
  providerErrorText,
} from "@/apis/provider/_shared/provider-ui";
import { useProviderServices, useSaveProviderService } from "../queries";

const categories = ["GROOMING", "SPA", "BOARDING", "TRAINING", "VETERINARY", "OTHER"];

export function ProviderServiceFormPage({ serviceId }: { serviceId?: string }) {
  const services = useProviderServices();
  const save = useSaveProviderService();
  const [imageUploading, setImageUploading] = useState(false);
  const { showToast } = useToast();
  const existing = useMemo(
    () => services.data?.items.find((item) => item.id === serviceId),
    [serviceId, services.data?.items],
  );
  const [draft, setDraft] = useState<{
    name: string;
    description: string;
    price: number;
    duration: number;
    category: string;
    imageUrls: string[];
  } | null>(null);

  if (services.isLoading) return <ProviderLoading />;
  if (services.isError) {
    return <ProviderError error={services.error} retry={() => void services.refetch()} />;
  }
  if (serviceId && !existing) {
    return (
      <ProviderError
        error={new Error("Không tìm thấy dịch vụ trong danh sách provider.")}
        retry={() => void services.refetch()}
      />
    );
  }

  const form: {
    name: string;
    description: string;
    price: number;
    duration: number;
    category: string;
    imageUrls: string[];
  } = draft ?? {
    name: existing?.name ?? "",
    description: existing?.description ?? "",
    price: existing?.price ?? 0,
    duration: existing?.duration ?? 30,
    category: existing?.category?.name ?? "OTHER",
    imageUrls: existing?.imageUrls ?? [],
  };
  const update = (patch: Partial<typeof form>) => setDraft({ ...form, ...patch });
  const invalid = !form.name.trim() || form.price < 0 || form.duration <= 0;

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title={serviceId ? "Cập nhật dịch vụ" : "Tạo dịch vụ"}
        description="Biểu mẫu gửi các trường đang được Service API hỗ trợ."
      />
      <section className="mx-auto grid max-w-3xl gap-5 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6 md:grid-cols-2">
        <label className="text-sm font-bold">
          Tên dịch vụ *
          <Input className="mt-2" value={form.name} onChange={(event) => update({ name: event.target.value })} />
        </label>
        <label className="text-sm font-bold">
          Danh mục
          <select
            className="mt-2 h-11 w-full rounded-xl border border-border-muted bg-surface px-3 text-sm"
            value={form.category}
            onChange={(event) => update({ category: event.target.value })}
          >
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-bold">
          Giá (VND) *
          <MoneyInput
            className="mt-2"
            min={0}
            value={form.price}
            onValueChange={(price) => update({ price })}
          />
        </label>
        <label className="text-sm font-bold">
          Thời lượng (phút) *
          <Input
            className="mt-2"
            type="number"
            min={1}
            value={form.duration}
            onChange={(event) => update({ duration: Number(event.target.value) })}
          />
        </label>
        <label className="text-sm font-bold md:col-span-2">
          Mô tả
          <Textarea
            className="mt-2"
            value={form.description}
            onChange={(event) => update({ description: event.target.value })}
          />
        </label>
        <div className="md:col-span-2">
          <ServiceImageUpload
            imageUrls={form.imageUrls}
            onChange={(imageUrls) => update({ imageUrls })}
            onUploadingChange={setImageUploading}
          />
        </div>
        <div className="flex flex-wrap gap-3 md:col-span-2">
          <Button
            disabled={invalid || save.isLoading || imageUploading}
            onClick={() =>
              save.mutate(
                {
                  id: serviceId,
                  payload: {
                    name: form.name.trim(),
                    description: form.description.trim(),
                    price: form.price,
                    duration: form.duration,
                    category: form.category,
                    imageUrls: form.imageUrls,
                  },
                },
                {
                  onSuccess: () =>
                    showToast(serviceId ? "Đã cập nhật dịch vụ." : "Đã tạo dịch vụ.", "success"),
                  onError: (error) => showToast(providerErrorText(error), "error"),
                },
              )
            }
          >
            {imageUploading ? "Đang tải ảnh..." : save.isLoading ? "Đang lưu..." : "Lưu dịch vụ"}
          </Button>
          <Link
            className="inline-flex min-h-11 items-center rounded-xl border border-border-muted px-5 text-sm font-bold hover:bg-surface-muted"
            href="/provider/services"
          >
            Quay lại
          </Link>
        </div>
      </section>
    </div>
  );
}
