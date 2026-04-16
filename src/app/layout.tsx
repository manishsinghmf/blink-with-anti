import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Donate SOL — Solana Blink",
  description:
    "Donate SOL on Solana via a shareable Blink. Click, connect your wallet, and send devnet SOL instantly.",
  openGraph: {
    title: "Donate SOL — Solana Blink",
    description:
      "Support the project by donating SOL. Powered by Solana Actions & Dialect Blinks.",
    url: "https://blink-with-anti.vercel.app/donate-sol",
    images: ["/donate-sol.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Donate SOL — Solana Blink",
    description:
      "Support the project by donating SOL. Powered by Solana Actions & Dialect Blinks.",
    images: ["/donate-sol.jpg"],
  },
  other: {
    "solana:action:apiUrl": "https://blink-with-anti.vercel.app/api/actions/donate-sol",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
