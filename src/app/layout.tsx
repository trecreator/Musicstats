import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next"
import GuiaFixa from "@/app/_components/home/GuiaFixa"

// Importa a versão direto do seu package.json
import { version } from "@/../package.json";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://musicalstats.com"),

  title: "MusicalStats",

  description:
    "Search for your favorite musics and see detailed analytics.",

  icons: {
    icon: "/favicon.png",
  },

  openGraph: {
    siteName: "MusicalStats",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <GuiaFixa></GuiaFixa>
        {children}

        <Analytics />
        <SpeedInsights />
        
        {/* Versão automatizada aqui */}
        <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-sm rounded-lg p-2 text-xs text-white/50 font-mono">
          <p>MusicalStats v0.1.2</p>
        </div>

        <footer className="w-full py-8 mt-12 border-t border-white/5 text-center font-mono text-xs text-white/30">
          <p>© {new Date().getFullYear()} MusicalStats. All rights reserved.</p>
        </footer>
      </body>
    </html>
  );
}
