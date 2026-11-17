import Link from "next/link";
import { CheckCircle2, Plus } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { getSettings } from "@/lib/data";
import { ProductTable, type AdminProductRow } from "@/components/admin/ProductTable";

export const metadata = { title: "Produtos" };

type Props = { searchParams: Promise<{ salvo?: string; status?: string }> };

export default async function AdminProductsPage({ searchParams }: Props) {
  const { supabase } = await requireAdmin();
  const sp = await searchParams;
  const [settings, { data: products, error }, { data: categories }] = await Promise.all([
    getSettings(),
    supabase
      .from("products")
      .select("id, slug, name, price, old_price, images, category_id, affiliate_url, is_active, is_featured, is_offer, sort_order, clicks, price_checked_at, created_at")
      .order("sort_order")
      .order("created_at", { ascending: false })
      .limit(2000),
    supabase.from("categories").select("id, name").order("sort_order"),
  ]);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-ink-950">Produtos</h1>
          <p className="text-sm text-ink-500">Cadastre, edite, ative e organize a ordem de exibição.</p>
        </div>
        <Link href="/admin/produtos/novo" className="btn-primary">
          <Plus className="h-4 w-4" /> Novo produto
        </Link>
      </div>

      {sp.salvo ? (
        <p role="status" className="mb-5 flex items-center gap-2 rounded-xl bg-mint-50 px-4 py-3 text-sm font-medium text-mint-700 ring-1 ring-mint-500/20">
          <CheckCircle2 className="h-4 w-4" /> “{sp.salvo}” foi salvo com sucesso.
        </p>
      ) : null}
      {error ? <p className="mb-5 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">Erro ao carregar produtos: {error.message}</p> : null}

      <ProductTable
        initial={(products ?? []) as AdminProductRow[]}
        categories={categories ?? []}
        staleDays={settings.price_stale_days}
        initialStatus={sp.status ?? ""}
      />
    </div>
  );
}
