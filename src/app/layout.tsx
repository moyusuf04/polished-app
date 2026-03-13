import type { Metadata } from "next";
import { Inter, Playfair_Display, DM_Sans, Outfit } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-serif" });
const dmSans = DM_Sans({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Polished",
  description: "Conversational breadth for the ambitious.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${playfair.variable} ${dmSans.variable} font-sans bg-zinc-950 text-white min-h-screen antialiased selection:bg-zinc-800 selection:text-white`}>
        <div className="noise-texture" />
        {children}
      </body>
    </html>
  );
}
