import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import darkThemeImage from "../image 21.png";
import lightThemeImage from "../image 22.png";
import "./globals.css";

export const metadata: Metadata = {
  title: "MagicStory",
  description: "Персональные сказки для детей на основе реальных ситуаций дня."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const bodyStyle = {
    "--app-bg-dark": `url("${darkThemeImage.src}")`,
    "--app-bg-light": `url("${lightThemeImage.src}")`
  } as CSSProperties;

  return (
    <html lang="ru" data-theme="dark" suppressHydrationWarning>
      <body style={bodyStyle}>
        <div className="min-h-screen">
          <SiteHeader />
          {children}
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
