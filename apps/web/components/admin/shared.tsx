"use client";

import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { ApiResponse } from "@/types/api";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { DataTable, type DataTableColumn } from "@/components/ui/data-table";
import { FinanceStatusPill } from "@/apis/admin/finance/components/status-pill";
import { CustomSelect, type CustomSelectOption } from "@/components/ui/custom-select";
import { ActionMenu, type ActionMenuItem } from "@/components/ui/action-menu";
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
  id: "Mã",
  userName: "Tên đăng nhập",
  displayName: "Tên hiển thị",
  fullName: "Họ và tên",
  email: "Email",
  phone: "Số điện thoại",
  role: "Vai trò",
  status: "Trạng thái",
  businessName: "Tên cơ sở",
  providerStatus: "Trạng thái nhà cung cấp",
  depositStatus: "Trạng thái ký quỹ",
  walletBalance: "Số dư ví",
  depositBalance: "Số dư ký quỹ",
  paymentMethod: "Phương thức thanh toán",
  paymentStatus: "Trạng thái thanh toán",
  totalAmount: "Tổng tiền",
  appointmentStart: "Thời gian hẹn",
  bookingId: "Mã booking",
  providerId: "Mã nhà cung cấp",
  customerId: "Mã khách hàng",
  reason: "Lý do",
  description: "Mô tả",
  createAt: "Ngày tạo",
  updateAt: "Ngày cập nhật",
  createdAt: "Ngày tạo",
  updatedAt: "Ngày cập nhật",
  resolvedBy: "Người xử lý",
  resolvedAt: "Ngày xử lý",
  adminNote: "Ghi chú admin",
  type: "Loại giao dịch",
  balanceType: "Loại số dư",
  amount: "Số tiền",
  balanceAfter: "Số dư sau giao dịch",
  action: "Hành động",
  targetType: "Loại đối tượng",
  targetId: "Mã đối tượng",
  "customer.users.fullName": "Khách hàng",
  "customer.users.phone": "Số điện thoại",
  "provider.businessName": "Nhà cung cấp",
  "service.name": "Dịch vụ",
  "booking.id": "Mã booking",
  "booking.customer.users.fullName": "Khách hàng",
  "booking.service.name": "Dịch vụ",
  name: "Tên",
  category: "Danh mục",
  price: "Giá",
  duration: "Thời lượng",
  isActive: "Đang hoạt động",
  isHiddenByAdmin: "Admin đang ẩn",
  title: "Tiêu đề",
  message: "Nội dung",
  userId: "Mã người nhận",
  isRead: "Đã đọc",
  cancelledAt: "Ngày hủy",
  "user.fullName": "Người nhận",
  "user.email": "Email",
};

