export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string;
  sort_order: number;
  is_active: boolean;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  short_description: string | null;
  description: string | null;
  price: number;
  old_price: number | null;
  category_id: string | null;
  images: string[];
  affiliate_url: string | null;
  badge_label: string | null;
  is_featured: boolean;
  is_offer: boolean;
  is_active: boolean;
  sort_order: number;
  clicks: number;
  price_checked_at: string;
  created_at: string;
  updated_at: string;
  category?: Pick<Category, "id" | "name" | "slug" | "icon"> | null;
};

export type SiteSettings = {
  site_name: string;
  tagline: string;
  seo_description: string;
  hero_title: string;
  hero_subtitle: string;
  affiliate_disclaimer: string;
  price_stale_days: number;
  contact_email: string | null;
  instagram_url: string | null;
  telegram_url: string | null;
  whatsapp_url: string | null;
};

export type SortOption = "relevancia" | "recentes" | "menor-preco" | "maior-preco" | "maior-desconto";

export type ActionResult = { ok: true; message?: string; id?: string } | { ok: false; error: string };
