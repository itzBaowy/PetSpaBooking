import { AuthVisualShell } from "@/apis/auth/components/auth-visual-shell";
import { RegisterProviderForm } from "@/apis/auth/components/register-provider-form";

export default function RegisterProvider() {
  return (
    <AuthVisualShell
      title="Tạo tài khoản nhà cung cấp"
      description="Đăng ký tài khoản trước. Bạn sẽ bổ sung hồ sơ doanh nghiệp sau khi đăng nhập."
    >
      <RegisterProviderForm />
    </AuthVisualShell>
  );
}