export const VALUE_LABELS: Record<string, string> = {
  CUSTOMER: "Khách hàng",
  PROVIDER: "Nhà cung cấp",
  ADMIN: "Quản trị viên",
  ACTIVE: "Đang hoạt động",
  INACTIVE: "Ngừng hoạt động",
  BANNED: "Bị cấm",
  PENDING_VERIFICATION: "Chờ xác minh",
  VERIFIED: "Đã xác minh",
  REJECTED: "Đã từ chối",
  SUSPENDED: "Tạm ngưng",
  PENDING: "Đang chờ",
  CONFIRMED: "Đã xác nhận",
  CHECKED_IN: "Đã nhận khách",
  CHECKED_OUT: "Đã hoàn tất dịch vụ",
  COMPLETED: "Hoàn thành",
  CANCELLED: "Đã hủy",
  DISPUTE: "Đang tranh chấp",
  NO_ARRIVAL: "Không đến",
  CASH: "Tiền mặt",
  ONLINE: "Trực tuyến",
  UNPAID: "Chưa thanh toán",
  SUCCESS: "Thành công",
  FAILED: "Thất bại",
  NOT_PAID: "Chưa thanh toán",
  LOW_BALANCE: "Số dư thấp",
  REFUNDED: "Đã hoàn tiền",
  APPROVED: "Đã duyệt",
  PAID: "Đã chi trả",
  RESOLVED_PROVIDER_WIN: "Nhà cung cấp thắng",
  RESOLVED_CUSTOMER_WIN: "Khách hàng thắng",
  WALLET: "Ví",
  DEPOSIT: "Ký quỹ",
  ONLINE_EARNING: "Doanh thu trực tuyến",
  CASH_COMMISSION_DEDUCTION: "Trừ hoa hồng tiền mặt",
  DEPOSIT_COMMISSION_DEDUCTION: "Trừ hoa hồng từ ký quỹ",
  MANUAL_ADJUSTMENT: "Điều chỉnh thủ công",
  WITHDRAWAL_PAYOUT: "Chi trả rút tiền",
  WITHDRAWAL_HOLD: "Giữ tiền rút",
  WITHDRAWAL_RELEASE: "Hoàn tiền rút",
  DISPUTE_RESOLVE: "Giải quyết tranh chấp",
  REFUND_MARK_REFUNDED: "Đánh dấu đã hoàn tiền",
  REFUND_REJECT: "Từ chối hoàn tiền",
  ADMIN_NOTIFICATION_SEND: "Gửi thông báo",
  ADMIN_NOTIFICATION_BROADCAST: "Phát thông báo theo vai trò",
  PROVIDER_REJECT: "Từ chối nhà cung cấp",
  PROVIDER_SUSPEND: "Tạm ngưng nhà cung cấp",
  PROVIDER_VERIFY: "Xác minh nhà cung cấp",
  PROVIDER_DOCUMENT_APPROVE: "Duyệt tài liệu nhà cung cấp",
  PROVIDER_DOCUMENT_REJECT: "Từ chối tài liệu nhà cung cấp",
  PROVIDER_WALLET_ADJUST: "Điều chỉnh số dư ví",
  USER_STATUS_UPDATE: "Cập nhật trạng thái người dùng",
  SERVICE_HIDE: "Ẩn dịch vụ",
  SERVICE_UNHIDE: "Hiện lại dịch vụ",
  WITHDRAWAL_APPROVE: "Duyệt yêu cầu rút tiền",
  WITHDRAWAL_MARK_PAID: "Đánh dấu đã chi trả",
  WITHDRAWAL_REJECT: "Từ chối yêu cầu rút tiền",
  BookingDispute: "Tranh chấp lịch hẹn",
  BOOKING_DISPUTE: "Tranh chấp lịch hẹn",
  BOOKING: "Lịch đặt",
  ROLE: "Vai trò",
  SERVICE: "Dịch vụ",
  Provider: "Nhà cung cấp",
  PROVIDER_DOCUMENT: "Tài liệu nhà cung cấp",
  ProviderWallet: "Ví nhà cung cấp",
  PROVIDER_WALLET: "Ví nhà cung cấp",
  User: "Người dùng",
  USER: "Người dùng",
  WithdrawalRequest: "Yêu cầu rút tiền",
  WITHDRAWAL: "Yêu cầu rút tiền",
  WITHDRAWAL_REQUEST: "Yêu cầu rút tiền",
  GROOMING: "Chăm sóc lông",
  SPA: "Spa",
  BOARDING: "Lưu trú",
  TRAINING: "Huấn luyện",
  VETERINARY: "Thú y",
  OTHER: "Khác",
};

export function fieldLabel(key: string) {
  return FIELD_LABELS[key] ?? key;
}

export function displayValue(value: unknown, key?: string) {
  if (typeof value === "string" && VALUE_LABELS[value]) return VALUE_LABELS[value];
  if (typeof value === "boolean") return value ? "Có" : "Không";
  if (key && ["walletBalance", "depositBalance", "totalAmount", "amount", "balanceAfter", "price"].includes(key) && typeof value === "number") {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
  }
  if (key && ["createAt", "updateAt", "createdAt", "updatedAt", "resolvedAt", "appointmentStart", "cancelledAt"].includes(key) && typeof value === "string") {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) return date.toLocaleString("vi-VN");
  }
  return textValue(value);
}

