import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Termos de uso", alternates: { canonical: "/termos-de-uso" } };
export const revalidate = 300;

export default async function Page() {
  const s = await getSettings();
  return (
    <LegalPage title="Termos de uso">
      <p>Ao usar o {s.site_name}, você concorda com os termos abaixo.</p>
      <h2>1. Natureza do serviço</h2>
      <p>
        O {s.site_name} é um site de divulgação de produtos. Não vendemos produtos, não processamos pagamentos e não realizamos
        entregas. Todas as compras são feitas diretamente no Mercado Livre.
      </p>
      <h2>2. Informações exibidas</h2>
      <p>
        Fazemos o possível para manter preços e descrições corretos, mas eles podem mudar sem aviso. O preço, o frete e as
        condições válidas são sempre os exibidos no Mercado Livre no momento da compra.
      </p>
      <h2>3. Links de afiliado</h2>
      <p>
        Os links de compra são links de afiliado. Veja o <Link href="/aviso-de-afiliados">aviso de afiliados</Link>.
      </p>
      <h2>4. Responsabilidade</h2>
      <p>
        Questões sobre pedidos, entregas, trocas, devoluções e garantia devem ser tratadas com o vendedor e com o Mercado Livre,
        conforme as regras daquela plataforma.
      </p>
      <h2>5. Propriedade intelectual</h2>
      <p>
        Nomes de produtos, marcas e imagens pertencem aos seus respectivos titulares e são usados apenas para identificar os
        produtos divulgados.
      </p>
    </LegalPage>
  );
}
