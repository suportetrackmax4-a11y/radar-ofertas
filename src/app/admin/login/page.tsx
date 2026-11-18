import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/site/Logo";
import { getAdmin } from "@/lib/admin";
import { isSupabaseConfigured } from "@/lib/env";
import { adminExists } from "../actions";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  const allowSignup = isSupabaseConfigured && !(await adminExists());

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink-900 px-4 py-10">
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <LogoMark className="h-12 w-12" />
          <h1 className="mt-4 text-2xl font-extrabold">Painel administrativo</h1>
          <p className="mt-1 text-sm text-ink-300">{allowSignup ? "Configure seu acesso" : "Acesso restrito aos administradores"}</p>
        </div>
        <div className="card p-6">
          {isSupabaseConfigured ? (
            <LoginForm allowSignup={allowSignup} />
          ) : (
            <div className="space-y-3 text-sm text-ink-700">
              <p className="font-semibold text-ink-900">Ainda não dá para entrar: o banco de dados não está conectado.</p>
              <p>Ainda não existe usuário nem senha. Para criar o seu:</p>
              <ol className="ml-5 list-decimal space-y-1.5">
                <li>Crie um projeto grátis em <strong>supabase.com</strong>.</li>
                <li>No <strong>SQL Editor</strong>, rode o arquivo <code>supabase/schema.sql</code>.</li>
                <li>Coloque a URL e a chave <em>publishable</em> do projeto no <code>.env.local</code> (ou nas variáveis da Vercel).</li>
                <li>Volte a esta página: vai aparecer a opção <strong>Criar conta</strong>.</li>
              </ol>
            </div>
          )}
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-ink-300 hover:text-white">← Voltar para o site</Link>
        </p>
      </div>
    </main>
  );
}
