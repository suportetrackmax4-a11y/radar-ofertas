import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarCheck, Flame, ShieldCheck, Star, Truck } from "lucide-react";
import { getProductBySlug, getRelatedProducts, getSettings } from "@/lib/data";
import { formatDate, getPricing, mainImage } from "@/lib/format";
import { SITE_URL } from "@/lib/env";
import { Gallery } from "@/components/site/Gallery";
import { PriceTag } from "@/components/site/PriceTag";
import { OfferButton } from "@/components/site/OfferButton";
import { ProductGrid } from "@/components/site/ProductGrid";
import { AffiliateNotice, Breadcrumbs, SectionHeader } from "@/components/site/Misc";

export const revalidate = 300;

export async function generateStaticParams() {
  // As páginas são geradas sob demanda na primeira visita e ficam em cache (ISR).
  return [];
}

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Produto não encontrado", robots: { index: false } };
  const description = (product.short_description || product.description || product.name).slice(0, 160);
  const image = mainImage(product);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/produto/${product.slug}` },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      url: `/produto/${product.slug}`,
      images: image ? [{ url: image, alt: product.name }] : undefined,
    },
    twitter: { card: image ? "summary_large_image" : "summary", title: product.name, description, images: image ? [image] : undefined },
  };
}

function Paragraphs({ text }: { text: string }) {
  return (
    <div className="prose-product">
      {text
        .split(/\n{2,}|\r\n\r\n/)
        .map((p) => p.trim())
        .filter(Boolean)
        .map((p, i) => (
          <p key={i} className="whitespace-pre-line">{p}</p>
        ))}
    </div>
  );
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const [product, settings] = await Promise.all([getProductBySlug(slug), getSettings()]);
  if (!product) notFound();

  const related = await getRelatedProducts(product, 8);
  const pricing = getPricing(product, settings.price_stale_days);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.short_description || product.description || undefined,
    image: product.images.length ? product.images : undefined,
    category: product.category?.name,
    url: `${SITE_URL}/produto/${product.slug}`,
    offers: pricing.stale
      ? undefined
      : {
          "@type": "Offer",
          price: pricing.price.toFixed(2),
          priceCurrency: "BRL",
          url: `${SITE_URL}/produto/${product.slug}`,
          priceValidUntil: new Date(new Date(product.price_checked_at).getTime() + settings.price_stale_days * 86_400_000)
            .toISOString()
            .slice(0, 10),
        },
  };

  const crumbs = product.category
    ? [{ label: product.category.name, href: `/categoria/${product.category.slug}` }, { label: product.name }]
    : [{ label: product.name }];

  return (
    <div className="container-page py-8 sm:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
      <Breadcrumbs items={crumbs} />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <Gallery images={product.images} alt={product.name} />

        <div className="flex flex-col">
          <div className="mb-3 flex flex-wrap gap-2">
            {product.is_offer ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-ink-900 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                <Flame className="h-3.5 w-3.5 text-flame-400" aria-hidden="true" /> Oferta
              </span>
            ) : null}
            {product.is_featured ? (
              <span className="inline-flex items-center gap-1 rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-bold uppercase tracking-wide text-white">
                <Star className="h-3.5 w-3.5" aria-hidden="true" /> Destaque
              </span>
            ) : null}
            {product.badge_label ? (
              <span className="rounded-lg bg-mint-50 px-2.5 py-1 text-xs font-bold text-mint-700 ring-1 ring-mint-500/20">{product.badge_label}</span>
            ) : null}
          </div>

          {product.category ? (
            <Link href={`/categoria/${product.category.slug}`} className="w-fit text-xs font-bold uppercase tracking-wider text-brand-600 hover:text-brand-800">
              {product.category.name}
            </Link>
          ) : null}
          <h1 className="mt-2 text-2xl font-extrabold leading-tight text-ink-950 sm:text-3xl">{product.name}</h1>
          {product.short_description ? <p className="mt-3 text-ink-600 text-base leading-relaxed">{product.short_description}</p> : null}

          <div className="card mt-6 p-5 sm:p-6">
            <PriceTag price={pricing.price} oldPrice={pricing.oldPrice} discount={pricing.discount} size="lg" />
            <p className="mt-3 flex items-center gap-2 text-sm text-ink-500">
              <CalendarCheck className="h-4 w-4 text-mint-600" aria-hidden="true" />
              Preço conferido em {formatDate(product.price_checked_at)}
            </p>
            {pricing.stale ? (
              <p className="mt-2 rounded-lg bg-flame-50 px-3 py-2 text-sm text-flame-700">
                Este preço foi conferido há algum tempo e pode ter mudado. Confira o valor atualizado no Mercado Livre.
              </p>
            ) : null}
            <OfferButton slug={product.slug} size="lg" label="Ver oferta no Mercado Livre" className="mt-5" />
            <ul className="mt-5 grid gap-2 text-sm text-ink-600 sm:grid-cols-2">
              <li className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-brand-600" aria-hidden="true" /> Compra segura pelo Mercado Livre</li>
              <li className="flex items-center gap-2"><Truck className="h-4 w-4 text-brand-600" aria-hidden="true" /> Frete e prazo calculados no site do vendedor</li>
            </ul>
          </div>

          <div className="mt-5">
            <AffiliateNotice text={settings.affiliate_disclaimer} compact />
          </div>
        </div>
      </div>

      {product.description ? (
        <section className="card mt-10 p-6 sm:p-8" aria-labelledby="descricao">
          <h2 id="descricao" className="mb-4 text-xl font-extrabold text-ink-950">Descrição do produto</h2>
          <Paragraphs text={product.description} />
        </section>
      ) : null}

      {related.length ? (
        <section className="mt-14" aria-labelledby="relacionados">
          <SectionHeader id="relacionados" title="Você também pode gostar" subtitle="Outros produtos selecionados" />
          <ProductGrid products={related} staleDays={settings.price_stale_days} />
        </section>
      ) : null}
    </div>
  );
}
