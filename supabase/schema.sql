-- =====================================================================
-- Radar de Ofertas — schema do banco (Supabase / PostgreSQL)
-- Execute este arquivo inteiro no Supabase: Dashboard > SQL Editor > New query.
-- É idempotente: pode ser executado novamente sem perder dados.
-- =====================================================================

create extension if not exists unaccent with schema extensions;

-- ---------------------------------------------------------------------
-- Administradores (quem pode usar o painel)
-- ---------------------------------------------------------------------
create table if not exists public.admins (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.admins enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (select 1 from public.admins a where a.user_id = auth.uid());
$$;

revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

drop policy if exists "admins_select_self" on public.admins;
create policy "admins_select_self" on public.admins
  for select to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- Função utilitária: updated_at automático
-- ---------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- Categorias
-- ---------------------------------------------------------------------
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 60),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  description text check (char_length(description) <= 300),
  icon text not null default 'tag',
  sort_order integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists categories_updated_at on public.categories;
create trigger categories_updated_at before update on public.categories
  for each row execute function public.set_updated_at();

alter table public.categories enable row level security;

drop policy if exists "categories_public_read" on public.categories;
create policy "categories_public_read" on public.categories
  for select to anon, authenticated
  using (is_active or public.is_admin());

drop policy if exists "categories_admin_write" on public.categories;
create policy "categories_admin_write" on public.categories
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---------------------------------------------------------------------
-- Produtos
-- ---------------------------------------------------------------------
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name text not null check (char_length(name) between 3 and 160),
  short_description text check (char_length(short_description) <= 220),
  description text check (char_length(description) <= 8000),
  price numeric(12, 2) not null check (price > 0),
  old_price numeric(12, 2) check (old_price is null or old_price > price),
  category_id uuid references public.categories (id) on delete set null,
  images text[] not null default '{}',
  affiliate_url text check (affiliate_url is null or affiliate_url ~ '^https://'),
  badge_label text check (char_length(badge_label) <= 30),
  is_featured boolean not null default false,
  is_offer boolean not null default false,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  clicks integer not null default 0,
  price_checked_at timestamptz not null default now(),
  search_text text,
  discount_pct integer generated always as (
    case when old_price is not null and old_price > price
      then floor((1 - price / old_price) * 100)::integer else 0 end
  ) stored,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint active_requires_link check (not is_active or affiliate_url is not null)
);

create index if not exists products_active_order_idx on public.products (is_active, sort_order, created_at desc);
create index if not exists products_category_idx on public.products (category_id);
create index if not exists products_featured_idx on public.products (is_featured) where is_featured;
create index if not exists products_offer_idx on public.products (is_offer) where is_offer;
create index if not exists products_clicks_idx on public.products (clicks desc);
create index if not exists products_discount_idx on public.products (discount_pct desc);

-- Texto de busca sem acentos e em minúsculas (mantido automaticamente)
create or replace function public.products_search_text()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.search_text = lower(extensions.unaccent(coalesce(new.name, '') || ' ' || coalesce(new.short_description, '')));
  return new;
end;
$$;

drop trigger if exists products_search_text on public.products;
create trigger products_search_text before insert or update of name, short_description on public.products
  for each row execute function public.products_search_text();

drop trigger if exists products_updated_at on public.products;
create trigger products_updated_at before update on public.products
  for each row execute function public.set_updated_at();

alter table public.products enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select to anon, authenticated
  using (is_active or public.is_admin());

drop policy if exists "products_admin_write" on public.products;
create policy "products_admin_write" on public.products
  for all to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- Contador de cliques (visitantes podem incrementar, mas não editar nada)
create or replace function public.register_click(p_slug text)
returns void
language sql
security definer
set search_path = ''
as $$
  update public.products set clicks = clicks + 1 where slug = p_slug and is_active;
$$;

revoke all on function public.register_click(text) from public;
grant execute on function public.register_click(text) to anon, authenticated;

