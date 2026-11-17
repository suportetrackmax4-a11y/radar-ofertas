import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, ExternalLink } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Editar produto" };

const toInput = (n: number | null) => (n == null ? "" : Number(n).toFixed(2).replace(".", ","));

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { supabase } = await requireAdmin();
  const [{ data: product }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").eq("id", id).maybeSingle(),
    supabase.from("categories").select("id, name").order("sort_order"),
  ]);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/produtos" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ChevronLeft className="h-4 w-4" /> Produtos
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold text-ink-950">Editar produto</h1>
        {product.is_active ? (
          <a href={`/produto/${product.slug}`} target="_blank" rel="noopener" className="btn-ghost">
            <ExternalLink className="h-4 w-4" /> Ver no site
          </a>
        ) : null}
      </div>
      <ProductForm
        categories={categories ?? []}
        initial={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          short_description: product.short_description ?? "",
          description: product.description ?? "",
          price: toInput(product.price),
          old_price: toInput(product.old_price),
          category_id: product.category_id ?? "",
          images: product.images ?? [],
          affiliate_url: product.affiliate_url ?? "",
          badge_label: product.badge_label ?? "",
          is_featured: product.is_featured,
          is_offer: product.is_offer,
          is_active: product.is_active,
          price_checked_at: product.price_checked_at,
        }}
      />
    </div>
  );
}
