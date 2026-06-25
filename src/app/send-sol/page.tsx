import { Metadata } from "next";
import {
  DONATE_IMAGE_URL,
  SEND_ACTION_URL,
  SEND_PAGE_URL,
} from "@/lib/public-config";
import SendPage from "./client";

export const metadata: Metadata = {
  title: "Send SOL — Solana Blink",
  description:
    "Send SOL on Solana via a shareable Blink. Enter a recipient wallet, choose an amount, and approve.",
  openGraph: {
    title: "Send SOL — Solana Blink",
    description:
      "Transfer SOL quickly with a Solana Blink. Powered by Solana Actions & Dialect Blinks.",
    url: SEND_PAGE_URL,
    images: [DONATE_IMAGE_URL],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Send SOL — Solana Blink",
    description:
      "Transfer SOL quickly with a Solana Blink. Powered by Solana Actions & Dialect Blinks.",
    images: [DONATE_IMAGE_URL],
  },
  other: {
    "solana:action:apiUrl": SEND_ACTION_URL,
    "solana:action:type": "transaction",
    "solana:action:label": "Send SOL",
    "solana:action:icon": DONATE_IMAGE_URL,
  },
};

export default SendPage;
