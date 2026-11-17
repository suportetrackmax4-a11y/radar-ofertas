import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Catalog, type RawSearchParams } from "@/components/site/Catalog";
import { getCategoryBySlug } from "@/lib/data";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<RawSearchParams> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Categoria não encontrada" };
  const description = category.description
    ? `${category.name}: ${category.description} Ofertas selecionadas do Mercado Livre.`
    : `Ofertas selecionadas de ${category.name} no Mercado Livre.`;
  return {
    title: `${category.name} em oferta`,
    description,
    alternates: { canonical: `/categoria/${category.slug}` },
    openGraph: { title: `${category.name} em oferta`, description, url: `/categoria/${category.slug}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  return (
    <Catalog
      title={category.name}
      description={category.description ?? undefined}
      crumbs={[{ label: category.name }]}
      searchParams={await searchParams}
      basePath={`/categoria/${category.slug}`}
      defaultSort="relevancia"
      filters={{ categoryId: category.id }}
      emptyText="Ainda não há produtos nesta categoria."
    />
  );
}
