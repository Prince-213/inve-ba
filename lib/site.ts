/** Canonical site URL for metadata / Open Graph. */
export function getSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, "");

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) {
    const host = vercel.replace(/^https?:\/\//, "").replace(/\/$/, "");
    return `https://${host}`;
  }

  return "http://localhost:3000";
}

export const siteConfig = {
  name: "InventoryFinder",
  shortName: "InventoryFinder",
  description:
    "Flexible inventory data banks with CSV/Excel import and OCR-powered product ID lookup.",
  tagline: "Find any product ID in seconds",
} as const;
