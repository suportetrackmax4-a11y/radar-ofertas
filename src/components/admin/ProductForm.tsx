"use client";

import Link from "next/link";
import { useActionState, useState, useTransition } from "react";
import { AlertCircle, Loader2, Save } from "lucide-react";
import { saveProduct, type FormState } from "@/app/admin/actions";
import { isAllowedAffiliateUrl } from "@/lib/affiliate";
import { formatDate, formatPrice } from "@/lib/format";
import { slugify } from "@/lib/slug";
import { parsePrice } from "@/lib/validation";
import { ImageManager } from "./ImageManager";

export type ProductFormValues = {
  id?: string;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  price: string;
  old_price: string;
  category_id: string;
  images: string[];
  affiliate_url: string;
  badge_label: string;
  is_featured: boolean;
  is_offer: boolean;
  is_active: boolean;
  price_checked_at?: string;
};

function FieldError({ msg }: { msg?: string }) {
  return msg ? <p className="mt-1 text-sm text-red-600">{msg}</p> : null;
}

function Toggle({ name, label, hint, defaultChecked }: { name: string; label: string; hint: string; defaultChecked: boolean }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-xl p-3 ring-1 ring-ink-100 transition hover:bg-ink-50">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
      <span className="relative mt-0.5 h-5 w-9 shrink-0 rounded-full bg-ink-200 transition peer-checked:bg-brand-600 peer-focus-visible:ring-4 peer-focus-visible:ring-brand-100 after:absolute after:left-0.5 after:top-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:shadow after:transition peer-checked:after:translate-x-4" />
      <span>
        <span className="block text-sm font-semibold text-ink-900">{label}</span>
        <span className="block text-xs text-ink-500">{hint}</span>
      </span>
    </label>
  );
}

