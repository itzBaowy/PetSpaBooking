import { RegisterProviderForm } from "@/apis/auth/components/register-provider-form";

export default function RegisterProvider() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-border-subtle bg-surface p-6 shadow-sm sm:p-8">
        <div className="mb-6 space-y-2">
          <p className="text-sm font-bold text-brand">PetLink Provider</p>
          <h1 className="text-2xl font-bold text-foreground">
            Đăng ký nhà cung cấp
          </h1>
          <p className="text-sm text-muted">
            Tạo tài khoản để bắt đầu quản lý dịch vụ trên PetLink.
          </p>
        </div>
        <RegisterProviderForm />
      </div>
    </main>
  );
}
