import { Suspense } from "react";
import { AuthVisualShell } from "@/apis/auth/components/auth-visual-shell";
import { LoginForm } from "@/apis/auth/components/login-form";

export default function Login() {
  return (
    <AuthVisualShell
      title="Chào mừng trở lại"
      description="Đăng nhập để tiếp tục sử dụng PetLink."
    >
      <Suspense
        fallback={<div className="h-80 animate-pulse rounded-2xl bg-surface-muted" />}
      >
        <LoginForm />
      </Suspense>
    </AuthVisualShell>
  );
}