export function ProductForm({ initial, categories }: { initial: ProductFormValues; categories: { id: string; name: string }[] }) {
  const [state, action, pending] = useActionState<FormState, FormData>(saveProduct, {});
  const [, startTransition] = useTransition();
  const [images, setImages] = useState<string[]>(initial.images);
  const [name, setName] = useState(initial.name);
  const [slug, setSlug] = useState(initial.slug);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [price, setPrice] = useState(initial.price);
  const [oldPrice, setOldPrice] = useState(initial.old_price);
  const [link, setLink] = useState(initial.affiliate_url);
  const e = state.errors ?? {};

  const p = parsePrice(price);
  const op = parsePrice(oldPrice);
  const discount = p && op && op > p ? Math.floor((1 - p / op) * 100) : 0;
  const linkWarning = link.trim() && !isAllowedAffiliateUrl(link.trim());

  return (
    <form
      // onSubmit (em vez de action) evita que o React limpe o formulário quando há erro de validação
      onSubmit={(ev) => {
        ev.preventDefault();
        const fd = new FormData(ev.currentTarget);
        startTransition(() => action(fd));
      }}
      className="grid gap-6 lg:grid-cols-[1fr_340px]"
      noValidate
    >
      {initial.id ? <input type="hidden" name="id" value={initial.id} /> : null}
      <input type="hidden" name="images" value={JSON.stringify(images)} />

      <div className="space-y-6">
        <section className="card space-y-4 p-5 sm:p-6">
          <h2 className="text-base font-bold text-ink-950">Informações do produto</h2>
          <div>
            <label htmlFor="name" className="label">Nome do produto *</label>
            <input
              id="name"
              name="name"
              required
              maxLength={160}
              value={name}
              onChange={(ev) => {
                setName(ev.target.value);
                if (!slugTouched) setSlug(slugify(ev.target.value));
              }}
              className="input"
              placeholder="Ex.: Fone de ouvido Bluetooth XYZ com cancelamento de ruído"
            />
            <FieldError msg={e.name} />
          </div>
          <div>
            <label htmlFor="slug" className="label">Endereço da página (URL)</label>
            <div className="flex items-center rounded-xl border border-ink-200 bg-ink-50 pl-3 text-sm text-ink-400 focus-within:border-brand-500 focus-within:ring-4 focus-within:ring-brand-100">
              <span className="shrink-0">/produto/</span>
              <input
                id="slug"
                name="slug"
                value={slug}
                maxLength={80}
                onChange={(ev) => {
                  setSlugTouched(true);
                  setSlug(slugify(ev.target.value));
                }}
                className="w-full rounded-r-xl bg-white px-2 py-2.5 text-ink-900 focus:outline-none"
              />
            </div>
            <p className="mt-1 text-xs text-ink-400">Gerado a partir do nome. Evite mudar depois de publicado (links antigos deixam de funcionar).</p>
          </div>
          <div>
            <label htmlFor="short_description" className="label">Descrição curta</label>
            <input id="short_description" name="short_description" maxLength={220} defaultValue={initial.short_description} className="input" placeholder="Aparece nos cards (até 220 caracteres)" />
            <FieldError msg={e.short_description} />
          </div>
          <div>
            <label htmlFor="description" className="label">Descrição detalhada</label>
            <textarea id="description" name="description" rows={8} maxLength={8000} defaultValue={initial.description} className="input resize-y" placeholder="Principais características, especificações, para quem é indicado… Separe parágrafos com uma linha em branco." />
            <FieldError msg={e.description} />
          </div>
        </section>

        <section className="card space-y-4 p-5 sm:p-6">
          <h2 className="text-base font-bold text-ink-950">Imagens</h2>
          <ImageManager value={images} onChange={setImages} />
          <FieldError msg={e.images} />
        </section>

        <section className="card space-y-4 p-5 sm:p-6">
          <h2 className="text-base font-bold text-ink-950">Preço e link de afiliado</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="price" className="label">Preço atual (R$) *</label>
              <input id="price" name="price" inputMode="decimal" required value={price} onChange={(ev) => setPrice(ev.target.value)} className="input" placeholder="1.299,90" />
              <FieldError msg={e.price} />
            </div>
            <div>
              <label htmlFor="old_price" className="label">Preço anterior (R$)</label>
              <input id="old_price" name="old_price" inputMode="decimal" value={oldPrice} onChange={(ev) => setOldPrice(ev.target.value)} className="input" placeholder="Deixe em branco se não houver" />
              <FieldError msg={e.old_price} />
            </div>
          </div>
          <p className="rounded-xl bg-ink-50 px-3 py-2 text-sm text-ink-600">
            {p && !Number.isNaN(p) ? (
              <>
                Exibição: <strong>{formatPrice(p)}</strong>
                {discount > 0 && op ? (
                  <> · de <s>{formatPrice(op)}</s> · <strong className="text-mint-700">{discount}% OFF</strong></>
                ) : null}
              </>
            ) : (
              "Digite o preço exatamente como aparece no Mercado Livre."
            )}
          </p>
          <label className="flex items-center gap-2 text-sm text-ink-700">
            <input type="checkbox" name="price_checked_today" defaultChecked={!initial.id} className="h-4 w-4 rounded accent-brand-600" />
            Conferi este preço hoje no Mercado Livre
            {initial.price_checked_at ? <span className="text-xs text-ink-400">(última conferência: {formatDate(initial.price_checked_at)})</span> : null}
          </label>
          <div>
            <label htmlFor="affiliate_url" className="label">Link de afiliado do Mercado Livre *</label>
            <input id="affiliate_url" name="affiliate_url" type="url" value={link} onChange={(ev) => setLink(ev.target.value)} className="input" placeholder="https://mercadolivre.com/sec/..." />
            {linkWarning ? (
              <p className="mt-1 flex items-center gap-1.5 text-sm text-flame-700"><AlertCircle className="h-4 w-4" /> O link precisa ser do Mercado Livre e começar com https://</p>
            ) : (
              <p className="mt-1 text-xs text-ink-400">Gere o link no Portal de Afiliados do Mercado Livre e cole aqui. Obrigatório para produtos ativos.</p>
            )}
            <FieldError msg={e.affiliate_url} />
          </div>
        </section>
      </div>

      <aside className="space-y-6 lg:sticky lg:top-6 lg:self-start">
        <section className="card space-y-4 p-5">
          <h2 className="text-base font-bold text-ink-950">Organização</h2>
          <div>
            <label htmlFor="category_id" className="label">Categoria</label>
            <select id="category_id" name="category_id" defaultValue={initial.category_id} className="input">
              <option value="">Sem categoria</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <FieldError msg={e.category_id} />
          </div>
          <div>
            <label htmlFor="badge_label" className="label">Selo personalizado</label>
            <input id="badge_label" name="badge_label" maxLength={30} defaultValue={initial.badge_label} className="input" placeholder="Ex.: Frete grátis, Mais vendido" />
            <p className="mt-1 text-xs text-ink-400">Use apenas informações verdadeiras exibidas no anúncio.</p>
          </div>
          <div className="space-y-2">
            <Toggle name="is_active" label="Ativo (visível no site)" hint="Desative para esconder sem excluir." defaultChecked={initial.is_active} />
            <Toggle name="is_featured" label="Destaque" hint="Aparece no banner e em “Produtos em destaque”." defaultChecked={initial.is_featured} />
            <Toggle name="is_offer" label="Oferta do dia" hint="Aparece em “Ofertas do dia”." defaultChecked={initial.is_offer} />
          </div>
        </section>

        {state.message ? (
          <p role="alert" className={`rounded-xl px-4 py-3 text-sm ring-1 ${state.ok ? "bg-mint-50 text-mint-700 ring-mint-500/20" : "bg-red-50 text-red-700 ring-red-100"}`}>
            {state.message}
          </p>
        ) : null}

        <div className="flex gap-3">
          <button type="submit" disabled={pending} className="btn-primary flex-1 py-3">
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {initial.id ? "Salvar alterações" : "Cadastrar produto"}
          </button>
          <Link href="/admin/produtos" className="btn-ghost py-3">Cancelar</Link>
        </div>
      </aside>
    </form>
  );
}
