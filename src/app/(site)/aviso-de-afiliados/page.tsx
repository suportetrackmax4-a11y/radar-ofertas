import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Aviso de afiliados", alternates: { canonical: "/aviso-de-afiliados" } };
export const revalidate = 300;

export default async function Page() {
  const s = await getSettings();
  return (
    <LegalPage title="Aviso de afiliados">
      <p>{s.affiliate_disclaimer}</p>
      <h2>Como funciona</h2>
      <p>
        O {s.site_name} é um site independente de curadoria de ofertas. Os botões “Ver oferta” levam você à página do produto no
        Mercado Livre por meio de um link de afiliado. Se você concluir uma compra, o Mercado Livre pode nos pagar uma comissão.
        <strong> Você não paga nada a mais por isso.</strong>
      </p>
      <h2>Preços e disponibilidade</h2>
      <p>
        Os preços exibidos aqui foram conferidos manualmente na data indicada em cada produto. Como os valores, estoques, frete e
        condições de pagamento são definidos pelos vendedores do Mercado Livre e podem mudar a qualquer momento, o preço válido é
        sempre o exibido no Mercado Livre no momento da compra.
      </p>
      <p>
        Descontos só são exibidos quando há um preço anterior cadastrado e o preço foi conferido recentemente
        (até {s.price_stale_days} dias). Depois desse prazo, mostramos o aviso para conferir o valor atualizado.
      </p>
      <h2>Sem vínculo oficial</h2>
      <p>
        Este site não é operado, patrocinado ou endossado pelo Mercado Livre. A compra, o pagamento, a entrega, as trocas e a
        garantia são de responsabilidade do Mercado Livre e de seus vendedores, conforme as regras daquela plataforma.
      </p>
    </LegalPage>
  );
}
