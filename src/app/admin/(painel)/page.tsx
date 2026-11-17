import Link from "next/link";
import { AlertTriangle, Eye, Flame, MousePointerClick, Package, Plus, Star } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/data";
import { daysSince, formatPrice } from "@/lib/format";

export const metadata = { title: "Visão geral" };

type Row = { id: string; name: string; slug: string; price: number; is_active: boolean; is_featured: boolean; is_offer: boolean; clicks: number; price_checked_at: string };

export default async function DashboardPage() {
  const { supabase } = await requireAdmin();
  const settings = await getSettings();
  const { data } = await supabase
    .from("products")
    .select("id, name, slug, price, is_active, is_featured, is_offer, clicks, price_checked_at")
    .limit(5000);
  const rows = (data ?? []) as Row[];

  const active = rows.filter((r) => r.is_active);
  const stale = active.filter((r) => daysSince(r.price_checked_at) > settings.price_stale_days).sort((a, b) => a.price_checked_at.localeCompare(b.price_checked_at));
  const top = [...active].filter((r) => r.clicks > 0).sort((a, b) => b.clicks - a.clicks).slice(0, 5);
  const totalClicks = rows.reduce((s, r) => s + r.clicks, 0);

  const stats = [
    { label: "Produtos ativos", value: active.length, sub: `${rows.length} cadastrados`, icon: Package, cls: "bg-brand-50 text-brand-600" },
    { label: "Em oferta", value: active.filter((r) => r.is_offer).length, icon: Flame, cls: "bg-flame-50 text-flame-600" },
    { label: "Em destaque", value: active.filter((r) => r.is_featured).length, icon: Star, cls: "bg-brand-50 text-brand-700" },
    { label: "Cliques em ofertas", value: totalClicks, icon: MousePointerClick, cls: "bg-mint-50 text-mint-700" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-950">Visão geral</h1>
          <p className="text-sm text-ink-500">Acompanhe seu catálogo e mantenha os preços em dia.</p>
        </div>
        <Link href="/admin/produtos/novo" className="btn-primary">
          <Plus className="h-4 w-4" /> Cadastrar produto
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, cls }) => (
          <div key={label} className="card p-5">
            <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${cls}`}>
              <Icon className="h-5 w-5" aria-hidden="true" />
            </div>
            <p className="font-display text-3xl font-extrabold text-ink-950">{value.toLocaleString("pt-BR")}</p>
            <p className="text-sm text-ink-500">{label}</p>
            {sub ? <p className="text-xs text-ink-400">{sub}</p> : null}
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="card p-5 sm:p-6">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-ink-950">
            <AlertTriangle className="h-5 w-5 text-flame-500" aria-hidden="true" /> Preços para conferir
          </h2>
          <p className="mb-4 text-sm text-ink-500">
            Conferidos há mais de {settings.price_stale_days} dias. No site, esses produtos não exibem desconto até você confirmar o preço.
          </p>
          {stale.length ? (
            <ul className="divide-y divide-ink-100">
              {stale.slice(0, 8).map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                  <Link href={`/admin/produtos/${r.id}`} className="line-clamp-1 text-sm font-medium text-ink-800 hover:text-brand-700">{r.name}</Link>
                  <span className="shrink-0 text-xs text-flame-700">há {daysSince(r.price_checked_at)} dias</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-xl bg-mint-50 px-4 py-3 text-sm text-mint-700">Tudo em dia! Nenhum preço desatualizado.</p>
          )}
          {stale.length > 8 ? (
            <Link href="/admin/produtos?status=desatualizados" className="mt-3 inline-block text-sm font-semibold text-brand-600">Ver todos ({stale.length})</Link>
          ) : null}
        </section>

        <section className="card p-5 sm:p-6">
          <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-ink-950">
            <Eye className="h-5 w-5 text-brand-600" aria-hidden="true" /> Mais clicados
          </h2>
          <p className="mb-4 text-sm text-ink-500">Produtos com mais cliques no botão “Ver oferta”.</p>
          {top.length ? (
            <ol className="divide-y divide-ink-100">
              {top.map((r, i) => (
                <li key={r.id} className="flex items-center gap-3 py-2.5">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-ink-100 text-xs font-bold text-ink-600">{i + 1}</span>
                  <Link href={`/admin/produtos/${r.id}`} className="line-clamp-1 flex-1 text-sm font-medium text-ink-800 hover:text-brand-700">{r.name}</Link>
                  <span className="shrink-0 text-xs text-ink-400">{formatPrice(Number(r.price))}</span>
                  <span className="shrink-0 text-sm font-bold text-ink-900">{r.clicks}</span>
                </li>
              ))}
            </ol>
          ) : (
            <p className="rounded-xl bg-ink-50 px-4 py-3 text-sm text-ink-500">Os cliques aparecem aqui assim que os visitantes começarem a acessar as ofertas.</p>
          )}
        </section>
      </div>
    </div>
  );
}
