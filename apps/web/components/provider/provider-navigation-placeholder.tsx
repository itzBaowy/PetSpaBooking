import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

export function ProviderNavigationPlaceholder({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <PageHeader
          eyebrow="Provider"
          title={title}
          description={description}
        />
        <section className="rounded-3xl border border-dashed border-border-muted bg-surface p-6 text-center sm:p-10">
          <h2 className="text-lg font-bold text-foreground">
            Chưa có dữ liệu để hiển thị
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-muted">
            Route đã được chuẩn bị cho điều hướng Provider. Dữ liệu và thao tác
            nghiệp vụ sẽ được kết nối trong phase triển khai riêng, không sử
            dụng response giả.
          </p>
          <Link
            href="/provider"
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl border border-border-muted px-5 text-sm font-bold text-foreground hover:bg-surface-muted"
          >
            Về Dashboard
          </Link>
        </section>
      </div>
    </main>
  );
}