-- Reordenação em lote (somente administradores)
create or replace function public.reorder_products(p_ids uuid[])
returns void
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'not allowed';
  end if;
  update public.products p
     set sort_order = o.pos * 10
    from unnest(p_ids) with ordinality as o(id, pos)
   where p.id = o.id;
end;
$$;

revoke all on function public.reorder_products(uuid[]) from public;
grant execute on function public.reorder_products(uuid[]) to authenticated;

-- ---------------------------------------------------------------------
-- Configurações do site (linha única, id = 1)
-- ---------------------------------------------------------------------
create table if not exists public.site_settings (
  id smallint primary key default 1 check (id = 1),
  site_name text not null default 'Radar de Ofertas',
  tagline text not null default 'Achados selecionados do Mercado Livre',
  seo_description text not null default 'Seleção de produtos e ofertas do Mercado Livre, organizados por categoria, com preços conferidos.',
  hero_title text not null default 'As melhores ofertas, sem perder tempo procurando',
  hero_subtitle text not null default 'Selecionamos produtos do Mercado Livre e conferimos os preços para você comprar com mais segurança.',
  affiliate_disclaimer text not null default 'Este site participa do Programa de Afiliados do Mercado Livre. Ao comprar pelos nossos links, podemos receber uma comissão, sem custo adicional para você. Preços e disponibilidade podem mudar a qualquer momento no Mercado Livre.',
  price_stale_days integer not null default 7 check (price_stale_days between 1 and 90),
  contact_email text,
  instagram_url text,
  telegram_url text,
  whatsapp_url text,
  updated_at timestamptz not null default now()
);

drop trigger if exists site_settings_updated_at on public.site_settings;
create trigger site_settings_updated_at before update on public.site_settings
  for each row execute function public.set_updated_at();

alter table public.site_settings enable row level security;

drop policy if exists "settings_public_read" on public.site_settings;
create policy "settings_public_read" on public.site_settings
  for select to anon, authenticated using (true);

drop policy if exists "settings_admin_update" on public.site_settings;
create policy "settings_admin_update" on public.site_settings
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.site_settings (id) values (1) on conflict (id) do nothing;

-- ---------------------------------------------------------------------
-- Categorias iniciais (somente categorias; nenhum produto fictício)
-- ---------------------------------------------------------------------
insert into public.categories (name, slug, icon, sort_order, description) values
  ('Eletrônicos', 'eletronicos', 'tv', 10, 'TVs, áudio, fones e gadgets.'),
  ('Informática', 'informatica', 'laptop', 20, 'Notebooks, periféricos e componentes.'),
  ('Celulares e acessórios', 'celulares-e-acessorios', 'smartphone', 30, 'Smartphones, capas, carregadores e mais.'),
  ('Casa e decoração', 'casa-e-decoracao', 'sofa', 40, 'Móveis, decoração e organização.'),
  ('Eletrodomésticos', 'eletrodomesticos', 'refrigerator', 50, 'Cozinha, limpeza e climatização.'),
  ('Games', 'games', 'gamepad', 60, 'Consoles, jogos e acessórios.'),
  ('Ferramentas', 'ferramentas', 'wrench', 70, 'Ferramentas manuais, elétricas e construção.'),
  ('Moda', 'moda', 'shirt', 80, 'Roupas, calçados e acessórios.'),
  ('Esportes', 'esportes', 'dumbbell', 90, 'Fitness, ciclismo e aventura.'),
  ('Outros', 'outros', 'tag', 100, 'Achados diversos.')
on conflict (slug) do nothing;

-- ---------------------------------------------------------------------
-- Storage: bucket público para imagens dos produtos
-- ---------------------------------------------------------------------
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', true, 5242880, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "product_images_admin_insert" on storage.objects;
create policy "product_images_admin_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_update" on storage.objects;
create policy "product_images_admin_update" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

drop policy if exists "product_images_admin_delete" on storage.objects;
create policy "product_images_admin_delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and public.is_admin());

-- =====================================================================
-- DEPOIS de criar seu usuário em Authentication > Users, torne-o admin:
--
--   insert into public.admins (user_id)
--   select id from auth.users where email = 'SEU-EMAIL@exemplo.com';
-- =====================================================================
