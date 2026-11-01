import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    template: "%s | SHRÎ Atelier — Luxury Women's Fashion",
    default: "SHRÎ Atelier — Timeless Elegance & Women's Fashion",
  },
  description:
    "Discover handcrafted silhouettes, pure fabrics, and timeless luxury women's fashion designed for mindful sophistication.",
  keywords: [
    "women's fashion",
    "luxury clothing",
    "dresses",
    "co-ords",
    "silk",
    "linen",
    "atelier",
    "Indian luxury fashion",
  ],
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "SHRÎ Atelier",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${playfair.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-charcoal">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
