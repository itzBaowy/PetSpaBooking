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

type Params = Record<string, string | number | undefined>;

const FIELD_LABELS: Record<string, string> = {
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

const VALUE_LABELS: Record<string, string> = {
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
};

function fieldLabel(key: string) { return FIELD_LABELS[key] ?? key; }
function displayValue(value: unknown, key?: string) {
  if (typeof value === "string" && VALUE_LABELS[value]) return VALUE_LABELS[value];
  if (key && ["walletBalance", "depositBalance", "totalAmount", "amount", "balanceAfter"].includes(key) && typeof value === "number") {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  }
  if (key && ["createAt", "updateAt", "appointmentStart"].includes(key) && typeof value === "string") {
    const date = new Date(value); if (!Number.isNaN(date.getTime())) return date.toLocaleString("vi-VN");
  }
  return textValue(value);
}

function cleanParams(params: Params) {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== "" && value !== undefined));
}

function errorMessage(error: unknown) {
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

function LoadState({ error, retry }: { error: unknown; retry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <p className="font-semibold text-red-800">{errorMessage(error)}</p>
      <Button type="button" onClick={retry} className="mt-3 bg-red-700 hover:bg-red-800">Thử lại</Button>
    </div>
  );
}

function PageTitle({ title, description }: { title: string; description: string }) {
  return <PageHeader eyebrow="Quản trị PetLink" title={title} description={description} />;
}

function Pager({ data, setPage, setPageSize }: { data?: AdminList; setPage: (page: number) => void; setPageSize?: (pageSize: number) => void }) {
  if (!data) return null;
  return <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-3"><Pagination page={data.pagination.page} totalPages={Math.max(data.pagination.totalPages, 1)} pageSize={data.pagination.pageSize} pageSizeOptions={[10, 20, 50]} onPageChange={setPage} onPageSizeChange={setPageSize ? (nextPageSize) => { setPage(1); setPageSize(nextPageSize); } : undefined} /></div>;
}

function Field({ label, value }: { label: string; value: unknown }) {
  return <div className="rounded-xl bg-gray-50 p-3"><dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{fieldLabel(label)}</dt><dd className="mt-1 break-words text-sm font-medium text-gray-900">{displayValue(value, label)}</dd></div>;
}

function EntityFields({ entity, omit = [] }: { entity: AdminEntity; omit?: string[] }) {
  const entries = Object.entries(entity).filter(([key, value]) => !omit.includes(key) && (typeof value !== "object" || value === null));
  return <dl className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{entries.map(([key, value]) => <Field key={key} label={key} value={value} />)}</dl>;
}

function useAdminList(key: string, url: string, params: Params) {
  return useQuery<AdminList>({
    queryKey: ["admin-real", key, cleanParams(params)],
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(url, { params: cleanParams(params) });
      return listSchema.parse(response.data.data);
    },
    keepPreviousData: true,
  });
}

function useAdminDetail(key: string, url: string | null) {
  return useQuery<AdminEntity>({
    queryKey: ["admin-real", key, url],
    queryFn: async () => {
      const response = await api.get<ApiResponse<unknown>>(url!);
      return entitySchema.parse(response.data.data);
    },
    enabled: Boolean(url),
  });
}

export function FilterSelect({ value, options, onChange, className }: { value: string; options: CustomSelectOption[]; onChange: (value: string) => void; className?: string }) {
  return <CustomSelect className={className} value={value} options={options} onValueChange={onChange} />;
}

export function EntityTable({ loading, items, columns, detailBase }: { loading: boolean; items?: AdminEntity[]; columns: string[]; detailBase?: string }) {
  const router = useRouter();
  if (loading) return <p className="rounded-2xl border bg-white p-6">Đang tải dữ liệu...</p>;
  const statusKeys = new Set(["status", "providerStatus", "depositStatus", "paymentStatus", "balanceType", "type"]);
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

export function StatusPill({ value }: { value: unknown }) {
  const raw = textValue(value, "UNKNOWN");
  const success = ["ACTIVE", "VERIFIED", "SUCCESS", "COMPLETED", "APPROVED", "PAID", "ONLINE_EARNING"].includes(raw);
  const warning = ["PENDING", "PENDING_VERIFICATION", "UNPAID", "NOT_PAID", "LOW_BALANCE", "CONFIRMED"].includes(raw);
  const danger = ["INACTIVE", "BANNED", "REJECTED", "SUSPENDED", "FAILED", "CANCELLED", "DISPUTE"].includes(raw);
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

export { AdminDashboardPage } from "./pages/dashboard-page";
export { AdminUsersPage } from "./pages/users-page";
export { AdminUserDetailPage } from "./pages/user-detail-page";
export { AdminProvidersPage } from "./pages/providers-page";
export { AdminProviderDetailPage } from "./pages/provider-detail-page";
export { AdminBookingsPage } from "./pages/bookings-page";
export { AdminBookingDetailPage } from "./pages/booking-detail-page";
export { AdminDisputesPage } from "./pages/disputes-page";
export { AdminDisputeDetailPage } from "./pages/dispute-detail-page";
export { AdminLedgerPage } from "./pages/ledger-page";
export { AdminProviderWalletPage } from "./pages/provider-wallet-page";
export { AdminWithdrawalsPage } from "./pages/withdrawals-page";
export { AdminWithdrawalDetailPage } from "./pages/withdrawal-detail-page";
export { AdminAuditLogsPage } from "./pages/audit-logs-page";
export { AdminServicesPage } from "./pages/services-page";
export { AdminServiceDetailPage } from "./pages/service-detail-page";
export { AdminRefundsPage } from "./pages/refunds-page";
export { AdminRefundDetailPage } from "./pages/refund-detail-page";
export { AdminNotificationsPage } from "./pages/notifications-page";
