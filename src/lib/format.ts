import type { Product } from "./types";

const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const dateFmt = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" });

export function formatPrice(value: number): string {
  return brl.format(value);
}

export function formatDate(value: string | Date): string {
  return dateFmt.format(typeof value === "string" ? new Date(value) : value);
}

/** Quantos dias desde a última conferência do preço. */
export function daysSince(value: string): number {
  return Math.floor((Date.now() - new Date(value).getTime()) / 86_400_000);
}

export function isPriceStale(product: Pick<Product, "price_checked_at">, staleDays: number): boolean {
  return daysSince(product.price_checked_at) > staleDays;
}

/**
 * Desconto só é exibido quando existe preço anterior cadastrado, maior que o atual,
 * e o preço foi conferido dentro do prazo configurado no painel.
 */
export function getPricing(product: Pick<Product, "price" | "old_price" | "price_checked_at">, staleDays: number) {
  const stale = isPriceStale(product, staleDays);
  const hasOld = !stale && product.old_price != null && Number(product.old_price) > Number(product.price);
  const discount = hasOld ? Math.floor((1 - Number(product.price) / Number(product.old_price)) * 100) : 0;
  return {
    price: Number(product.price),
    oldPrice: hasOld ? Number(product.old_price) : null,
    discount: discount >= 1 ? discount : 0,
    stale,
  };
}

export function mainImage(product: Pick<Product, "images">): string | null {
  return product.images?.[0] ?? null;
}
