import Link from "next/link";
import { ChevronRight, Info, PackageSearch } from "lucide-react";

export function AffiliateNotice({ text, compact = false }: { text: string; compact?: boolean }) {
  return (
    <aside
      className={`flex gap-3 rounded-xl bg-brand-50 text-brand-800 ring-1 ring-brand-100 ${compact ? "p-3 text-xs" : "p-4 text-sm"}`}
      aria-label="Aviso de afiliados"
    >
      <Info className={`shrink-0 text-brand-600 ${compact ? "h-4 w-4" : "h-5 w-5"}`} aria-hidden="true" />
      <p className="leading-relaxed">{text}</p>
    </aside>
  );
}

type SectionHeaderProps = { title: string; subtitle?: string; href?: string; icon?: React.ReactNode; id?: string };

export function SectionHeader({ title, subtitle, href, icon, id }: SectionHeaderProps) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 sm:mb-7">
      <div>
        <h2 id={id} className="flex items-center gap-2.5 text-xl font-extrabold text-ink-950 sm:text-2xl">
          {icon}
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-sm text-ink-500">{subtitle}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-brand-600 hover:text-brand-800">
          Ver todos
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="card flex flex-col items-center px-6 py-14 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
        <PackageSearch className="h-7 w-7" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-bold text-ink-900">{title}</h2>
      {children ? <div className="mt-2 max-w-md text-sm text-ink-500">{children}</div> : null}
    </div>
  );
}

export type Crumb = { label: string; href?: string };

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Você está em" className="mb-5 text-sm text-ink-500">
      <ol className="flex flex-wrap items-center gap-1.5">
        <li>
          <Link href="/" className="hover:text-brand-700">Início</Link>
        </li>
        {items.map((c) => (
          <li key={c.label} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-ink-300" aria-hidden="true" />
            {c.href ? (
              <Link href={c.href} className="hover:text-brand-700">{c.label}</Link>
            ) : (
              <span className="line-clamp-1 text-ink-700" aria-current="page">{c.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
