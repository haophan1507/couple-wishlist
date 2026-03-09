import type { Metadata } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const playfair = Playfair_Display({
  variable: "--font-heading",
  subsets: ["latin"]
});

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-body",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: {
    default: "Wishlist Cặp Đôi",
    template: "%s | Wishlist Cặp Đôi"
  },
  description: "Website wishlist và ngày đặc biệt dành cho cặp đôi.",
  metadataBase: new URL("https://example.com")
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="vi" className={`${playfair.variable} ${jakarta.variable}`} suppressHydrationWarning>
      <body className="font-[var(--font-body)]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
