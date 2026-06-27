import Link from "next/link";
import { ProviderVerificationForm } from "@/apis/auth/components/provider-verification-form";

export default function RegisterProvider() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border-subtle bg-surface/95 px-5 py-4 shadow-sm backdrop-blur sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-black text-brand">
            PetLink
          </Link>
          <Link
            href="/login"
            className="rounded-full border border-border-muted px-4 py-2 text-sm font-bold text-foreground hover:bg-surface-muted"
          >
            Đăng nhập
          </Link>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-[28px] border border-border-subtle bg-surface p-5 shadow-xl shadow-slate-900/5 sm:p-10 lg:p-14">
          <ProviderVerificationForm />
        </div>
      </div>
    </main>
  );
}
