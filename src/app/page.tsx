"use client";

import { useMemo, useState } from "react";
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

const ACTION_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/api/actions/donate-sol`
    : "http://localhost:3000/api/actions/donate-sol";
const RPC_URL = "https://api.devnet.solana.com";
const SHARE_URL =
  typeof window !== "undefined"
    ? `${window.location.origin}/donate-sol`
    : "https://blink-with-anti.vercel.app/donate-sol";

function BlinkPreview() {
  const { adapter } = useBlinkSolanaWalletAdapter(RPC_URL);
  const { blink } = useBlink({ url: ACTION_URL });

  if (!blink) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "3rem", gap: "1rem" }}>
        <div style={{ width: 40, height: 40, border: "3px solid transparent", borderTopColor: "#a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <p style={{ color: "#a1a1aa", fontSize: "0.9rem" }}>Loading Blink…</p>
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

function CopyButton() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(SHARE_URL).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        padding: "10px 20px",
        borderRadius: 999,
        background: copied
          ? "rgba(52,211,153,0.15)"
          : "linear-gradient(135deg, #7c3aed, #2563eb)",
        border: copied ? "1px solid rgba(52,211,153,0.4)" : "none",
        color: copied ? "#34d399" : "#fff",
        fontSize: "0.85rem",
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 0.2s ease",
        boxShadow: copied ? "none" : "0 4px 20px rgba(124,58,237,0.3)",
      }}
    >
      {copied ? (
        <>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M3 8.5L6.5 12L13 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect x="5" y="5" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M3 11V3.5C3 2.67 3.67 2 4.5 2H11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Copy Blink URL
        </>
      )}
    </button>
  );
}

export default function Home() {
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={RPC_URL}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div style={styles.page}>
            {/* Decorative background orbs */}
            <div style={styles.orbPurple} />
            <div style={styles.orbGreen} />

            <main style={styles.main}>
              {/* Hero */}
              <div style={styles.hero}>
                <h1 style={styles.title}>
                  Solana Blink
                  <br />
                  <span style={styles.titleAccent}>Workspace</span>
                </h1>
                <p style={styles.subtitle}>
                  Your donate blink is live. Share the URL on X, Discord, Telegram — anywhere.
                  <br />
                  Users with the Chrome extension see it unfurl inline.
                </p>
              </div>

              {/* Two column layout */}
              <div style={styles.grid}>
                {/* Left: Share card */}
                <div style={styles.panel}>
                  <h2 style={styles.panelTitle}>📤 Share Your Blink</h2>
                  <div style={styles.urlBox}>
                    <code style={styles.urlCode}>{SHARE_URL}</code>
                  </div>
                  <CopyButton />
                  <p style={styles.panelDesc}>
                    Share this URL on any platform. Visitors will land on a beautiful
                    donate page where they can connect their wallet and send SOL.
                  </p>

                  <div style={styles.divider} />

                  <h3 style={styles.panelSubtitle}>🧩 Chrome Extension</h3>
                  <p style={styles.panelDesc}>
                    For X.com unfurling, install the custom Chrome extension from the{" "}
                    <code style={styles.inlineCode}>chrome-extension/</code> directory:
                  </p>
                  <ol style={styles.instructionList}>
                    <li>
                      <code style={styles.inlineCode}>cd chrome-extension && npm install && npm run build</code>
                    </li>
                    <li>
                      Open <code style={styles.inlineCode}>chrome://extensions</code> → Enable Developer Mode
                    </li>
                    <li>Click &quot;Load unpacked&quot; → Select the <code style={styles.inlineCode}>chrome-extension/dist</code> folder</li>
                    <li>
                      Post the Blink URL on X.com → it auto-unfurls! 🎉
                    </li>
                  </ol>
                </div>

                {/* Right: Live preview */}
                <div style={styles.panel}>
                  <h2 style={styles.panelTitle}>⚡ Live Preview</h2>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: "1rem" }}>
                    <WalletMultiButton />
                  </div>
                  <div style={styles.blinkWrapper}>
                    <div style={styles.blinkGlow} />
                    <div style={styles.blinkCard}>
                      <BlinkPreview />
                    </div>
                  </div>
                </div>
              </div>

              {/* API info */}
              <div style={styles.apiBar}>
                <span style={styles.apiLabel}>Action API:</span>
                <code style={styles.apiUrl}>/api/actions/donate-sol</code>
                <span style={styles.apiLabel}>Actions JSON:</span>
                <code style={styles.apiUrl}>/actions.json</code>
              </div>
            </main>

            <style>{`
              @keyframes spin {
                to { transform: rotate(360deg); }
              }
            `}</style>
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

/* ─── Inline Styles ─── */

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    background: "#09090b",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "3rem 1.5rem",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  },
  orbPurple: {
    position: "absolute",
    top: "-10%",
    left: "20%",
    width: 600,
    height: 600,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(124,58,237,0.1) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  orbGreen: {
    position: "absolute",
    bottom: "-20%",
    right: "10%",
    width: 500,
    height: 500,
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(52,211,153,0.08) 0%, transparent 70%)",
    pointerEvents: "none",
  },
  main: {
    position: "relative",
    zIndex: 1,
    maxWidth: 960,
    width: "100%",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2rem",
  },
  hero: {
    textAlign: "center",
    maxWidth: 600,
  },
  title: {
    fontSize: "clamp(2rem, 4vw, 3rem)",
    fontWeight: 800,
    color: "#fafafa",
    margin: 0,
    lineHeight: 1.15,
  },
  titleAccent: {
    background: "linear-gradient(135deg, #a78bfa 0%, #34d399 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: "#a1a1aa",
    fontSize: "1rem",
    lineHeight: 1.7,
    marginTop: "0.75rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "1.5rem",
    width: "100%",
  },
  panel: {
    background: "rgba(24,24,27,0.7)",
    backdropFilter: "blur(20px)",
    border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 16,
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  panelTitle: {
    color: "#fafafa",
    fontSize: "1.15rem",
    fontWeight: 700,
    margin: 0,
  },
  panelSubtitle: {
    color: "#e4e4e7",
    fontSize: "0.95rem",
    fontWeight: 600,
    margin: 0,
  },
  panelDesc: {
    color: "#a1a1aa",
    fontSize: "0.85rem",
    lineHeight: 1.6,
    margin: 0,
  },
  urlBox: {
    background: "rgba(0,0,0,0.4)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 10,
    padding: "10px 14px",
    overflowX: "auto",
  },
  urlCode: {
    color: "#a78bfa",
    fontSize: "0.8rem",
    wordBreak: "break-all",
  },
  inlineCode: {
    background: "rgba(139,92,246,0.1)",
    color: "#c4b5fd",
    padding: "2px 6px",
    borderRadius: 4,
    fontSize: "0.8rem",
  },
  divider: {
    height: 1,
    background: "rgba(255,255,255,0.06)",
    margin: "0.25rem 0",
  },
  instructionList: {
    color: "#a1a1aa",
    fontSize: "0.82rem",
    lineHeight: 1.8,
    paddingLeft: "1.25rem",
    margin: 0,
  },
  blinkWrapper: {
    position: "relative",
    width: "100%",
  },
  blinkGlow: {
    position: "absolute",
    inset: -2,
    borderRadius: 14,
    background: "linear-gradient(135deg, #7c3aed, #34d399)",
    opacity: 0.2,
    filter: "blur(14px)",
    pointerEvents: "none",
  },
  blinkCard: {
    position: "relative",
    borderRadius: 12,
    background: "rgba(24,24,27,0.9)",
    border: "1px solid rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  apiBar: {
    display: "flex",
    alignItems: "center",
    gap: "0.75rem",
    flexWrap: "wrap",
    justifyContent: "center",
    padding: "0.75rem 1.25rem",
    borderRadius: 12,
    background: "rgba(24,24,27,0.5)",
    border: "1px solid rgba(255,255,255,0.05)",
  },
  apiLabel: {
    color: "#52525b",
    fontSize: "0.75rem",
    fontWeight: 600,
  },
  apiUrl: {
    color: "#34d399",
    fontSize: "0.78rem",
    fontFamily: "monospace",
  },
};
