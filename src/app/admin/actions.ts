"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getAdmin } from "@/lib/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getPublicClient } from "@/lib/supabase/public";
import { IMAGE_BUCKET, isSupabaseConfigured } from "@/lib/env";
import { slugify } from "@/lib/slug";
import { categorySchema, firstErrors, parsePrice, productSchema, settingsSchema } from "@/lib/validation";
import type { ActionResult } from "@/lib/types";

export type FormState = { ok?: boolean; message?: string; errors?: Record<string, string> };

const NOT_ALLOWED = "Sessão expirada ou sem permissão. Entre novamente.";

function friendlyDbError(error: { code?: string; message: string }): string {
  if (error.code === "23505") return "Já existe um registro com esse endereço (slug). Escolha outro.";
  if (error.message.includes("active_requires_link")) return "Produtos ativos precisam de um link de afiliado.";
  if (error.code === "42501") return NOT_ALLOWED;
  console.error("[admin]", error);
  return "Não foi possível salvar. Tente novamente.";
}

function refreshSite() {
  revalidatePath("/", "layout");
}

const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";
const str = (fd: FormData, key: string) => String(fd.get(key) ?? "");

async function uniqueSlug(db: SupabaseClient, table: "products" | "categories", wanted: string, ignoreId?: string) {
  const base = slugify(wanted) || `item-${Date.now().toString(36)}`;
  const { data } = await db.from(table).select("id, slug").like("slug", `${base}%`).limit(200);
  const taken = new Set((data ?? []).filter((r) => r.id !== ignoreId).map((r) => r.slug));
  if (!taken.has(base)) return base;
  for (let i = 2; i < 500; i++) {
    const candidate = `${base}-${i}`;
    if (!taken.has(candidate)) return candidate;
  }
  return `${base}-${Date.now().toString(36)}`;
}

/** Remove do Storage as imagens que foram enviadas para o bucket do site. */
async function removeStoredImages(db: SupabaseClient, urls: string[]) {
  const marker = `/storage/v1/object/public/${IMAGE_BUCKET}/`;
  const paths = urls.filter((u) => u.includes(marker)).map((u) => decodeURIComponent(u.split(marker)[1]));
  if (paths.length) {
    const { error } = await db.storage.from(IMAGE_BUCKET).remove(paths);
    if (error) console.error("[admin:storage]", error);
  }
}

/* ------------------------------------------------------------------ */
/* Autenticação                                                        */
/* ------------------------------------------------------------------ */

export async function login(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { message: "Configure o Supabase no arquivo .env.local antes de entrar." };
  const email = str(fd, "email").trim().toLowerCase();
  const password = str(fd, "password");
  if (!email || !password) return { message: "Informe e-mail e senha." };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) {
    const msg = (error?.message ?? "").toLowerCase();
    if (msg.includes("rate") || error?.status === 429) return { message: "Muitas tentativas. Aguarde alguns minutos." };
    if (msg.includes("not confirmed")) return { message: "Confirme seu e-mail antes de entrar." };
    return { message: "E-mail ou senha incorretos." };
  }

  const { data: adminRow } = await supabase.from("admins").select("user_id").eq("user_id", data.user.id).maybeSingle();
  if (!adminRow) {
    // Primeiro acesso: se ainda não existe nenhum administrador, esta conta assume.
    const { data: claimed } = await supabase.rpc("claim_first_admin");
    if (claimed !== true) {
      await supabase.auth.signOut();
      return { message: "Este usuário não tem acesso ao painel." };
    }
  }
  redirect("/admin");
}

