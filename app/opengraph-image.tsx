import { ImageResponse } from "next/og";

export const alt = "InventoryFinder — find any product ID in seconds";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(145deg, #0f172a 0%, #1e3a5f 48%, #2563a8 100%)",
          padding: "64px 72px",
          color: "#f8fafc",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 14,
              background: "#3b82f6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            IF
          </div>
          <div
            style={{
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: 3,
              textTransform: "uppercase",
            }}
          >
            InventoryFinder
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 920 }}>
          <div
            style={{
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.08,
              letterSpacing: -1.5,
            }}
          >
            Find any product ID in seconds
          </div>
          <div
            style={{
              fontSize: 28,
              lineHeight: 1.35,
              color: "#cbd5e1",
              maxWidth: 820,
            }}
          >
            Flexible data banks, CSV/Excel import, and OCR-powered lookup for inventory on the
            floor.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#94a3b8",
          }}
        >
          <span>Data banks · Finder · OCR ID snap</span>
          <span style={{ color: "#93c5fd", fontWeight: 600 }}>Built for fast lookups</span>
        </div>
      </div>
    ),
    {
      ...size,
    },
  );
}
