"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react";
import { ProductImage } from "./ProductImage";

export type HeroSlide = {
  id: string;
  slug: string;
  name: string;
  image: string | null;
  category: string | null;
  price: string;
  oldPrice: string | null;
  discount: number;
};

export function HeroSlider({ slides }: { slides: HeroSlide[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = slides.length;

  const go = useCallback((dir: number) => setIndex((i) => (i + dir + count) % count), [count]);

  useEffect(() => {
    if (count < 2 || paused) return;
    const t = setInterval(() => go(1), 5500);
    return () => clearInterval(t);
  }, [count, paused, go]);

  if (count === 0) return null;
  const s = slides[index];

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      aria-roledescription="carrossel"
      aria-label="Grandes ofertas"
    >
      <div key={s.id} className="animate-fade-up overflow-hidden rounded-3xl bg-white shadow-2xl shadow-ink-950/30 ring-1 ring-white/10">
        <Link href={`/produto/${s.slug}`} className="group relative block aspect-[4/3] bg-white sm:aspect-[5/4]">
          <ProductImage
            src={s.image}
            alt={s.name}
            sizes="(max-width: 1024px) 90vw, 480px"
            priority={index === 0}
            className="p-8 transition-transform duration-700 group-hover:scale-105"
          />
          {s.discount > 0 ? (
            <span className="absolute left-4 top-4 rounded-xl bg-flame-500 px-3 py-1.5 text-sm font-extrabold text-white shadow-lg">
              -{s.discount}%
            </span>
          ) : null}
        </Link>
        <div className="flex flex-col gap-3 border-t border-ink-100 p-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {s.category ? <p className="text-[11px] font-bold uppercase tracking-wider text-brand-600">{s.category}</p> : null}
            <p className="line-clamp-1 font-semibold text-ink-900">{s.name}</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="font-display text-2xl font-extrabold text-ink-950">{s.price}</span>
              {s.oldPrice ? <span className="text-sm text-ink-400 line-through">{s.oldPrice}</span> : null}
            </p>
          </div>
          <a href={`/ir/${s.slug}`} target="_blank" rel="sponsored nofollow noopener" className="btn-flame shrink-0">
            Ver oferta <ExternalLink className="h-4 w-4" aria-hidden="true" />
          </a>
        </div>
      </div>

      {count > 1 ? (
        <div className="mt-4 flex items-center justify-center gap-3">
          <button onClick={() => go(-1)} className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20" aria-label="Oferta anterior">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-1.5">
            {slides.map((sl, i) => (
              <button
                key={sl.id}
                onClick={() => setIndex(i)}
                aria-label={`Ir para oferta ${i + 1}`}
                aria-current={i === index}
                className={`h-2 rounded-full transition-all ${i === index ? "w-6 bg-flame-500" : "w-2 bg-white/30 hover:bg-white/60"}`}
              />
            ))}
          </div>
          <button onClick={() => go(1)} className="rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20" aria-label="Próxima oferta">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
