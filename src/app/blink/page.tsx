import { Metadata } from "next";
import BlinkClientPage from "./client";

export const metadata: Metadata = {
  title: "Solana Blink Client — Donate SOL",
  description:
    "Interactive Solana Blink client for executing Actions. Share this URL to unfurl Blinks anywhere.",
  openGraph: {
    title: "Solana Blink Client",
    description:
      "Universal Blink client for Solana Actions. Works on X, Discord, and more.",
    url: "https://demo-blinks.vercel.app/blink",
    type: "website",
  },
  other: {
    "solana:action:apiUrl": "https://demo-blinks.vercel.app/api/actions/donate-sol",
  },
};

export default BlinkClientPage;
