"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/feedback-provider";
import {
  ProviderBadge,
  ProviderEmpty,
  ProviderError,
  ProviderLoading,
  ProviderPageHeader,
  providerDate,
  providerErrorText,
  sortByDateDesc,
} from "@/apis/provider/_shared/provider-ui";
import {
  providerDocumentTypeLabels,
  providerStatusLabels,
} from "../schema";
import {
  useMyProviderDocuments,
  useMyProviderInfo,
  useUploadProviderDocument,
} from "../queries";

const documentTypes = ["business_license", "id_card_front", "id_card_back", "tax_code", "other"];

export function ProviderVerificationPage() {
  const info = useMyProviderInfo();
  const docs = useMyProviderDocuments();
  const upload = useUploadProviderDocument();
  const { showToast } = useToast();
  const [documentType, setDocumentType] = useState(documentTypes[0]);
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const previewUrl = useImagePreview(file);

  if (info.isLoading || docs.isLoading) return <ProviderLoading />;
  if (info.isError || docs.isError) {
    return (
      <ProviderError
        error={info.error ?? docs.error}
        retry={() => {
          void info.refetch();
          void docs.refetch();
        }}
      />
    );
  }

  const provider = info.data!;
  const canUpload = provider.providerStatus !== "VERIFIED";

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Xác minh provider"
        description="Tải ảnh tài liệu xác minh lên API provider bằng multipart/form-data."
      />

      <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted">Trạng thái hồ sơ</p>
            <div className="mt-2">
              <ProviderBadge value={providerStatusLabels[provider.providerStatus] ?? provider.providerStatus} />
            </div>
            {provider.adminNote ? (
              <p className="mt-3 text-sm font-semibold text-red-700">Ghi chú admin: {provider.adminNote}</p>
            ) : null}
          </div>
          <strong>{provider.businessName}</strong>
        </div>
      </section>

      {canUpload ? (
        <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
          <h2 className="font-extrabold">Tải ảnh tài liệu xác minh</h2>
          <p className="mt-1 text-sm text-muted">
            Chọn loại tài liệu, chọn ảnh JPG/PNG/WEBP rồi gửi lên `/providers/me/documents`.
          </p>

          <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="grid gap-3 sm:grid-cols-[220px_minmax(0,1fr)_auto] sm:items-start">
              <select
                className="h-11 rounded-xl border border-border-muted bg-surface px-3 text-sm"
                value={documentType}
                onChange={(event) => setDocumentType(event.target.value)}
              >
                {documentTypes.map((type) => (
                  <option key={type} value={type}>
                    {providerDocumentTypeLabels[type] ?? type.replaceAll("_", " ")}
                  </option>
                ))}
              </select>
              <Input
                key={inputKey}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
              <Button
                disabled={!file || upload.isLoading}
                onClick={() =>
                  file &&
                  upload.mutate(
                    { documentType, file },
                    {
                      onSuccess: () => {
                        setFile(null);
                        setInputKey((value) => value + 1);
                        showToast("Đã tải ảnh tài liệu lên.", "success");
                      },
                      onError: (error) => showToast(providerErrorText(error), "error"),
                    },
                  )
                }
              >
                {upload.isLoading ? "Đang tải..." : "Tải ảnh lên"}
              </Button>
            </div>

            <div className="rounded-2xl border border-dashed border-border-muted bg-surface-muted p-3">
              {previewUrl ? (
                <div>
                  <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-surface">
                    <Image src={previewUrl} alt="Ảnh tài liệu sắp tải lên" fill className="object-cover" unoptimized />
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold text-muted">{file?.name}</p>
                </div>
              ) : (
                <div className="grid aspect-[4/3] place-items-center rounded-xl bg-surface text-center text-sm font-semibold text-muted">
                  Chưa chọn ảnh
                </div>
              )}
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
        <h2 className="font-extrabold">Tài liệu đã gửi</h2>
        {docs.data?.length ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {sortByDateDesc(docs.data, (document) => document.createAt).map((document) => (
              <a
                className="overflow-hidden rounded-2xl border border-border-subtle hover:border-brand"
                href={document.imageUrl}
                target="_blank"
                rel="noreferrer"
                key={document.id}
              >
                <div className="relative aspect-[4/3] bg-surface-muted">
                  <Image
                    src={document.imageUrl}
                    alt={providerDocumentTypeLabels[document.documentType] ?? document.documentType}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div className="p-4">
                  <ProviderBadge value={document.status} />
                  <strong className="mt-2 block">
                    {providerDocumentTypeLabels[document.documentType] ?? document.documentType.replaceAll("_", " ")}
                  </strong>
                  <p className="mt-1 text-xs text-muted">{providerDate(document.createAt)}</p>
                  {document.adminNote ? <p className="mt-2 text-sm text-red-700">{document.adminNote}</p> : null}
                </div>
              </a>
            ))}
          </div>
        ) : (
          <ProviderEmpty text="Chưa có tài liệu." />
        )}
      </section>
    </div>
  );
}

function useImagePreview(file: File | null) {
  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  return previewUrl;
}
