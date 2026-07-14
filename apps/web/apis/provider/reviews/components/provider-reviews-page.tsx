"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CustomSelect } from "@/components/ui/custom-select";
import { useProviderBusinessProfile } from "@/apis/provider/business-profile/queries";
import {
  ProviderEmpty,
  ProviderError,
  ProviderLoading,
  ProviderPageHeader,
  providerDate,
  sortByDateDesc,
} from "@/apis/provider/_shared/provider-ui";
import { useProviderPublicReviews, type ProviderReviewApi } from "../queries";

export function ProviderReviewsPage() {
  const [page, setPage] = useState(1);
  const [rating, setRating] = useState("all");
  const provider = useProviderBusinessProfile();
  const reviews = useProviderPublicReviews(provider.data?.id, page);

  if (provider.isLoading || reviews.isLoading) return <ProviderLoading />;
  if (provider.isError) {
    return <ProviderError error={provider.error} retry={() => void provider.refetch()} />;
  }
  if (reviews.isError) {
    return <ProviderError error={reviews.error} retry={() => void reviews.refetch()} />;
  }

  const data = reviews.data;
  const items = data?.responseReviews ?? [];
  const filtered = sortByDateDesc(
    rating === "all"
      ? items
      : items.filter((item) => item.rating === Number(rating)),
    (review) => review.createdAt,
  );
  const average = items.length
    ? items.reduce((total, item) => total + item.rating, 0) / items.length
    : 0;

  return (
    <div className="space-y-5">
      <ProviderPageHeader
        title="Đánh giá khách hàng"
        description="Đọc đánh giá thật từ API public provider reviews. Backend hiện chưa có API phản hồi hoặc báo cáo review cho provider."
      />

      <section className="grid gap-4 md:grid-cols-[260px_1fr]">
        <article className="rounded-2xl border border-border-subtle bg-surface p-5 text-center shadow-sm">
          <p className="text-5xl font-black">{average.toFixed(1)}</p>
          <Stars rating={Math.round(average)} />
          <p className="mt-2 text-sm text-muted">{items.length} đánh giá</p>
        </article>
        <article className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
          <div className="max-w-xs">
            <CustomSelect
              value={rating}
              options={[
                { label: "Tất cả sao", value: "all" },
                ...[5, 4, 3, 2, 1].map((value) => ({
                  label: `${value} sao`,
                  value: String(value),
                })),
              ]}
              onValueChange={setRating}
            />
          </div>
          <div className="mt-4 space-y-2">
            {[5, 4, 3, 2, 1].map((value) => {
              const count = items.filter((item) => item.rating === value).length;
              const width = items.length ? `${(count / items.length) * 100}%` : "0%";
              return (
                <div className="grid grid-cols-[52px_1fr_36px] items-center gap-3 text-sm" key={value}>
                  <span className="font-bold">{value} sao</span>
                  <span className="h-2 overflow-hidden rounded-full bg-surface-muted">
                    <span className="block h-full rounded-full bg-amber-400" style={{ width }} />
                  </span>
                  <span className="text-right text-xs font-bold text-muted">{count}</span>
                </div>
              );
            })}
          </div>
        </article>
      </section>

      {filtered.length === 0 ? (
        <ProviderEmpty text="Không có đánh giá phù hợp." />
      ) : (
        <section className="space-y-3">
          {filtered.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </section>
      )}

      <div className="flex justify-center gap-3">
        <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>
          Trước
        </Button>
        <span className="py-2 text-sm font-semibold">
          {page}/{Math.max(1, Math.ceil((data?.total ?? 0) / (data?.pageSize ?? 20)))}
        </span>
        <Button
          variant="outline"
          disabled={!data || page >= Math.ceil(data.total / data.pageSize)}
          onClick={() => setPage(page + 1)}
        >
          Sau
        </Button>
      </div>
    </div>
  );
}

function ReviewCard({ review }: { review: ProviderReviewApi }) {
  const images = useMemo(() => review.images ?? [], [review.images]);
  return (
    <article className="rounded-2xl border border-border-subtle bg-surface p-5 shadow-sm">
      <div className="flex flex-col justify-between gap-3 sm:flex-row">
        <div>
          <h2 className="font-extrabold">{review.user?.name ?? "Khách hàng"}</h2>
          <p className="mt-1 text-xs text-muted">Booking #{review.bookingId.slice(-8)}</p>
        </div>
        <div className="sm:text-right">
          <Stars rating={review.rating} />
          <p className="mt-1 text-xs text-muted">{providerDate(review.createdAt)}</p>
        </div>
      </div>
      {review.comment ? (
        <p className="mt-4 text-sm leading-7 text-foreground">{review.comment}</p>
      ) : (
        <p className="mt-4 text-sm text-muted">Khách hàng không để lại nội dung.</p>
      )}
      {images.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-3">
          {images.map((url) => (
            <a
              className="h-24 w-28 rounded-2xl bg-surface-muted bg-cover bg-center"
              href={url}
              key={url}
              rel="noreferrer"
              style={{ backgroundImage: `url(${url})` }}
              target="_blank"
            />
          ))}
        </div>
      ) : null}
    </article>
  );
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="text-lg tracking-wider text-amber-400" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, index) => (
        <span className={index < rating ? "text-amber-400" : "text-slate-300"} key={index}>
          ★
        </span>
      ))}
    </div>
  );
}
