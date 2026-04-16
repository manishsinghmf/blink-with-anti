/**
 * This is a dedicated endpoint for X unfurling
 * Returns action JSON that X crawlers and the Chrome extension can consume
 * 
 * This endpoint handles requests from:
 * - X/Twitter crawler (for link previews)
 * - Chrome extension setupTwitterObserver (for Blink unfurling)
 * - Anyone accessing it directly
 */

import {
  ActionGetResponse,
  ACTIONS_CORS_HEADERS,
  BLOCKCHAIN_IDS,
} from "@solana/actions";

const blockchain = BLOCKCHAIN_IDS.devnet;

const headers = {
  ...ACTIONS_CORS_HEADERS,
  "x-blockchain-ids": blockchain,
  "x-action-version": "2.4",
};

export const OPTIONS = async () => {
  return new Response(null, { headers });
};

export const GET = async (req: Request) => {
  const response: ActionGetResponse = {
    type: "action",
    icon: "https://blink-with-anti.vercel.app/donate-sol.jpg",
    label: "Donate",
    title: "Donate SOL",
    description:
      "Support this project with a quick SOL donation. One click, instant transfer on Solana. Every bit helps! 🚀",
    links: {
      actions: [
        {
          type: "transaction",
          label: "0.1 SOL ⭐",
          href: "https://blink-with-anti.vercel.app/api/actions/donate-sol?amount=0.1",
        },
        {
          type: "transaction",
          label: "0.05 SOL",
          href: "https://blink-with-anti.vercel.app/api/actions/donate-sol?amount=0.05",
        },
        {
          type: "transaction",
          label: "0.01 SOL",
          href: "https://blink-with-anti.vercel.app/api/actions/donate-sol?amount=0.01",
        },
        {
          type: "transaction",
          href: "https://blink-with-anti.vercel.app/api/actions/donate-sol?amount={amount}",
          label: "Donate",
          parameters: [
            {
              name: "amount",
              label: "Enter a custom SOL amount",
              type: "number",
            },
          ],
        },
      ],
    },
  };

  return new Response(JSON.stringify(response), { status: 200, headers });
};
