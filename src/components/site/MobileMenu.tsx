"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import type { Category } from "@/lib/types";
import { CategoryIcon } from "./CategoryIcon";

export function MobileMenu({ categories }: { categories: Category[] }) {
  const [openPath, setOpenPath] = useState<string | null>(null);
  const pathname = usePathname();
  // O menu fecha sozinho quando a rota muda.
  const open = openPath === pathname;

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const close = () => setOpenPath(null);
  const linkCls = "block rounded-lg px-3 py-2.5 font-semibold hover:bg-ink-50";

  return (
    <>
      <button
        type="button"
        onClick={() => setOpenPath(pathname)}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-white transition hover:bg-white/10 lg:hidden"
        aria-label="Abrir menu"
        aria-expanded={open}
      >
        <Menu className="h-6 w-6" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
          <button className="absolute inset-0 bg-ink-950/60 backdrop-blur-sm" aria-label="Fechar menu" onClick={close} />
          <nav className="absolute right-0 top-0 flex h-full w-[min(85vw,340px)] animate-fade-up flex-col overflow-y-auto bg-white p-5 text-ink-900 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <span className="font-display text-lg font-bold">Menu</span>
              <button onClick={close} className="rounded-lg p-2 hover:bg-ink-100" aria-label="Fechar menu">
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="space-y-1 border-b border-ink-100 pb-4">
              <li><Link onClick={close} className={linkCls} href="/ofertas">Ofertas do dia</Link></li>
              <li><Link onClick={close} className={linkCls} href="/busca?ordem=maior-desconto">Maiores descontos</Link></li>
              <li><Link onClick={close} className={linkCls} href="/busca?ordem=recentes">Novidades</Link></li>
            </ul>
            <p className="mb-2 mt-4 px-3 text-xs font-bold uppercase tracking-wider text-ink-400">Categorias</p>
            <ul className="space-y-0.5">
              {categories.map((c) => (
                <li key={c.id}>
                  <Link onClick={close} href={`/categoria/${c.slug}`} className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-ink-700 hover:bg-brand-50 hover:text-brand-700">
                    <CategoryIcon name={c.icon} className="h-4 w-4" />
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      ) : null}
    </>
  );
}
