import Image from "next/image";
import { Package } from "lucide-react";
import { isOptimizableImage } from "@/lib/affiliate";

type Props = {
  src: string | null;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

/** Imagem de produto com otimização automática e espaço reservado quando não há foto. */
export function ProductImage({ src, alt, sizes, priority, className = "" }: Props) {
  if (!src) {
    return (
      <div className={`flex h-full w-full items-center justify-center bg-ink-100 text-ink-300 ${className}`}>
        <Package className="h-10 w-10" aria-hidden="true" />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      unoptimized={!isOptimizableImage(src)}
      className={`object-contain ${className}`}
    />
  );
}
