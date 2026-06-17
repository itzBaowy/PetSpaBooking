"use client";

import { useState } from "react";
import { ActionMenu } from "@/components/ui/action-menu";
import { DataTable } from "@/components/ui/data-table";
import { PageHeader } from "@/components/ui/page-header";
import { StatisticCard, StatisticCardGrid } from "@/components/ui/statistic-card";
import type { DataTableColumn } from "@/components/ui/data-table";
import { useNoShowReviews } from "../queries";
import type { NoShowReview } from "../queries";
import { NoShowResolutionDialog } from "./no-show-resolution-dialog";

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function NoShowReviewTable() {
  const { data: reviews } = useNoShowReviews();
  const [selectedReview, setSelectedReview] = useState<NoShowReview | null>(
    null,
  );
  const readyCount = reviews.filter(
    (review) => review.status === "READY_FOR_ADMIN",
  ).length;
  const reservedAmount = reviews.reduce(
    (total, review) => total + review.reserveAmount,
    0,
  );

  const columns: Array<DataTableColumn<NoShowReview>> = [
    {
      key: "booking",
      header: "Đặt lịch",
      widthClassName: "w-[18%]",
      render: (review) => (
        <div>
          <p className="font-bold text-foreground">{review.bookingId}</p>
          <p className="text-xs text-muted">{review.service}</p>
        </div>
      ),
    },
    {
      key: "parties",
      header: "Các bên",
      render: (review) => (
        <div>
          <p className="font-semibold">{review.petOwner}</p>
          <p className="text-xs text-muted">{review.provider}</p>
        </div>
      ),
    },
    {
      key: "reported",
      header: "Báo lúc",
      render: (review) => review.reportedAt,
    },
    {
      key: "reserve",
      header: "Khoản giữ",
      align: "right",
      render: (review) => formatCurrency(review.reserveAmount),
    },
    {
      key: "status",
      header: "Trạng thái",
      render: (review) => (
        <span className="rounded-full border border-warning-soft bg-warning-soft px-2.5 py-1 text-xs font-bold text-warning">
          {review.status}
        </span>
      ),
    },
    {
      key: "actions",
      header: "Thao tác",
      align: "right",
      isAction: true,
      render: (review) => (
        <ActionMenu
          items={[
            { label: "Xem bằng chứng", onClick: () => setSelectedReview(review) },
            { label: "Xử lý vắng mặt", onClick: () => setSelectedReview(review) },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        eyebrow="Quản trị / Giám sát đặt lịch"
        title="Duyệt báo cáo vắng mặt"
        description="Duyệt báo cáo vắng mặt trước khi hoàn giữ hoa hồng hoặc chuyển thành tranh chấp."
      />
      <StatisticCardGrid columns={3}>
        <StatisticCard title="Báo cáo" value={reviews.length} tone="amber" />
        <StatisticCard title="Sẵn sàng xử lý" value={readyCount} tone="red" />
        <StatisticCard
          title="Hoa hồng đang giữ"
          value={formatCurrency(reservedAmount)}
          tone="blue"
          valueClassName="text-2xl"
        />
      </StatisticCardGrid>
      <DataTable
        columns={columns}
        data={reviews}
        getRowKey={(review) => review.id}
        minWidthClassName="min-w-[960px]"
      />
      {selectedReview && (
        <NoShowResolutionDialog
          review={selectedReview}
          onClose={() => setSelectedReview(null)}
        />
      )}
    </div>
  );
}
