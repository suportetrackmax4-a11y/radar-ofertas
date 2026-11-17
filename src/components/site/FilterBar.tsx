"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Loader2, SlidersHorizontal } from "lucide-react";

export const SORT_LABELS: Record<string, string> = {
  relevancia: "Relevância",
  recentes: "Mais recentes",
  "menor-preco": "Menor preço",
  "maior-preco": "Maior preço",
  "maior-desconto": "Maior desconto",
};

type Props = {
  categories?: { slug: string; name: string }[];
  defaultSort: string;
  total: number;
};

export function FilterBar({ categories, defaultSort, total }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [pending, startTransition] = useTransition();

  function update(key: string, value: string, fallback = "") {
    const next = new URLSearchParams(params.toString());
    if (!value || value === fallback) next.delete(key);
    else next.set(key, value);
    next.delete("pagina");
    const qs = next.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
  }

  const selectCls =
    "h-10 rounded-xl border border-ink-200 bg-white pl-3 pr-8 text-sm font-medium text-ink-800 transition hover:border-ink-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none";

  return (
    <div className="mb-6 flex flex-col gap-3 rounded-2xl bg-white p-3 shadow-card ring-1 ring-ink-100 sm:flex-row sm:items-center sm:justify-between sm:p-4">
      <p className="flex items-center gap-2 text-sm text-ink-500" aria-live="polite">
        {pending ? <Loader2 className="h-4 w-4 animate-spin text-brand-600" /> : <SlidersHorizontal className="h-4 w-4" />}
        <span>
          <strong className="text-ink-900">{total}</strong> {total === 1 ? "produto encontrado" : "produtos encontrados"}
        </span>
      </p>
      <div className="flex flex-wrap gap-2">
        {categories ? (
          <label className="flex-1 sm:flex-none">
            <span className="sr-only">Categoria</span>
            <select className={`${selectCls} w-full`} value={params.get("categoria") ?? ""} onChange={(e) => update("categoria", e.target.value)}>
              <option value="">Todas as categorias</option>
              {categories.map((c) => (
                <option key={c.slug} value={c.slug}>{c.name}</option>
              ))}
            </select>
          </label>
        ) : null}
        <label className="flex-1 sm:flex-none">
          <span className="sr-only">Ordenar por</span>
          <select className={`${selectCls} w-full`} value={params.get("ordem") ?? defaultSort} onChange={(e) => update("ordem", e.target.value, defaultSort)}>
            {Object.entries(SORT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
