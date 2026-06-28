"use client";

import { getErrorMessage } from "@/lib/error";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { useRegister } from "@/apis/auth/queries";
import { Button, Input, PasswordInput } from "@/components/ui";
import { useAuthStore } from "@/stores/auth-store";
import { registerProviderSchema } from "../schema";

export function RegisterProviderForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const setTokens = useAuthStore((state) => state.setTokens);
  const [formError, setFormError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    const formData = new FormData(event.currentTarget);
    const parsed = registerProviderSchema.safeParse({
      userName: formData.get("userName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      confirmPassword: formData.get("confirmPassword"),
    });

    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Thông tin không hợp lệ.");
      return;
    }

    try {
      const payload = {
        userName: parsed.data.userName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        password: parsed.data.password,
      };
      const tokens = await registerMutation.mutateAsync(payload);
      setTokens(tokens);
      router.push("/provider-verification");
    } catch (error) {
      setFormError(getErrorMessage(error, "Đăng ký thất bại."));
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">
          Tên đăng nhập
        </span>
        <Input
          required
          name="userName"
          autoComplete="username"
          className="h-12 px-4"
          placeholder="petlink_provider"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">Email</span>
        <Input
          required
          type="email"
          name="email"
          autoComplete="email"
          className="h-12 px-4"
          placeholder="business@email.com"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">
          Số điện thoại
        </span>
        <Input
          required
          type="tel"
          name="phone"
          autoComplete="tel"
          className="h-12 px-4"
          placeholder="+84 900 000 000"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">Mật khẩu</span>
        <PasswordInput
          required
          minLength={8}
          name="password"
          autoComplete="new-password"
          className="h-12 px-4"
          placeholder="Tối thiểu 8 ký tự"
        />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">
          Xác nhận mật khẩu
        </span>
        <PasswordInput
          required
          minLength={8}
          name="confirmPassword"
          autoComplete="new-password"
          className="h-12 px-4"
          placeholder="Nhập lại mật khẩu"
        />
      </label>
      {formError && (
        <p
          role="alert"
          className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger"
        >
          {formError}
        </p>
      )}
      <label className="flex items-start gap-3 text-sm leading-6 text-muted">
        <input required type="checkbox" className="mt-1 h-4 w-4 accent-brand" />
        <span>
          Tôi đồng ý với điều khoản dịch vụ và chính sách bảo mật của PetLink.
        </span>
      </label>
      <Button
        type="submit"
        className="h-12 w-full"
        disabled={registerMutation.isLoading}
      >
        {registerMutation.isLoading
          ? "Đang tạo tài khoản..."
          : "Tạo tài khoản nhà cung cấp"}
      </Button>
      <p className="pt-2 text-center text-sm text-muted">
        Đã có tài khoản?{" "}
        <Link href="/login" className="font-semibold text-secondary hover:underline">
          Đăng nhập
        </Link>
      </p>
    </form>
  );
}
