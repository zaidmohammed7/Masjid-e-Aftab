import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import BottomNav from "@/components/BottomNav";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Masjid e Aftab App",
  description: "Extreme UX Masjid e Aftab PWA",
  manifest: "/manifest.ts",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="theme-color" content="#10b981" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 overscroll-none`}>
        <div className="max-w-md mx-auto min-h-screen relative shadow-2xl bg-white">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
