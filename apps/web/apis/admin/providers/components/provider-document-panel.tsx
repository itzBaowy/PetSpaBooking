"use client";

import { useMemo, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { queryKeys } from "@/constants/query-keys";
import { api } from "@/lib/axios";
import { formatVietnameseDateTime } from "@/lib/date";
import type { ApiResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { useConfirmDialog, useToast } from "@/components/ui/feedback-provider";
import {
  providerDocumentTypeLabels,
  type AdminProviderDetail,
  type AdminProviderStatus,
  type ProviderDocument,
} from "../schema";

const fallbackPreview = "/brand/petlink-logo.png";

function getDocumentDisplayStatus(
  document: ProviderDocument,
  providerStatus: AdminProviderStatus,
) {
  if (document.status === "APPROVED") return "Đã phê duyệt";
  if (document.status === "REJECTED") return "Đã từ chối";
  if (document.status === "PENDING") return "Chờ duyệt";
  if (providerStatus === "VERIFIED") return "Đã xác thực";
  if (providerStatus === "REJECTED") return "Đã từ chối";
  if (providerStatus === "SUSPENDED") return "Tạm ngưng";
  if (document.status === "APPROVED") return "Đã phê duyệt";

  return document.status === "PENDING" ? "Chờ duyệt" : document.status;
}

function isImageDocument(value: string) {
  return /\.(png|jpe?g|webp|gif|avif)$/i.test(value);
}

function getDocumentUrl(document: ProviderDocument) {
  return document.signedUrl ?? document.fileUrl ?? document.imageUrl ?? "";
}

function getDocumentName(document: ProviderDocument) {
  return document.fileName ?? getDocumentUrl(document) ?? "Chưa có tên file";
}

function getDocumentPreviewSrc(value: string) {
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("/")) {
    return value;
  }

  return fallbackPreview;
}

export function ProviderDocumentPanel({
  documents = [],
  providerStatus,
}: {
  documents?: ProviderDocument[];
  providerStatus: AdminProviderStatus;
}) {
  const queryClient = useQueryClient();
  const confirm = useConfirmDialog();
  const { showToast } = useToast();
  const [localDocuments, setLocalDocuments] = useState(documents);
  const [selectedDocumentId, setSelectedDocumentId] = useState(
    documents[0]?.id ?? "",
  );
  const effectiveSelectedDocumentId = selectedDocumentId || localDocuments[0]?.id || "";
  const selectedDocument = useMemo(
    () =>
      localDocuments.find((document) => document.id === effectiveSelectedDocumentId) ??
      localDocuments[0],
    [localDocuments, effectiveSelectedDocumentId],
  );

  const approveMutation = useMutation({
    mutationFn: async (documentId: string) => {
      const response = await api.patch<ApiResponse<ProviderDocument>>(
        API_ENDPOINTS.ADMIN.PROVIDER_DOCUMENTS.APPROVE(documentId),
      );
      return response.data.data;
    },
    onSuccess: (updatedDocument) => {
      setLocalDocuments((current) =>
        current.map((document) =>
          document.id === updatedDocument.id ? { ...document, ...updatedDocument } : document,
        ),
      );
      queryClient.setQueryData<AdminProviderDetail | null>(
        queryKeys.adminProviders.detail(updatedDocument.providerId),
        (current) => {
          if (!current) return current;

          return {
            ...current,
            documents: current.documents.map((document) =>
              document.id === updatedDocument.id ? updatedDocument : document,
            ),
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminProviders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminProviders.detail(updatedDocument.providerId) });
      showToast("Đã phê duyệt tài liệu.", "success");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({
      documentId,
      reason,
    }: {
      documentId: string;
      reason: string;
    }) => {
      const response = await api.patch<ApiResponse<ProviderDocument>>(
        API_ENDPOINTS.ADMIN.PROVIDER_DOCUMENTS.REJECT(documentId),
        { reason },
      );
      return response.data.data;
    },
    onSuccess: (updatedDocument) => {
      setLocalDocuments((current) =>
        current.map((document) =>
          document.id === updatedDocument.id ? { ...document, ...updatedDocument } : document,
        ),
      );
      queryClient.setQueryData<AdminProviderDetail | null>(
        queryKeys.adminProviders.detail(updatedDocument.providerId),
        (current) => {
          if (!current) return current;

          return {
            ...current,
            documents: current.documents.map((document) =>
              document.id === updatedDocument.id ? updatedDocument : document,
            ),
          };
        },
      );
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminProviders.all });
      void queryClient.invalidateQueries({ queryKey: queryKeys.adminProviders.detail(updatedDocument.providerId) });
      showToast("Đã từ chối tài liệu.", "success");
    },
  });

  const handleApproveDocument = async () => {
    if (!selectedDocument || selectedDocument.status === "APPROVED") return;

    const result = await confirm({
      title: "Phê duyệt tài liệu",
      description: `Bạn có chắc chắn muốn phê duyệt tài liệu ${providerDocumentTypeLabels[selectedDocument.documentType] ?? selectedDocument.documentType}?`,
      confirmLabel: "Phê duyệt",
      cancelLabel: "Hủy",
      tone: "success",
    });

    if (!result.confirmed) return;

    try {
      await approveMutation.mutateAsync(selectedDocument.id);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Không thể phê duyệt tài liệu.",
        "error",
      );
    }
  };

  const handleRejectDocument = async () => {
    if (!selectedDocument || selectedDocument.status === "REJECTED") return;

    const result = await confirm({
      title: "Từ chối tài liệu",
      description: `Nhập lý do từ chối tài liệu ${providerDocumentTypeLabels[selectedDocument.documentType] ?? selectedDocument.documentType}.`,
      confirmLabel: "Từ chối",
      cancelLabel: "Hủy",
      tone: "danger",
      input: {
        label: "Lý do từ chối",
        placeholder: "Ví dụ: giấy phép kinh doanh bị mờ...",
        required: true,
      },
    });

    if (!result.confirmed || !result.value?.trim()) return;

    try {
      await rejectMutation.mutateAsync({
        documentId: selectedDocument.id,
        reason: result.value.trim(),
      });
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Không thể từ chối tài liệu.",
        "error",
      );
    }
  };

  if (localDocuments.length === 0) {
    return (
      <p className="mt-4 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
        Chưa có tài liệu nào.
      </p>
    );
  }

  const previewSrc = selectedDocument
    ? getDocumentPreviewSrc(getDocumentUrl(selectedDocument))
    : fallbackPreview;
  const canPreviewImage = selectedDocument
    ? Boolean(selectedDocument.mimeType?.startsWith("image/")) ||
      isImageDocument(getDocumentUrl(selectedDocument)) ||
      /^(https?:)?\/\//i.test(getDocumentUrl(selectedDocument))
    : false;
  const selectedLabel = selectedDocument
    ? providerDocumentTypeLabels[selectedDocument.documentType] ??
      selectedDocument.documentType
    : "Tài liệu";

  return (
    <div className="mt-5 grid items-start gap-5 lg:grid-cols-[300px_minmax(0,1fr)]">
      <div className="max-h-140 space-y-3 overflow-y-auto pr-1 lg:sticky lg:top-4">
        {localDocuments.map((document) => {
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
                {getDocumentName(document)}
              </p>
              <p className="mt-3 text-xs font-semibold text-brand">
                {getDocumentDisplayStatus(document, providerStatus)} /{" "}
                {formatVietnameseDateTime(document.createAt)}
              </p>
            </button>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-subtle bg-surface-muted lg:sticky lg:top-4">
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface px-4 py-3">
          <div>
            <p className="text-sm font-bold text-foreground">{selectedLabel}</p>
            <p className="text-xs text-muted">
              {selectedDocument
                ? getDocumentName(selectedDocument)
                : "Không có tài liệu"}
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
        <div className="flex min-h-110 items-center justify-center bg-gray-100 p-4">
          {canPreviewImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={previewSrc}
              alt={selectedLabel}
              className="max-h-140 max-w-full rounded-xl object-contain"
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
        {selectedDocument && selectedDocument.status !== "APPROVED" && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle bg-surface px-4 py-3">
            <p className="text-xs font-semibold text-muted">
              Trạng thái hiện tại: {getDocumentDisplayStatus(selectedDocument, providerStatus)}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleRejectDocument}
                disabled={rejectMutation.isPending}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {rejectMutation.isPending ? "Đang từ chối..." : "Từ chối tài liệu"}
              </Button>
              <Button
                onClick={handleApproveDocument}
                disabled={approveMutation.isPending}
                className="bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {approveMutation.isPending ? "Đang phê duyệt..." : "Phê duyệt tài liệu"}
              </Button>
            </div>
          </div>
        )}
        {!/^(https?:)?\/\//i.test(
          selectedDocument ? getDocumentUrl(selectedDocument) : "",
        ) &&
          !(selectedDocument
            ? getDocumentUrl(selectedDocument)
            : ""
          ).startsWith("/") && (
            <p className="border-t border-border-subtle bg-warning-soft px-4 py-3 text-xs font-semibold text-warning">
              BE hiện chỉ lưu tên file, chưa có URL ảnh thật. Cần upload lên
              Cloudinary hoặc serve static file để preview hiển thị đúng.
            </p>
          )}
      </div>
    </div>
  );
}
