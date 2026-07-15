"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImageCropDialog } from "@/components/ui";
import { Input, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/feedback-provider";
import { useImageCropper } from "@/hooks/use-image-cropper";
import type { ProviderInfo } from "@/apis/provider/verification/schema";
import {
  ProviderError,
  ProviderLoading,
  providerErrorText,
} from "@/apis/provider/_shared/provider-ui";
import {
  useProviderBusinessProfile,
  useUpdateProviderBusinessProfile,
  useUploadProviderProfileImages,
} from "../queries";
import { ProviderLocationMap } from "./provider-location-map";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_IMAGE_SIZE = 8 * 1024 * 1024;

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
  const uploadImages = useUploadProviderProfileImages();
  const cropper = useImageCropper();
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

  const uploadProfileImage = async (kind: "avatar" | "cover", file?: File) => {
    if (!file) return;
    if (!IMAGE_TYPES.includes(file.type)) {
      showToast("Ảnh chỉ hỗ trợ JPG, PNG hoặc WEBP.", "error");
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      showToast("Mỗi ảnh không được lớn hơn 8 MB.", "error");
      return;
    }

    const croppedFile = await cropper.cropFile(file, kind === "avatar" ? 1 : 16 / 9);
    if (!croppedFile) return;

    uploadImages.mutate(
      { [kind]: croppedFile },
      {
        onSuccess: () => {
          showToast(
            kind === "avatar"
              ? "Đã cập nhật avatar doanh nghiệp."
              : "Đã cập nhật ảnh bìa doanh nghiệp.",
            "success",
          );
        },
        onError: (error) => showToast(providerErrorText(error), "error"),
      },
    );
  };

  return (
    <div className="space-y-6">
      {cropper.pending ? (
        <ImageCropDialog
          sourceUrl={cropper.pending.sourceUrl}
          aspectRatio={cropper.pending.aspectRatio}
          onCancel={cropper.cancel}
          onConfirm={cropper.confirm}
        />
      ) : null}

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

      <ProviderProfileImagesPanel
        profile={profile}
        uploading={uploadImages.isLoading}
        onUpload={uploadProfileImage}
      />

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

function ProviderProfileImagesPanel({
  profile,
  uploading,
  onUpload,
}: {
  profile: Pick<ProviderInfo, "businessName" | "avatarUrl" | "coverImageUrl">;
  uploading: boolean;
  onUpload: (kind: "avatar" | "cover", file?: File) => void | Promise<void>;
}) {
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const initial = profile.businessName.trim().charAt(0).toUpperCase() || "P";

  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
      <div className="relative h-44 bg-slate-100 sm:h-56">
        {profile.coverImageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={profile.coverImageUrl}
            alt={`Ảnh bìa ${profile.businessName}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-[linear-gradient(135deg,#ecfdf5,#dbeafe_55%,#f8fafc)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-transparent to-transparent" />
        <Button
          variant="outline"
          className="absolute right-4 top-4 border-white/70 bg-white/90 px-4 text-slate-900 shadow-sm hover:bg-white"
          disabled={uploading}
          onClick={() => coverInputRef.current?.click()}
        >
          {uploading ? "Đang tải..." : "Đổi ảnh bìa"}
        </Button>
      </div>

      <div className="flex flex-col gap-4 px-5 pb-5 sm:flex-row sm:items-end sm:justify-between sm:px-7 sm:pb-7">
        <div className="-mt-12 flex min-w-0 items-end gap-4">
          <div className="relative grid h-24 w-24 shrink-0 place-items-center overflow-hidden rounded-2xl border-4 border-white bg-emerald-600 text-4xl font-black text-white shadow-lg sm:h-28 sm:w-28">
            {profile.avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatarUrl}
                alt={`Avatar ${profile.businessName}`}
                className="h-full w-full object-cover"
              />
            ) : (
              initial
            )}
          </div>
          <div className="min-w-0 pb-1">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-600">
              Hình ảnh hiển thị công khai
            </p>
            <h2 className="truncate text-xl font-black text-slate-950 sm:text-2xl">
              {profile.businessName}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Avatar và ảnh bìa sẽ dùng trong hồ sơ provider, danh sách tìm kiếm và màn chi tiết.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          className="w-full border-emerald-200 text-emerald-700 hover:bg-emerald-50 sm:w-auto"
          disabled={uploading}
          onClick={() => avatarInputRef.current?.click()}
        >
          {uploading ? "Đang tải..." : "Đổi avatar"}
        </Button>
      </div>

      <input
        ref={avatarInputRef}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={uploading}
        onChange={(event) => {
          void onUpload("avatar", event.target.files?.[0]);
          event.target.value = "";
        }}
      />
      <input
        ref={coverInputRef}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        disabled={uploading}
        onChange={(event) => {
          void onUpload("cover", event.target.files?.[0]);
          event.target.value = "";
        }}
      />
    </section>
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
