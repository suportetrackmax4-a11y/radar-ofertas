import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage } from "@/components/site/LegalPage";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = { title: "Sobre o site", alternates: { canonical: "/sobre" } };
export const revalidate = 3600;

export default async function Page() {
  const s = await getSettings();
  return (
    <LegalPage title={`Sobre o ${s.site_name}`}>
      <p>
        O {s.site_name} nasceu para facilitar a vida de quem quer comprar bem: garimpamos produtos no Mercado Livre, conferimos os
        preços e organizamos tudo por categoria, para você encontrar boas oportunidades sem perder tempo.
      </p>
      <h2>Nosso compromisso</h2>
      <ul>
        <li>Todos os produtos são escolhidos e cadastrados manualmente.</li>
        <li>Mostramos a data em que cada preço foi conferido.</li>
        <li>Não inventamos descontos: eles só aparecem quando há um preço anterior registrado.</li>
        <li>A compra acontece sempre no Mercado Livre, com toda a segurança da plataforma.</li>
      </ul>
      <h2>Transparência</h2>
      <p>
        Participamos do Programa de Afiliados do Mercado Livre e podemos receber comissão pelas compras feitas a partir dos nossos
        links. Saiba mais no <Link href="/aviso-de-afiliados">aviso de afiliados</Link>.
      </p>
      {s.contact_email ? (
        <>
          <h2>Contato</h2>
          <p>
            Fale com a gente pelo e-mail <a href={`mailto:${s.contact_email}`}>{s.contact_email}</a>.
          </p>
        </>
      ) : null}
    </LegalPage>
  );
}
