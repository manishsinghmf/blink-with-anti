const trimTrailingSlash = (value: string) => value.replace(/\/+$/, "");

export const APP_URL = trimTrailingSlash(
  process.env.NEXT_PUBLIC_APP_URL ?? "https://demo-blinks.vercel.app"
);
export const APP_HOST = new URL(APP_URL).host;
export const SOLANA_RPC_URL =
  process.env.NEXT_PUBLIC_SOLANA_RPC_URL ?? "https://api.devnet.solana.com";

export const DONATE_ACTION_URL = `${APP_URL}/api/actions/donate-sol`;
export const SEND_ACTION_URL = `${APP_URL}/api/actions/send-sol`;
export const DONATE_PAGE_URL = `${APP_URL}/donate-sol`;
export const SEND_PAGE_URL = `${APP_URL}/send-sol`;
export const BLINK_PAGE_URL = `${APP_URL}/blink`;
export const DONATE_IMAGE_URL = `${APP_URL}/donate-sol.jpg`;
