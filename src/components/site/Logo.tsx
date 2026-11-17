import Link from "next/link";

export function LogoMark({ className = "h-9 w-9" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <defs>
        <linearGradient id="lg-radar" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#8a74ff" />
          <stop offset="1" stopColor="#4a27cc" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#lg-radar)" />
      <circle cx="20" cy="20" r="11" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="2" />
      <circle cx="20" cy="20" r="5.5" fill="none" stroke="#fff" strokeOpacity=".6" strokeWidth="2" />
      <path d="M20 20 L29 12" stroke="#fff" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="27.5" cy="25.5" r="3.2" fill="#ff6a3d" stroke="#fff" strokeWidth="1.6" />
    </svg>
  );
}

export function Logo({ name, light = false }: { name: string; light?: boolean }) {
  return (
    <Link href="/" className="group flex shrink-0 items-center gap-2.5" aria-label={`${name} — página inicial`}>
      <LogoMark className="h-9 w-9 transition-transform duration-300 group-hover:rotate-[-8deg]" />
      <span className={`font-display text-lg font-extrabold tracking-tight ${light ? "text-white" : "text-ink-900"}`}>
        {name}
      </span>
    </Link>
  );
}