export function cleanParams(params: Params) {
  return Object.fromEntries(
    Object.entries(params)
      .map(([key, value]) => [
        key,
        typeof value === "string" ? value.trim() : value,
      ])
      .filter(([, value]) => value !== "" && value !== undefined),
  );
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
    <div className="mx-auto mt-10 max-w-2xl rounded-3xl border border-red-200 bg-gradient-to-br from-white to-red-50 p-8 text-center shadow-sm">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-red-100 text-xl font-black text-red-600">!</div>
      <p className="mt-4 font-semibold leading-6 text-red-800">{errorMessage(error)}</p>
      <Button type="button" onClick={retry} className="mt-5 bg-red-700 hover:bg-red-800">Thử lại</Button>
    </div>
  );
}

export function PageTitle({ title, description, actions }: { title: string; description: string; actions?: ReactNode }) {
  return (
    <header className="relative overflow-hidden rounded-[28px] border border-emerald-200/70 bg-gradient-to-br from-emerald-950 via-emerald-800 to-emerald-500 px-5 py-6 text-white shadow-[0_18px_45px_-28px_rgba(5,150,105,0.75)] sm:px-7 sm:py-7">
      <div className="pointer-events-none absolute -right-10 -top-16 h-52 w-52 rounded-full border-[34px] border-white/10" />
      <div className="pointer-events-none absolute bottom-4 right-40 text-5xl text-white/10">✦</div>
      <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="mt-0.5 grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-white/25 bg-white/15 shadow-lg backdrop-blur">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 3 4.5 6.2v5.2c0 4.5 3 7.8 7.5 9.6 4.5-1.8 7.5-5.1 7.5-9.6V6.2L12 3Z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-extrabold uppercase tracking-[0.22em] text-emerald-100">Trung tâm quản trị PetLink</p>
            <h1 className="mt-2 break-words text-2xl font-black tracking-tight sm:text-3xl">{title}</h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/85">{description}</p>
          </div>
        </div>
        {actions ? <div className="flex w-full flex-wrap gap-2 lg:w-auto [&_button]:shadow-lg">{actions}</div> : null}
      </div>
    </header>
  );
}

export function Pager({ data, setPage, setPageSize }: { data?: AdminList; setPage: (page: number) => void; setPageSize?: (pageSize: number) => void }) {
  if (!data) return null;
  return (
    <div className="rounded-2xl border border-border-subtle bg-surface px-4 py-3 shadow-sm">
      <Pagination
        page={data.pagination.page}
        totalPages={Math.max(data.pagination.totalPages, 1)}
        pageSize={data.pagination.pageSize}
        pageSizeOptions={[10, 20, 50]}
        onPageChange={setPage}
        onPageSizeChange={setPageSize ? (nextPageSize) => {
          setPage(1);
          setPageSize(nextPageSize);
        } : undefined}
      />
    </div>
  );
}

