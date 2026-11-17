import { formatPrice } from "@/lib/format";

type Props = {
  price: number;
  oldPrice: number | null;
  discount: number;
  size?: "sm" | "lg";
};

export function PriceTag({ price, oldPrice, discount, size = "sm" }: Props) {
  const big = size === "lg";
  return (
    <div className="flex flex-col">
      {oldPrice ? (
        <span className={`text-ink-400 line-through ${big ? "text-base" : "text-xs"}`}>
          <span className="sr-only">Preço anterior: </span>
          {formatPrice(oldPrice)}
        </span>
      ) : null}
      <div className="flex flex-wrap items-baseline gap-x-2">
        <span className={`font-display font-extrabold text-ink-950 ${big ? "text-4xl" : "text-xl"}`}>
          <span className="sr-only">Preço atual: </span>
          {formatPrice(price)}
        </span>
        {discount > 0 ? (
          <span className={`font-bold text-mint-600 ${big ? "text-lg" : "text-sm"}`}>{discount}% OFF</span>
        ) : null}
      </div>
    </div>
  );
}
