import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";
import { Analytics } from "@vercel/analytics/react";

import { ThemeProvider } from "@/components/ThemeProvider";
import ClearBadge from "@/components/ClearBadge";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });

export const metadata: Metadata = {
  title: "Masjid-e-Aftab App",
  description: "Daily prayer times and announcements",
  manifest: "/manifest.ts",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#C5A059" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/apple-icon.png" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans overscroll-none`}>
        <ThemeProvider>
          <ClearBadge />
          <div className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-inherit">
            {children}
            <BottomNav />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
