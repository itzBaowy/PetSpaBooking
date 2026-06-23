"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { Button, Input, PasswordInput } from "@/components/ui";

export function RegisterProviderForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (password !== confirmPassword) {
      setPasswordError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setPasswordError("");
    router.push("/login?next=/provider-verification");
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">Họ và tên</span>
        <Input required name="fullName" className="h-12 px-4" placeholder="Nguyễn Văn An" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">Email</span>
        <Input required type="email" name="email" className="h-12 px-4" placeholder="business@email.com" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">Mật khẩu</span>
        <PasswordInput required minLength={8} name="password" value={password} onChange={(event) => setPassword(event.target.value)} className="h-12 px-4" placeholder="Tối thiểu 8 ký tự" />
      </label>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">Xác nhận mật khẩu</span>
        <PasswordInput required minLength={8} name="confirmPassword" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} className="h-12 px-4" placeholder="Nhập lại mật khẩu" aria-invalid={Boolean(passwordError)} aria-describedby="confirm-password-error" />
      </label>
      {passwordError && <p id="confirm-password-error" role="alert" className="rounded-xl bg-danger-soft px-4 py-3 text-sm font-semibold text-danger">{passwordError}</p>}
      <label className="flex items-start gap-3 text-sm leading-6 text-muted">
        <input required type="checkbox" className="mt-1 h-4 w-4 accent-brand" />
        <span>Tôi đồng ý với điều khoản dịch vụ và chính sách bảo mật của PetLink.</span>
      </label>
      <Button type="submit" className="h-12 w-full">Tạo tài khoản nhà cung cấp</Button>
      <p className="pt-2 text-center text-sm text-muted">
        Đã có tài khoản? <Link href="/login" className="font-semibold text-secondary hover:underline">Đăng nhập</Link>
      </p>
    </form>
  );
}
