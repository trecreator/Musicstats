import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/react";
import GuiaFixa from "@/app/_components/home/GuiaFixa"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MusicalStats",
  description: "Search for your favorite musics and see them analytics",
  icons: {
    icon: "/MusicalStatsLogo.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <GuiaFixa></GuiaFixa>
        {children}


        <Analytics />

        <footer className="w-full py-8 mt-12 border-t border-white/5 text-center font-mono text-xs text-white/30">
          <p>© {new Date().getFullYear()} MusicalStats. All rights reserved.</p>
        </footer>


      </body>
    </html>
  );
}