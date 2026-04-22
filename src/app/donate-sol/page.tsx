import { Metadata } from "next";
import DonatePage from "./client";


export const metadata: Metadata = {
  title: "Donate SOL — Solana Blink",
  description:
    "Donate SOL on Solana via a shareable Blink. Click, connect your wallet, and send devnet SOL instantly.",
  openGraph: {
    title: "Donate SOL — Solana Blink",
    description:
      "Support the project by donating SOL. Powered by Solana Actions & Dialect Blinks.",
    url: "https://blink-with-anti.vercel.app/donate-sol",
    images: ["https://blink-with-anti.vercel.app/donate-sol.jpg"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Donate SOL — Solana Blink",
    description:
      "Support the project by donating SOL. Powered by Solana Actions & Dialect Blinks.",
    images: ["https://blink-with-anti.vercel.app/donate-sol.jpg"],
  },
  other: {
    "solana:action:apiUrl":
      "https://blink-with-anti.vercel.app/api/actions/donate-sol",
    "solana:action:type": "transaction",
    "solana:action:label": "Donate SOL",
    "solana:action:icon":
      "https://blink-with-anti.vercel.app/donate-sol.jpg",
  },
};

export default DonatePage;
