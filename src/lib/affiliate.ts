/**
 * Domínios aceitos para links de afiliado. Os links do Programa de Afiliados do
 * Mercado Livre são gerados no painel do afiliado (ex.: https://mercadolivre.com/sec/...
 * ou https://meli.la/...). O site nunca cria links: apenas usa o que você cadastrar.
 */
export const ALLOWED_AFFILIATE_HOSTS = [
  "mercadolivre.com.br",
  "mercadolivre.com",
  "mercadolibre.com",
  "meli.la",
];

export function isAllowedAffiliateUrl(value: string): boolean {
  try {
    const url = new URL(value);
    if (url.protocol !== "https:") return false;
    const host = url.hostname.toLowerCase();
    return ALLOWED_AFFILIATE_HOSTS.some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

/** Hosts cujas imagens podem passar pelo otimizador do Next.js. */
export function isOptimizableImage(src: string): boolean {
  if (src.startsWith("/")) return true;
  try {
    const host = new URL(src).hostname;
    const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname : "";
    return host === supabaseHost || host.endsWith(".mlstatic.com");
  } catch {
    return false;
  }
}
