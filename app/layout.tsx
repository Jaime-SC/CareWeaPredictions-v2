import type { Metadata, Viewport } from "next";
import { Big_Shoulders, Geist_Mono, Schibsted_Grotesk } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

// opsz axis: large sizes get the display cut automatically (font-optical-sizing: auto).
const display = Big_Shoulders({
  variable: "--font-big-shoulders",
  subsets: ["latin"],
  axes: ["opsz"],
  // next/font has no fallback metrics for this family; declare the fallback ourselves.
  adjustFontFallback: false,
  fallback: ["Arial Narrow", "sans-serif"],
});
const sans = Schibsted_Grotesk({ variable: "--font-schibsted", subsets: ["latin"] });
const mono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CareWeaPredictions",
  description: "Predicciones de fútbol con modelos Poisson y contexto multi-fuente.",
  applicationName: "CareWeaPredictions",
};

export const viewport: Viewport = {
  themeColor: "#1b4532",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning className={`${display.variable} ${sans.variable} ${mono.variable}`}>
      <body className="min-h-dvh">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