/** Cria a primeira conta de administrador. Só funciona enquanto não houver nenhum admin. */
export async function registerFirstAdmin(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!isSupabaseConfigured) return { message: "Conecte o Supabase antes de criar a conta (veja o README)." };
  if (await adminExists()) return { message: "Já existe um administrador. Use a opção Entrar." };

  const email = str(fd, "email").trim().toLowerCase();
  const password = str(fd, "password");
  const confirm = str(fd, "confirm");
  const errors: Record<string, string> = {};
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = "Informe um e-mail válido.";
  if (password.length < 8) errors.password = "A senha precisa ter pelo menos 8 caracteres.";
  else if (!/[a-zA-Z]/.test(password) || !/[0-9]/.test(password)) errors.password = "Use letras e números na senha.";
  if (password !== confirm) errors.confirm = "As senhas não são iguais.";
  if (Object.keys(errors).length) return { errors };

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) {
    const msg = error.message.toLowerCase();
    if (msg.includes("signups not allowed") || msg.includes("signup is disabled"))
      return { message: "O cadastro está desativado no Supabase. Ative em Authentication > Sign In / Providers > Allow new users to sign up." };
    if (msg.includes("already registered")) return { message: "Este e-mail já tem conta. Use a opção Entrar." };
    if (msg.includes("password")) return { errors: { password: error.message } };
    if (error.status === 429) return { message: "Muitas tentativas. Aguarde alguns minutos." };
    console.error("[admin:signup]", error);
    return { message: "Não foi possível criar a conta. Tente novamente." };
  }

  if (!data.session) {
    // Confirmação de e-mail ativada no Supabase: o acesso é liberado no primeiro login.
    return {
      ok: true,
      message: "Conta criada! Abra o e-mail de confirmação que o Supabase enviou, clique no link e depois entre com seu e-mail e senha.",
    };
  }

  const { data: claimed } = await supabase.rpc("claim_first_admin");
  if (claimed !== true) {
    await supabase.auth.signOut();
    return { message: "Outro administrador foi criado antes. Peça acesso a ele." };
  }
  redirect("/admin");
}

export async function adminExists(): Promise<boolean> {
  const db = getPublicClient();
  if (!db) return false;
  const { data, error } = await db.rpc("admin_exists");
  if (error) {
    console.error("[admin:admin_exists]", error);
    return true; // na dúvida, não oferece cadastro
  }
  return data === true;
}

export async function logout() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* ------------------------------------------------------------------ */
/* Produtos                                                            */
/* ------------------------------------------------------------------ */

export async function saveProduct(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await getAdmin();
  if (!admin) return { message: NOT_ALLOWED };
  const db = admin.supabase;
  const id = str(fd, "id");

  let images: unknown = [];
  try {
    images = JSON.parse(str(fd, "images") || "[]");
  } catch {
    images = [];
  }

  const priceRaw = parsePrice(str(fd, "price"));
  const oldPriceRaw = parsePrice(str(fd, "old_price"));
  if (Number.isNaN(priceRaw)) return { errors: { price: "Preço inválido. Exemplo: 1.299,90" } };
  if (Number.isNaN(oldPriceRaw)) return { errors: { old_price: "Preço anterior inválido. Exemplo: 1.499,90" } };

  const parsed = productSchema.safeParse({
    name: str(fd, "name"),
    slug: str(fd, "slug"),
    short_description: str(fd, "short_description"),
    description: str(fd, "description"),
    price: priceRaw ?? undefined,
    old_price: oldPriceRaw,
    category_id: str(fd, "category_id"),
    images,
    affiliate_url: str(fd, "affiliate_url"),
    badge_label: str(fd, "badge_label"),
    is_featured: bool(fd, "is_featured"),
    is_offer: bool(fd, "is_offer"),
    is_active: bool(fd, "is_active"),
    price_checked_today: bool(fd, "price_checked_today"),
  });
  if (!parsed.success) return { errors: firstErrors(parsed.error), message: "Revise os campos destacados." };

  const { price_checked_today, slug: wantedSlug, ...values } = parsed.data;

  let previous: { price: number; old_price: number | null; images: string[] } | null = null;
  if (id) {
    const { data } = await db.from("products").select("price, old_price, images").eq("id", id).maybeSingle();
    if (!data) return { message: "Produto não encontrado." };
    previous = data;
  }

  const slug = await uniqueSlug(db, "products", wantedSlug || values.name, id || undefined);
  const priceChanged =
    !previous || Number(previous.price) !== values.price || (previous.old_price == null ? null : Number(previous.old_price)) !== values.old_price;

  const row: Record<string, unknown> = { ...values, slug };
  if (price_checked_today || priceChanged) row.price_checked_at = new Date().toISOString();

  if (id) {
    const { error } = await db.from("products").update(row).eq("id", id);
    if (error) return { message: friendlyDbError(error) };
    const removed = (previous?.images ?? []).filter((u) => !values.images.includes(u));
    await removeStoredImages(db, removed);
  } else {
    const { data: top } = await db.from("products").select("sort_order").order("sort_order").limit(1).maybeSingle();
    row.sort_order = (top?.sort_order ?? 10) - 10;
    const { error } = await db.from("products").insert(row);
    if (error) return { message: friendlyDbError(error) };
  }

  refreshSite();
  redirect(`/admin/produtos?salvo=${encodeURIComponent(values.name.slice(0, 60))}`);
}

const IMAGE_TYPES: Record<string, string> = { "image/webp": "webp", "image/jpeg": "jpg", "image/png": "png", "image/avif": "avif" };

