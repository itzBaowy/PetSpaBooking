import Link from "next/link";

export function UnsupportedFeature({ title }: { title: string }) {
  return (
    <section className="rounded-3xl border border-amber-200 bg-amber-50 p-8">
      <p className="text-sm font-bold uppercase tracking-wider text-amber-700">Chưa có API</p>
      <h1 className="mt-2 text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-700">
        Backend hiện chưa cung cấp endpoint cho chức năng này. Màn hình được giữ lại để
        không làm hỏng điều hướng, nhưng không gọi dữ liệu mock và không gửi thao tác giả.
      </p>
      <Link href="/admin" className="mt-6 inline-flex rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white">
        Về tổng quan
      </Link>
    </section>
  );
}
