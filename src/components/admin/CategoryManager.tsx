"use client";

import { useState, useTransition } from "react";
import { Loader2, Pencil, Plus, Save, Trash2, X } from "lucide-react";
import { deleteCategory, saveCategory } from "@/app/admin/actions";
import { CATEGORY_ICONS, CategoryIcon } from "@/components/site/CategoryIcon";
import type { Category } from "@/lib/types";
import { useFormAction } from "./useFormAction";

function CategoryForm({ category, onDone }: { category?: Category; onDone: () => void }) {
  const { state, pending, onSubmit } = useFormAction(async (prev, fd) => {
    const res = await saveCategory(prev, fd);
    if (res.ok) onDone();
    return res;
  });
  const [icon, setIcon] = useState(category?.icon ?? "tag");
  const e = state.errors ?? {};

  return (
    <form onSubmit={onSubmit} className="grid gap-3 rounded-xl bg-ink-50 p-4 sm:grid-cols-2" noValidate>
      {category ? <input type="hidden" name="id" value={category.id} /> : null}
      <div>
        <label className="label" htmlFor={`name-${category?.id ?? "new"}`}>Nome *</label>
        <input id={`name-${category?.id ?? "new"}`} name="name" defaultValue={category?.name} required maxLength={60} className="input" />
        {e.name ? <p className="mt-1 text-sm text-red-600">{e.name}</p> : null}
      </div>
      <div>
        <label className="label" htmlFor={`slug-${category?.id ?? "new"}`}>Endereço (slug)</label>
        <input id={`slug-${category?.id ?? "new"}`} name="slug" defaultValue={category?.slug} maxLength={60} className="input" placeholder="gerado automaticamente" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor={`desc-${category?.id ?? "new"}`}>Descrição</label>
        <input id={`desc-${category?.id ?? "new"}`} name="description" defaultValue={category?.description ?? ""} maxLength={300} className="input" />
      </div>
      <div className="sm:col-span-2">
        <span className="label">Ícone</span>
        <input type="hidden" name="icon" value={icon} />
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(CATEGORY_ICONS).map(([key, { label }]) => (
            <button
              key={key}
              type="button"
              title={label}
              aria-label={label}
              aria-pressed={icon === key}
              onClick={() => setIcon(key)}
              className={`flex h-9 w-9 items-center justify-center rounded-lg ring-1 transition ${icon === key ? "bg-brand-600 text-white ring-brand-600" : "bg-white text-ink-600 ring-ink-200 hover:ring-brand-300"}`}
            >
              <CategoryIcon name={key} className="h-4 w-4" />
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="label" htmlFor={`order-${category?.id ?? "new"}`}>Ordem</label>
        <input id={`order-${category?.id ?? "new"}`} name="sort_order" type="number" min={0} defaultValue={category?.sort_order ?? 0} className="input" />
      </div>
      <label className="flex items-center gap-2 self-end pb-3 text-sm font-medium text-ink-800">
        <input type="checkbox" name="is_active" defaultChecked={category?.is_active ?? true} className="h-4 w-4 accent-brand-600" />
        Visível no site
      </label>
      {state.message && !state.ok ? <p className="text-sm text-red-600 sm:col-span-2">{state.message}</p> : null}
      <div className="flex gap-2 sm:col-span-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Salvar
        </button>
        <button type="button" onClick={onDone} className="btn-ghost">Cancelar</button>
      </div>
    </form>
  );
}

export function CategoryManager({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  const [editing, setEditing] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="space-y-4">
      {editing === "new" ? (
        <div className="card p-4"><CategoryForm onDone={() => setEditing(null)} /></div>
      ) : (
        <button onClick={() => setEditing("new")} className="btn-primary"><Plus className="h-4 w-4" /> Nova categoria</button>
      )}
      {error ? <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p> : null}
      <ul className="space-y-2">
        {categories.map((c) => (
          <li key={c.id} className="card p-3">
            {editing === c.id ? (
              <CategoryForm category={c} onDone={() => setEditing(null)} />
            ) : (
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><CategoryIcon name={c.icon} /></span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink-900">
                    {c.name} {!c.is_active ? <span className="ml-1 rounded bg-ink-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-ink-500">oculta</span> : null}
                  </p>
                  <p className="text-xs text-ink-500">/categoria/{c.slug} · {counts[c.id] ?? 0} produtos · ordem {c.sort_order}</p>
                </div>
                <button onClick={() => setEditing(c.id)} className="rounded-lg p-2 text-ink-500 hover:bg-brand-50 hover:text-brand-700" aria-label={`Editar ${c.name}`}><Pencil className="h-4 w-4" /></button>
                {confirmId === c.id ? (
                  <span className="flex items-center gap-1">
                    <button
                      disabled={pending}
                      onClick={() =>
                        startTransition(async () => {
                          const res = await deleteCategory(c.id);
                          setError(res.ok ? null : res.error);
                          setConfirmId(null);
                        })
                      }
                      className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white"
                    >
                      Excluir
                    </button>
                    <button onClick={() => setConfirmId(null)} className="rounded-lg p-1.5 text-ink-500 hover:bg-ink-100" aria-label="Cancelar"><X className="h-4 w-4" /></button>
                  </span>
                ) : (
                  <button onClick={() => setConfirmId(c.id)} className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600" aria-label={`Excluir ${c.name}`}><Trash2 className="h-4 w-4" /></button>
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
      <p className="text-xs text-ink-400">Ao excluir uma categoria, os produtos dela ficam “sem categoria” (não são apagados).</p>
    </div>
  );
}
