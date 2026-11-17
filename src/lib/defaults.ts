import type { SiteSettings } from "./types";

export const DEFAULT_SETTINGS: SiteSettings = {
  site_name: "Radar de Ofertas",
  tagline: "Achados selecionados do Mercado Livre",
  seo_description:
    "Seleção de produtos e ofertas do Mercado Livre, organizados por categoria, com preços conferidos.",
  hero_title: "As melhores ofertas, sem perder tempo procurando",
  hero_subtitle:
    "Selecionamos produtos do Mercado Livre e conferimos os preços para você comprar com mais segurança.",
  affiliate_disclaimer:
    "Este site participa do Programa de Afiliados do Mercado Livre. Ao comprar pelos nossos links, podemos receber uma comissão, sem custo adicional para você. Preços e disponibilidade podem mudar a qualquer momento no Mercado Livre.",
  price_stale_days: 7,
  contact_email: null,
  instagram_url: null,
  telegram_url: null,
  whatsapp_url: null,
};
