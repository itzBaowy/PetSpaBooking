"use client";

import { useState } from "react";
import { CustomSelect } from "@/components/ui/custom-select";
import { noShowResolutionSchema } from "../schema";
import { useResolveNoShowReview } from "../queries";
import type { NoShowReview } from "../queries";

export function NoShowResolutionDialog({
  review,
  onClose,
}: {
  review: NoShowReview;
  onClose: () => void;
}) {
  const resolveMutation = useResolveNoShowReview();
  const [decision, setDecision] = useState<
    "APPROVE_NO_SHOW" | "REJECT_TO_DISPUTE" | "REJECT_TO_COMPLETED"
  >("APPROVE_NO_SHOW");
  const [evidenceNote, setEvidenceNote] = useState("");
  const [auditNote, setAuditNote] = useState("");
  const [error, setError] = useState("");

  const handleResolve = () => {
    const result = noShowResolutionSchema.safeParse({
      bookingId: review.bookingId,
      decision,
      evidenceNote,
      auditNote,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? "Quyết định vắng mặt không hợp lệ.");
      return;
    }

    resolveMutation.mutate(result.data, {
      onError: () => {
        window.alert("Quyết định vắng mặt đã được kiểm tra. Backend chưa kết nối.");
        onClose();
      },
      onSuccess: () => {
        window.alert("Đã lưu quyết định vắng mặt (mock).");
        onClose();
      },
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-2xl rounded-2xl border border-border-subtle bg-surface p-5 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-foreground">
              Xử lý báo cáo vắng mặt
            </h2>
            <p className="mt-1 text-sm text-muted">
              {review.bookingId} / {review.provider} / {review.petOwner}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-2 py-1 text-sm font-bold text-muted hover:bg-surface-muted"
          >
            Đóng
          </button>
        </div>

        <div className="mt-5 grid gap-3 rounded-xl bg-surface-muted p-4 text-sm text-muted">
          <p>
            <span className="font-bold text-foreground">Bằng chứng nhà cung cấp:</span>{" "}
            {review.providerEvidence}
          </p>
          <p>
            <span className="font-bold text-foreground">Phản hồi chủ thú cưng:</span>{" "}
            {review.ownerResponse}
          </p>
        </div>

        <div className="mt-5 space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-muted">Quyết định</span>
            <CustomSelect
              defaultValue={decision}
              options={[
                { label: "Duyệt vắng mặt và hoàn giữ hoa hồng", value: "APPROVE_NO_SHOW" },
                { label: "Từ chối và chuyển sang tranh chấp", value: "REJECT_TO_DISPUTE" },
                { label: "Từ chối và đánh dấu hoàn tất", value: "REJECT_TO_COMPLETED" },
              ]}
              onValueChange={(value) =>
                setDecision(
                  value as
                    | "APPROVE_NO_SHOW"
                    | "REJECT_TO_DISPUTE"
                    | "REJECT_TO_COMPLETED",
                )
              }
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-muted">
              Ghi chú bằng chứng
            </span>
            <textarea
              value={evidenceNote}
              onChange={(event) => setEvidenceNote(event.target.value)}
              className="min-h-24 w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-sm outline-none focus:ring-4 focus:ring-brand-soft"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-semibold text-muted">Ghi chú kiểm toán</span>
            <textarea
              value={auditNote}
              onChange={(event) => setAuditNote(event.target.value)}
              className="min-h-24 w-full rounded-xl border border-border-subtle bg-surface px-4 py-3 text-sm font-medium text-foreground shadow-sm outline-none focus:ring-4 focus:ring-brand-soft"
            />
          </label>
        </div>
        {error && <p className="mt-3 text-sm font-semibold text-danger">{error}</p>}
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="h-10 rounded-xl border border-border-subtle px-4 text-sm font-bold text-foreground hover:bg-surface-muted"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={handleResolve}
            className="h-10 rounded-xl bg-foreground px-4 text-sm font-bold text-background hover:bg-muted"
          >
            Lưu quyết định
          </button>
        </div>
      </div>
    </div>
  );
}
