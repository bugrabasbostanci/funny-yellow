import type React from "react";
import type { Metadata } from "next";
import { Inter, Fredoka } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

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
  title: "Funny Yellow - Free Stickers for WhatsApp",
  description:
    "Make Chat Fun Again! High-quality, funny stickers for WhatsApp and more. Download free sticker packs instantly.",
  keywords:
    "stickers, WhatsApp stickers, funny stickers, free stickers, chat stickers",
  generator: "Funny Yellow",
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
