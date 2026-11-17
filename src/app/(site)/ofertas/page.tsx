import type { Metadata } from "next";
import { Catalog, type RawSearchParams } from "@/components/site/Catalog";

export const metadata: Metadata = {
  title: "Ofertas do dia",
  description: "Produtos do Mercado Livre em oferta, com preços conferidos e ordenados pelos maiores descontos.",
  alternates: { canonical: "/ofertas" },
};

export default async function OffersPage({ searchParams }: { searchParams: Promise<RawSearchParams> }) {
  return (
    <Catalog
      title="Ofertas do dia"
      description="Selecionamos os produtos com os melhores preços que encontramos. Os valores são conferidos periodicamente."
      crumbs={[{ label: "Ofertas do dia" }]}
      searchParams={await searchParams}
      basePath="/ofertas"
      defaultSort="maior-desconto"
      showCategoryFilter={false}
      filters={{ offer: true }}
      emptyText="Nenhuma oferta ativa no momento. Volte em breve!"
    />
  );
}
