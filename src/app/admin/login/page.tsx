import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/site/Logo";
import { getAdmin } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink-900 px-4 py-10">
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <LogoMark className="h-12 w-12" />
          <h1 className="mt-4 text-2xl font-extrabold">Painel administrativo</h1>
          <p className="mt-1 text-sm text-ink-300">Acesso restrito aos administradores</p>
        </div>
        <div className="card p-6">
          {!isSupabaseConfigured ? (
            <p className="mb-4 rounded-lg bg-flame-50 px-3 py-2 text-sm text-flame-700">
              O Supabase ainda não foi configurado. Preencha o arquivo <code>.env.local</code> conforme o README.
            </p>
          ) : null}
          <LoginForm />
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-ink-300 hover:text-white">← Voltar para o site</Link>
        </p>
      </div>
    </main>
  );
}
