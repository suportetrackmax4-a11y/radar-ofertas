import type { MetadataRoute } from "next";
import { getSitemapEntries } from "@/lib/data";
import { SITE_URL } from "@/lib/env";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { products, categories } = await getSitemapEntries();
  const now = new Date();
  const fixed = ["", "/ofertas", "/sobre", "/aviso-de-afiliados", "/politica-de-privacidade", "/termos-de-uso"].map((p) => ({
    url: `${SITE_URL}${p}`,
    lastModified: now,
    changeFrequency: p === "" || p === "/ofertas" ? ("daily" as const) : ("monthly" as const),
    priority: p === "" ? 1 : p === "/ofertas" ? 0.9 : 0.3,
  }));
  return [
    ...fixed,
    ...categories.map((c) => ({ url: `${SITE_URL}/categoria/${c.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 })),
    ...products.map((p) => ({ url: `${SITE_URL}/produto/${p.slug}`, lastModified: new Date(p.updated_at), changeFrequency: "weekly" as const, priority: 0.7 })),
  ];
}
