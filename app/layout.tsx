import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { CursorMagic } from "@/components/site/cursor-magic";
import { CabinetSidebar } from "@/components/dashboard/cabinet-sidebar";
import { RouteShell } from "@/components/dashboard/route-shell";
import { ScrollReveal } from "@/components/site/scroll-reveal";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import darkThemeImage from "../image 21.png";
import "./globals.css";

export const metadata: Metadata = {
  title: "MagicStory",
  description: "Персональные вечерние сериалы для детей, которые продолжаются одной кнопкой.",
  icons: {
    icon: "/favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyStyle = {
    "--app-bg-dark": `url("${darkThemeImage.src}")`
  } as CSSProperties;

  return (
    <html lang="ru" data-theme="dark">
      <body style={bodyStyle}>
        <CursorMagic />
        <ScrollReveal />
        <div className="min-h-screen">
          <RouteShell
            header={<SiteHeader />}
            sidebar={<CabinetSidebar />}
            footer={<SiteFooter />}
          >
            {children}
          </RouteShell>
        </div>
      </body>
    </html>
  );
}
