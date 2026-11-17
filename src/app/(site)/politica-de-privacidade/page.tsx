import type { Metadata } from "next";
import { LegalPage } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Política de privacidade", alternates: { canonical: "/politica-de-privacidade" } };
export const revalidate = 3600;

export default async function Page() {
  const s = await getSettings();
  return (
    <LegalPage title="Política de privacidade">
      <p>
        Esta política explica como o {s.site_name} trata informações dos visitantes, em conformidade com a Lei Geral de Proteção
        de Dados (Lei nº 13.709/2018 — LGPD).
      </p>
      <h2>Dados que coletamos</h2>
      <ul>
        <li>Não pedimos cadastro e não coletamos nome, e-mail ou dados de pagamento dos visitantes.</li>
        <li>
          Contabilizamos, de forma anônima, quantas vezes cada botão “Ver oferta” é clicado, apenas para saber quais produtos são
          mais populares. Nenhum dado pessoal é associado a esse número.
        </li>
        <li>
          Nossa hospedagem pode registrar dados técnicos de acesso (como endereço IP e navegador) em registros de segurança, pelo
          tempo exigido em lei.
        </li>
      </ul>
      <h2>Cookies</h2>
      <p>
        O site público não usa cookies de rastreamento próprios. Ao clicar em uma oferta, você é levado ao Mercado Livre, que usa
        seus próprios cookies — inclusive para identificar que a visita veio de um link de afiliado. Consulte a política de
        privacidade do Mercado Livre para saber mais.
      </p>
      <h2>Seus direitos</h2>
      <p>
        Você pode solicitar informações sobre o tratamento de dados a qualquer momento
        {s.contact_email ? (
          <>
            {" "}pelo e-mail <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a>
          </>
        ) : null}
        .
      </p>
    </LegalPage>
  );
}
