import { ExternalLink } from "lucide-react";

type Props = {
  slug: string;
  size?: "sm" | "lg";
  label?: string;
  className?: string;
};

/**
 * Botão que leva ao link de afiliado cadastrado no painel.
 * Passa por /ir/[slug], que contabiliza o clique e redireciona para o Mercado Livre.
 */
export function OfferButton({ slug, size = "sm", label = "Ver oferta", className = "" }: Props) {
  return (
    <a
      href={`/ir/${slug}`}
      target="_blank"
      rel="sponsored nofollow noopener"
      className={`btn-flame group/btn w-full ${size === "lg" ? "py-4 text-base" : ""} ${className}`}
    >
      {label}
      <ExternalLink className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden="true" />
      <span className="sr-only">(abre o Mercado Livre em nova aba)</span>
    </a>
  );
}
