"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useProfile } from "@/apis/auth/queries";
import { API_ENDPOINTS } from "@/constants/api-endpoints";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { PageHeader } from "@/components/ui/page-header";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { FinanceStatusPill } from "@/apis/admin/finance/components/status-pill";
import { CustomSelect, type CustomSelectOption } from "@/components/ui/custom-select";
import { SearchInput } from "@/components/ui/search-input";
import { ActionMenu } from "@/components/ui/action-menu";
import { getAvatarInitials } from "@/components/ui/avatar";
import { useConfirmDialog, useToast } from "@/components/ui";
import { UserPetsPanel } from "@/apis/admin/users/components/user-pets-panel";
import { ProviderDocumentPanel } from "@/apis/admin/providers/components/provider-document-panel";
import {
  entitySchema,
  listSchema,
  nested,
  textValue,
  type AdminEntity,
  type AdminList,
} from "@/apis/admin/supported-api";

export type Params = Record<string, string | number | undefined>;

export const FIELD_LABELS: Record<string, string> = {
  id: "Mã", userName: "Tên đăng nhập", fullName: "Họ và tên", email: "Email",
  phone: "Số điện thoại", role: "Vai trò", status: "Trạng thái",
  businessName: "Tên cơ sở", providerStatus: "Trạng thái nhà cung cấp",
  depositStatus: "Trạng thái ký quỹ", walletBalance: "Số dư ví",
  depositBalance: "Số dư ký quỹ", paymentMethod: "Phương thức thanh toán",
  paymentStatus: "Trạng thái thanh toán", totalAmount: "Tổng tiền",
  appointmentStart: "Thời gian hẹn", bookingId: "Mã booking",
  providerId: "Mã nhà cung cấp", customerId: "Mã khách hàng",
  reason: "Lý do", createAt: "Ngày tạo", updateAt: "Ngày cập nhật",
  type: "Loại giao dịch", balanceType: "Loại số dư", amount: "Số tiền",
  balanceAfter: "Số dư sau giao dịch", action: "Hành động",
  targetType: "Loại đối tượng", targetId: "Mã đối tượng",
};

export const VALUE_LABELS: Record<string, string> = {
  CUSTOMER: "Khách hàng", PROVIDER: "Nhà cung cấp", ADMIN: "Quản trị viên",
  ACTIVE: "Đang hoạt động", INACTIVE: "Ngừng hoạt động", BANNED: "Bị cấm",
  PENDING_VERIFICATION: "Chờ xác minh", VERIFIED: "Đã xác minh",
  REJECTED: "Đã từ chối", SUSPENDED: "Tạm ngưng", PENDING: "Đang chờ",
  CONFIRMED: "Đã xác nhận", CHECKED_IN: "Đã nhận khách", CHECKED_OUT: "Đã hoàn tất dịch vụ",
  COMPLETED: "Hoàn thành", CANCELLED: "Đã hủy", DISPUTE: "Đang tranh chấp",
  NO_ARRIVAL: "Không đến", CASH: "Tiền mặt", ONLINE: "Trực tuyến",
  UNPAID: "Chưa thanh toán", SUCCESS: "Thành công", FAILED: "Thất bại",
  NOT_PAID: "Chưa thanh toán", LOW_BALANCE: "Số dư thấp",
  REFUNDED: "Đã hoàn tiền", APPROVED: "Đã duyệt", PAID: "Đã chi trả",
  RESOLVED_PROVIDER_WIN: "Nhà cung cấp thắng", RESOLVED_CUSTOMER_WIN: "Khách hàng thắng",
  WALLET: "Ví", DEPOSIT: "Ký quỹ", ONLINE_EARNING: "Doanh thu trực tuyến",
  CASH_COMMISSION_DEDUCTION: "Trừ hoa hồng tiền mặt",
  DEPOSIT_COMMISSION_DEDUCTION: "Trừ hoa hồng từ ký quỹ",
  MANUAL_ADJUSTMENT: "Điều chỉnh thủ công", WITHDRAWAL_PAYOUT: "Chi trả rút tiền",
  // Actions
  DISPUTE_RESOLVE: "Giải quyết tranh chấp",
  PROVIDER_REJECT: "Từ chối nhà cung cấp",
  PROVIDER_SUSPEND: "Tạm ngưng nhà cung cấp",
  PROVIDER_VERIFY: "Xác minh nhà cung cấp",
  PROVIDER_WALLET_ADJUST: "Điều chỉnh số dư ví",
  USER_STATUS_UPDATE: "Cập nhật trạng thái",
  WITHDRAWAL_APPROVE: "Duyệt yêu cầu rút tiền",
  WITHDRAWAL_MARK_PAID: "Đánh dấu đã chi trả",
  WITHDRAWAL_REJECT: "Từ chối yêu cầu rút tiền",
  // Target types
  BookingDispute: "Tranh chấp lịch hẹn",
  Provider: "Nhà cung cấp",
  ProviderWallet: "Ví nhà cung cấp",
  User: "Người dùng",
  WithdrawalRequest: "Yêu cầu rút tiền",
};

