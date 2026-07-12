import { ProviderVerificationForm } from "@/apis/auth/components/provider-verification-form";

export default function ProviderVerificationPage() {
  return (
    <main className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl rounded-3xl border border-border-subtle bg-surface p-5 shadow-sm sm:p-8 lg:p-10">
        <ProviderVerificationForm />
      </div>
    </main>
  );
}
