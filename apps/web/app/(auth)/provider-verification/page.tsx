import Link from "next/link";
import { ProviderVerificationForm } from "@/apis/auth/components/provider-verification-form";

export default function ProviderVerificationPage() {
  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border-subtle bg-surface/95 px-5 py-4 shadow-sm backdrop-blur sm:px-10">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link href="/" className="text-xl font-black text-brand">PetLink</Link>
          <div className="flex items-center gap-3 text-sm text-muted"><span className="hidden sm:inline">Tài khoản nhà cung cấp</span><span className="grid h-9 w-9 place-items-center rounded-full bg-brand-soft font-bold text-brand">NA</span></div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 sm:py-12">
        <div className="rounded-[28px] border border-border-subtle bg-surface p-5 shadow-xl shadow-slate-900/5 sm:p-10 lg:p-14">
          <ProviderVerificationForm />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-xs text-muted"><span>◈ Mã hóa dữ liệu an toàn</span><span>♢ Mạng lưới nhà cung cấp đã xác minh</span></div>
      </div>
    </main>
  );
}
