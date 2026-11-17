import { NextResponse, after, type NextRequest } from "next/server";
import { getPublicClient } from "@/lib/supabase/public";
import { isAllowedAffiliateUrl } from "@/lib/affiliate";

const BOT_RE = /bot|crawl|spider|slurp|preview|facebookexternalhit|whatsapp|telegram|discord|curl|wget|python|headless/i;

/**
 * Redireciona o visitante para o link de afiliado cadastrado no painel
 * e registra o clique (usado em "Mais populares").
 */
export async function GET(request: NextRequest, ctx: RouteContext<"/ir/[slug]">) {
  const { slug } = await ctx.params;
  const db = getPublicClient();
  const home = new URL("/", request.url);
  if (!db || !/^[a-z0-9-]{1,100}$/.test(slug)) return NextResponse.redirect(home, 302);

  const { data } = await db.from("products").select("affiliate_url").eq("slug", slug).eq("is_active", true).maybeSingle();
  const target = data?.affiliate_url;

  if (!target || !isAllowedAffiliateUrl(target)) {
    return NextResponse.redirect(new URL(`/produto/${slug}`, request.url), 302);
  }

  const ua = request.headers.get("user-agent") ?? "";
  const isPrefetch = request.headers.get("purpose") === "prefetch" || request.headers.get("sec-purpose")?.includes("prefetch");
  if (!BOT_RE.test(ua) && !isPrefetch) {
    after(async () => {
      await db.rpc("register_click", { p_slug: slug });
    });
  }

  const res = NextResponse.redirect(target, 302);
  res.headers.set("X-Robots-Tag", "noindex, nofollow");
  res.headers.set("Cache-Control", "no-store");
  res.headers.set("Referrer-Policy", "no-referrer-when-downgrade");
  return res;
}
