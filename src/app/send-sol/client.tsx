"use client";

import { useMemo } from "react";
import { Blink, useBlink, BlinkAdapter } from "@dialectlabs/blinks";
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

const ACTION_URL = "https://demo-blinks.vercel.app/api/actions/send-sol";
const RPC_URL = "https://api.devnet.solana.com";

function BlinkCard() {
  const { adapter } = useBlinkSolanaWalletAdapter(RPC_URL);
  const { blink } = useBlink({ url: ACTION_URL });

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
        <p style={{ color: "#a1a1aa", fontSize: "0.9rem" }}>Loading Blink…</p>
      </div>
    );
  }

  return (
    <Blink
      blink={blink}
      adapter={adapter as BlinkAdapter}
      websiteText="demo-blinks.vercel.app"
      stylePreset="x-dark"
    />
  );
}

export default function SendPage() {
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div style={styles.page}>
            <div style={styles.orbTopRight} />
            <div style={styles.orbBottomLeft} />

            <main style={styles.main}>
              <div style={styles.header}>
                <div style={styles.badge}>
                  <span style={styles.badgeDot} />
                  Solana Devnet
                </div>
                <h1 style={styles.title}>Send SOL</h1>
                <p style={styles.subtitle}>
                  Transfer SOL to any recipient wallet.
                  <br />
                  Connect, enter recipient, choose amount, approve.
                </p>
              </div>

              <div style={styles.walletRow}>
                <WalletMultiButton />
              </div>

              <div style={styles.cardWrapper}>
                <div style={styles.card}>
                  <BlinkCard />
                </div>
              </div>

              <div style={styles.info}>
                <div style={styles.step}>
                  <div style={styles.stepNumber}>1</div>
                  <span>Connect your Solana wallet</span>
                </div>
                <div style={styles.divider} />
                <div style={styles.step}>
                  <div style={styles.stepNumber}>2</div>
                  <span>Enter recipient and amount</span>
                </div>
                <div style={styles.divider} />
                <div style={styles.step}>
                  <div style={styles.stepNumber}>3</div>
                  <span>Approve the transfer</span>
                </div>
              </div>
            </main>

            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
              @keyframes float {
                0%, 100% { transform: translateY(0px); }
                50% { transform: translateY(-8px); }
              }
            `}</style>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#09090b",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem 1rem",
    position: "relative",
    overflow: "hidden",
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  } as React.CSSProperties,
  orbTopRight: {
    position: "absolute",
    top: "-15%",
    right: "-10%",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)",
    pointerEvents: "none",
  } as React.CSSProperties,
  orbBottomLeft: {
    position: "absolute",
    bottom: "-15%",
    left: "-10%",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
  } as React.CSSProperties,
  main: {
    position: "relative",
    zIndex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    maxWidth: 480,
    width: "100%",
    gap: "1.5rem",
  } as React.CSSProperties,
  header: {
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "0.75rem",
  } as React.CSSProperties,
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "4px 14px",
    borderRadius: 999,
    background: "rgba(139,92,246,0.12)",
    border: "1px solid rgba(139,92,246,0.25)",
    color: "#c4b5fd",
    fontSize: "0.75rem",
    fontWeight: 600,
    letterSpacing: "0.04em",
    textTransform: "uppercase",
  } as React.CSSProperties,
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: "50%",
    background: "#34d399",
    display: "inline-block",
    boxShadow: "0 0 6px #34d399",
  } as React.CSSProperties,
  title: {
    fontSize: "clamp(2rem, 5vw, 3rem)",
    fontWeight: 800,
    margin: 0,
    background: "linear-gradient(135deg, #c4b5fd 0%, #34d399 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    lineHeight: 1.1,
  } as React.CSSProperties,
  subtitle: {
    color: "#a1a1aa",
    fontSize: "1rem",
    lineHeight: 1.6,
    margin: 0,
    maxWidth: 360,
  } as React.CSSProperties,
  walletRow: {
    display: "flex",
    justifyContent: "center",
  } as React.CSSProperties,
  cardWrapper: {
    position: "relative",
    width: "100%",
    animation: "float 6s ease-in-out infinite",
  } as React.CSSProperties,
  card: {
    position: "relative",
    width: "100%",
    borderRadius: 14,
    background: "rgba(24,24,27,0.85)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
    boxShadow: "0 4px 30px rgba(0,0,0,0.5), 0 0 60px rgba(139,92,246,0.08)",
  } as React.CSSProperties,
  info: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    padding: "0.75rem 1.25rem",
    borderRadius: 12,
    background: "rgba(24,24,27,0.6)",
    border: "1px solid rgba(255,255,255,0.06)",
    width: "100%",
    justifyContent: "center",
    flexWrap: "wrap",
  } as React.CSSProperties,
  step: {
    display: "flex",
    alignItems: "center",
    gap: 6,
  } as React.CSSProperties,
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: "50%",
    background: "rgba(139,92,246,0.2)",
    color: "#c4b5fd",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "0.7rem",
    fontWeight: 700,
    flexShrink: 0,
  } as React.CSSProperties,
  divider: {
    width: 20,
    height: 1,
    background: "rgba(255,255,255,0.1)",
  } as React.CSSProperties,
};
