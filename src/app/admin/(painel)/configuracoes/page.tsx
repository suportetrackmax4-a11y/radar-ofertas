import { requireAdmin } from "@/lib/admin";
import { DEFAULT_SETTINGS } from "@/lib/defaults";
import { SettingsForm } from "@/components/admin/SettingsForm";

export const metadata = { title: "Configurações" };

export default async function AdminSettingsPage() {
  const { supabase } = await requireAdmin();
  const { data } = await supabase.from("site_settings").select("*").eq("id", 1).maybeSingle();

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-extrabold text-ink-950">Configurações do site</h1>
      <p className="mb-6 text-sm text-ink-500">Textos, SEO, aviso de afiliados e redes sociais. As mudanças aparecem no site imediatamente.</p>
      <SettingsForm settings={{ ...DEFAULT_SETTINGS, ...(data ?? {}) }} />
    </div>
  );
}
