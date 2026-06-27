"use client";

import axios from "axios";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { useLogin, useProfile } from "@/apis/auth/queries";
import { Button, Input, PasswordInput } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { loginSchema } from "../schema";

const roleHomePath: Record<string, string> = {
  ADMIN: "/admin",
  PENDING_PROVIDER: "/provider-verification",
  PROVIDER: "/provider",
};

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message ?? "Đăng nhập thất bại.";
  }

  return "Đăng nhập thất bại.";
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const loginMutation = useLogin();
  const profileQuery = useProfile();
  const setTokens = useAuthStore((state) => state.setTokens);
  const [formError, setFormError] = useState("");
  const providerRegistered = searchParams.get("providerRegistered") === "1";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const formData = new FormData(event.currentTarget);
    const parsed = loginSchema.safeParse({
      userName: formData.get("userName"),
      password: formData.get("password"),
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Thông tin không hợp lệ.");
      return;
    }

    try {
      const tokens = await loginMutation.mutateAsync(parsed.data);
      setTokens(tokens);

      const profile = await profileQuery.refetch();
      const nextPath = searchParams.get("next");
      const userRole = profile.data?.role;
      const isProviderRegistrationPath =
        nextPath === "/register-provider" || nextPath === "/provider-verification";

      if (userRole !== "ADMIN" && userRole !== "PROVIDER" && userRole !== "PENDING_PROVIDER") {
        if (isProviderRegistrationPath) {
          router.push(nextPath);
          return;
        }

        setFormError(
          "Cổng web này chỉ dành cho quản trị viên và nhà cung cấp đã được duyệt. Bạn có muốn đăng ký trở thành nhà cung cấp không?",
        );
        return;
      }

      const fallbackPath = roleHomePath[userRole] ?? "/login";

      router.push(nextPath || fallbackPath);
    } catch (error) {
      setFormError(getErrorMessage(error));
    }
  }

  const isSubmitting = loginMutation.isLoading || profileQuery.isFetching;

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {providerRegistered && (
        <div className="rounded-xl border border-success/20 bg-success-soft px-4 py-3 text-sm font-semibold text-success">
          Đăng ký nhà cung cấp thành công. Vui lòng đăng nhập để xem hồ sơ đang
          chờ duyệt.
        </div>
      )}

      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">
          Tên đăng nhập
        </span>
        <Input
          required
          name="userName"
          autoComplete="username"
          className="h-12 px-4"
          placeholder="petlink_user"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="flex items-center justify-between text-sm font-semibold text-foreground">
          Mật khẩu
          <Link
            href="/forgot-password"
            className="font-medium text-secondary hover:underline"
          >
            Quên mật khẩu?
          </Link>
        </span>
        <PasswordInput
          required
          minLength={6}
          name="password"
          autoComplete="current-password"
          className="h-12 px-4"
          placeholder="••••••••"
        />
      </label>

      {formError && (
        <div
          role="alert"
          className="space-y-3 rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger"
        >
          <p>{formError}</p>
          {formError.includes("đăng ký trở thành nhà cung cấp") && (
            <Link
              href="/register-provider"
              className="inline-flex text-secondary underline underline-offset-4"
            >
              Đăng ký hồ sơ nhà cung cấp
            </Link>
          )}
        </div>
      )}

      <Button type="submit" className="h-12 w-full" disabled={isSubmitting}>
        {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
      </Button>

      <div className="flex items-center gap-3 py-2 text-xs font-medium text-muted">
        <span className="h-px flex-1 bg-border-subtle" /> hoặc{" "}
        <span className="h-px flex-1 bg-border-subtle" />
      </div>

      <Button
        type="button"
        variant="outline"
        className="h-12 w-full font-semibold"
        disabled
        title="Chưa hỗ trợ đăng nhập bằng Google"
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[conic-gradient(#4285f4_0_25%,#34a853_0_50%,#fbbc05_0_75%,#ea4335_0)] text-[10px] font-black text-white">
          G
        </span>
        Tiếp tục với Google
      </Button>

      <div className="pt-4 text-center text-sm text-muted">
        <p>Chưa có tài khoản?</p>
        <div className="mt-2 flex flex-col gap-1">
          <Link
            href="/register-provider"
            className="font-semibold text-secondary hover:underline"
          >
            Đăng ký tài khoản nhà cung cấp
          </Link>
        </div>
      </div>
    </form>
  );
}
