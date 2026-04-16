/**
 * Solana Blink Unfurler — Chrome Extension Content Script
 *
 * This content script runs on X.com/Twitter and uses Dialect's
 * `setupTwitterObserver` to detect Solana Action URLs in tweets
 * and unfurl them into interactive Blink UIs.
 *
 * Wallet signing is delegated to the injected `window.solana`
 * provider (Phantom, Backpack, etc.).
 */

import { setupTwitterObserver } from "@dialectlabs/blinks/ext/twitter";
import {
  type ActionAdapter,
  type SignMessageData,
  BlockchainIds,
  createSignMessageText,
} from "@dialectlabs/blinks";
import "@dialectlabs/blinks/index.css";
import { Connection, VersionedTransaction } from "@solana/web3.js";

// Solana Devnet RPC (switch to mainnet-beta for production)
const RPC_URL = "https://api.devnet.solana.com";
const connection = new Connection(RPC_URL, "confirmed");

/**
 * Helper: access the injected Solana wallet provider (Phantom, Backpack, etc.)
 */
function getSolanaProvider(): any {
  if ("solana" in window) {
    const provider = (window as any).solana;
    if (provider?.isPhantom || provider?.isBackpack || provider?.publicKey) {
      return provider;
    }
  }
  // Also check for `phantom?.solana`
  if ("phantom" in window) {
    const phantom = (window as any).phantom;
    if (phantom?.solana) {
      return phantom.solana;
    }
  }
  return null;
}

/**
 * Custom ActionAdapter that bridges Dialect's Blink components
 * to the user's injected Solana wallet (e.g. Phantom).
 */
class SolanaBlinkAdapter implements ActionAdapter {
  get metadata() {
    return {
      supportedBlockchainIds: [BlockchainIds.SOLANA_DEVNET],
    };
  }

  async connect(_context: any) {
    const provider = getSolanaProvider();
    if (!provider) {
      throw new Error(
        "No Solana wallet found. Please install Phantom or Backpack."
      );
    }
    // Connect will prompt the user if not already connected
    const resp = await provider.connect();
    return resp.publicKey.toString();
  }

  async signTransaction(tx: string, _context: any) {
    const provider = getSolanaProvider();
    if (!provider) {
      throw new Error("No Solana wallet found.");
    }

    // Ensure wallet is connected
    if (!provider.publicKey) {
      await provider.connect();
    }

    // Decode the base64-encoded transaction
    const txBytes = Uint8Array.from(atob(tx), (c) => c.charCodeAt(0));
    const transaction = VersionedTransaction.deserialize(txBytes);

    // Sign the transaction via the wallet
    const signedTx = await provider.signTransaction(transaction);

    // Send the signed transaction
    const rawTx = signedTx.serialize();
    const signature = await connection.sendRawTransaction(rawTx, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });

    return { signature };
  }

  async confirmTransaction(sig: string, _context: any) {
    // Wait for confirmation
    await connection.confirmTransaction(sig, "confirmed");
  }

  async signMessage(data: string | SignMessageData, _context: any) {
    const provider = getSolanaProvider();
    if (!provider) {
      throw new Error("No Solana wallet found.");
    }

    if (!provider.publicKey) {
      await provider.connect();
    }

    const messageText =
      typeof data === "string" ? data : createSignMessageText(data);
    const message = new TextEncoder().encode(messageText);

    const { signature } = await provider.signMessage(message);
    return { signature: Buffer.from(signature).toString("base64") };
  }
}

// ── Initialize ──────────────────────────────────────────────
// Wait a moment for the page to settle, then start observing
function init() {
  console.log(
    "[Blink Unfurler] 🚀 Starting Twitter observer for Solana Blinks..."
  );

  const adapter = new SolanaBlinkAdapter();
  setupTwitterObserver(adapter);

  console.log(
    "[Blink Unfurler] ✅ Twitter observer active. Blink URLs will be unfurled."
  );
}

// Run when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
