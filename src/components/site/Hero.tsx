import Link from "next/link";
import { BadgeCheck, Clock, ShieldCheck } from "lucide-react";
import type { Product, SiteSettings } from "@/lib/types";
import { formatPrice, getPricing, mainImage } from "@/lib/format";
import { HeroSlider, type HeroSlide } from "./HeroSlider";

export function Hero({ settings, products }: { settings: SiteSettings; products: Product[] }) {
  const slides: HeroSlide[] = products.map((p) => {
    const pr = getPricing(p, settings.price_stale_days);
    return {
      id: p.id,
      slug: p.slug,
      name: p.name,
      image: mainImage(p),
      category: p.category?.name ?? null,
      price: formatPrice(pr.price),
      oldPrice: pr.oldPrice ? formatPrice(pr.oldPrice) : null,
      discount: pr.discount,
    };
  });

  return (
    <section className="relative overflow-hidden bg-ink-900 text-white" aria-labelledby="hero-title">
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        <div className="absolute -left-32 -top-32 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl" />
        <div className="absolute -bottom-40 right-0 h-[28rem] w-[28rem] rounded-full bg-flame-500/20 blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{ backgroundImage: "radial-gradient(circle at 1px 1px, white 1px, transparent 0)", backgroundSize: "28px 28px" }}
        />
      </div>

      <div className={`container-page relative grid items-center gap-10 py-12 sm:py-16 lg:py-20 ${slides.length ? "lg:grid-cols-[1.1fr_0.9fr]" : ""}`}>
        <div className="animate-fade-up">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 ring-1 ring-white/15">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-radar rounded-full bg-flame-400" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-flame-500" />
            </span>
            Ofertas selecionadas e atualizadas
          </p>
          <h1 id="hero-title" className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-5xl lg:text-[3.4rem]">
            {settings.hero_title}
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-ink-300 sm:text-lg">{settings.hero_subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/ofertas" className="btn-flame px-6 py-3 text-base">
              Ver ofertas do dia
            </Link>
            <Link href="/#categorias" className="btn bg-white/10 px-6 py-3 text-base text-white ring-1 ring-white/20 hover:bg-white/20">
              Explorar categorias
            </Link>
          </div>
          <ul className="mt-10 grid max-w-xl gap-3 text-sm text-ink-300 sm:grid-cols-3">
            <li className="flex items-center gap-2"><BadgeCheck className="h-5 w-5 text-mint-500" aria-hidden="true" /> Curadoria manual</li>
            <li className="flex items-center gap-2"><Clock className="h-5 w-5 text-brand-300" aria-hidden="true" /> Preços conferidos</li>
            <li className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-flame-400" aria-hidden="true" /> Compra no Mercado Livre</li>
          </ul>
        </div>
        {slides.length ? (
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <HeroSlider slides={slides} />
          </div>
        ) : null}
      </div>
    </section>
  );
}
