import { Metadata } from "next";
import {
  DONATE_ACTION_URL,
  DONATE_IMAGE_URL,
  DONATE_PAGE_URL,
} from "@/lib/public-config";
import DonatePage from "./client";


export const metadata: Metadata = {
  title: "Donate SOL — Solana Blink",
  description:
    "Donate SOL on Solana via a shareable Blink. Click, connect your wallet, and send devnet SOL instantly.",
  openGraph: {
    title: "Donate SOL — Solana Blink",
    description:
      "Support the project by donating SOL. Powered by Solana Actions & Dialect Blinks.",
    url: DONATE_PAGE_URL,
    images: [DONATE_IMAGE_URL],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Donate SOL — Solana Blink",
    description:
      "Support the project by donating SOL. Powered by Solana Actions & Dialect Blinks.",
    images: [DONATE_IMAGE_URL],
  },
  other: {
    "solana:action:apiUrl": DONATE_ACTION_URL,
    "solana:action:type": "transaction",
    "solana:action:label": "Donate SOL",
    "solana:action:icon": DONATE_IMAGE_URL,
  },
};

export default DonatePage;
