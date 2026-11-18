import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { getServiceClient } from "@/lib/supabase/service";
import { LOCAL_NO_LOGIN, isSupabaseConfigured } from "@/lib/env";

export type AdminContext = { supabase: SupabaseClient; email: string; localMode: boolean };

/**
 * Retorna o contexto do administrador, ou null se não autorizado.
 * - Modo local (npm run dev): sem login, usando a chave secreta do .env.local.
 * - Produção: confere a sessão no servidor de autenticação (getUser) e a tabela `admins`.
 */
export async function getAdmin(): Promise<AdminContext | null> {
  // Garante que as páginas do painel nunca sejam geradas estaticamente/cacheadas.
  await connection();
  if (!isSupabaseConfigured) return null;

  if (LOCAL_NO_LOGIN) {
    const service = getServiceClient();
    return service ? { supabase: service, email: "Modo local (sem senha)", localMode: true } : null;
  }

  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: row } = await supabase.from("admins").select("user_id").eq("user_id", auth.user.id).maybeSingle();
  if (!row) return null;
  return { supabase, email: auth.user.email ?? "", localMode: false };
}

/** Para páginas do painel: redireciona ao login quando não autorizado. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
