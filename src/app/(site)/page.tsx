import { Flame, LayoutGrid, Sparkles, Star, TrendingUp } from "lucide-react";
import { getCategories, getCategoryCounts, getSettings, listProducts } from "@/lib/data";
import { isSupabaseConfigured } from "@/lib/env";
import { Hero } from "@/components/site/Hero";
import { ProductGrid } from "@/components/site/ProductGrid";
import { CategoryGrid } from "@/components/site/CategoryGrid";
import { AffiliateNotice, EmptyState, SectionHeader } from "@/components/site/Misc";

export const revalidate = 300;

export default async function HomePage() {
  const [settings, categories, counts, featured, offers, popular, latest] = await Promise.all([
    getSettings(),
    getCategories(),
    getCategoryCounts(),
    listProducts({ featured: true, limit: 8 }),
    listProducts({ offer: true, sort: "maior-desconto", limit: 8 }),
    listProducts({ popular: true, limit: 8 }),
    listProducts({ sort: "recentes", limit: 8 }),
  ]);

  const stale = settings.price_stale_days;
  const heroProducts = (featured.items.length ? featured.items : offers.items).slice(0, 5);
  const isEmpty = latest.total === 0;

  return (
    <>
      <Hero settings={settings} products={heroProducts} />

      <div className="container-page space-y-16 py-12 sm:py-16">
        {!isSupabaseConfigured ? (
          <EmptyState title="Banco de dados ainda não conectado">
            Configure as variáveis do Supabase no arquivo <code>.env.local</code> (veja o README) para começar a cadastrar produtos.
          </EmptyState>
        ) : isEmpty ? (
          <EmptyState title="Nenhum produto publicado ainda">
            Em breve teremos ofertas selecionadas por aqui. Volte mais tarde!
          </EmptyState>
        ) : null}

        {featured.items.length ? (
          <section aria-labelledby="destaques">
            <SectionHeader
              id="destaques"
              title="Produtos em destaque"
              subtitle="Escolhidos a dedo pela nossa curadoria"
              href="/busca?destaque=1"
              icon={<Star className="h-6 w-6 text-brand-600" aria-hidden="true" />}
            />
            <ProductGrid products={featured.items} staleDays={stale} priorityCount={2} />
          </section>
        ) : null}

        {offers.items.length ? (
          <section aria-labelledby="ofertas-dia">
            <SectionHeader
              id="ofertas-dia"
              title="Ofertas do dia"
              subtitle="Os maiores descontos que encontramos"
              href="/ofertas"
              icon={<Flame className="h-6 w-6 text-flame-500" aria-hidden="true" />}
            />
            <ProductGrid products={offers.items} staleDays={stale} />
          </section>
        ) : null}

        {categories.length ? (
          <section id="categorias" aria-labelledby="categorias-titulo" className="scroll-mt-32">
            <SectionHeader
              id="categorias-titulo"
              title="Categorias"
              subtitle="Navegue pelo que você procura"
              icon={<LayoutGrid className="h-6 w-6 text-brand-600" aria-hidden="true" />}
            />
            <CategoryGrid categories={categories} counts={counts} />
          </section>
        ) : null}

        {popular.items.length ? (
          <section aria-labelledby="populares">
            <SectionHeader
              id="populares"
              title="Mais populares"
              subtitle="Os produtos que mais chamam a atenção dos visitantes"
              icon={<TrendingUp className="h-6 w-6 text-mint-600" aria-hidden="true" />}
            />
            <ProductGrid products={popular.items} staleDays={stale} />
          </section>
        ) : null}

        {latest.items.length ? (
          <section aria-labelledby="novidades">
            <SectionHeader
              id="novidades"
              title="Novidades"
              subtitle="Acabaram de chegar ao radar"
              href="/busca?ordem=recentes"
              icon={<Sparkles className="h-6 w-6 text-brand-500" aria-hidden="true" />}
            />
            <ProductGrid products={latest.items} staleDays={stale} />
          </section>
        ) : null}

        <AffiliateNotice text={settings.affiliate_disclaimer} />
      </div>
    </>
  );
}
