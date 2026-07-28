import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import SiteNav from "@/components/SiteNav";

const bricolage = Bricolage_Grotesque({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-bricolage",
});

export const metadata: Metadata = {
  title: "Spiral",
  description: "3D spiral showcase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={bricolage.variable}>
      <body className={bricolage.className}>
        <SiteNav />
        {children}
      </body>
    </html>
  );
}
