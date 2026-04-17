"use client";

import { useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import {
  Blink,
  useBlink,
  BlinkAdapter,
} from "@dialectlabs/blinks";
import { useBlinkSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana";
import {
  WalletProvider,
  ConnectionProvider,
} from "@solana/wallet-adapter-react";
import {
  WalletModalProvider,
  WalletMultiButton,
} from "@solana/wallet-adapter-react-ui";
import "@dialectlabs/blinks/index.css";
import "@solana/wallet-adapter-react-ui/styles.css";

const RPC_URL = "https://api.devnet.solana.com";

function BlinkCard({ actionUrl }: { actionUrl: string }) {
  const { adapter } = useBlinkSolanaWalletAdapter(RPC_URL);
  const { blink } = useBlink({ url: actionUrl });

  if (!blink) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "3rem",
          gap: "1rem",
        }}
      >
        <div
          style={{
            width: 40,
            height: 40,
            border: "3px solid transparent",
            borderTopColor: "#a78bfa",
            borderRadius: "50%",
            animation: "spin 0.8s linear infinite",
          }}
        />
        <p style={{ color: "#a1a1aa", fontSize: "0.9rem" }}>
          Loading Blink…
        </p>
      </div>
    );
  }

  return (
    <Blink
      blink={blink}
      adapter={adapter as BlinkAdapter}
      websiteText="blink-with-anti.vercel.app"
      stylePreset="x-dark"
    />
  );
}

function BlinkClientContent() {
  const searchParams = useSearchParams();
  const encodedAction = searchParams.get("action");

  let actionUrl = "";

  if (encodedAction) {
    try {
      // Decode the action parameter
      actionUrl = decodeURIComponent(encodedAction);
      console.log("[Blink Client] Decoded action URL:", actionUrl);

      // If it has solana-action:// protocol, remove it
      if (actionUrl.startsWith("solana-action://")) {
        actionUrl = actionUrl.replace("solana-action://", "");
        console.log("[Blink Client] Stripped protocol, URL:", actionUrl);
      }
    } catch (error) {
      console.error("[Blink Client] Error decoding action:", error);
    }
  }

  if (!actionUrl) {
    return (
      <div style={styles.page}>
        <div style={styles.orbTopRight} />
        <div style={styles.orbBottomLeft} />

        <main style={styles.main}>
          <div style={styles.header}>
            <h1 style={styles.title}>Universal Blink Client</h1>
            <p style={styles.subtitle}>
              Share Solana Actions anywhere by wrapping them in a proper Blink URL.
            </p>
            <p style={{ color: "#a1a1aa", fontSize: "0.9rem", marginTop: "1rem" }}>
              Example:
              <br />
              <code style={{ background: "#27272a", padding: "0.5rem", display: "block", marginTop: "0.5rem", borderRadius: "0.5rem", fontSize: "0.8rem", wordBreak: "break-all" }}>
                /blink?action=solana-action%3Ahttps%3A%2F%2Fblink-with-anti.vercel.app%2Fapi%2Fdonate
              </code>
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={[]} autoConnect>
        <WalletModalProvider>
          <div style={styles.page}>
            {/* Background gradient orbs */}
            <div style={styles.orbTopRight} />
            <div style={styles.orbBottomLeft} />

            <main style={styles.main}>
              {/* Header */}
              <div style={styles.header}>
                <div style={styles.badge}>
                  <span style={styles.badgeDot} />
                  Solana Devnet
                </div>
                <h1 style={styles.title}>Blink Action</h1>
                <p style={styles.subtitle}>
                  Execute a Solana Action directly.
                </p>
              </div>

              {/* Wallet button */}
              <div style={styles.walletRow}>
                <WalletMultiButton />
              </div>

              {/* Blink Card */}
              <div style={styles.cardWrapper}>
                <BlinkCard actionUrl={actionUrl} />
              </div>

              {/* Footer */}
              <div style={styles.footer}>
                <p style={{ fontSize: "0.85rem", color: "#71717a" }}>
                  Action URL: <code style={{ fontSize: "0.75rem" }}>{actionUrl}</code>
                </p>
              </div>
            </main>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

function BlinkClientPageWithSuspense() {
  return (
    <Suspense fallback={
      <div style={styles.page}>
        <div style={styles.orbTopRight} />
        <div style={styles.orbBottomLeft} />
        <main style={styles.main}>
          <p style={{ textAlign: "center", color: "#a1a1aa" }}>Loading...</p>
        </main>
      </div>
    }>
      <BlinkClientContent />
    </Suspense>
  );
}

export default BlinkClientPageWithSuspense;

const styles = {
  page: {
    minHeight: "100vh" as const,
    background: "linear-gradient(135deg, #0f0f1e 0%, #1a1a2e 50%, #16213e 100%)",
    display: "flex" as const,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: "1rem",
    position: "relative" as const,
    overflow: "hidden" as const,
  },
  orbTopRight: {
    position: "absolute" as const,
    top: "-100px",
    right: "-100px",
    width: "300px",
    height: "300px",
    background: "radial-gradient(circle, rgba(167, 139, 250, 0.15) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(40px)",
  },
  orbBottomLeft: {
    position: "absolute" as const,
    bottom: "-100px",
    left: "-100px",
    width: "300px",
    height: "300px",
    background: "radial-gradient(circle, rgba(139, 92, 246, 0.15) 0%, transparent 70%)",
    borderRadius: "50%",
    filter: "blur(40px)",
  },
  main: {
    maxWidth: "600px",
    width: "100%",
    zIndex: 10,
    animation: "fadeIn 0.5s ease-in",
  },
  header: {
    textAlign: "center" as const,
    marginBottom: "2rem",
  },
  badge: {
    display: "inline-flex" as const,
    alignItems: "center" as const,
    gap: "0.5rem",
    background: "rgba(167, 139, 250, 0.1)",
    border: "1px solid rgba(167, 139, 250, 0.3)",
    color: "#a78bfa",
    padding: "0.5rem 1rem",
    borderRadius: "9999px",
    fontSize: "0.85rem",
    fontWeight: "500" as const,
    marginBottom: "1rem",
  },
  badgeDot: {
    width: "6px",
    height: "6px",
    background: "#a78bfa",
    borderRadius: "50%",
  },
  title: {
    fontSize: "2.5rem",
    fontWeight: "700" as const,
    background: "linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)",
    backgroundClip: "text",
    WebkitBackgroundClip: "text" as const,
    WebkitTextFillColor: "transparent" as const,
    marginBottom: "1rem",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#a1a1aa",
    maxWidth: "500px",
    margin: "0 auto",
    lineHeight: "1.6",
  },
  walletRow: {
    display: "flex" as const,
    justifyContent: "center" as const,
    marginBottom: "2rem",
  },
  cardWrapper: {
    background: "rgba(39, 39, 42, 0.5)",
    border: "1px solid rgba(167, 139, 250, 0.1)",
    borderRadius: "1rem",
    padding: "2rem",
    backdropFilter: "blur(10px)",
    boxShadow: "0 8px 32px rgba(0, 0, 0, 0.3)",
  },
  footer: {
    textAlign: "center" as const,
    marginTop: "2rem",
    paddingTop: "1rem",
    borderTop: "1px solid rgba(167, 139, 250, 0.1)",
  },
};
