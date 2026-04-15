import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "T33WAGER",
  description: "Free Fire 1v1 wagering platform for Nigerian and West African players"
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
