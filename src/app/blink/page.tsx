import { Metadata } from "next";
import { BLINK_PAGE_URL, DONATE_ACTION_URL } from "@/lib/public-config";
import BlinkClientPage from "./client";

export const metadata: Metadata = {
  title: "Solana Blink Client — Donate SOL",
  description:
    "Interactive Solana Blink client for executing Actions. Share this URL to unfurl Blinks anywhere.",
  openGraph: {
    title: "Solana Blink Client",
    description:
      "Universal Blink client for Solana Actions. Works on X, Discord, and more.",
    url: BLINK_PAGE_URL,
    type: "website",
  },
  other: {
    "solana:action:apiUrl": DONATE_ACTION_URL,
  },
};

export default BlinkClientPage;
