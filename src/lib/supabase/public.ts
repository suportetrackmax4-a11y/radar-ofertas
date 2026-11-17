import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL, isSupabaseConfigured } from "@/lib/env";

let client: SupabaseClient | null = null;

/**
 * Cliente sem cookies para leituras públicas. Não depende da requisição,
 * então as páginas públicas podem ser geradas estaticamente (ISR).
 */
export function getPublicClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}
