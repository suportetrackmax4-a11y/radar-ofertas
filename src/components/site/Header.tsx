import Link from "next/link";
import { Flame, Percent, Sparkles } from "lucide-react";
import { getCategories, getSettings } from "@/lib/data";
import { Logo } from "./Logo";
import { SearchBar } from "./SearchBar";
import { MobileMenu } from "./MobileMenu";
import { CategoryIcon } from "./CategoryIcon";

const navCls =
  "inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-white/85 transition hover:bg-white/10 hover:text-white";

export async function Header() {
  const [settings, categories] = await Promise.all([getSettings(), getCategories()]);

  return (
    <header className="sticky top-0 z-40">
      <div className="bg-ink-900 text-white shadow-lg shadow-ink-950/10">
        <div className="container-page flex h-16 items-center gap-4 lg:h-[72px] lg:gap-8">
          <Logo name={settings.site_name} light />
          <SearchBar className="hidden max-w-xl flex-1 md:block" id="busca-desktop" />
          <nav className="ml-auto hidden items-center gap-1 lg:flex" aria-label="Principal">
            <Link href="/ofertas" className={navCls}>
              <Flame className="h-4 w-4 text-flame-400" /> Ofertas do dia
            </Link>
            <Link href="/busca?ordem=maior-desconto" className={navCls}>
              <Percent className="h-4 w-4 text-mint-500" /> Descontos
            </Link>
            <Link href="/busca?ordem=recentes" className={navCls}>
              <Sparkles className="h-4 w-4 text-brand-300" /> Novidades
            </Link>
          </nav>
          <div className="ml-auto lg:hidden">
            <MobileMenu categories={categories} />
          </div>
        </div>
        <div className="container-page pb-3 md:hidden">
          <SearchBar id="busca-mobile" />
        </div>
      </div>
      {categories.length > 0 ? (
        <nav aria-label="Categorias" className="border-b border-ink-100 bg-white/90 backdrop-blur">
          <ul className="container-page scrollbar-none flex gap-1 overflow-x-auto py-2">
            {categories.map((c) => (
              <li key={c.id} className="shrink-0">
                <Link
                  href={`/categoria/${c.slug}`}
                  className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-ink-700 transition hover:bg-brand-50 hover:text-brand-700"
                >
                  <CategoryIcon name={c.icon} className="h-4 w-4 text-ink-400" />
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
    </header>
  );
}
