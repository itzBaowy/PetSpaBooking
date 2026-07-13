"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { errorMessage } from "@/components/admin/shared";
import { CustomSelect } from "@/components/ui/custom-select";
import { Dialog } from "@/components/ui/dialog";
import { useToast } from "@/components/ui";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { NOTIFICATION_TYPE_OPTIONS } from "./notification-labels";

function parseNotificationData(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;

  const parsed = JSON.parse(trimmed) as unknown;
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Data must be a JSON object.");
  }

  return parsed as Record<string, unknown>;
}

export function SendNotificationModal({ onClose }: { onClose: () => void }) {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [mode, setMode] = useState<"single" | "broadcast">("single");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("PROVIDER");
  const [type, setType] = useState("ADMIN_ANNOUNCEMENT");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [dataText, setDataText] = useState("");

  const mutation = useMutation({
    mutationFn: async () => {
      const data = parseNotificationData(dataText);
      const payload = {
        type: type.trim(),
        title: title.trim(),
        message: message.trim(),
        ...(data ? { data } : {}),
      };
      const url = mode === "single" ? API_ENDPOINTS.ADMIN.NOTIFICATIONS.SEND : API_ENDPOINTS.ADMIN.NOTIFICATIONS.BROADCAST;
      const body = mode === "single" ? { ...payload, userId: userId.trim() } : { ...payload, role };
      return (await api.post<ApiResponse<unknown>>(url, body)).data.data;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["topbar-notifications"] });
      showToast("Đã gửi thông báo.", "success");
      onClose();
    },
    onError: (error) => showToast(errorMessage(error), "error"),
  });

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!type.trim() || !title.trim() || !message.trim()) {
      showToast("Vui lòng nhập đủ loại, tiêu đề và nội dung.", "error");
      return;
    }
    if (mode === "single" && !userId.trim()) {
      showToast("Vui lòng nhập mã người nhận.", "error");
      return;
    }
    try {
      parseNotificationData(dataText);
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Data JSON không hợp lệ.", "error");
      return;
    }
    mutation.mutate();
  };

  return (
    <Dialog title="Gửi thông báo" onClose={onClose}>
      <form onSubmit={submit} className="space-y-4">
        <p className="rounded-xl bg-surface-muted px-3 py-2 text-xs font-medium text-muted">
          Gửi cá nhân tạo 1 thông báo. Gửi theo nhóm sẽ tạo thông báo cho từng người dùng đang hoạt động trong vai trò đã chọn.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1.5">
            <span className="text-xs font-bold uppercase tracking-wide text-muted">Gửi cho</span>
            <CustomSelect
              value={mode}
              onValueChange={(value) => setMode(value as "single" | "broadcast")}
              options={[
                { value: "single", label: "Một người dùng" },
                { value: "broadcast", label: "Nhóm theo vai trò" },
              ]}
            />
          </label>

          {mode === "single" ? (
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-muted">Mã người nhận</span>
              <input value={userId} onChange={(event) => setUserId(event.target.value)} placeholder="Nhập userId" className="h-11 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm" />
            </label>
          ) : (
            <label className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wide text-muted">Vai trò nhận</span>
              <CustomSelect
                value={role}
                onValueChange={setRole}
                options={[
                  { value: "CUSTOMER", label: "Khách hàng" },
                  { value: "PROVIDER", label: "Nhà cung cấp" },
                  { value: "ADMIN", label: "Quản trị viên" },
                ]}
              />
            </label>
          )}
        </div>

        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">Loại thông báo</span>
          <CustomSelect value={type} onValueChange={setType} options={NOTIFICATION_TYPE_OPTIONS} />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">Tiêu đề</span>
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Nhập tiêu đề thông báo" className="h-11 w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm" />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">Nội dung</span>
          <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Nhập nội dung thông báo" rows={4} className="w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm" />
        </label>

        <label className="block space-y-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-muted">Data JSON tuỳ chọn</span>
          <textarea
            value={dataText}
            onChange={(event) => setDataText(event.target.value)}
            placeholder='Ví dụ: {"screen":"home"}'
            rows={3}
            className="w-full rounded-xl border border-border-subtle bg-surface px-3 py-2 text-sm"
          />
        </label>

        <div className="flex justify-end gap-2">
          <button type="button" onClick={onClose} className="h-10 rounded-xl border border-border-muted px-4 text-sm font-bold">
            Hủy
          </button>
          <button type="submit" disabled={mutation.isPending} className="h-10 rounded-xl bg-brand px-4 text-sm font-bold text-white hover:bg-brand-hover disabled:opacity-60">
            {mutation.isPending ? "Đang gửi..." : "Gửi thông báo"}
          </button>
        </div>
      </form>
    </Dialog>
  );
}
