import Link from "next/link";
import { Suspense } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getCategories, getSettings, listProducts, type ListParams } from "@/lib/data";
import type { SortOption } from "@/lib/types";
import { ProductGrid } from "./ProductGrid";
import { FilterBar, SORT_LABELS } from "./FilterBar";
import { AffiliateNotice, Breadcrumbs, EmptyState, type Crumb } from "./Misc";

export const PAGE_SIZE = 24;

export type RawSearchParams = Record<string, string | string[] | undefined>;

export function readParam(sp: RawSearchParams, key: string): string {
  const v = sp[key];
  return (Array.isArray(v) ? v[0] : v)?.trim() ?? "";
}

export function readSort(sp: RawSearchParams, fallback: SortOption): SortOption {
  const v = readParam(sp, "ordem");
  return v in SORT_LABELS ? (v as SortOption) : fallback;
}

export function readPage(sp: RawSearchParams): number {
  const n = Number.parseInt(readParam(sp, "pagina"), 10);
  return Number.isFinite(n) && n > 0 ? Math.min(n, 500) : 1;
}

type Props = {
  title: string;
  description?: string;
  crumbs: Crumb[];
  searchParams: RawSearchParams;
  basePath: string;
  defaultSort: SortOption;
  filters: Omit<ListParams, "sort" | "page" | "limit">;
  showCategoryFilter?: boolean;
  emptyText?: React.ReactNode;
};

export async function Catalog({ title, description, crumbs, searchParams, basePath, defaultSort, filters, showCategoryFilter, emptyText }: Props) {
  const sort = readSort(searchParams, defaultSort);
  const page = readPage(searchParams);
  const [settings, categories, result] = await Promise.all([
    getSettings(),
    getCategories(),
    listProducts({ ...filters, sort, page, limit: PAGE_SIZE }),
  ]);
  const totalPages = Math.max(1, Math.ceil(result.total / PAGE_SIZE));

  const pageHref = (p: number) => {
    const qs = new URLSearchParams();
    for (const [k, v] of Object.entries(searchParams)) {
      const val = Array.isArray(v) ? v[0] : v;
      if (val && k !== "pagina") qs.set(k, val);
    }
    if (p > 1) qs.set("pagina", String(p));
    const s = qs.toString();
    return s ? `${basePath}?${s}` : basePath;
  };

  return (
    <div className="container-page py-8 sm:py-10">
      <Breadcrumbs items={crumbs} />
      <header className="mb-6">
        <h1 className="text-2xl font-extrabold text-ink-950 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-2xl text-ink-500">{description}</p> : null}
      </header>

      <Suspense fallback={<div className="mb-6 h-[66px] rounded-2xl bg-white shadow-card ring-1 ring-ink-100" />}>
        <FilterBar
          total={result.total}
          defaultSort={defaultSort}
          categories={showCategoryFilter ? categories.map((c) => ({ slug: c.slug, name: c.name })) : undefined}
        />
      </Suspense>

      {result.items.length ? (
        <ProductGrid products={result.items} staleDays={settings.price_stale_days} priorityCount={4} />
      ) : (
        <EmptyState title="Nenhum produto encontrado">
          {emptyText ?? "Tente outro termo de busca ou explore as categorias."}
        </EmptyState>
      )}

      {totalPages > 1 ? (
        <nav className="mt-10 flex items-center justify-center gap-2" aria-label="Paginação">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="btn-ghost" rel="prev">
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Link>
          ) : null}
          <span className="px-3 text-sm text-ink-500">
            Página <strong className="text-ink-900">{page}</strong> de {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={pageHref(page + 1)} className="btn-ghost" rel="next">
              Próxima <ChevronRight className="h-4 w-4" />
            </Link>
          ) : null}
        </nav>
      ) : null}

      <div className="mt-12">
        <AffiliateNotice text={settings.affiliate_disclaimer} compact />
      </div>
    </div>
  );
}
