import "server-only";
import { notFound, redirect } from "next/navigation";
import { connection } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getServiceClient } from "@/lib/supabase/service";
import { PANEL_ENABLED, isSupabaseConfigured } from "@/lib/env";

export type AdminContext = { supabase: SupabaseClient };

/**
 * Acesso ao painel. Não há usuário nem senha: o painel só existe no seu computador
 * (`npm run dev`) e usa a chave secreta do .env.local. No site publicado retorna null.
 */
export async function getAdmin(): Promise<AdminContext | null> {
  // Garante que as páginas do painel nunca sejam geradas estaticamente/cacheadas.
  await connection();
  if (!PANEL_ENABLED || !isSupabaseConfigured) return null;
  const service = getServiceClient();
  return service ? { supabase: service } : null;
}

/** Para páginas do painel: 404 no site publicado; tela de configuração se faltar a chave. */
export async function requireAdmin() {
  if (!PANEL_ENABLED) notFound();
  const admin = await getAdmin();
  if (!admin) redirect("/admin/configurar");
  return admin;
}
