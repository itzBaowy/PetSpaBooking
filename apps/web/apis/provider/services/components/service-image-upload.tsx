"use client";

import { useRef } from "react";
import { useToast } from "@/components/ui/feedback-provider";
import { providerErrorText } from "@/apis/provider/_shared/provider-ui";
import { useUploadProviderServiceImages } from "../queries";

const MAX_IMAGES = 5;
const MAX_FILE_SIZE = 8 * 1024 * 1024;

export function ServiceImageUpload({
  imageUrls,
  onChange,
  onUploadingChange,
}: {
  imageUrls: string[];
  onChange: (urls: string[]) => void;
  onUploadingChange?: (uploading: boolean) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useUploadProviderServiceImages();
  const { showToast } = useToast();

  const selectFiles = (files: File[]) => {
    const availableSlots = MAX_IMAGES - imageUrls.length;
    if (availableSlots <= 0) {
      showToast(`Mỗi dịch vụ được tải tối đa ${MAX_IMAGES} ảnh.`, "error");
      return;
    }
    const validFiles = files
      .filter((file) => file.type.startsWith("image/") && file.size <= MAX_FILE_SIZE)
      .slice(0, availableSlots);
    if (validFiles.length !== files.length) {
      showToast("Chỉ nhận tối đa 5 ảnh JPG, PNG hoặc WEBP; mỗi ảnh không quá 8 MB.", "error");
    }
    if (!validFiles.length) return;

    onUploadingChange?.(true);
    upload.mutate(validFiles, {
      onSuccess: (urls) => {
        onChange([...imageUrls, ...urls].slice(0, MAX_IMAGES));
        showToast(`Đã tải lên ${urls.length} ảnh dịch vụ.`, "success");
      },
      onError: (error) => showToast(providerErrorText(error), "error"),
      onSettled: () => onUploadingChange?.(false),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-bold">Hình ảnh dịch vụ</p>
          <p className="mt-0.5 text-xs text-muted">Tối đa 5 ảnh, mỗi ảnh không quá 8 MB.</p>
        </div>
        <span className="rounded-full bg-brand-soft px-2.5 py-1 text-xs font-bold text-brand">
          {imageUrls.length}/{MAX_IMAGES}
        </span>
      </div>

      {imageUrls.length ? (
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-5">
          {imageUrls.map((url, index) => (
            <div className="group relative aspect-square overflow-hidden rounded-2xl border border-border-muted bg-surface-muted" key={`${url}-${index}`}>
              {/* API trả URL động từ dịch vụ lưu trữ ảnh nên dùng img để không phụ thuộc cấu hình domain. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className="h-full w-full object-cover" src={url} alt={`Ảnh dịch vụ ${index + 1}`} />
              <button
                type="button"
                aria-label={`Xóa ảnh ${index + 1}`}
                className="absolute right-1.5 top-1.5 grid h-7 w-7 place-items-center rounded-full bg-black/65 text-sm font-bold text-white shadow transition hover:bg-red-600"
                onClick={() => onChange(imageUrls.filter((_, imageIndex) => imageIndex !== index))}
              >
                ×
              </button>
              {index === 0 ? (
                <span className="absolute bottom-1.5 left-1.5 rounded-full bg-brand px-2 py-0.5 text-[10px] font-bold text-white">
                  Ảnh bìa
                </span>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        disabled={upload.isLoading || imageUrls.length >= MAX_IMAGES}
        className="flex min-h-24 w-full flex-col items-center justify-center rounded-2xl border-2 border-dashed border-brand/30 bg-brand-soft/40 px-4 py-4 text-center transition hover:border-brand hover:bg-brand-soft disabled:cursor-not-allowed disabled:opacity-60"
        onClick={() => inputRef.current?.click()}
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand text-xl text-white">+</span>
        <strong className="mt-2 text-sm text-foreground">
          {upload.isLoading ? "Đang tải ảnh lên..." : "Chọn ảnh dịch vụ"}
        </strong>
        <span className="mt-1 text-xs text-muted">JPG, PNG, WEBP</span>
      </button>
      <input
        ref={inputRef}
        className="sr-only"
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        onChange={(event) => {
          selectFiles(Array.from(event.target.files ?? []));
          event.target.value = "";
        }}
      />
    </div>
  );
}
