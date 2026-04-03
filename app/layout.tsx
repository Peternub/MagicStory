import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Магические Сказки",
  description: "Персональные сказки и аудио для детей"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  );
}
