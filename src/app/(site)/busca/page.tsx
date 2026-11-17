import type { Metadata } from "next";
import { Catalog, readParam, type RawSearchParams } from "@/components/site/Catalog";
import { getCategoryBySlug } from "@/lib/data";

type Props = { searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = readParam(await searchParams, "q");
  return {
    title: q ? `Busca por “${q}”` : "Todos os produtos",
    alternates: { canonical: "/busca" },
    // Páginas de resultado de busca não devem ser indexadas (evita conteúdo duplicado).
    robots: { index: false, follow: true },
  };
}

export default async function SearchPage({ searchParams }: Props) {
  const sp = await searchParams;
  const q = readParam(sp, "q");
  const category = readParam(sp, "categoria") ? await getCategoryBySlug(readParam(sp, "categoria")) : null;
  const featured = readParam(sp, "destaque") === "1";
  const offer = readParam(sp, "oferta") === "1";

  const title = q ? `Resultados para “${q}”` : featured ? "Produtos em destaque" : offer ? "Ofertas" : "Todos os produtos";

  return (
    <Catalog
      title={title}
      crumbs={[{ label: "Busca" }]}
      searchParams={sp}
      basePath="/busca"
      defaultSort="relevancia"
      showCategoryFilter
      filters={{ q, categoryId: category?.id, featured, offer }}
      emptyText={q ? <>Não encontramos produtos para “{q}”. Tente palavras mais curtas ou outra categoria.</> : undefined}
    />
  );
}