/** Envia uma imagem (já comprimida no navegador) para o Storage e devolve a URL pública. */
export async function uploadProductImage(fd: FormData): Promise<{ ok: true; url: string } | { ok: false; error: string }> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const file = fd.get("file");
  if (!(file instanceof File)) return { ok: false, error: "Arquivo não recebido" };
  const ext = IMAGE_TYPES[file.type];
  if (!ext) return { ok: false, error: "Formato não suportado (use JPG, PNG, WebP ou AVIF)" };
  if (file.size > 5 * 1024 * 1024) return { ok: false, error: "Imagem muito grande (máx. 5 MB)" };
  const path = `products/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const storage = admin.supabase.storage.from(IMAGE_BUCKET);
  const { error } = await storage.upload(path, file, { contentType: file.type, cacheControl: "31536000", upsert: false });
  if (error) {
    console.error("[admin:upload]", error);
    return { ok: false, error: error.message };
  }
  return { ok: true, url: storage.getPublicUrl(path).data.publicUrl };
}

const TOGGLE_FIELDS =["is_active", "is_featured", "is_offer"] as const;
type ToggleField = (typeof TOGGLE_FIELDS)[number];

export async function toggleProduct(id: string, field: ToggleField, value: boolean): Promise<ActionResult> {
  if (!TOGGLE_FIELDS.includes(field)) return { ok: false, error: "Campo inválido" };
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const { error } = await admin.supabase.from("products").update({ [field]: Boolean(value) }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  refreshSite();
  return { ok: true };
}

export async function markPriceChecked(id: string): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const { error } = await admin.supabase.from("products").update({ price_checked_at: new Date().toISOString() }).eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  refreshSite();
  return { ok: true };
}

export async function deleteProduct(id: string): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const { data } = await admin.supabase.from("products").select("images").eq("id", id).maybeSingle();
  const { error } = await admin.supabase.from("products").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  if (data?.images?.length) await removeStoredImages(admin.supabase, data.images);
  refreshSite();
  return { ok: true };
}

export async function reorderProducts(ids: string[]): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const clean = ids.filter((v) => /^[0-9a-f-]{36}$/i.test(v)).slice(0, 5000);
  const { error } = await admin.supabase.rpc("reorder_products", { p_ids: clean });
  if (error) return { ok: false, error: friendlyDbError(error) };
  refreshSite();
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Categorias                                                          */
/* ------------------------------------------------------------------ */

export async function saveCategory(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await getAdmin();
  if (!admin) return { message: NOT_ALLOWED };
  const parsed = categorySchema.safeParse({
    id: str(fd, "id"),
    name: str(fd, "name"),
    slug: str(fd, "slug"),
    description: str(fd, "description"),
    icon: str(fd, "icon"),
    sort_order: str(fd, "sort_order") || "0",
    is_active: bool(fd, "is_active"),
  });
  if (!parsed.success) return { errors: firstErrors(parsed.error), message: "Revise os campos." };
  const { id, slug: wanted, ...values } = parsed.data;
  const slug = await uniqueSlug(admin.supabase, "categories", wanted || values.name, id || undefined);

  const { error } = id
    ? await admin.supabase.from("categories").update({ ...values, slug }).eq("id", id)
    : await admin.supabase.from("categories").insert({ ...values, slug });
  if (error) return { message: friendlyDbError(error) };
  refreshSite();
  return { ok: true, message: id ? "Categoria atualizada." : "Categoria criada." };
}

export async function deleteCategory(id: string): Promise<ActionResult> {
  const admin = await getAdmin();
  if (!admin) return { ok: false, error: NOT_ALLOWED };
  const { error } = await admin.supabase.from("categories").delete().eq("id", id);
  if (error) return { ok: false, error: friendlyDbError(error) };
  refreshSite();
  return { ok: true };
}

/* ------------------------------------------------------------------ */
/* Configurações                                                       */
/* ------------------------------------------------------------------ */

export async function saveSettings(_prev: FormState, fd: FormData): Promise<FormState> {
  const admin = await getAdmin();
  if (!admin) return { message: NOT_ALLOWED };
  const keys = Object.keys(settingsSchema.shape) as (keyof typeof settingsSchema.shape)[];
  const parsed = settingsSchema.safeParse(Object.fromEntries(keys.map((k) => [k, str(fd, k)])));
  if (!parsed.success) return { errors: firstErrors(parsed.error), message: "Revise os campos destacados." };
  const { error } = await admin.supabase.from("site_settings").update(parsed.data).eq("id", 1);
  if (error) return { message: friendlyDbError(error) };
  refreshSite();
  return { ok: true, message: "Configurações salvas." };
}
