import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata = { title: "Novo produto" };

export default async function NewProductPage() {
  const { supabase } = await requireAdmin();
  const { data: categories } = await supabase.from("categories").select("id, name").order("sort_order");

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/produtos" className="mb-3 inline-flex items-center gap-1 text-sm font-medium text-ink-500 hover:text-ink-900">
        <ChevronLeft className="h-4 w-4" /> Produtos
      </Link>
      <h1 className="mb-6 text-2xl font-extrabold text-ink-950">Cadastrar produto</h1>
      <ProductForm
        categories={categories ?? []}
        initial={{
          name: "",
          slug: "",
          short_description: "",
          description: "",
          price: "",
          old_price: "",
          category_id: "",
          images: [],
          affiliate_url: "",
          badge_label: "",
          is_featured: false,
          is_offer: false,
          is_active: true,
        }}
      />
    </div>
  );
}
