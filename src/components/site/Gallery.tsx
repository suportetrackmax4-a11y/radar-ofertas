"use client";

import { useState } from "react";
import { ProductImage } from "./ProductImage";

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? null;

  return (
    <div className="flex flex-col gap-3">
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-white shadow-card ring-1 ring-ink-100">
        <ProductImage key={current ?? "none"} src={current} alt={alt} sizes="(max-width: 1024px) 100vw, 600px" priority className="animate-fade-up p-6 sm:p-10" />
      </div>
      {images.length > 1 ? (
        <ul className="scrollbar-none flex gap-2 overflow-x-auto pb-1" aria-label="Fotos do produto">
          {images.map((src, i) => (
            <li key={src} className="shrink-0">
              <button
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Ver foto ${i + 1}`}
                aria-current={i === active}
                className={`relative block h-20 w-20 overflow-hidden rounded-xl bg-white ring-2 transition ${i === active ? "ring-brand-500" : "ring-ink-100 hover:ring-ink-300"}`}
              >
                <ProductImage src={src} alt="" sizes="80px" className="p-1.5" />
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
