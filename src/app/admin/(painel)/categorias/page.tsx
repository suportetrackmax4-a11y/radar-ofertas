import { requireAdmin } from "@/lib/admin";
import { CategoryManager } from "@/components/admin/CategoryManager";
import type { Category } from "@/lib/types";

export const metadata = { title: "Categorias" };

export default async function AdminCategoriesPage() {
  const { supabase } = await requireAdmin();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("id, name, slug, description, icon, sort_order, is_active").order("sort_order").order("name"),
    supabase.from("products").select("category_id").limit(5000),
  ]);
  const counts: Record<string, number> = {};
  for (const p of products ?? []) if (p.category_id) counts[p.category_id] = (counts[p.category_id] ?? 0) + 1;

  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-2xl font-extrabold text-ink-950">Categorias</h1>
      <p className="mb-6 text-sm text-ink-500">Crie, edite, oculte e ordene as categorias exibidas no menu e na página inicial.</p>
      <CategoryManager categories={(categories ?? []) as Category[]} counts={counts} />
    </div>
  );
}
