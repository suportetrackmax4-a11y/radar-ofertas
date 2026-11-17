import type { Product } from "@/lib/types";
import { ProductCard } from "./ProductCard";

export function ProductGrid({ products, staleDays, priorityCount = 0 }: { products: Product[]; staleDays: number; priorityCount?: number }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <div key={p.id} className="animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
          <ProductCard product={p} staleDays={staleDays} priority={i < priorityCount} />
        </div>
      ))}
    </div>
  );
}
