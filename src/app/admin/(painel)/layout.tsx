import type { Metadata } from "next";
import { LogOut } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { LogoMark } from "@/components/site/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "../actions";

export const metadata: Metadata = {
  title: { default: "Painel", template: "%s | Painel" },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const { email, localMode } = await requireAdmin();

  return (
    <div className="min-h-dvh bg-ink-50 lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="bg-ink-900 p-4 text-white lg:sticky lg:top-0 lg:flex lg:h-dvh lg:flex-col lg:p-5">
        <div className="mb-4 flex items-center justify-between gap-3 lg:mb-8">
          <div className="flex items-center gap-2.5">
            <LogoMark className="h-9 w-9" />
            <div>
              <p className="font-display text-sm font-extrabold leading-tight">Painel</p>
              <p className="max-w-[160px] truncate text-xs text-ink-400">{email}</p>
            </div>
          </div>
          {localMode ? null : <form action={logout} className="lg:hidden">
            <button className="rounded-lg p-2 text-ink-300 hover:bg-white/10 hover:text-white" aria-label="Sair">
              <LogOut className="h-5 w-5" />
            </button>
          </form>}
        </div>
        <AdminNav />
        {localMode ? null : <form action={logout} className="mt-auto hidden lg:block">
          <button className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-300 transition hover:bg-white/5 hover:text-white">
            <LogOut className="h-[18px] w-[18px]" /> Sair
          </button>
        </form>}
      </aside>
      <div className="min-w-0 p-4 sm:p-6 lg:p-10">
        {localMode ? (
          <p className="mx-auto mb-6 max-w-6xl rounded-xl bg-flame-50 px-4 py-3 text-sm text-flame-700 ring-1 ring-flame-100">
            <strong>Modo local, sem senha.</strong> Isso só funciona no seu computador (npm run dev). No site publicado, o login é obrigatório.
          </p>
        ) : null}
        {children}
      </div>
    </div>
  );
}
