import type { ChangeEvent } from "react";

export function ProviderRegistrationUploadBox({
  fileName,
  fileNames,
  previewUrls = [],
  multiple = false,
  onChange,
}: {
  fileName?: string;
  fileNames?: string[];
  previewUrls?: string[];
  multiple?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const displayText =
    previewUrls.length > 0
      ? `${previewUrls.length} ảnh đã chọn`
      : fileNames && fileNames.length > 0
        ? `${fileNames.length} ảnh đã chọn`
        : fileName
          ? "1 ảnh đã chọn"
          : "Tải lên PNG hoặc JPG";

  return (
    <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border-muted bg-surface-muted px-4 py-3 text-center text-sm font-medium text-muted hover:border-brand hover:bg-brand-soft">
      <input
        type="file"
        className="sr-only"
        accept=".jpg,.jpeg,.png"
        multiple={multiple}
        onChange={onChange}
      />
      <span className="text-xl text-brand">↑</span>
      <span className="mt-1 max-w-full break-all">{displayText}</span>
      {previewUrls.length > 0 && (
        <span className="mt-3 grid w-full grid-cols-2 gap-2 sm:grid-cols-3">
          {previewUrls.map((url, index) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt={`Ảnh xem trước ${index + 1}`}
              className="h-28 w-full rounded-lg border border-border-subtle bg-white object-cover"
            />
          ))}
        </span>
      )}
    </label>
  );
}
