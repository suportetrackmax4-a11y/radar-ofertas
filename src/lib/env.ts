export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** URL pública do site (sem barra no final). Usada em SEO, sitemap e Open Graph. */
function resolveSiteUrl(): string {
  const candidates = [
    process.env.NEXT_PUBLIC_SITE_URL,
    process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : undefined,
  ];
  for (const value of candidates) {
    try {
      // Ignora valores que não são um endereço http(s) válido (ex.: uma chave colada no campo errado).
      if (value && /^https?:$/.test(new URL(value.trim()).protocol)) return value.trim().replace(/\/+$/, "");
    } catch {}
  }
  return "http://localhost:3000";
}

export const SITE_URL = resolveSiteUrl();

export const isSupabaseConfigured = Boolean(SUPABASE_URL && SUPABASE_KEY);

export const IMAGE_BUCKET = "product-images";

/**
 * O painel administrativo só funciona no seu computador, com `npm run dev`.
 * No build de produção (`npm run build` / Vercel) o /admin não existe, então
 * não há usuário nem senha em lugar nenhum.
 */
export const PANEL_ENABLED = process.env.NODE_ENV === "development";
