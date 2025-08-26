import type React from "react";
import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ClarityProvider } from "@/components/clarity-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const fredoka = Fredoka({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-fredoka",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://funnyyellow.com"),
  title: "Funny Yellow - Free WhatsApp Stickers | Download Instantly",
  description:
    "Make Chat Fun Again! 🎉 Download high-quality, funny stickers for WhatsApp instantly. 100% free sticker collection with easy WhatsApp integration.",
  keywords: [
    "WhatsApp stickers",
    "free stickers",
    "funny stickers",
    "sticker packs",
    "WhatsApp sticker maker",
    "emoji stickers",
    "chat stickers",
    "instant download",
    "webp stickers",
  ],
  authors: [{ name: "Funny Yellow Team" }],
  creator: "Funny Yellow",
  publisher: "Funny Yellow",
  category: "Entertainment",
  openGraph: {
    title: "Funny Yellow - Free WhatsApp Stickers",
    description:
      "Download high-quality, funny stickers for WhatsApp instantly. 100% free sticker collection.",
    url: "https://funnyyellow.com",
    siteName: "Funny Yellow",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Funny Yellow - Free WhatsApp Stickers",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Funny Yellow - Free WhatsApp Stickers",
    description:
      "Download high-quality, funny stickers for WhatsApp instantly. 100% free!",
    images: ["/twitter-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code", // To be added
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${fredoka.variable} antialiased`}
    >
      <body className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50">
        <ClarityProvider />
        {children}
        <Toaster />
      </body>
    </html>
  );
}
