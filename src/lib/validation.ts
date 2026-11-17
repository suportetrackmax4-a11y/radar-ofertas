import { z } from "zod";
import { isAllowedAffiliateUrl } from "./affiliate";
import { CATEGORY_ICON_KEYS } from "./icons";

/** Aceita "1.299,90", "1299,90", "1299.90" ou "R$ 1.299,90". */
export function parsePrice(raw: unknown): number | null {
  if (typeof raw !== "string") return null;
  let s = raw.replace(/[R$\s]/g, "");
  if (!s) return null;
  if (s.includes(",")) s = s.replace(/\./g, "").replace(",", ".");
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n * 100) / 100 : NaN;
}

const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max, `Máximo de ${max} caracteres`)
    .transform((v) => (v === "" ? null : v));

const httpsUrl = z
  .string()
  .trim()
  .url("URL inválida")
  .refine((v) => v.startsWith("https://"), "Use um endereço que comece com https://");

const optionalUrl = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .pipe(httpsUrl.nullable());

export const productSchema = z
  .object({
    name: z.string().trim().min(3, "Informe o nome (mínimo 3 caracteres)").max(160, "Máximo de 160 caracteres"),
    slug: z.string().trim().max(80).optional().default(""),
    short_description: optionalText(220),
    description: optionalText(8000),
    price: z.number({ error: "Informe o preço atual" }).positive("O preço deve ser maior que zero").max(9_999_999),
    old_price: z.number().positive().max(9_999_999).nullable(),
    category_id: z
      .string()
      .trim()
      .transform((v) => (v === "" ? null : v))
      .pipe(z.uuid("Categoria inválida").nullable()),
    images: z.array(httpsUrl).max(8, "Máximo de 8 imagens"),
    affiliate_url: z
      .string()
      .trim()
      .transform((v) => (v === "" ? null : v))
      .refine((v) => v === null || isAllowedAffiliateUrl(v), {
        message: "Use o link de afiliado gerado no Mercado Livre (https://mercadolivre.com/sec/…, https://meli.la/… ou mercadolivre.com.br)",
      }),
    badge_label: optionalText(30),
    is_featured: z.boolean(),
    is_offer: z.boolean(),
    is_active: z.boolean(),
    price_checked_today: z.boolean(),
  })
  .superRefine((v, ctx) => {
    if (v.old_price != null && v.old_price <= v.price) {
      ctx.addIssue({ code: "custom", path: ["old_price"], message: "O preço anterior deve ser maior que o preço atual (ou deixe em branco)" });
    }
    if (v.is_active && !v.affiliate_url) {
      ctx.addIssue({ code: "custom", path: ["affiliate_url"], message: "Produtos ativos precisam de um link de afiliado" });
    }
  });

export type ProductInput = z.infer<typeof productSchema>;

export const categorySchema = z.object({
  id: z.string().trim().optional().default(""),
  name: z.string().trim().min(2, "Informe o nome").max(60),
  slug: z.string().trim().max(60).optional().default(""),
  description: optionalText(300),
  icon: z.enum(CATEGORY_ICON_KEYS as [string, ...string[]]).catch("tag"),
  sort_order: z.coerce.number().int().min(0).max(100000).catch(0),
  is_active: z.boolean(),
});

export const settingsSchema = z.object({
  site_name: z.string().trim().min(2, "Informe o nome do site").max(60),
  tagline: z.string().trim().min(2).max(120),
  seo_description: z.string().trim().min(20, "Mínimo de 20 caracteres").max(300),
  hero_title: z.string().trim().min(5).max(120),
  hero_subtitle: z.string().trim().min(5).max(300),
  affiliate_disclaimer: z.string().trim().min(30, "O aviso de afiliados é obrigatório (mínimo 30 caracteres)").max(800),
  price_stale_days: z.coerce.number().int().min(1).max(90),
  contact_email: z
    .string()
    .trim()
    .transform((v) => (v === "" ? null : v))
    .pipe(z.email("E-mail inválido").nullable()),
  instagram_url: optionalUrl,
  telegram_url: optionalUrl,
  whatsapp_url: optionalUrl,
});

export function firstErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
