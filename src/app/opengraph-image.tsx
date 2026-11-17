import { ImageResponse } from "next/og";
import { getSettings } from "@/lib/data";

export const alt = "Ofertas selecionadas do Mercado Livre";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

export default async function OgImage() {
  const s = await getSettings();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "linear-gradient(135deg, #15132e 0%, #24214a 60%, #4a27cc 100%)",
          color: "white",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "#6c4dff", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 40, height: 40, borderRadius: 999, border: "5px solid white", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: 14, height: 14, borderRadius: 999, background: "#ff6a3d" }} />
            </div>
          </div>
          <div style={{ fontSize: 40, fontWeight: 800 }}>{s.site_name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, maxWidth: 950 }}>{s.hero_title}</div>
          <div style={{ fontSize: 30, color: "#b9b7d3" }}>{s.tagline}</div>
        </div>
        <div style={{ display: "flex", gap: 16 }}>
          <div style={{ background: "#ff6a3d", padding: "12px 24px", borderRadius: 14, fontSize: 26, fontWeight: 700 }}>Ofertas do dia</div>
          <div style={{ background: "rgba(255,255,255,0.12)", padding: "12px 24px", borderRadius: 14, fontSize: 26 }}>Preços conferidos</div>
        </div>
      </div>
    ),
    size,
  );
}
