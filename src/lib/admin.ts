import "server-only";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";

/**
 * Verifica a sessão diretamente no servidor de autenticação (getUser) e confirma
 * que o usuário está na tabela `admins`. Retorna null se não for administrador.
 */
export async function getAdmin() {
  // Garante que as páginas do painel nunca sejam geradas estaticamente/cacheadas.
  await connection();
  if (!isSupabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: row } = await supabase.from("admins").select("user_id").eq("user_id", auth.user.id).maybeSingle();
  if (!row) return null;
  return { supabase, user: auth.user };
}

/** Para páginas do painel: redireciona ao login quando não autorizado. */
export async function requireAdmin() {
  const admin = await getAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}
