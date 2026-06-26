import Link from "next/link";

export function ProviderAlreadyPrivilegedState({
  roleLabel,
}: {
  roleLabel: string;
}) {
  return (
    <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
      <h1 className="text-3xl font-bold">Tài khoản đã có quyền</h1>
      <p className="mt-3 max-w-lg text-sm leading-6 text-muted">
        Tài khoản này đã là {roleLabel}, nên không cần gửi hồ sơ đăng ký nhà
        cung cấp nữa.
      </p>
      <Link
        href="/provider"
        className="mt-8 inline-flex h-12 items-center justify-center rounded-xl bg-brand px-8 font-bold text-white hover:bg-brand-hover"
      >
        Về dashboard
      </Link>
    </div>
  );
}
