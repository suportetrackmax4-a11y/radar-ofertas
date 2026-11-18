# Radar de Ofertas — site de afiliados do Mercado Livre

Site de curadoria de ofertas com painel administrativo. Os produtos, preços, imagens e links de afiliado são cadastrados por você no painel e ficam salvos no banco (Supabase).

## Tecnologias

| Camada | Escolha | Por quê |
|---|---|---|
| Front-end | **Next.js 16** (App Router) + **React 19** + **TypeScript** | Renderização no servidor e páginas em cache (ISR): rápido e bom para o Google |
| Estilo | **Tailwind CSS 4** | Identidade visual própria (roxo/coral), responsiva |
| Banco | **Supabase (PostgreSQL)** | Dados persistentes, regras de segurança (RLS) no próprio banco |
| Login | **Supabase Auth** | E-mail e senha, sessão em cookie seguro |
| Imagens | **Supabase Storage** + `next/image` | Fotos são convertidas para WebP no envio e otimizadas na exibição |

> O modo experimental *Cache Components* do Next 16 foi desativado de propósito: o modelo clássico (ISR + revalidação) é mais simples e estável para este projeto.

## Estrutura

```
supabase/schema.sql        → tabelas, segurança (RLS), bucket de imagens e categorias iniciais
src/app/(site)/            → site público: início, busca, categoria, produto, ofertas, páginas legais
src/app/admin/             → painel: login, visão geral, produtos, categorias, configurações
src/app/admin/actions.ts   → todas as gravações (validadas e só para administradores)
src/app/ir/[slug]/         → redireciona para o link de afiliado e conta o clique
src/app/sitemap.ts, robots.ts, opengraph-image.tsx → SEO
src/lib/                   → acesso a dados, validação, formatação, Supabase
src/components/            → componentes do site e do painel
```

## 1. Configurar o Supabase (uma vez)

1. Crie uma conta e um projeto em https://supabase.com (plano gratuito serve para começar).
2. No projeto: **SQL Editor → New query**, cole todo o conteúdo de `supabase/schema.sql` e clique em **Run**.
3. **Project Settings → API Keys**: copie a *Project URL* e a chave **publishable** (ou a `anon` legada) para o `.env.local` (seção 2) ou para as variáveis da Vercel (seção 4).
   ⚠️ Não use a chave secreta / `service_role` — o projeto não precisa dela.
4. **Criar seu usuário e senha:** abra `/admin/login` no site e use a aba **Criar conta**. A primeira conta criada vira administradora; depois disso, a opção de cadastro some da tela.
   - Se o Supabase pedir confirmação de e-mail, clique no link que chegar e depois entre com seu e-mail e senha.
   - Para pular a confirmação: **Authentication → Sign In / Providers → Email** → desative *Confirm email*.
5. **Depois de criar sua conta**, por segurança: **Authentication → Sign In / Providers** → desative **"Allow new users to sign up"**. (Mesmo sem isso, outras contas não conseguem acessar o painel, mas assim ninguém cria contas inúteis.)

> Alternativa: criar o usuário em **Authentication → Users → Add user** e rodar no SQL Editor
> `insert into public.admins (user_id) select id from auth.users where email = 'SEU-EMAIL';`
>
> Já rodou uma versão antiga do `schema.sql`? Rode o arquivo de novo — ele é seguro para repetir e não apaga dados.

## 2. Rodar no seu computador

Requisitos: Node.js 20.9 ou mais novo.

```bash
cd radar-ofertas
copy .env.example .env.local     # no Windows (ou: cp .env.example .env.local)
# edite .env.local com a URL e a chave do Supabase
npm install
npm run dev
```

- Site: http://localhost:3000
- Painel: http://localhost:3000/admin

### Painel sem senha (só no seu computador)

Com `npm run dev`, o painel abre **direto, sem login**, desde que o `.env.local` tenha a chave secreta:

```
SUPABASE_SECRET_KEY=sb_secret_...   # Project Settings → API Keys → Secret keys
```

- Essa chave dá acesso total ao banco: **não compartilhe, não envie ao GitHub** (o `.env.local` já é ignorado) e **não cadastre na Vercel**.
- No site publicado (`npm run build` / Vercel) esse modo **não existe**: o painel sempre pede login. Para criar seu acesso online, use a aba **Criar conta** em `/admin/login` (seção 1, passo 4).

> Dica: a pasta está dentro do OneDrive. Se o `npm install` ou o `npm run dev` ficarem lentos, pause a sincronização ou mova o projeto para fora do OneDrive (ex.: `C:\projetos`).

## 3. Usar o painel

- **Produtos → Novo produto**: nome, descrições, fotos (envio ou URL), preço atual, preço anterior, **link de afiliado**, categoria, selo, e os botões *Ativo*, *Destaque*, *Oferta do dia*.
- **Link de afiliado**: gere no Portal de Afiliados do Mercado Livre e cole no campo. O sistema só aceita links `https` dos domínios do Mercado Livre (`mercadolivre.com.br`, `mercadolivre.com`, `mercadolibre.com`, `meli.la`). Produto sem link não pode ficar ativo.
- **Ordem de exibição**: setas ↑ ↓ na lista de produtos (com os filtros limpos).
- **Preço conferido**: cada produto guarda a data em que o preço foi conferido. Depois do prazo definido em *Configurações* (padrão 7 dias), o site **esconde o desconto** e pede para o visitante conferir o preço no Mercado Livre. Use o ícone de calendário na lista para confirmar o preço do dia.
- **Categorias**: criar, editar, ocultar, ordenar, escolher ícone.
- **Configurações**: nome do site, slogan, textos do banner, descrição para o Google, aviso de afiliados, e-mail e redes sociais.

“Mais populares” na página inicial usa a contagem de cliques no botão “Ver oferta” (robôs são ignorados).

## 4. Publicar na internet (Vercel — recomendado)

1. Crie um repositório no GitHub e envie a pasta `radar-ofertas`.
2. Em https://vercel.com → **Add New → Project** → importe o repositório.
3. Em **Environment Variables**, cadastre:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
   - `NEXT_PUBLIC_SITE_URL` → o endereço final, ex.: `https://www.seudominio.com.br`
4. **Deploy**. Depois, em **Settings → Domains**, conecte seu domínio.
5. No Supabase, **Authentication → URL Configuration**: coloque o endereço do site em *Site URL*.
6. No Google Search Console, adicione o site e envie `https://seudominio/sitemap.xml`.

Funciona também em qualquer hospedagem Node (`npm run build` e `npm start`).

## Segurança

- Painel protegido em três camadas: proxy (redireciona quem não está logado), verificação no servidor em cada página e ação (usuário precisa estar na tabela `admins`) e regras RLS no banco (visitantes só leem produtos ativos; só admins gravam).
- Nenhuma chave secreta no projeto. Cadastro público de usuários deve ficar desativado (passo 1.3).
- Cabeçalhos de segurança (HSTS, X-Frame-Options, nosniff), painel com `noindex`.
- Links de compra com `rel="sponsored nofollow"`, como o Google recomenda para links de afiliado.

## Regras do programa de afiliados — lembretes

- Mantenha o aviso de afiliados visível (já aparece no rodapé, nas listagens e em cada produto).
- Não anuncie preço, desconto ou selo que não esteja no anúncio. Confira os preços com frequência.
- Não use logotipo ou identidade do Mercado Livre como se o site fosse oficial (o site já informa que é independente).
- Leia os termos atuais do programa no Portal de Afiliados, pois podem mudar.
