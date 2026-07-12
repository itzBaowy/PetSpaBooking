"use client";

import { FormEvent, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import { Button } from "@/components/ui/button";
import type { ApiResponse } from "@/types/api";
import {
  EntityTable,
  FilterSelect,
  LoadState,
  PageTitle,
  Pager,
  errorMessage,
  inputClass,
  useAdminList,
} from "../shared";
import { useToast } from "@/components/ui";

type SendMode = "single" | "broadcast";

export function AdminNotificationsPage() {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [userIdFilter, setUserIdFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [mode, setMode] = useState<SendMode>("single");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("PROVIDER");
  const [type, setType] = useState("ADMIN_ANNOUNCEMENT");
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");

  const query = useAdminList("notifications", API_ENDPOINTS.ADMIN.NOTIFICATIONS.LIST, {
    page,
    pageSize,
    userId: userIdFilter,
    type: typeFilter,
  });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload = {
        type: type.trim(),
        title: title.trim(),
        message: message.trim(),
      };
      const url =
        mode === "single"
          ? API_ENDPOINTS.ADMIN.NOTIFICATIONS.SEND
          : API_ENDPOINTS.ADMIN.NOTIFICATIONS.BROADCAST;
      const body =
        mode === "single"
          ? { ...payload, userId: userId.trim() }
          : { ...payload, role };

      return (await api.post<ApiResponse<unknown>>(url, body)).data.data;
    },
    onSuccess: () => {
      setTitle("");
      setMessage("");
      if (mode === "single") setUserId("");
      void queryClient.invalidateQueries({ queryKey: ["admin-real"] });
      showToast("Đã gửi thông báo.", "success");
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
    mutation.mutate();
  };

  if (query.isError) {
    return <LoadState error={query.error} retry={() => void query.refetch()} />;
  }

  return (
    <div className="space-y-6">
      <PageTitle
        title="Thông báo quản trị"
        description="Xem lịch sử thông báo và gửi thông báo quản trị cho một người dùng hoặc broadcast theo vai trò."
      />

      <section className="rounded-2xl border border-border-subtle bg-surface p-4 shadow-sm">
        <form onSubmit={submit} className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              className="w-full sm:w-48"
              value={mode}
              options={[
                { value: "single", label: "Gửi 1 người" },
                { value: "broadcast", label: "Gửi theo vai trò" },
              ]}
              onChange={(value) => setMode(value as SendMode)}
            />
            {mode === "single" ? (
              <input
                value={userId}
                onChange={(event) => setUserId(event.target.value)}
                placeholder="Mã người nhận"
                className={inputClass}
              />
            ) : (
              <FilterSelect
                className="w-full sm:w-48"
                value={role}
                options={[
                  { value: "CUSTOMER", label: "Khách hàng" },
                  { value: "PROVIDER", label: "Nhà cung cấp" },
                  { value: "ADMIN", label: "Quản trị viên" },
                ]}
                onChange={setRole}
              />
            )}
            <input
              value={type}
              onChange={(event) => setType(event.target.value)}
              placeholder="Loại thông báo"
              className={inputClass}
            />
          </div>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Tiêu đề"
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          />
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Nội dung thông báo"
            rows={3}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm"
          />
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="bg-brand text-white hover:bg-brand-hover"
            >
              {mutation.isPending ? "Đang gửi..." : "Gửi thông báo"}
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div className="rounded-2xl border border-border-subtle bg-surface p-3 shadow-sm">
          <div className="flex flex-wrap gap-2">
            <input
              value={userIdFilter}
              onChange={(event) => {
                setUserIdFilter(event.target.value);
                setPage(1);
              }}
              placeholder="Lọc theo mã người nhận"
              className={inputClass}
            />
            <input
              value={typeFilter}
              onChange={(event) => {
                setTypeFilter(event.target.value);
                setPage(1);
              }}
              placeholder="Lọc theo loại thông báo"
              className={inputClass}
            />
            <span className="ml-auto self-center text-sm font-medium text-muted">
              {query.isFetching
                ? "Đang tải..."
                : `${query.data?.pagination.totalItems ?? 0} thông báo`}
            </span>
          </div>
        </div>

        <EntityTable
          loading={query.isLoading}
          items={query.data?.items}
          columns={[
            "user.fullName",
            "user.email",
            "type",
            "title",
            "message",
            "isRead",
            "createAt",
          ]}
        />
        <Pager data={query.data} setPage={setPage} setPageSize={setPageSize} />
      </section>
    </div>
  );
}
