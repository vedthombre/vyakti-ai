import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Vyakti — Voice-First Agentic Commerce",
  description:
    "Vyakti (व्यक्ति) is a voice-first agentic commerce engine for the ONDC network. Just speak your order — Vyakti handles the rest.",
  keywords: ["ONDC", "voice commerce", "agentic AI", "India", "quick commerce"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Inter from Google Fonts — loaded here so CSS @import works reliably */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>{children}</body>
    </html>
  );
}
