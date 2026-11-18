"use client";

import { useState } from "react";
import { Loader2, LogIn, UserPlus } from "lucide-react";
import { login, registerFirstAdmin } from "../actions";
import { useFormAction } from "@/components/admin/useFormAction";

function Err({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-sm text-red-600">{msg}</p> : null;
}

function SignInForm() {
  const { state, pending, onSubmit } = useFormAction(login);
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="label">E-mail</label>
        <input id="email" name="email" type="email" autoComplete="username" required className="input" />
      </div>
      <div>
        <label htmlFor="password" className="label">Senha</label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className="input" />
      </div>
      {state.message ? (
        <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100">{state.message}</p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-primary w-full py-3">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
        Entrar no painel
      </button>
    </form>
  );
}

function SignUpForm() {
  const { state, pending, onSubmit } = useFormAction(registerFirstAdmin);
  const e = state.errors ?? {};
  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <p className="rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-800">
        Primeiro acesso: crie a conta que vai administrar o site. Depois disso, esta opção deixa de aparecer.
      </p>
      <div>
        <label htmlFor="su-email" className="label">Seu e-mail</label>
        <input id="su-email" name="email" type="email" autoComplete="email" required className="input" />
        <Err msg={e.email} />
      </div>
      <div>
        <label htmlFor="su-password" className="label">Crie uma senha</label>
        <input id="su-password" name="password" type="password" autoComplete="new-password" minLength={8} required className="input" />
        {e.password ? <Err msg={e.password} /> : <p className="mt-1 text-xs text-ink-400">Mínimo de 8 caracteres, com letras e números.</p>}
      </div>
      <div>
        <label htmlFor="su-confirm" className="label">Repita a senha</label>
        <input id="su-confirm" name="confirm" type="password" autoComplete="new-password" required className="input" />
        <Err msg={e.confirm} />
      </div>
      {state.message ? (
        <p role="alert" className={`rounded-lg px-3 py-2 text-sm ring-1 ${state.ok ? "bg-mint-50 text-mint-700 ring-mint-500/20" : "bg-red-50 text-red-700 ring-red-100"}`}>
          {state.message}
        </p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-flame w-full py-3">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
        Criar conta de administrador
      </button>
    </form>
  );
}

export function LoginForm({ allowSignup }: { allowSignup: boolean }) {
  const [mode, setMode] = useState<"entrar" | "criar">(allowSignup ? "criar" : "entrar");
  if (!allowSignup) return <SignInForm />;
  const tab = (m: "entrar" | "criar", label: string) => (
    <button
      type="button"
      onClick={() => setMode(m)}
      aria-pressed={mode === m}
      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${mode === m ? "bg-white text-ink-900 shadow-sm" : "text-ink-500 hover:text-ink-800"}`}
    >
      {label}
    </button>
  );
  return (
    <div>
      <div className="mb-5 flex gap-1 rounded-xl bg-ink-100 p-1">
        {tab("criar", "Criar conta")}
        {tab("entrar", "Entrar")}
      </div>
      {mode === "criar" ? <SignUpForm /> : <SignInForm />}
    </div>
  );
}
