"use client";

import { useActionState, useTransition, type FormEvent } from "react";
import type { FormState } from "@/app/admin/actions";

/**
 * useActionState + onSubmit: mantém os valores digitados quando o servidor
 * devolve erro (o atributo `action` do form faria o React limpar os campos).
 */
export function useFormAction(fn: (prev: FormState, fd: FormData) => Promise<FormState>) {
  const [state, dispatch, pending] = useActionState<FormState, FormData>(fn, {});
  const [, startTransition] = useTransition();
  const onSubmit = (ev: FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const fd = new FormData(ev.currentTarget);
    startTransition(() => dispatch(fd));
  };
  return { state, pending, onSubmit };
}
