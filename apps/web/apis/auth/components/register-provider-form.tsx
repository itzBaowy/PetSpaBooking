"use client";

const inputClassName =
  "h-11 w-full rounded-xl border border-border-subtle bg-surface px-3 text-sm text-foreground outline-none transition placeholder:text-subtle focus:border-brand focus:ring-4 focus:ring-brand-soft";

export function RegisterProviderForm() {
  return (
    <form className="space-y-4">
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">Tên cơ sở</span>
        <input
          type="text"
          name="businessName"
          className={inputClassName}
          placeholder="Nhập tên cơ sở của bạn"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">Email</span>
        <input
          type="email"
          name="email"
          className={inputClassName}
          placeholder="business@email.com"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">Mật khẩu</span>
        <input
          type="password"
          name="password"
          className={inputClassName}
          placeholder="••••••••"
        />
      </label>
      <button
        type="submit"
        className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-brand px-4 text-sm font-bold text-brand-foreground shadow-sm transition-colors hover:bg-brand-hover focus:outline-none focus:ring-4 focus:ring-brand-soft"
      >
        Đăng ký nhà cung cấp
      </button>
    </form>
  );
}
