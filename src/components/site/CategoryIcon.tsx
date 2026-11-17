import {
  Baby, BookOpen, Camera, Car, Dumbbell, Gamepad2, Gift, Headphones, Heart, Laptop, PawPrint,
  Refrigerator, Shirt, Smartphone, Sofa, Sparkles, Tag, Tv, UtensilsCrossed, Watch, Wrench,
  type LucideIcon,
} from "lucide-react";

export const CATEGORY_ICONS: Record<string, { icon: LucideIcon; label: string }> = {
  tv: { icon: Tv, label: "TV / Eletrônicos" },
  laptop: { icon: Laptop, label: "Notebook" },
  smartphone: { icon: Smartphone, label: "Celular" },
  sofa: { icon: Sofa, label: "Casa" },
  refrigerator: { icon: Refrigerator, label: "Eletrodoméstico" },
  gamepad: { icon: Gamepad2, label: "Games" },
  wrench: { icon: Wrench, label: "Ferramentas" },
  shirt: { icon: Shirt, label: "Moda" },
  dumbbell: { icon: Dumbbell, label: "Esportes" },
  headphones: { icon: Headphones, label: "Áudio" },
  camera: { icon: Camera, label: "Câmera" },
  watch: { icon: Watch, label: "Relógios" },
  car: { icon: Car, label: "Automotivo" },
  baby: { icon: Baby, label: "Bebês" },
  book: { icon: BookOpen, label: "Livros" },
  beauty: { icon: Sparkles, label: "Beleza" },
  pet: { icon: PawPrint, label: "Pet" },
  kitchen: { icon: UtensilsCrossed, label: "Cozinha" },
  health: { icon: Heart, label: "Saúde" },
  gift: { icon: Gift, label: "Presentes" },
  tag: { icon: Tag, label: "Outros" },
};

export function CategoryIcon({ name, className = "h-5 w-5" }: { name: string; className?: string }) {
  const Icon = CATEGORY_ICONS[name]?.icon ?? Tag;
  return <Icon className={className} aria-hidden="true" />;
}
