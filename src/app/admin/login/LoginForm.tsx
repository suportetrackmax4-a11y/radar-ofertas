"use client";

import { useActionState } from "react";
import { Loader2, LogIn } from "lucide-react";
import { login, type FormState } from "../actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<FormState, FormData>(login, {});
  return (
    <form action={action} className="space-y-4">
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
