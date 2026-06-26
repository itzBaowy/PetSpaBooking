import type { ChangeEvent } from "react";

export function ProviderRegistrationUploadBox({
  fileName,
  fileNames,
  multiple = false,
  onChange,
}: {
  fileName?: string;
  fileNames?: string[];
  multiple?: boolean;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
}) {
  const displayText =
    fileNames && fileNames.length > 0
      ? `${fileNames.length} ảnh đã chọn: ${fileNames.join(", ")}`
      : fileName || "Tải lên PNG hoặc JPG";

  return (
    <label className="flex min-h-24 cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-border-muted bg-surface-muted px-4 text-center text-sm font-medium text-muted hover:border-brand hover:bg-brand-soft">
      <input
        type="file"
        className="sr-only"
        accept=".jpg,.jpeg,.png"
        multiple={multiple}
        onChange={onChange}
      />
      <span className="text-xl text-brand">↑</span>
      <span className="mt-1 max-w-full break-all">{displayText}</span>
    </label>
  );
}
