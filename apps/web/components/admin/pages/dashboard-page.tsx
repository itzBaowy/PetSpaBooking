"use client";

import { useQuery } from "@tanstack/react-query";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { nested, textValue } from "@/apis/admin/supported-api";
import { PageTitle, LoadState } from "../shared";

export function AdminDashboardPage() {
  const query = useQuery<Record<string, unknown>>({
    queryKey: ["admin-real", "dashboard"],
    queryFn: async () => (await api.get<ApiResponse<Record<string, unknown>>>(API_ENDPOINTS.ADMIN.DASHBOARD)).data.data,
  });

  if (query.isLoading) return <p>Đang tải tổng quan...</p>;
  if (query.isError) return <LoadState error={query.error} retry={() => void query.refetch()} />;

  const data = query.data ?? {};
  const cards = [
    ["Người dùng", nested(data, "users", "total")],
    ["Nhà cung cấp", nested(data, "providers", "total")],
    ["Lịch đặt hoàn tất", nested(data, "bookings", "completed")],
    ["Tranh chấp chờ xử lý", nested(data, "disputes", "pending")],
    ["Rút tiền chờ duyệt", nested(data, "withdrawals", "pending")],
    ["Dịch vụ hoạt động", nested(data, "services", "active")],
  ];

  return (
    <div className="space-y-6">
      <PageTitle title="Tổng quan quản trị" description="Số liệu trực tiếp từ GET /admin/dashboard/summary." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map(([label, value]) => (
          <div key={String(label)} className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm text-gray-500">{textValue(label)}</p>
            <p className="mt-2 text-3xl font-bold">{textValue(value, "0")}</p>
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900">
        Biểu đồ xu hướng, top dịch vụ và top nhà cung cấp chưa có endpoint trong BE nên không sử dụng dữ liệu mock.
      </div>
    </div>
  );
}
