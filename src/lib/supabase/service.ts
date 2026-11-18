import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_URL } from "@/lib/env";

/** Chave secreta do Supabase. Só é usada pelo painel, que roda apenas no seu computador (npm run dev). Nunca vai para o navegador. */
const SECRET_KEY = process.env.SUPABASE_SECRET_KEY ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const hasSecretKey = Boolean(SUPABASE_URL && SECRET_KEY);

let client: SupabaseClient | null = null;

export function getServiceClient(): SupabaseClient | null {
  if (!hasSecretKey) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SECRET_KEY, { auth: { persistSession: false, autoRefreshToken: false } });
  }
  return client;
}
