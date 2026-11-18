import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/site/Logo";
import { getAdmin } from "@/lib/admin";
import { LOCAL_NO_LOGIN, isSupabaseConfigured } from "@/lib/env";
import { adminExists } from "../actions";
import { LoginForm } from "./LoginForm";

export const metadata: Metadata = { title: "Entrar no painel", robots: { index: false, follow: false } };

function Steps({ local }: { local: boolean }) {
  return (
    <div className="space-y-3 text-sm text-ink-700">
      <p className="font-semibold text-ink-900">
        {local ? "O painel abre sem senha no seu computador, mas precisa do banco de dados." : "Ainda não dá para entrar: o banco de dados não está conectado."}
      </p>
      <ol className="ml-5 list-decimal space-y-1.5">
        {!isSupabaseConfigured || local ? (
          <>
            <li>Crie um projeto grátis em <strong>supabase.com</strong>.</li>
            <li>No <strong>SQL Editor</strong>, rode o arquivo <code>supabase/schema.sql</code>.</li>
          </>
        ) : null}
        <li>
          Em <strong>Project Settings → API Keys</strong>, copie a URL, a chave <em>publishable</em>
          {local ? <> e a chave <em>secret</em></> : null} para o arquivo <code>.env.local</code>.
        </li>
        <li>Reinicie com <code>npm run dev</code> e volte a esta página.</li>
      </ol>
    </div>
  );
}

export default async function LoginPage() {
  if (await getAdmin()) redirect("/admin");
  const allowSignup = !LOCAL_NO_LOGIN && isSupabaseConfigured && !(await adminExists());
  const showForm = !LOCAL_NO_LOGIN && isSupabaseConfigured;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-ink-900 px-4 py-10">
      <div className="pointer-events-none fixed inset-0" aria-hidden="true">
        <div className="absolute left-1/4 top-0 h-96 w-96 rounded-full bg-brand-600/30 blur-3xl" />
      </div>
      <div className="relative w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center text-white">
          <LogoMark className="h-12 w-12" />
          <h1 className="mt-4 text-2xl font-extrabold">Painel administrativo</h1>
          <p className="mt-1 text-sm text-ink-300">{showForm ? (allowSignup ? "Configure seu acesso" : "Acesso restrito aos administradores") : "Falta conectar o banco de dados"}</p>
        </div>
        <div className="card p-6">{showForm ? <LoginForm allowSignup={allowSignup} /> : <Steps local={LOCAL_NO_LOGIN} />}</div>
        <p className="mt-6 text-center text-sm">
          <Link href="/" className="text-ink-300 hover:text-white">← Voltar para o site</Link>
        </p>
      </div>
    </main>
  );
}
