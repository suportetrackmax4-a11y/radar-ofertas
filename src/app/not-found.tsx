import Link from "next/link";
import { LogoMark } from "@/components/site/Logo";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-ink-50 px-4 text-center">
      <LogoMark className="h-14 w-14" />
      <p className="mt-6 font-display text-6xl font-extrabold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-extrabold text-ink-950">Página não encontrada</h1>
      <p className="mt-2 max-w-md text-ink-500">Este produto pode ter saído do ar ou o endereço está incorreto.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn-primary">Voltar ao início</Link>
        <Link href="/ofertas" className="btn-ghost">Ver ofertas do dia</Link>
      </div>
    </main>
  );
}
