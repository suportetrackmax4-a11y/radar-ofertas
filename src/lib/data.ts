import "server-only";
import { cache } from "react";
import { getPublicClient } from "@/lib/supabase/public";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { normalizeSearch } from "@/lib/slug";
import type { Category, Product, SiteSettings, SortOption } from "@/lib/types";

export const PRODUCT_COLUMNS =
  "id, slug, name, short_description, description, price, old_price, category_id, images, affiliate_url, badge_label, is_featured, is_offer, is_active, sort_order, clicks, price_checked_at, created_at, updated_at, category:categories(id, name, slug, icon)";

function logError(scope: string, error: unknown) {
  console.error(`[data:${scope}]`, error);
}

export const getSettings = cache(async (): Promise<SiteSettings> => {
  const db = getPublicClient();
  if (!db) return DEFAULT_SETTINGS;
  const { data, error } = await db.from("site_settings").select("*").eq("id", 1).maybeSingle();
  if (error) logError("settings", error);
  return { ...DEFAULT_SETTINGS, ...(data ?? {}) };
});

export const getCategories = cache(async (): Promise<Category[]> => {
  const db = getPublicClient();
  if (!db) return [];
  const { data, error } = await db
    .from("categories")
    .select("id, name, slug, description, icon, sort_order, is_active")
    .eq("is_active", true)
    .order("sort_order")
    .order("name");
  if (error) logError("categories", error);
  return (data as Category[]) ?? [];
});

export const getCategoryBySlug = cache(async (slug: string): Promise<Category | null> => {
  const categories = await getCategories();
  return categories.find((c) => c.slug === slug) ?? null;
});

export type ListParams = {
  q?: string;
  categoryId?: string;
  sort?: SortOption;
  featured?: boolean;
  offer?: boolean;
  popular?: boolean;
  limit?: number;
  page?: number;
  excludeId?: string;
};

export async function listProducts(params: ListParams = {}): Promise<{ items: Product[]; total: number }> {
  const db = getPublicClient();
  if (!db) return { items: [], total: 0 };
  const limit = params.limit ?? 24;
  const page = Math.max(1, params.page ?? 1);

  let query = db.from("products").select(PRODUCT_COLUMNS, { count: "exact" }).eq("is_active", true);

  const q = params.q ? normalizeSearch(params.q) : "";
  if (q) {
    for (const term of q.split(" ").filter(Boolean).slice(0, 6)) {
      query = query.ilike("search_text", `%${term}%`);
    }
  }
  if (params.categoryId) query = query.eq("category_id", params.categoryId);
  if (params.featured) query = query.eq("is_featured", true);
  if (params.offer) query = query.eq("is_offer", true);
  if (params.popular) query = query.gt("clicks", 0);
  if (params.excludeId) query = query.neq("id", params.excludeId);

  switch (params.sort) {
    case "recentes":
      query = query.order("created_at", { ascending: false });
      break;
    case "menor-preco":
      query = query.order("price", { ascending: true });
      break;
    case "maior-preco":
      query = query.order("price", { ascending: false });
      break;
    case "maior-desconto":
      query = query.order("discount_pct", { ascending: false }).order("price_checked_at", { ascending: false });
      break;
    default:
      if (params.popular) query = query.order("clicks", { ascending: false });
      query = query.order("sort_order", { ascending: true }).order("created_at", { ascending: false });
  }

  const from = (page - 1) * limit;
  const { data, error, count } = await query.range(from, from + limit - 1);
  if (error) {
    logError("listProducts", error);
    return { items: [], total: 0 };
  }
  return { items: (data as unknown as Product[]) ?? [], total: count ?? 0 };
}

export const getProductBySlug = cache(async (slug: string): Promise<Product | null> => {
  const db = getPublicClient();
  if (!db) return null;
  const { data, error } = await db
    .from("products")
    .select(PRODUCT_COLUMNS)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) logError("product", error);
  return (data as unknown as Product) ?? null;
});

export async function getRelatedProducts(product: Product, limit = 8): Promise<Product[]> {
  const sameCategory = product.category_id
    ? (await listProducts({ categoryId: product.category_id, excludeId: product.id, limit })).items
    : [];
  if (sameCategory.length >= limit) return sameCategory;
  const extra = await listProducts({ featured: true, excludeId: product.id, limit: limit * 2 });
  const ids = new Set(sameCategory.map((p) => p.id));
  return [...sameCategory, ...extra.items.filter((p) => !ids.has(p.id))].slice(0, limit);
}

export async function getCategoryCounts(): Promise<Record<string, number>> {
  const db = getPublicClient();
  if (!db) return {};
  const { data, error } = await db.from("products").select("category_id").eq("is_active", true).limit(5000);
  if (error) {
    logError("categoryCounts", error);
    return {};
  }
  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    if (row.category_id) counts[row.category_id] = (counts[row.category_id] ?? 0) + 1;
  }
  return counts;
}

export async function getSitemapEntries() {
  const db = getPublicClient();
  if (!db) return { products: [], categories: [] as Category[] };
  const [{ data: products }, categories] = await Promise.all([
    db.from("products").select("slug, updated_at").eq("is_active", true).limit(10000),
    getCategories(),
  ]);
  return { products: (products ?? []) as { slug: string; updated_at: string }[], categories };
}
