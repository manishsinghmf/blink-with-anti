import { SOLANA_RPC_URL as PUBLIC_SOLANA_RPC_URL } from "./public-config";

export const SERVER_SOLANA_RPC_URL =
  process.env.SOLANA_RPC_URL ?? PUBLIC_SOLANA_RPC_URL;
export const DONATION_WALLET_ADDRESS =
  process.env.DONATION_WALLET_ADDRESS ??
  "HS7M3zgnFVucMMM5k1a2sPBPjRndfYNW7Ep6eMueCvX4";
export const SOLANA_ACTION_VERSION =
  process.env.SOLANA_ACTION_VERSION ?? "2.4";
