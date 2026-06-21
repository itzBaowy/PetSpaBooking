"use client";

import { useMemo, useState } from "react";
import { ActionMenu } from "@/components/ui/action-menu";
import { CustomSelect } from "@/components/ui/custom-select";
import { DataTable } from "@/components/ui/data-table";
import type { DataTableColumn } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { SearchInput } from "@/components/ui/search-input";
import {
  StatisticCard,
  StatisticCardGrid,
} from "@/components/ui/statistic-card";
import { formatCurrency } from "@/lib/currency";
import { cn } from "@/lib/utils";
import {
  useMarketingBanners,
  useMarketingCampaigns,
  useMarketingCoupons,
} from "../queries";
import type {
  CouponConfig,
  MarketingCampaign,
  MarketingStatus,
} from "../schema";

const STATUS_FILTERS: Array<{ label: string; value: "" | MarketingStatus }> = [
  { label: "Tất cả trạng thái", value: "" },
  { label: "Đang chạy", value: "ACTIVE" },
  { label: "Đã lên lịch", value: "SCHEDULED" },
  { label: "Bản nháp", value: "DRAFT" },
  { label: "Tạm dừng", value: "PAUSED" },
  { label: "Hết hạn", value: "EXPIRED" },
];

const statusStyles: Record<MarketingStatus, string> = {
  ACTIVE: "border-green-200 bg-green-50 text-green-700",
  SCHEDULED: "border-blue-200 bg-blue-50 text-blue-700",
  DRAFT: "border-gray-200 bg-gray-50 text-gray-700",
  PAUSED: "border-amber-200 bg-amber-50 text-amber-700",
  EXPIRED: "border-red-200 bg-red-50 text-red-700",
};

const statusLabels: Record<MarketingStatus, string> = {
  ACTIVE: "Đang chạy",
  SCHEDULED: "Đã lên lịch",
  DRAFT: "Bản nháp",
  PAUSED: "Tạm dừng",
  EXPIRED: "Hết hạn",
};

function StatusBadge({ status }: { status: MarketingStatus }) {
  return (
    <span
      className={cn(
        "inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold",
        statusStyles[status],
      )}
    >
      {statusLabels[status]}
    </span>
  );
}

