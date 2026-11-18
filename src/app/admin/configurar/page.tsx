import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { LogoMark } from "@/components/site/Logo";
import { getAdmin } from "@/lib/admin";
import { PANEL_ENABLED, isSupabaseConfigured } from "@/lib/env";

export const metadata: Metadata = { title: "Configurar o painel", robots: { index: false, follow: false } };

export default async function SetupPage() {
  // Já está tudo certo: vai direto para o painel.
  if (await getAdmin()) redirect("/admin");
  // No site publicado o painel não existe.
  if (!PANEL_ENABLED) notFound();

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink-900 px-4 py-10">
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
      </div>
      <div className="relative w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <LogoMark className="h-12 w-12" />
          <h1 className="mt-4 text-2xl font-extrabold">Painel administrativo</h1>
          <p className="mt-1 text-sm text-ink-300">Falta conectar o banco de dados</p>
        </div>
        <div className="card space-y-3 p-6 text-sm text-ink-700">
          <p className="font-semibold text-ink-900">O painel abre sem usuário e senha, mas precisa do Supabase.</p>
          <ol className="ml-5 list-decimal space-y-1.5">
            {!isSupabaseConfigured ? (
              <>
                <li>Crie um projeto grátis em <strong>supabase.com</strong>.</li>
                <li>No <strong>SQL Editor</strong>, rode o arquivo <code>supabase/schema.sql</code>.</li>
              </>
            ) : null}
            <li>
              Em <strong>Project Settings → API Keys</strong>, copie a URL, a chave <em>publishable</em> e a chave{" "}
              <em>secret</em> para o arquivo <code>.env.local</code>.
            </li>
            <li>Pare o servidor, rode <code>npm run dev</code> de novo e volte a esta página.</li>
          </ol>
        </div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-ink-300 hover:text-white">← Voltar para o site</Link>
        </p>
      </div>
    </main>
  );
}
