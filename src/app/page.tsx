"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Blink,
  useBlink,
  BlinkAdapter,
} from "@dialectlabs/blinks";
import { useBlinkSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import { useWallet, WalletProvider, ConnectionProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import "@dialectlabs/blinks/index.css";
import "@solana/wallet-adapter-react-ui/styles.css";

const BLINK_URL = "http://localhost:3000/api/actions/donate-sol";
const RPC_URL = "https://api.devnet.solana.com";

function BlinkViewer() {
  const { adapter } = useBlinkSolanaWalletAdapter(RPC_URL);
  const { blink } = useBlink({ url: BLINK_URL });

  if (!blink) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
        <p className="text-zinc-400 font-medium">Loading Blink Action...</p>
      </div>
    );
  }

  return (
    <Blink
      blink={blink}
      adapter={adapter as BlinkAdapter}
      websiteText="localhost:3000"
    />
  );
}

export default function Home() {
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-zinc-950 text-white">
            <div className="z-10 max-w-5xl w-full items-center justify-center font-sans">
              <h1 className="text-5xl font-extrabold mb-4 text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-emerald-400">
                Solana Blink Workspace
              </h1>
              <p className="text-center mb-6 text-zinc-400 text-lg">
                Local client to render and test your{" "}
                <code className="bg-zinc-800 px-2 py-1 rounded text-purple-300">
                  /api/actions/donate-sol
                </code>{" "}
                Blink API.
              </p>

              <div className="flex justify-center mb-8">
                <WalletMultiButton />
              </div>

              <div className="flex justify-center w-full max-w-md mx-auto relative group">
                {/* Subtle glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-emerald-600 rounded-xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                <div className="relative w-full rounded-xl bg-zinc-900 ring-1 ring-white/10 shadow-2xl overflow-hidden">
                  <BlinkViewer />
                </div>
              </div>
            </div>
          </main>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