export function MarketingManagement() {
  const campaigns = useMarketingCampaigns();
  const banners = useMarketingBanners();
  const coupons = useMarketingCoupons();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | MarketingStatus>("");

  const filteredCampaigns = useMemo(() => {
    const query = search.trim().toLowerCase();

    return campaigns.data.filter((campaign) => {
      if (statusFilter && campaign.status !== statusFilter) return false;
      if (!query) return true;

      return [campaign.id, campaign.name, campaign.type, campaign.status].some(
        (value) => value.toLowerCase().includes(query),
      );
    });
  }, [campaigns.data, search, statusFilter]);

  const activeCampaignCount = campaigns.data.filter(
    (campaign) => campaign.status === "ACTIVE",
  ).length;
  const scheduledCampaignCount = campaigns.data.filter(
    (campaign) => campaign.status === "SCHEDULED",
  ).length;
  const activeCouponCount = coupons.data.filter(
    (coupon) => coupon.status === "ACTIVE",
  ).length;
  const totalBudget = campaigns.data.reduce(
    (sum, campaign) => sum + campaign.budgetVnd,
    0,
  );

  const campaignColumns: Array<DataTableColumn<MarketingCampaign>> = [
    {
      key: "campaign",
      header: "Chiến dịch",
      widthClassName: "w-[26%]",
      render: (campaign) => (
        <div>
          <p className="break-words font-semibold text-gray-900">
            {campaign.name}
          </p>
          <p className="text-xs text-gray-500">
            {campaign.id} / {campaign.type}
          </p>
        </div>
      ),
    },
    {
      key: "window",
      header: "Thời gian",
      widthClassName: "w-[20%]",
      render: (campaign) => (
        <span className="text-sm text-gray-700">
          {campaign.startsAt} - {campaign.endsAt}
        </span>
      ),
    },
    {
      key: "budget",
      header: "Ngân sách",
      widthClassName: "w-[16%]",
      render: (campaign) => (
        <span className="font-semibold text-gray-900">
          {formatCurrency(campaign.budgetVnd, "VND")}
        </span>
      ),
    },
    {
      key: "performance",
      header: "Hiệu quả",
      widthClassName: "w-[18%]",
      render: (campaign) => (
        <div>
          <p className="text-sm font-semibold text-gray-900">
            {campaign.usageCount.toLocaleString("vi-VN")} lượt xem/thao tác
          </p>
          <p className="text-xs text-gray-500">
            {campaign.conversionRate}% chuyển đổi
          </p>
        </div>
      ),
    },
    {
      key: "status",
      header: "Trạng thái",
      widthClassName: "w-[12%]",
      render: (campaign) => <StatusBadge status={campaign.status} />,
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      isAction: true,
      widthClassName: "w-[8%]",
      render: (campaign) => (
        <ActionMenu
          items={[
            { label: "Xem trước chiến dịch" },
            { label: "Sửa chiến dịch" },
            ...(campaign.status === "DRAFT" || campaign.status === "SCHEDULED"
              ? [{ label: "Kích hoạt chiến dịch" }]
              : []),
            ...(campaign.status === "ACTIVE"
              ? [{ label: "Tạm dừng chiến dịch" }]
              : []),
            { label: "Lưu trữ chiến dịch", variant: "danger" },
          ]}
        />
      ),
    },
  ];

  const couponColumns: Array<DataTableColumn<CouponConfig>> = [
    {
      key: "code",
      header: "Mã giảm giá",
      widthClassName: "w-[24%]",
      render: (coupon) => (
        <div>
          <p className="font-semibold text-gray-900">{coupon.code}</p>
          <p className="text-xs text-gray-500">{coupon.id}</p>
        </div>
      ),
    },
    {
      key: "discount",
      header: "Giảm giá",
      widthClassName: "w-[20%]",
      render: (coupon) =>
        coupon.type === "PERCENTAGE"
          ? `${coupon.value}%`
          : formatCurrency(coupon.value, "VND"),
    },
    {
      key: "minimum",
      header: "Đơn tối thiểu",
      widthClassName: "w-[20%]",
      render: (coupon) => formatCurrency(coupon.minOrderValue, "VND"),
    },
    {
      key: "usage",
      header: "Lượt dùng",
      widthClassName: "w-[20%]",
      render: (coupon) => `${coupon.usedCount}/${coupon.usageLimit}`,
    },
    {
      key: "status",
      header: "Trạng thái",
      widthClassName: "w-[12%]",
      render: (coupon) => <StatusBadge status={coupon.status} />,
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      isAction: true,
      widthClassName: "w-[8%]",
      render: () => (
        <ActionMenu
          items={[
            { label: "Sửa mã giảm giá" },
            { label: "Nhân bản mã giảm giá" },
            { label: "Tạm dừng mã giảm giá", variant: "danger" },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="w-full max-w-full space-y-6 p-6">
      <PageHeader
        eyebrow="Quản trị / Marketing"
        title="Quản lý marketing & banner"
        description="Quản lý banner, mã giảm giá, flash sale và mức hiển thị chiến dịch trên toàn sàn."
        actions={
          <>
            <button className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm">
              Lưu nháp
            </button>
            <button className="rounded-lg bg-gray-950 px-4 py-2 text-sm font-semibold text-white shadow-sm">
              Tạo chiến dịch
            </button>
          </>
        }
      />

      <StatisticCardGrid columns={4}>
        <StatisticCard
          title="Chiến dịch đang chạy"
          value={activeCampaignCount}
          tone="green"
        />
        <StatisticCard
          title="Lịch sắp chạy"
          value={scheduledCampaignCount}
          tone="blue"
        />
        <StatisticCard
          title="Mã giảm giá đang chạy"
          value={activeCouponCount}
          tone="amber"
        />
        <StatisticCard
          title="Tổng ngân sách"
          value={formatCurrency(totalBudget, "VND")}
          tone="purple"
        />
      </StatisticCardGrid>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Vị trí banner trang chủ
              </h2>
              <p className="text-sm text-gray-500">
                Sắp xếp vị trí hiển thị trước khi chiến dịch chạy.
              </p>
            </div>
            <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              Tự động lưu đã bật
            </span>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            {banners.data.map((banner) => (
              <div
                key={banner.id}
                className="overflow-hidden rounded-xl border border-gray-100 bg-gray-50/70"
              >
                <div className="h-28 bg-gradient-to-br from-blue-100 via-emerald-50 to-amber-100" />
                <div className="space-y-2 p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {banner.title}
                      </p>
                      <p className="text-xs text-gray-500">{banner.slot}</p>
                    </div>
                    <StatusBadge status={banner.status} />
                  </div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Ưu tiên #{banner.priority}</span>
                    <span>{banner.id}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-100 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Cấu hình mã giảm giá
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Điều khiển mock cho quy tắc giảm giá toàn sàn.
          </p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm font-semibold text-gray-700">
              Mã giảm giá
              <input
                value="PETWELCOME"
                readOnly
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 outline-none"
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-700">
              Loại giảm giá
              <CustomSelect
                options={[
                  { label: "Theo phần trăm", value: "PERCENTAGE" },
                  { label: "Số tiền cố định", value: "FIXED_AMOUNT" },
                ]}
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-700">
              Đơn tối thiểu
              <input
                value="150000"
                readOnly
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 outline-none"
              />
            </label>
            <label className="space-y-1 text-sm font-semibold text-gray-700">
              Giới hạn lượt dùng
              <input
                value="3000"
                readOnly
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-medium text-gray-800 outline-none"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col gap-3 rounded-xl border border-border-subtle bg-surface p-4 shadow-sm lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              Chiến dịch toàn sàn
            </h2>
            <p className="text-sm text-gray-500">
              Chương trình banner, mã giảm giá và flash sale cho toàn nền tảng.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <SearchInput
              value={search}
              onChange={setSearch}
              className="sm:w-80"
              placeholder="Tìm chiến dịch, mã giảm giá, banner..."
            />
            <CustomSelect
              className="sm:w-52"
              options={STATUS_FILTERS}
              defaultValue={statusFilter}
              onValueChange={(value) =>
                setStatusFilter(value as "" | MarketingStatus)
              }
            />
          </div>
        </div>
        <DataTable
          columns={campaignColumns}
          data={filteredCampaigns}
          getRowKey={(campaign) => campaign.id}
          minWidthClassName="min-w-[1180px]"
          emptyState={
            <div className="p-8 text-center text-sm font-semibold text-gray-600">
              Không tìm thấy chiến dịch marketing.
            </div>
          }
        />
      </div>

      <div className="space-y-4">
        <div className="rounded-xl border border-border-subtle bg-surface p-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Quy tắc mã giảm giá toàn sàn
          </h2>
          <p className="text-sm text-gray-500">
            Quản lý ưu đãi dùng lại cho chiến dịch và flash sale.
          </p>
        </div>
        <DataTable
          columns={couponColumns}
          data={coupons.data}
          getRowKey={(coupon) => coupon.id}
          minWidthClassName="min-w-[980px]"
        />
      </div>
    </div>
  );
}
