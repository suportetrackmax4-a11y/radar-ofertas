import Link from "next/link";
import { Mail, MessageCircle, Send } from "lucide-react";
import { getCategories, getSettings } from "@/lib/data";
import { Logo } from "./Logo";

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

type Social = { href: string; label: string; icon: React.ComponentType<{ className?: string }> };

export async function Footer() {
  const [s, categories] = await Promise.all([getSettings(), getCategories()]);
  const socials: Social[] = [];
  if (s.instagram_url) socials.push({ href: s.instagram_url, label: "Instagram", icon: InstagramIcon });
  if (s.telegram_url) socials.push({ href: s.telegram_url, label: "Telegram", icon: Send });
  if (s.whatsapp_url) socials.push({ href: s.whatsapp_url, label: "WhatsApp", icon: MessageCircle });
  if (s.contact_email) socials.push({ href: `mailto:${s.contact_email}`, label: "E-mail", icon: Mail });

  const linkCls = "transition hover:text-white";

  return (
    <footer className="mt-20 bg-ink-950 text-ink-300">
      <div className="container-page grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo name={s.site_name} light />
          <p className="mt-4 text-sm leading-relaxed text-ink-400">{s.tagline}</p>
          {socials.length > 0 ? (
            <ul className="mt-5 flex gap-2">
              {socials.map(({ href, label, icon: Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-ink-200 transition hover:bg-brand-600 hover:text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Categorias</h2>
          <ul className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm lg:grid-cols-1">
            {categories.slice(0, 10).map((c) => (
              <li key={c.id}>
                <Link className={linkCls} href={`/categoria/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Institucional</h2>
          <ul className="space-y-2 text-sm">
            <li><Link className={linkCls} href="/sobre">Sobre o site</Link></li>
            <li><Link className={linkCls} href="/aviso-de-afiliados">Aviso de afiliados</Link></li>
            <li><Link className={linkCls} href="/politica-de-privacidade">Política de privacidade</Link></li>
            <li><Link className={linkCls} href="/termos-de-uso">Termos de uso</Link></li>
          </ul>
        </div>
        <div>
          <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Transparência</h2>
          <p className="text-sm leading-relaxed text-ink-400">{s.affiliate_disclaimer}</p>
        </div>
      </div>
      <div className="border-t border-white/5">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {s.site_name}. Todos os direitos reservados.
          </p>
          <p>Site independente, sem vínculo oficial com o Mercado Livre. As marcas citadas pertencem aos seus donos.</p>
        </div>
      </div>
    </footer>
  );
}
