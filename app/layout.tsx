import type { Metadata } from "next";
import "./globals.css";

function resolveSiteUrl() {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.startsWith("http") ? configured : `https://${configured}`;

  const vercelUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercelUrl) return `https://${vercelUrl}`;

  return "http://localhost:3000";
}

const siteUrl = resolveSiteUrl();

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Calidoso Team",
  description:
    "Repositorio institucional del Dream Team de Calidad y Mejoramiento Continuo de Electroingeniería S.A.S.",
  icons: {
    icon: "/assets/icons/favicon.ico",
    shortcut: "/assets/icons/favicon-32x32.png",
    apple: "/assets/icons/apple-touch-icon.png",
  },
  openGraph: {
    title: "Calidoso Team",
    description:
      "Repositorio de Apps Calidad del Dream Team de Calidad y Mejoramiento Continuo.",
    url: "/",
    siteName: "Calidoso Team",
    images: [
      {
        url: "/og.png",
        width: 1730,
        height: 909,
        alt: "Calidoso Team — Repositorio de Apps Calidad",
      },
    ],
    locale: "es_CO",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Calidoso Team",
    description:
      "Repositorio de Apps Calidad del Dream Team de Calidad y Mejoramiento Continuo.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">{children}</body>
    </html>
  );
}
