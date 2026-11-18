export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** URL pública do site (sem barra no final). Usada em SEO, sitemap e Open Graph. */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/+$/, "");

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const IMAGE_BUCKET = "product-images";

/**
 * Modo local sem login: só existe com `npm run dev` (NODE_ENV = development).
 * No build de produção (`npm run build` / Vercel) o login é SEMPRE obrigatório.
 */
export const LOCAL_NO_LOGIN = process.env.NODE_ENV === "development";
