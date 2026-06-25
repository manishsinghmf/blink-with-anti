import type { Metadata } from "next";
import { APP_URL, DONATE_ACTION_URL } from "@/lib/public-config";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: "Donate SOL — Solana Blink",
  description:
    "Donate SOL on Solana via a shareable Blink. Click, connect your wallet, and send devnet SOL instantly.",
  openGraph: {
    title: "Donate SOL — Solana Blink",
    description:
      "Support the project by donating SOL. Powered by Solana Actions & Dialect Blinks.",
    url: `${APP_URL}/donate-sol`,
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
    "solana:action:apiUrl": DONATE_ACTION_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
