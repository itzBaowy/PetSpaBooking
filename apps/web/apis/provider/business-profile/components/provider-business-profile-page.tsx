"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/feedback-provider";
import {
  ProviderError,
  ProviderLoading,
  ProviderPageHeader,
  providerErrorText,
} from "@/apis/provider/_shared/provider-ui";
import {
  useProviderBusinessProfile,
  useUpdateProviderBusinessProfile,
} from "../queries";
import { ProviderLocationMap } from "./provider-location-map";

type BusinessProfileForm = {
  businessName: string;
  description: string;
  phone: string;
  email: string;
  address: string;
  lat: string;
  lng: string;
};

export function ProviderBusinessProfilePage() {
  const query = useProviderBusinessProfile();
  const update = useUpdateProviderBusinessProfile();
  const { showToast } = useToast();
  const [draft, setDraft] = useState<BusinessProfileForm | null>(null);

  if (query.isLoading) return <ProviderLoading />;
  if (query.isError) return <ProviderError error={query.error} retry={() => void query.refetch()} />;

  const profile = query.data!;
  const form: BusinessProfileForm = draft ?? {
    businessName: profile.businessName,
    description: profile.description ?? "",
    phone: profile.phone ?? "",
    email: profile.email ?? "",
    address: profile.address ?? "",
    lat: profile.lat?.toString() ?? "",
    lng: profile.lng?.toString() ?? "",
  };
  const set = (key: keyof BusinessProfileForm, value: string) => setDraft({ ...form, [key]: value });
  const latValue = parseCoordinate(form.lat);
  const lngValue = parseCoordinate(form.lng);
  const invalid =
    !form.businessName.trim() ||
    !form.address.trim() ||
    Boolean(form.email && !/^\S+@\S+\.\S+$/.test(form.email)) ||
    (form.lat !== "" && latValue === null) ||
    (form.lng !== "" && lngValue === null);

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Hồ sơ doanh nghiệp"
        description="Cập nhật thông tin cơ sở và chọn vị trí trên bản đồ để lấy vĩ độ, kinh độ."
      />

      <section className="grid gap-5 rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Tên doanh nghiệp *" value={form.businessName} onChange={(value) => set("businessName", value)} />
          <Field label="Điện thoại" value={form.phone} onChange={(value) => set("phone", value)} />
          <Field label="Email" value={form.email} onChange={(value) => set("email", value)} />
          <Field label="Địa chỉ *" value={form.address} onChange={(value) => set("address", value)} />
          <Field label="Vĩ độ" type="number" value={form.lat} onChange={(value) => set("lat", value)} />
          <Field label="Kinh độ" type="number" value={form.lng} onChange={(value) => set("lng", value)} />
          <label className="text-sm font-bold md:col-span-2">
            Mô tả
            <Textarea className="mt-2" value={form.description} onChange={(event) => set("description", event.target.value)} />
          </label>
          {invalid ? (
            <p className="text-sm font-bold text-red-700 md:col-span-2">
              Tên, địa chỉ, email và tọa độ hợp lệ là bắt buộc.
            </p>
          ) : null}
          <div className="md:col-span-2">
            <Button
              disabled={invalid || update.isLoading}
              onClick={() =>
                update.mutate(
                  {
                    businessName: form.businessName.trim(),
                    description: form.description.trim(),
                    phone: form.phone.trim(),
                    email: form.email.trim(),
                    address: form.address.trim(),
                    lat: latValue ?? undefined,
                    lng: lngValue ?? undefined,
                  },
                  {
                    onSuccess: (data) => {
                      setDraft(null);
                      showToast(`Đã lưu ${data.businessName}.`, "success");
                    },
                    onError: (error) => showToast(providerErrorText(error), "error"),
                  },
                )
              }
            >
              {update.isLoading ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </div>
        </div>

        <ProviderLocationMap
          lat={latValue}
          lng={lngValue}
          onChange={(location) => {
            setDraft({
              ...form,
              lat: location.lat.toString(),
              lng: location.lng.toString(),
            });
          }}
        />
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <label className="text-sm font-bold">
      {label}
      <Input className="mt-2" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function parseCoordinate(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
