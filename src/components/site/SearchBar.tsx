import Form from "next/form";
import { Search } from "lucide-react";

export function SearchBar({ defaultValue = "", className = "", id = "busca-q" }: { defaultValue?: string; className?: string; id?: string }) {
  return (
    <Form action="/busca" role="search" className={`relative w-full ${className}`}>
      <label htmlFor={id} className="sr-only">
        Buscar produtos
      </label>
      <input
        id={id}
        name="q"
        type="search"
        defaultValue={defaultValue}
        placeholder="Buscar produtos, marcas e categorias…"
        autoComplete="off"
        maxLength={80}
        className="h-11 w-full rounded-xl border-0 bg-white/95 pl-4 pr-12 text-sm text-ink-900 shadow-sm ring-1 ring-white/10 placeholder:text-ink-400 transition focus:bg-white focus:ring-4 focus:ring-brand-400/40 focus:outline-none"
      />
      <button
        type="submit"
        aria-label="Buscar"
        className="absolute right-1.5 top-1.5 flex h-8 w-9 items-center justify-center rounded-lg bg-brand-600 text-white transition hover:bg-brand-700"
      >
        <Search className="h-4 w-4" aria-hidden="true" />
      </button>
    </Form>
  );
}
