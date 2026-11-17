"use client";
import { createBrowserClient } from "@supabase/ssr";
import { SUPABASE_KEY, SUPABASE_URL } from "@/lib/env";

let browserClient: ReturnType<typeof createBrowserClient> | null = null;

/** Cliente do navegador (usado só no painel, para enviar imagens ao Storage). */
export function getBrowserClient() {
  if (!browserClient) browserClient = createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
  return browserClient;
}
