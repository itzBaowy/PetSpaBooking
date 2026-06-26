"use client";

import { useMemo, useState } from "react";
import { formatVietnameseDateTime } from "@/lib/date";
import {
  providerDocumentTypeLabels,
  type AdminProviderStatus,
  type ProviderDocument,
} from "../schema";

const fallbackPreview = "/brand/petlink-logo.png";

function getDocumentDisplayStatus(
  document: ProviderDocument,
  providerStatus: AdminProviderStatus,
) {
  if (providerStatus === "VERIFIED") return "Đã xác thực";
  if (providerStatus === "REJECTED") return "Đã từ chối";
  if (providerStatus === "SUSPENDED") return "Tạm ngưng";

  return document.status === "PENDING" ? "Chờ duyệt" : document.status;
}

function isImageDocument(value: string) {
  return /\.(png|jpe?g|webp|gif|avif)$/i.test(value);
}

function getDocumentPreviewSrc(value: string) {
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("/")) {
    return value;
  }

  return fallbackPreview;
}

export function ProviderDocumentPanel({
  documents,
  providerStatus,
}: {
  documents: ProviderDocument[];
  providerStatus: AdminProviderStatus;
}) {
  const [selectedDocumentId, setSelectedDocumentId] = useState(
    documents[0]?.id ?? "",
  );
  const selectedDocument = useMemo(
    () =>
      documents.find((document) => document.id === selectedDocumentId) ??
      documents[0],
    [documents, selectedDocumentId],
  );

  if (documents.length === 0) {
    return (
      <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
        Chưa có tài liệu nào.
      </p>
    );
  }

  const previewSrc = selectedDocument
    ? getDocumentPreviewSrc(selectedDocument.imageUrl)
    : fallbackPreview;
  const canPreviewImage = selectedDocument
    ? isImageDocument(selectedDocument.imageUrl)
    : false;
  const selectedLabel = selectedDocument
    ? providerDocumentTypeLabels[selectedDocument.documentType] ??
      selectedDocument.documentType
    : "Tài liệu";

  return (
    <div className="mt-5 grid gap-5 lg:grid-cols-[360px_1fr]">
      <div className="space-y-3">
        {documents.map((document) => {
          const active = document.id === selectedDocument?.id;
          const label =
            providerDocumentTypeLabels[document.documentType] ??
            document.documentType;

          return (
            <button
              key={document.id}
              type="button"
              onClick={() => setSelectedDocumentId(document.id)}
              className={`w-full rounded-xl border p-4 text-left transition ${
                active
                  ? "border-brand bg-brand-soft"
                  : "border-border-subtle bg-surface-muted hover:border-brand"
              }`}
            >
              <p className="text-sm font-bold text-foreground">{label}</p>
              <p className="mt-1 break-all text-xs text-muted">
                {document.imageUrl}
              </p>
              <p className="mt-3 text-xs font-semibold text-brand">
                {getDocumentDisplayStatus(document, providerStatus)} /{" "}
                {formatVietnameseDateTime(document.createAt)}
              </p>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-muted">
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-3">
          <div>
            <p className="text-sm font-bold text-foreground">{selectedLabel}</p>
            <p className="text-xs text-muted">
              {selectedDocument?.imageUrl ?? "Không có tài liệu"}
            </p>
          </div>
          {selectedDocument && (
            <a
              href={previewSrc}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-border-muted px-3 py-1.5 text-xs font-bold text-foreground hover:bg-surface-muted"
            >
              Mở ảnh
            </a>
          )}
        </div>
        <div className="grid min-h-[440px] place-items-center bg-gray-100 p-4">
          {canPreviewImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt={selectedLabel}
              className="max-h-[560px] w-full rounded-xl object-contain"
              onError={(event) => {
                event.currentTarget.src = fallbackPreview;
              }}
            />
          ) : (
            <div className="text-center">
              <div className="mx-auto grid h-24 w-24 place-items-center rounded-2xl bg-white text-sm font-black text-muted shadow-sm">
                FILE
              </div>
              <p className="mt-4 text-sm font-semibold text-muted">
                Tài liệu này không có bản xem trước ảnh.
              </p>
            </div>
          )}
        </div>
        {!/^(https?:)?\/\//i.test(selectedDocument?.imageUrl ?? "") &&
          !(selectedDocument?.imageUrl ?? "").startsWith("/") && (
            <p className="border-t border-border-subtle bg-warning-soft px-4 py-3 text-xs font-semibold text-warning">
              BE hiện chỉ lưu tên file, chưa có URL ảnh thật. Cần upload lên
              Cloudinary hoặc serve static file để preview hiển thị đúng.
            </p>
          )}
      </div>
    </div>
  );
}
