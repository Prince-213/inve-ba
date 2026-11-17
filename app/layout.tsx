import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import { AppProviders } from "@/components/providers/app-providers";
import "./globals.css";
import { cn } from "@/lib/utils";

const outfit = Outfit({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "InventoryFinder",
  description: "Flexible inventory data banks with OCR-powered ID lookup.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("h-full", "font-sans", outfit.variable)}>
      <body className="min-h-full font-sans antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
