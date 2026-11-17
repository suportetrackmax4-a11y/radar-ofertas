import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import { getSettings } from "@/lib/data";
import { SITE_URL } from "@/lib/env";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-jakarta", weight: ["600", "700", "800"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: `${s.site_name} — ${s.tagline}`, template: `%s | ${s.site_name}` },
    description: s.seo_description,
    applicationName: s.site_name,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "pt_BR",
      siteName: s.site_name,
      title: `${s.site_name} — ${s.tagline}`,
      description: s.seo_description,
      url: "/",
    },
    twitter: { card: "summary_large_image", title: s.site_name, description: s.seo_description },
    robots: { index: true, follow: true },
  };
}

export const viewport: Viewport = {
  themeColor: "#15132e",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="min-h-dvh">{children}</body>
    </html>
  );
}
