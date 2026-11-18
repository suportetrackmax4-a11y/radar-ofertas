import { NextResponse, type NextRequest } from "next/server";
import { PANEL_ENABLED } from "@/lib/env";

/** O painel só existe no seu computador (npm run dev). No site publicado, /admin não existe. */
export function proxy(request: NextRequest) {
  if (!PANEL_ENABLED) return new NextResponse("Not found", { status: 404, headers: { "X-Robots-Tag": "noindex" } });
  return NextResponse.next({ request });
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