export function fieldLabel(key: string) { return FIELD_LABELS[key] ?? key; }

export function displayValue(value: unknown, key?: string) {
  if (typeof value === "string" && VALUE_LABELS[value]) return VALUE_LABELS[value];
  if (key && ["walletBalance", "depositBalance", "totalAmount", "amount", "balanceAfter"].includes(key) && typeof value === "number") {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  }
  if (key && ["createAt", "updateAt", "appointmentStart"].includes(key) && typeof value === "string") {
    const date = new Date(value); if (!Number.isNaN(date.getTime())) return date.toLocaleString("vi-VN");
  }
  return textValue(value);
}

export function cleanParams(params: Params) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined));
}

export function errorMessage(error: unknown) {
  if (error && typeof error === "object" && "response" in error) {
    const response = (error as { response?: { data?: { message?: string }; status?: number } }).response;
    if (response?.status === 403) return "Bạn không có quyền thực hiện thao tác này.";
    if (response?.status === 404) return "Không tìm thấy dữ liệu được yêu cầu.";
    if (response?.status && response.status >= 500) {
      return "Máy chủ đang gặp lỗi xử lý dữ liệu. Vui lòng kiểm tra nhật ký máy chủ hoặc thử lại sau.";
    }
    return response?.data?.message || "Yêu cầu API thất bại.";
  }
  return error instanceof Error ? error.message : "Không thể tải dữ liệu.";
}

export function LoadState({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <p className="font-semibold text-red-800">{errorMessage(error)}</p>
      <Button type="button" onClick={retry} className="mt-3 bg-red-700 hover:bg-red-800">Thử lại</Button>
    </div>
  );
}

export function PageTitle({ title, description }: { title: string; description: string }) {
  return <PageHeader eyebrow="Quản trị PetLink" title={title} description={description} />;
}

export function Pager({ data, setPage, setPageSize }: { data?: AdminList; setPage: (page: number) => void; setPageSize?: (pageSize: number) => void }) {
  if (!data) return null;
  return <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-3"><Pagination page={data.pagination.page} totalPages={Math.max(data.pagination.totalPages, 1)} pageSize={data.pagination.pageSize} pageSizeOptions={[10, 20, 50]} onPageChange={setPage} onPageSizeChange={setPageSize ? (nextPageSize) => { setPage(1); setPageSize(nextPageSize); } : undefined} /></div>;
}

export function Field({ label, value }: { label: string; value: unknown }) {
  return <div className="rounded-xl bg-gray-50 p-3"><dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{fieldLabel(label)}</dt><dd className="mt-1 break-words text-sm font-medium text-gray-900">{displayValue(value, label)}</dd></div>;
}

