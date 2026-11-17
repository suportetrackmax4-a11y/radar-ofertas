"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ExternalLink, FolderTree, LayoutDashboard, Package, Plus, Settings } from "lucide-react";

const items = [
  { href: "/admin", label: "Visão geral", icon: LayoutDashboard, exact: true },
  { href: "/admin/produtos", label: "Produtos", icon: Package },
  { href: "/admin/categorias", label: "Categorias", icon: FolderTree },
  { href: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto lg:flex-col" aria-label="Painel">
      {items.map(({ href, label, icon: Icon, exact }) => {
        const active = exact ? pathname === href : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
              active ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"
            }`}
          >
            <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
            {label}
          </Link>
        );
      })}
      <Link href="/admin/produtos/novo" className="btn-flame mt-0 shrink-0 lg:mt-4">
        <Plus className="h-4 w-4" /> Novo produto
      </Link>
      <a href="/" target="_blank" rel="noopener" className="flex shrink-0 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-300 transition hover:bg-white/5 hover:text-white lg:mt-2">
        <ExternalLink className="h-[18px] w-[18px]" aria-hidden="true" /> Ver o site
      </a>
    </nav>
  );
}