export function Field({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-xl bg-gray-50 p-3">
      <dt className="text-xs font-semibold uppercase tracking-wide text-gray-500">{fieldLabel(label)}</dt>
      <dd className="mt-1 break-words text-sm font-medium text-gray-900">{displayValue(value, label)}</dd>
    </div>
  );
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
export const inputClass = "h-11 min-w-0 w-full rounded-xl border border-border-muted bg-surface px-3.5 py-2 text-sm font-medium shadow-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand-soft sm:w-auto";

export function FilterSelect({ value, options, onChange, className }: { value: string; options: CustomSelectOption[]; onChange: (value: string) => void; className?: string }) {
  return <CustomSelect className={className} value={value} options={options} onValueChange={onChange} />;
}

export function StatusPill({ value }: { value: unknown }) {
  const raw = textValue(value, "UNKNOWN");
  const success = ["ACTIVE", "VERIFIED", "SUCCESS", "COMPLETED", "APPROVED", "PAID", "ONLINE_EARNING", "PROVIDER_VERIFY", "WITHDRAWAL_APPROVE", "WITHDRAWAL_MARK_PAID", "Có", "Đang bật", "Đang hiển thị"].includes(raw);
  const warning = ["PENDING", "PENDING_VERIFICATION", "UNPAID", "NOT_PAID", "LOW_BALANCE", "CONFIRMED", "PROVIDER_SUSPEND", "USER_STATUS_UPDATE", "PROVIDER_WALLET_ADJUST", "Đang bị ẩn"].includes(raw);
  const danger = ["INACTIVE", "BANNED", "REJECTED", "SUSPENDED", "FAILED", "CANCELLED", "DISPUTE", "PROVIDER_REJECT", "WITHDRAWAL_REJECT", "DISPUTE_RESOLVE", "Không", "Đang tắt"].includes(raw);
  return <FinanceStatusPill tone={success ? "success" : warning ? "warning" : danger ? "danger" : "default"}>{displayValue(raw)}</FinanceStatusPill>;
}

export function DetailItem({ label, value, icon }: { label: string; value: unknown; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-border-subtle/50 bg-surface-soft p-3 transition-colors hover:bg-surface-muted/55">
      {icon && <div className="mt-0.5 shrink-0 text-muted">{icon}</div>}
      <div className="min-w-0 flex-1">
        <dt className="text-xs font-semibold uppercase tracking-wider text-muted">{fieldLabel(label)}</dt>
        <dd className="mt-1 break-words text-sm font-semibold text-foreground">{displayValue(value, label)}</dd>
      </div>
    </div>
  );
}

type EntityColumnRenderers = Record<string, (item: AdminEntity) => React.ReactNode>;
type EntityColumnOptions = Record<
  string,
  Pick<DataTableColumn<AdminEntity>, "widthClassName" | "cellClassName" | "headerClassName" | "align">
>;

export function EntityTable({
  loading,
  items,
  columns,
  detailBase,
  renderers,
  columnOptions,
  actions,
}: {
  loading: boolean;
  items?: AdminEntity[];
  columns: string[];
  detailBase?: string;
  renderers?: EntityColumnRenderers;
  columnOptions?: EntityColumnOptions;
  actions?: (item: AdminEntity) => ActionMenuItem[];
}) {
  const router = useRouter();
  if (loading) return <div className="rounded-3xl border border-border-subtle bg-surface p-8 text-center shadow-sm"><span className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-brand-soft border-t-brand" /><p className="mt-3 text-sm font-semibold text-muted">Đang tải dữ liệu...</p></div>;

  const statusKeys = new Set(["status", "providerStatus", "depositStatus", "paymentStatus", "balanceType", "type", "action", "category", "isActive", "isHiddenByAdmin", "isRead"]);
  const tableColumns: Array<DataTableColumn<AdminEntity>> = columns.map((key) => ({
    key,
    header: fieldLabel(key),
    ...columnOptions?.[key],
    render: (item) => {
      const customRender = renderers?.[key];
      if (customRender) return customRender(item);
      const value = key.includes(".") ? nested(item, ...key.split(".")) : item[key];
      return statusKeys.has(key)
        ? <StatusPill value={value} />
        : <span className="break-words">{displayValue(value, key)}</span>;
    },
  }));

  if (detailBase || actions) {
    tableColumns.push({
      key: "detail",
      header: "Thao tác",
      align: "right",
      isAction: true,
      render: (item) => (
        <ActionMenu
          items={[
            ...(detailBase ? [{ label: "Xem chi tiết", onClick: () => router.push(`${detailBase}/${item.id}`) }] : []),
            ...(actions?.(item) ?? []),
          ]}
        />
      ),
    });
  }

  return (
    <DataTable
      columns={tableColumns}
      data={items ?? []}
      getRowKey={(item) => item.id}
      minWidthClassName="min-w-[1040px]"
      emptyState={<div className="p-8 text-center text-sm font-semibold text-muted">Không có dữ liệu phù hợp.</div>}
    />
  );
}
