import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

// ponytail: Geist is provisional; F1 picks the final type pairing with /impeccable.
const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

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
    <html lang="es" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} min-h-dvh`}>
        <ThemeProvider attribute="class" defaultTheme="dark" themes={["dark", "light"]} enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
