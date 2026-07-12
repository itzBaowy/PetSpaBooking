import Image from "next/image";
import Link from "next/link";
import { ReactNode } from "react";

interface AuthVisualShellProps {
  children: ReactNode;
  title: string;
  description: string;
}

export function AuthVisualShell({ children, title, description }: AuthVisualShellProps) {
  return (
    <main className="grid min-h-screen bg-background lg:grid-cols-2">
      <section className="relative hidden min-h-screen overflow-hidden lg:block">
        <Image
          src="/brand/a_high_quality_heartwarming_photograph_of_a_happy_dog_and_cat_sitting_together.png"
          alt="Chó và mèo thân thiện tại PetLink"
          fill
          priority
          className="object-cover"
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-linear-to-br from-brand/70 via-emerald-500/45 to-cyan-700/55" />
        <div className="absolute inset-x-0 bottom-0 p-12 text-white xl:p-20">
          <Link href="/" className="text-4xl font-black tracking-tight">PetLink</Link>
          <p className="mt-5 max-w-xl text-lg leading-8 text-white/90">
            Kết nối thú cưng của bạn với những dịch vụ chăm sóc đáng tin cậy.
          </p>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8">
        <div className="w-full max-w-140 rounded-[28px] border border-border-subtle bg-surface p-6 shadow-xl shadow-slate-900/5 sm:p-10">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-muted transition-colors hover:text-brand"
          >
            <span aria-hidden="true">←</span>
            Quay lại trang chủ
          </Link>
          <div className="mb-7">
            <Link href="/" className="mb-8 block text-xl font-black text-brand lg:hidden">PetLink</Link>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">{title}</h1>
            <p className="mt-2 text-muted">{description}</p>
          </div>
          {children}
        </div>
      </section>
    </main>
  );
}
