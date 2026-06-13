import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Vyakti — Order anything, just say it",
  description:
    "Vyakti lets anyone order from Blinkit, Zepto, and Swiggy with a single voice message. Built for parents, grandparents, and busy professionals.",
  keywords: ["ONDC", "voice commerce", "agentic AI", "India", "quick commerce", "Blinkit", "Zepto", "Swiggy"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        {/* Inter 400 + 500 — used by both landing page and agent UI */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300..900;1,14..32,300..900&display=swap"
        />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
