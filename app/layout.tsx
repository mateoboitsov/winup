import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";
import LenisSmoothScroll from "@/components/LenisSmoothScroll";
import ConversionBot from "@/components/ConversionBot";
import NetlifyIdentity from "@/components/NetlifyIdentity";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "winup.",
  description: "Agencia digital. Branding, motion y fotografía",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={bricolage.variable} suppressHydrationWarning>
      <body className={bricolage.className} suppressHydrationWarning>
        <SiteNav />
        <LenisSmoothScroll />
        {children}
        <ConversionBot />
        <NetlifyIdentity />
      </body>
    </html>
  );
}
