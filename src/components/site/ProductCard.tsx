import Link from "next/link";
import { Flame, Star } from "lucide-react";
import type { Product } from "@/lib/types";
import { getPricing, mainImage } from "@/lib/format";
import { ProductImage } from "./ProductImage";
import { PriceTag } from "./PriceTag";
import { OfferButton } from "./OfferButton";

type Props = { product: Product; staleDays: number; priority?: boolean };

export function ProductCard({ product, staleDays, priority }: Props) {
  const pricing = getPricing(product, staleDays);
  const href = `/produto/${product.slug}`;

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-card ring-1 ring-ink-100 transition duration-300 hover:-translate-y-1 hover:shadow-lift hover:ring-brand-200">
      <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
        {pricing.discount > 0 ? (
          <span className="rounded-lg bg-flame-500 px-2 py-1 text-xs font-extrabold text-white shadow-sm">
            -{pricing.discount}%
          </span>
        ) : null}
        {product.is_offer ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-ink-900 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            <Flame className="h-3 w-3 text-flame-400" aria-hidden="true" /> Oferta
          </span>
        ) : null}
        {product.is_featured ? (
          <span className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2 py-1 text-[11px] font-bold uppercase tracking-wide text-white">
            <Star className="h-3 w-3" aria-hidden="true" /> Destaque
          </span>
        ) : null}
        {product.badge_label ? (
          <span className="rounded-lg bg-mint-50 px-2 py-1 text-[11px] font-bold text-mint-700 ring-1 ring-mint-500/20">
            {product.badge_label}
          </span>
        ) : null}
      </div>

      <Link href={href} className="relative block aspect-square overflow-hidden bg-white" tabIndex={-1} aria-hidden="true">
        <ProductImage
          src={mainImage(product)}
          alt={product.name}
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          priority={priority}
          className="p-5 transition-transform duration-500 group-hover:scale-105"
        />
      </Link>

      <div className="flex flex-1 flex-col gap-2 border-t border-ink-100 p-4">
        {product.category ? (
          <Link
            href={`/categoria/${product.category.slug}`}
            className="relative z-10 w-fit text-[11px] font-semibold uppercase tracking-wider text-brand-600 hover:text-brand-800"
          >
            {product.category.name}
          </Link>
        ) : null}
        <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-ink-900 sm:text-[15px]">
          <Link href={href} className="hover:text-brand-700">
            {product.name}
          </Link>
        </h3>
        {product.short_description ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-ink-500">{product.short_description}</p>
        ) : null}
        <div className="mt-auto pt-2">
          <PriceTag price={pricing.price} oldPrice={pricing.oldPrice} discount={pricing.discount} />
          {pricing.stale ? (
            <p className="mt-1 text-[11px] text-ink-400">Confira o preço atualizado no Mercado Livre</p>
          ) : null}
        </div>
        <OfferButton slug={product.slug} className="mt-2" />
      </div>
    </article>
  );
}
