"use client";

import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { ArrowDown, ArrowUp, CalendarCheck, ExternalLink, Loader2, Pencil, Search, Trash2 } from "lucide-react";
import { deleteProduct, markPriceChecked, reorderProducts, toggleProduct } from "@/app/admin/actions";
import { daysSince, formatPrice } from "@/lib/format";
import { ProductImage } from "@/components/site/ProductImage";

export type AdminProductRow = {
  id: string;
  slug: string;
  name: string;
  price: number;
  old_price: number | null;
  images: string[];
  category_id: string | null;
  affiliate_url: string | null;
  is_active: boolean;
  is_featured: boolean;
  is_offer: boolean;
  sort_order: number;
  clicks: number;
  price_checked_at: string;
  created_at: string;
};

type Props = {
  initial: AdminProductRow[];
  categories: { id: string; name: string }[];
  staleDays: number;
  initialStatus: string;
};

type Flag = "is_active" | "is_featured" | "is_offer";

export function ProductTable({ initial, categories, staleDays, initialStatus }: Props) {
  const [rows, setRows] = useState(initial);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  const catName = useMemo(() => Object.fromEntries(categories.map((c) => [c.id, c.name])), [categories]);
  const filtering = Boolean(q || cat || status);

  const visible = rows.filter((r) => {
    if (q && !r.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (cat === "none" ? r.category_id : cat && r.category_id !== cat) return false;
    if (status === "ativos" && !r.is_active) return false;
    if (status === "inativos" && r.is_active) return false;
    if (status === "destaques" && !r.is_featured) return false;
    if (status === "ofertas" && !r.is_offer) return false;
    if (status === "desatualizados" && !(r.is_active && daysSince(r.price_checked_at) > staleDays)) return false;
    return true;
  });

  function run(key: string, fn: () => Promise<{ ok: boolean; error?: string }>, rollback?: () => void) {
    setBusy(key);
    setError(null);
    startTransition(async () => {
      const res = await fn();
      if (!res.ok) {
        setError(res.error ?? "Erro ao salvar");
        rollback?.();
      }
      setBusy(null);
    });
  }

  function toggle(row: AdminProductRow, field: Flag) {
    const value = !row[field];
    if (field === "is_active" && value && !row.affiliate_url) {
      setError(`“${row.name}” precisa de um link de afiliado antes de ser ativado. Edite o produto.`);
      return;
    }
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, [field]: value } : r)));
    run(`${row.id}:${field}`, () => toggleProduct(row.id, field, value), () =>
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, [field]: !value } : r))),
    );
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= rows.length) return;
    const before = rows;
    const next = [...rows];
    [next[index], next[target]] = [next[target], next[index]];
    setRows(next);
    run(`${rows[index].id}:move`, () => reorderProducts(next.map((r) => r.id)), () => setRows(before));
  }

  function confirmPrice(row: AdminProductRow) {
    const now = new Date().toISOString();
    const prev = row.price_checked_at;
    setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, price_checked_at: now } : r)));
    run(`${row.id}:price`, () => markPriceChecked(row.id), () =>
      setRows((rs) => rs.map((r) => (r.id === row.id ? { ...r, price_checked_at: prev } : r))),
    );
  }

  function remove(row: AdminProductRow) {
    const before = rows;
    setRows((rs) => rs.filter((r) => r.id !== row.id));
    setConfirmId(null);
    run(`${row.id}:delete`, () => deleteProduct(row.id), () => setRows(before));
  }

  const pill = (on: boolean, onCls: string) =>
    `rounded-lg px-2 py-1 text-[11px] font-bold uppercase tracking-wide transition disabled:opacity-50 ${on ? onCls : "bg-ink-100 text-ink-400 hover:bg-ink-200"}`;

  return (
    <div className="space-y-4">
      <div className="card flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
        <label className="relative flex-1">
          <span className="sr-only">Buscar por nome</span>
          <Search className="pointer-events-none absolute left-3 top-3 h-4 w-4 text-ink-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Buscar por nome…" className="input pl-9" />
        </label>
        <select value={cat} onChange={(e) => setCat(e.target.value)} className="input sm:w-52" aria-label="Filtrar por categoria">
          <option value="">Todas as categorias</option>
          <option value="none">Sem categoria</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input sm:w-48" aria-label="Filtrar por status">
          <option value="">Todos os status</option>
          <option value="ativos">Ativos</option>
          <option value="inativos">Inativos</option>
          <option value="destaques">Destaques</option>
          <option value="ofertas">Ofertas</option>
          <option value="desatualizados">Preço desatualizado</option>
        </select>
      </div>

      {error ? (
        <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">{error}</p>
      ) : null}
      {filtering ? (
        <p className="text-xs text-ink-400">Limpe os filtros para reordenar os produtos com as setas.</p>
      ) : (
        <p className="text-xs text-ink-400">Use as setas para definir a ordem em que os produtos aparecem no site.</p>
      )}

      {visible.length === 0 ? (
        <div className="card p-10 text-center text-sm text-ink-500">
          {rows.length === 0 ? (
            <>Nenhum produto cadastrado ainda. <Link href="/admin/produtos/novo" className="font-semibold text-brand-600">Cadastre o primeiro</Link>.</>
          ) : (
            "Nenhum produto corresponde aos filtros."
          )}
        </div>
      ) : (
        <ul className="space-y-2">
          {visible.map((r) => {
            const index = rows.indexOf(r);
            const age = daysSince(r.price_checked_at);
            const stale = age > staleDays;
            return (
              <li key={r.id} className={`card flex flex-col gap-3 p-3 transition sm:flex-row sm:items-center ${r.is_active ? "" : "opacity-70"}`}>
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  {!filtering ? (
                    <div className="flex flex-col">
                      <button onClick={() => move(index, -1)} disabled={index === 0 || busy !== null} className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-800 disabled:opacity-30" aria-label="Mover para cima">
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button onClick={() => move(index, 1)} disabled={index === rows.length - 1 || busy !== null} className="rounded p-1 text-ink-400 hover:bg-ink-100 hover:text-ink-800 disabled:opacity-30" aria-label="Mover para baixo">
                        <ArrowDown className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white ring-1 ring-ink-100">
                    <ProductImage src={r.images[0] ?? null} alt="" sizes="56px" className="p-1" />
                  </div>
                  <div className="min-w-0">
                    <Link href={`/admin/produtos/${r.id}`} className="line-clamp-1 font-semibold text-ink-900 hover:text-brand-700">{r.name}</Link>
                    <p className="text-xs text-ink-500">
                      {r.category_id ? catName[r.category_id] ?? "—" : "Sem categoria"} · <strong className="text-ink-800">{formatPrice(Number(r.price))}</strong>
                      {r.old_price ? <span className="ml-1 line-through">{formatPrice(Number(r.old_price))}</span> : null} · {r.clicks} cliques
                    </p>
                    <p className={`text-xs ${stale && r.is_active ? "font-semibold text-flame-700" : "text-ink-400"}`}>
                      Preço conferido {age === 0 ? "hoje" : `há ${age} dia${age > 1 ? "s" : ""}`}
                      {!r.affiliate_url ? <span className="ml-2 font-semibold text-red-600">· sem link de afiliado</span> : null}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-1.5">
                  <button onClick={() => toggle(r, "is_active")} disabled={busy === `${r.id}:is_active`} className={pill(r.is_active, "bg-mint-50 text-mint-700 ring-1 ring-mint-500/30")} aria-pressed={r.is_active}>
                    {r.is_active ? "Ativo" : "Inativo"}
                  </button>
                  <button onClick={() => toggle(r, "is_featured")} disabled={busy === `${r.id}:is_featured`} className={pill(r.is_featured, "bg-brand-600 text-white")} aria-pressed={r.is_featured}>
                    Destaque
                  </button>
                  <button onClick={() => toggle(r, "is_offer")} disabled={busy === `${r.id}:is_offer`} className={pill(r.is_offer, "bg-flame-500 text-white")} aria-pressed={r.is_offer}>
                    Oferta
                  </button>
                  <span className="mx-1 hidden h-6 w-px bg-ink-100 sm:block" />
                  <button onClick={() => confirmPrice(r)} disabled={busy === `${r.id}:price`} title="Confirmar que o preço foi conferido hoje" className="rounded-lg p-2 text-ink-500 hover:bg-mint-50 hover:text-mint-700" aria-label="Marcar preço como conferido hoje">
                    {busy === `${r.id}:price` ? <Loader2 className="h-4 w-4 animate-spin" /> : <CalendarCheck className="h-4 w-4" />}
                  </button>
                  {r.is_active ? (
                    <a href={`/produto/${r.slug}`} target="_blank" rel="noopener" className="rounded-lg p-2 text-ink-500 hover:bg-ink-100 hover:text-ink-800" aria-label="Ver no site" title="Ver no site">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                  <Link href={`/admin/produtos/${r.id}`} className="rounded-lg p-2 text-ink-500 hover:bg-brand-50 hover:text-brand-700" aria-label="Editar" title="Editar">
                    <Pencil className="h-4 w-4" />
                  </Link>
                  {confirmId === r.id ? (
                    <span className="flex items-center gap-1">
                      <button onClick={() => remove(r)} className="rounded-lg bg-red-600 px-2.5 py-1.5 text-xs font-bold text-white hover:bg-red-700">Excluir</button>
                      <button onClick={() => setConfirmId(null)} className="rounded-lg px-2 py-1.5 text-xs font-semibold text-ink-500 hover:bg-ink-100">Cancelar</button>
                    </span>
                  ) : (
                    <button onClick={() => setConfirmId(r.id)} className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600" aria-label="Excluir" title="Excluir">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
