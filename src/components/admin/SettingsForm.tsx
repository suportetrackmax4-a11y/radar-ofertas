"use client";

import { Loader2, Save } from "lucide-react";
import { saveSettings } from "@/app/admin/actions";
import type { SiteSettings } from "@/lib/types";
import { useFormAction } from "./useFormAction";

type Field = { name: keyof SiteSettings; label: string; hint?: string; type?: "textarea" | "number" | "email" | "url"; required?: boolean; max?: number };

const groups: { title: string; fields: Field[] }[] = [
  {
    title: "Identidade e SEO",
    fields: [
      { name: "site_name", label: "Nome do site", required: true, max: 60 },
      { name: "tagline", label: "Slogan", required: true, max: 120 },
      { name: "seo_description", label: "Descrição para o Google e redes sociais", type: "textarea", required: true, max: 300, hint: "Entre 120 e 160 caracteres é o ideal." },
    ],
  },
  {
    title: "Banner principal",
    fields: [
      { name: "hero_title", label: "Título do banner", required: true, max: 120 },
      { name: "hero_subtitle", label: "Subtítulo do banner", type: "textarea", required: true, max: 300, hint: "O banner mostra automaticamente os produtos marcados como Destaque." },
    ],
  },
  {
    title: "Transparência e preços",
    fields: [
      { name: "affiliate_disclaimer", label: "Aviso de afiliados", type: "textarea", required: true, max: 800, hint: "Exibido no rodapé, nas listagens e na página de cada produto." },
      { name: "price_stale_days", label: "Validade da conferência de preço (dias)", type: "number", required: true, hint: "Depois desse prazo o site esconde o desconto e pede para o visitante conferir o preço no Mercado Livre." },
    ],
  },
  {
    title: "Contato e redes sociais",
    fields: [
      { name: "contact_email", label: "E-mail de contato", type: "email" },
      { name: "instagram_url", label: "Instagram (URL)", type: "url" },
      { name: "telegram_url", label: "Canal do Telegram (URL)", type: "url" },
      { name: "whatsapp_url", label: "Grupo/canal do WhatsApp (URL)", type: "url" },
    ],
  },
];

export function SettingsForm({ settings }: { settings: SiteSettings }) {
  const { state, pending, onSubmit } = useFormAction(saveSettings);
  const e = state.errors ?? {};

  return (
    <form onSubmit={onSubmit} className="space-y-6" noValidate>
      {groups.map((g) => (
        <section key={g.title} className="card space-y-4 p-5 sm:p-6">
          <h2 className="text-base font-bold text-ink-950">{g.title}</h2>
          {g.fields.map((f) => {
            const value = settings[f.name] ?? "";
            return (
              <div key={f.name}>
                <label htmlFor={f.name} className="label">{f.label}{f.required ? " *" : ""}</label>
                {f.type === "textarea" ? (
                  <textarea id={f.name} name={f.name} defaultValue={String(value)} rows={3} maxLength={f.max} className="input resize-y" />
                ) : (
                  <input
                    id={f.name}
                    name={f.name}
                    type={f.type === "number" ? "number" : f.type ?? "text"}
                    min={f.type === "number" ? 1 : undefined}
                    max={f.type === "number" ? 90 : undefined}
                    maxLength={f.max}
                    defaultValue={String(value)}
                    className="input"
                    placeholder={f.type === "url" ? "https://" : undefined}
                  />
                )}
                {e[f.name] ? <p className="mt-1 text-sm text-red-600">{e[f.name]}</p> : f.hint ? <p className="mt-1 text-xs text-ink-400">{f.hint}</p> : null}
              </div>
            );
          })}
        </section>
      ))}
      {state.message ? (
        <p role="status" className={`rounded-xl px-4 py-3 text-sm ring-1 ${state.ok ? "bg-mint-50 text-mint-700 ring-mint-500/20" : "bg-red-50 text-red-700 ring-red-100"}`}>{state.message}</p>
      ) : null}
      <button type="submit" disabled={pending} className="btn-primary px-6 py-3">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar configurações
      </button>
    </form>
  );
}
