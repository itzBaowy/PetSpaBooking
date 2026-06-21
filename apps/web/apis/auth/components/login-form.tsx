"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent } from "react";
import { Button, Input, PasswordInput } from "@/components/ui";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextPath = searchParams.get("next");
    router.push(nextPath === "/provider-verification" ? nextPath : "/provider");
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <label className="block space-y-1.5">
        <span className="text-sm font-semibold text-foreground">Email</span>
        <Input
          required
          type="email"
          name="email"
          className="h-12 px-4"
          placeholder="name@example.com"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="flex items-center justify-between text-sm font-semibold text-foreground">
          Mật khẩu
          <Link href="/forgot-password" className="font-medium text-secondary hover:underline">
            Quên mật khẩu?
          </Link>
        </span>
        <PasswordInput required minLength={6} name="password" className="h-12 px-4" placeholder="••••••••" />
      </label>

      <Button type="submit" className="h-12 w-full">Đăng nhập</Button>

      <div className="flex items-center gap-3 py-2 text-xs font-medium text-muted">
        <span className="h-px flex-1 bg-border-subtle" /> hoặc <span className="h-px flex-1 bg-border-subtle" />
      </div>

      <Button type="button" variant="outline" className="h-12 w-full font-semibold">
        <span className="grid h-5 w-5 place-items-center rounded-full bg-[conic-gradient(#4285f4_0_25%,#34a853_0_50%,#fbbc05_0_75%,#ea4335_0)] text-[10px] font-black text-white">G</span>
        Tiếp tục với Google
      </Button>

      <div className="pt-4 text-center text-sm text-muted">
        <p>Chưa có tài khoản?</p>
        <div className="mt-2 flex flex-col gap-1">
          <Link href="/register-provider" className="font-semibold text-secondary hover:underline">Đăng ký tài khoản nhà cung cấp</Link>
        </div>
      </div>
    </form>
  );
}
