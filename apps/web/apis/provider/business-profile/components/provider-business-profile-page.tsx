"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/feedback-provider";
import {
  ProviderError,
  ProviderLoading,
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
    <div className="space-y-6">
      <section className="relative overflow-hidden rounded-[28px] border border-emerald-100 bg-gradient-to-r from-white via-emerald-50 to-teal-50 px-6 py-7 shadow-sm sm:px-8">
        <div className="pointer-events-none absolute inset-0" aria-hidden="true">
          <span className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-emerald-200/30" />
          <span className="absolute right-8 top-4 rotate-12 text-6xl opacity-10">🐾</span>
          <span className="absolute bottom-1 right-40 -rotate-12 text-4xl opacity-10">🐾</span>
        </div>
        <div className="relative flex items-center gap-4">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-emerald-600 text-3xl shadow-lg shadow-emerald-200" aria-hidden="true">🐶</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-600">Không gian của bạn</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Hồ sơ doanh nghiệp</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Hoàn thiện thông tin để khách hàng dễ dàng tìm thấy và tin tưởng dịch vụ của bạn.
            </p>
          </div>
        </div>
      </section>

      <section className="grid gap-6 rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm sm:p-7 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.85fr)]">
        <div className="space-y-6">
          <div>
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-100 text-lg" aria-hidden="true">🏪</span>
              <div>
                <h2 className="font-black text-slate-900">Thông tin cơ sở</h2>
                <p className="text-xs text-slate-500">Thông tin khách hàng sẽ nhìn thấy</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Tên doanh nghiệp *" value={form.businessName} onChange={(value) => set("businessName", value)} />
              <Field label="Điện thoại" value={form.phone} onChange={(value) => set("phone", value)} />
              <Field label="Email" value={form.email} onChange={(value) => set("email", value)} />
              <Field label="Địa chỉ *" value={form.address} onChange={(value) => set("address", value)} />
            </div>
          </div>

          <div>
            <div className="mb-4 flex items-center gap-3 border-b border-slate-100 pb-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-sky-100 text-lg" aria-hidden="true">📍</span>
              <div>
                <h2 className="font-black text-slate-900">Tọa độ cửa hàng</h2>
                <p className="text-xs text-slate-500">Tự động cập nhật khi chọn vị trí trên bản đồ</p>
              </div>
            </div>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Vĩ độ" type="number" value={form.lat} onChange={(value) => set("lat", value)} />
              <Field label="Kinh độ" type="number" value={form.lng} onChange={(value) => set("lng", value)} />
            </div>
          </div>

          <label className="block text-sm font-bold text-slate-800">
            Giới thiệu doanh nghiệp
            <span className="ml-2 text-xs font-normal text-slate-400">Mô tả ngắn về dịch vụ và thế mạnh của bạn</span>
            <Textarea className="mt-2 min-h-32 border-slate-200 bg-slate-50/60 focus:bg-white" value={form.description} onChange={(event) => set("description", event.target.value)} />
          </label>
          {invalid ? (
            <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              Tên, địa chỉ, email và tọa độ hợp lệ là bắt buộc.
            </p>
          ) : null}
          <div className="flex items-center justify-between gap-4 border-t border-slate-100 pt-5">
            <p className="hidden text-xs text-slate-400 sm:block">Các trường có dấu * là bắt buộc</p>
            <Button
              className="min-w-36 bg-emerald-600 font-bold text-white shadow-md shadow-emerald-100 hover:bg-emerald-700"
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

        <aside className="h-fit rounded-2xl border border-emerald-100 bg-gradient-to-b from-emerald-50/70 to-white p-4 sm:p-5">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-emerald-600 text-xl text-white shadow-sm" aria-hidden="true">🐾</span>
            <div>
              <h2 className="font-black text-slate-900">Vị trí trên bản đồ</h2>
              <p className="text-xs text-slate-500">Giúp khách tìm đến cửa hàng dễ hơn</p>
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
          <div className="mt-4 rounded-xl bg-white px-4 py-3 text-xs leading-5 text-slate-500 shadow-sm ring-1 ring-emerald-100">
            <strong className="text-emerald-700">Mẹo:</strong> Kéo ghim đến đúng cửa hàng để tọa độ được cập nhật chính xác.
          </div>
        </aside>
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
    <label className="text-sm font-bold text-slate-800">
      {label}
      <Input className="mt-2 border-slate-200 bg-slate-50/60 focus:bg-white" type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function parseCoordinate(value: string) {
  if (!value.trim()) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}
