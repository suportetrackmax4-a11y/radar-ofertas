import type { Metadata } from "next";
import { requireAdmin } from "@/lib/admin";
import { LogoMark } from "@/components/site/Logo";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s | Painel" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();

  return (
    <div className="min-h-dvh bg-ink-50 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="bg-ink-900 p-4 text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:p-5">
        <div className="mb-4 flex items-center justify-between gap-3 lg:mb-8">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <div>
              <p className="font-display text-sm font-extrabold leading-tight">Painel</p>
              <p className="max-w-[160px] truncate text-xs text-ink-400">No seu computador</p>
            </div>
          </div>
        </div>
        <AdminNav />
      </aside>
      <div className="min-w-0 p-4 sm:p-6 lg:p-10">
        {children}
      </div>
    </div>
  );
}
