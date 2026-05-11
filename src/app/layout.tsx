import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Safebook - Dein privates Haushaltsbuch",
  description: "Ein privates, datenschutzorientiertes Haushaltsbuch für Einzelpersonen und Mehrpersonen-Haushalte.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body>{children}</body>
    </html>
  );
}
