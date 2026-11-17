import { Breadcrumbs } from "./Misc";

export function LegalPage({ title, updated, children }: { title: string; updated?: string; children: React.ReactNode }) {
  return (
    <div className="container-page max-w-3xl py-10">
      <Breadcrumbs items={[{ label: title }]} />
      <article className="card p-6 sm:p-10">
        <h1 className="text-2xl font-extrabold text-ink-950 sm:text-3xl">{title}</h1>
        {updated ? <p className="mt-2 text-sm text-ink-400">Última atualização: {updated}</p> : null}
        <div className="mt-6 space-y-4 leading-relaxed text-ink-700 [&_h2]:mt-8 [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-ink-900 [&_li]:ml-5 [&_li]:list-disc [&_a]:font-medium [&_a]:text-brand-700 [&_a]:underline">
          {children}
        </div>
      </article>
    </div>
  );
}
