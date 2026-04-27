import { Metadata } from "next";
import SendPage from "./client";

export const metadata: Metadata = {
  title: "Send SOL — Solana Blink",
  description:
    "Send SOL on Solana via a shareable Blink. Enter a recipient wallet, choose an amount, and approve.",
  openGraph: {
    title: "Send SOL — Solana Blink",
    description:
      "Transfer SOL quickly with a Solana Blink. Powered by Solana Actions & Dialect Blinks.",
    url: "https://demo-blinks.vercel.app/send-sol",
    images: ["https://demo-blinks.vercel.app/donate-sol.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Send SOL — Solana Blink",
    description:
      "Transfer SOL quickly with a Solana Blink. Powered by Solana Actions & Dialect Blinks.",
    images: ["https://demo-blinks.vercel.app/donate-sol.jpg"],
  },
  other: {
    "solana:action:apiUrl":
      "https://demo-blinks.vercel.app/api/actions/send-sol",
    "solana:action:type": "transaction",
    "solana:action:label": "Send SOL",
    "solana:action:icon":
      "https://demo-blinks.vercel.app/donate-sol.jpg",
  },
};

export default SendPage;
