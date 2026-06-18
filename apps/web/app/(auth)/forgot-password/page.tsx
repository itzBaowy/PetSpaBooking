import { ForgotPasswordForm } from "@/apis/auth/components/forgot-password-form";

export default function ForgotPassword() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6">Forgot Password</h1>
        <ForgotPasswordForm />
      </div>
    </div>
  );
}
