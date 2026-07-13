"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

type MomoReturnScreenProps = {
  variant: "booking" | "provider-deposit";
};

function getParam(
  params: URLSearchParams,
  key: string,
  fallback = "-",
) {
  const value = params.get(key);
  return value && value.trim() ? value : fallback;
}

function getResult(params: URLSearchParams) {
  const resultCode = params.get("resultCode");
  if (resultCode === "0") {
    return {
      title: "Thanh toán thành công",
      description:
        "MoMo đã redirect về PetLink. Backend sẽ cập nhật trạng thái chính thức qua IPN.",
      tone: "success" as const,
    };
  }

  if (resultCode) {
    return {
      title: "Thanh toán chưa thành công",
      description:
        getParam(params, "message", "Giao dịch chưa được xác nhận thành công."),
      tone: "danger" as const,
    };
  }

  return {
    title: "Đang chờ kết quả thanh toán",
    description:
      "Trang này chưa nhận được resultCode từ MoMo. Vui lòng kiểm tra lại trạng thái trong ứng dụng.",
    tone: "warning" as const,
  };
}

export function MomoReturnScreen({ variant }: MomoReturnScreenProps) {
  const searchParams = useSearchParams();
  const result = getResult(searchParams);
  const isProviderDeposit = variant === "provider-deposit";
  const primaryHref = isProviderDeposit ? "/provider/wallet" : "/";
  const secondaryHref = isProviderDeposit
    ? "/provider/wallet/transactions"
    : "/login";

  const detailRows = [
    ["Order ID", getParam(searchParams, "orderId")],
    ["Request ID", getParam(searchParams, "requestId")],
    ["Amount", getParam(searchParams, "amount")],
    ["Result code", getParam(searchParams, "resultCode")],
    ["Message", getParam(searchParams, "message")],
    ["Transaction ID", getParam(searchParams, "transId")],
  ];

  return (
    <main
      className={cn(
        "min-h-screen bg-background px-4 py-10",
        isProviderDeposit && "min-h-0",
      )}
    >
      <section className="mx-auto max-w-2xl rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm sm:p-8">
        <div
          className={cn(
            "mb-5 inline-flex rounded-full px-3 py-1 text-xs font-extrabold uppercase",
            result.tone === "success" && "bg-emerald-100 text-emerald-800",
            result.tone === "danger" && "bg-red-100 text-red-800",
            result.tone === "warning" && "bg-amber-100 text-amber-800",
          )}
        >
          MoMo sandbox
        </div>

        <h1 className="text-2xl font-black text-foreground sm:text-3xl">
          {result.title}
        </h1>
        <p className="mt-3 text-sm leading-6 text-muted">
          {result.description}
        </p>

        <dl className="mt-6 divide-y divide-border-subtle rounded-xl border border-border-subtle">
          {detailRows.map(([label, value]) => (
            <div
              className="grid gap-1 px-4 py-3 sm:grid-cols-[150px_1fr]"
              key={label}
            >
              <dt className="text-xs font-bold uppercase text-subtle">
                {label}
              </dt>
              <dd className="break-all text-sm font-semibold text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand px-4 py-2 text-sm font-bold text-brand-foreground shadow-sm transition hover:bg-brand-hover sm:px-6"
            href={primaryHref}
          >
            {isProviderDeposit ? "Về ví provider" : "Về trang chủ"}
          </Link>
          <Link
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border-muted bg-surface px-4 py-2 text-sm font-bold text-foreground transition hover:bg-surface-muted sm:px-6"
            href={secondaryHref}
          >
            {isProviderDeposit ? "Xem giao dịch ví" : "Đăng nhập"}
          </Link>
        </div>

        <p className="mt-5 text-xs leading-5 text-muted">
          Redirect chỉ dùng để điều hướng người dùng. Trạng thái thanh toán
          đáng tin cậy vẫn được backend xác nhận qua IPN của MoMo.
        </p>
      </section>
    </main>
  );
}
