import Link from "next/link";
import type { Category } from "@/lib/types";
import { CategoryIcon } from "./CategoryIcon";

export function CategoryGrid({ categories, counts }: { categories: Category[]; counts: Record<string, number> }) {
  return (
    <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {categories.map((c) => {
        const n = counts[c.id] ?? 0;
        return (
          <li key={c.id}>
            <Link
              href={`/categoria/${c.slug}`}
              className="group flex h-full items-center gap-3 rounded-2xl bg-white p-4 shadow-card ring-1 ring-ink-100 transition duration-300 hover:-translate-y-0.5 hover:shadow-lift hover:ring-brand-200"
            >
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-600 group-hover:text-white">
                <CategoryIcon name={c.icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold leading-tight text-ink-900">{c.name}</span>
                <span className="text-xs text-ink-400">{n === 1 ? "1 produto" : `${n} produtos`}</span>
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