export function EntityFields({ entity, omit = [] }: { entity: AdminEntity; omit?: string[] }) {
  const entries = Object.entries(entity).filter(([key, value]) => !omit.includes(key) && (typeof value !== "object" || value === null));
  return <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{entries.map(([key, value]) => <Field key={key} label={key} value={value} />)}</dl>;
}

export function useAdminList(key: string, url: string, params: Params) {
  return useQuery<AdminList>({
    queryKey: ["admin-real", key, cleanParams(params)],
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(url, { params: cleanParams(params) });
      return listSchema.parse(response.data.data);
    },
    keepPreviousData: true,
  });
}

export function useAdminDetail(key: string, url: string | null) {
  return useQuery<AdminEntity>({
    queryKey: ["admin-real", key, url],
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(url!);
      return entitySchema.parse(response.data.data);
    },
    enabled: Boolean(url),
  });
}

export const selectClass = "rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm";
export const inputClass = "min-w-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm";

export function FilterSelect({ value, options, onChange, className }: { value: string; options: CustomSelectOption[]; onChange: (value: string) => void; className?: string }) {
  return <CustomSelect className={className} value={value} options={options} onValueChange={onChange} />;
}

export function StatusPill({ value }: { value: unknown }) {
  const raw = textValue(value, "UNKNOWN");
  const success = ["ACTIVE", "VERIFIED", "SUCCESS", "COMPLETED", "APPROVED", "PAID", "ONLINE_EARNING", "PROVIDER_VERIFY", "WITHDRAWAL_APPROVE", "WITHDRAWAL_MARK_PAID"].includes(raw);
  const warning = ["PENDING", "PENDING_VERIFICATION", "UNPAID", "NOT_PAID", "LOW_BALANCE", "CONFIRMED", "PROVIDER_SUSPEND", "USER_STATUS_UPDATE", "PROVIDER_WALLET_ADJUST"].includes(raw);
  const danger = ["INACTIVE", "BANNED", "REJECTED", "SUSPENDED", "FAILED", "CANCELLED", "DISPUTE", "PROVIDER_REJECT", "WITHDRAWAL_REJECT", "DISPUTE_RESOLVE"].includes(raw);
  return <FinanceStatusPill tone={success ? "success" : warning ? "warning" : danger ? "danger" : "default"}>{displayValue(raw)}</FinanceStatusPill>;
}

export function DetailItem({ label, value, icon }: { label: string; value: unknown; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl bg-surface-soft p-3 transition-colors border border-border-subtle/50 hover:bg-surface-muted/55">
      {icon && <div className="mt-0.5 text-muted shrink-0">{icon}</div>}
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{fieldLabel(label)}</dt>
        <dd className="mt-1 break-words text-sm font-semibold text-foreground">{displayValue(value, label)}</dd>
      </div>
    </div>
  );
}

export function EntityTable({ loading, items, columns, detailBase }: { loading: boolean; items?: AdminEntity[]; columns: string[]; detailBase?: string }) {
  const router = useRouter();
  if (loading) return <p className="rounded-2xl border bg-white p-6">Đang tải dữ liệu...</p>;
  const statusKeys = new Set(["status", "providerStatus", "depositStatus", "paymentStatus", "balanceType", "type", "action"]);
  const tableColumns: Array<DataTableColumn<AdminEntity>> = columns.map((key) => ({
    key,
    header: fieldLabel(key),
    render: (item) => statusKeys.has(key)
      ? <StatusPill value={item[key]} />
      : <span className="break-words">{displayValue(item[key], key)}</span>,
  }));
  if (detailBase) tableColumns.push({ key: "detail", header: "Thao tác", align: "right", isAction: true, render: (item) => <ActionMenu items={[{ label: "Xem chi tiết", onClick: () => router.push(`${detailBase}/${item.id}`) }]} /> });
  return <DataTable columns={tableColumns} data={items ?? []} getRowKey={(item) => item.id} minWidthClassName="min-w-[1040px]" emptyState={<div className="p-8 text-center text-sm font-semibold text-muted">Không có dữ liệu phù hợp.</div>} />;
}
