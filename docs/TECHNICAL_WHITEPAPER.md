# Demo Blink App: Technical Whitepaper

**Version:** 1.0  
**Date:** April 24, 2026  
**Project:** Demo Blink App  
**Status:** Implemented reference system

---

## Executive Summary

Demo Blink App is a working reference implementation that reduces the gap between seeing a Solana action on social media and executing that action from a wallet. The system combines a Blink provider, a shareable donation page, a Blink client route, and a Chrome extension that unfurls supported links directly inside `x.com`.

The implementation demonstrates a full end-to-end flow:

1. A user shares a human-friendly URL such as `/donate-sol`
2. X.com displays the link in a post or DM
3. The extension resolves the URL into a Solana Action endpoint
4. Blink metadata is fetched and rendered inline
5. The user connects Phantom or Backpack
6. The backend returns an unsigned Solana transaction
7. The wallet signs locally
8. The extension broadcasts and confirms on Solana Devnet

This project exists because native social unfurling for Blinks is still constrained by registry trust and platform support. In practice, registry-backed X.com unfurling works best for verified or trusted Blinks. Blink App adds a controlled extension-based unfurl path so the product remains usable even when a Blink is not yet natively surfaced by the platform.

---

## 1. Problem Statement

### 1.1 The Social-to-Transaction Gap

Blockchain transactions are still operationally heavy for users who discover an action in a social feed. A simple donation usually requires:

`see post -> copy address -> open wallet -> paste address -> enter amount -> review -> sign -> return`

This creates several forms of friction:

- context switching between X, wallet, and confirmation surfaces
- address copy and paste risk
- poor discoverability of on-chain actions
- reduced conversion on mobile and casual traffic
- low trust when a link cannot be clearly classified as safe

### 1.2 Why This Matters

For creators, communities, and campaigns, the user intent already exists when the post is seen. The drop-off happens during execution. If the action can be rendered where the user already is, conversion improves and cognitive overhead drops.

### 1.3 Why Existing Solutions Are Incomplete

Traditional alternatives do not solve the full problem:

- wallet address sharing still requires manual entry
- QR codes are not native to social timelines
- custodial payment flows compromise self-custody
- bespoke in-app integrations do not generalize across wallets and clients
- native Blink unfurling depends on ecosystem support and trust registration

---

## 2. Solution Overview

Blink App solves this by combining four pieces:

- a **share URL** at `/donate-sol`
- an **action discovery layer** via `/actions.json` and `solana:action:apiUrl`
- a **Blink action API** at `/api/actions/donate-sol`
- a **Chrome extension** that unfurls eligible links inline on `x.com`

The result is a non-custodial donation flow that works both as a standalone Blink experience and as an embedded social interaction.

### 2.1 Core User Experience

From the user’s perspective the system behaves like this:

1. Someone posts `https://demo-blinks.vercel.app/donate-sol`
2. The extension detects the link in the X.com DOM
3. The extension resolves the final target URL, including `t.co` redirects
4. It discovers the action URL through one of the supported resolution paths
5. It checks the Dialect/Blinks registry security state
6. It mounts an inline Blink UI inside the post
7. The user picks a preset amount or enters a custom amount
8. Phantom or Backpack signs the transaction
9. The extension sends and confirms the transaction on Solana Devnet

### 2.2 What This Project Demonstrates

This repository is not just a mock UI. It demonstrates:

- standards-based Blink metadata
- action URL discovery via multiple strategies
- trust filtering before render
- wallet access from a Chrome extension through a page bridge
- unsigned transaction construction on the server
- client-side signing only
- broadcast, confirmation, and friendly error handling

---

## 3. Implemented System Components

### 3.1 Share Page

**Route:** `/donate-sol`

This is the URL intended for people to share. It is human-readable and social-friendly. The page includes:

- Open Graph metadata
- a `solana:action:apiUrl` meta tag
- a browser-accessible donation experience

This page acts as the social entry point for the unfurling flow.

### 3.2 Blink Resolution Endpoint

**Route:** `/actions.json`

This endpoint maps friendly website paths to Solana Action API endpoints. It allows a Blink client or extension to transform a URL like `/donate-sol` into `/api/actions/donate-sol`.

This is important because users share website URLs, not raw API URLs.

### 3.3 Action Metadata Endpoint

**Route:** `GET /api/actions/donate-sol`

This endpoint returns Blink metadata including:

- `type: "action"`
- title
- description
- icon
- preset donation actions
- custom amount support

The metadata is what the extension renders into the timeline as an interactive Blink card.

### 3.4 Transaction Construction Endpoint

**Route:** `POST /api/actions/donate-sol`

This endpoint:

- accepts the user wallet public key
- accepts the requested donation amount
- validates the request
- checks balance and estimated fee
- builds an unsigned Solana transfer transaction
- returns the serialized transaction to the client

The server never signs on behalf of the user.

### 3.5 Blink Client Route

**Route:** `/blink`

This route supports a standard Blink-client style flow where an `?action=` parameter can be supplied and rendered directly in the app. It complements the social unfurl path and provides a direct fallback entry point for testing and compatibility.

### 3.6 Chrome Extension

**Primary file:** `chrome-extension/src/contentScript.ts`

The extension is the key integration layer for X.com. It:

- scans tweets and messages for candidate links
- resolves `t.co` short links
- performs Blink discovery
- checks trust/security state
- mounts the Blink component inline
- connects to wallet providers
- signs, sends, and confirms transactions

### 3.7 Wallet Bridge

**Primary file:** `chrome-extension/src/pageWalletBridge.ts`

Chrome content scripts run in an isolated execution world. Phantom and Backpack inject providers into the page world. To bridge that boundary, this project injects a page-level script and communicates through `window.postMessage`.

The bridge supports:

- provider detection
- wallet connect
- transaction signing
- message signing

---

## 4. Architecture

### 4.1 High-Level Architecture

```text
User
  -> X.com timeline / DM
  -> Chrome extension content script
  -> Page wallet bridge
  -> Phantom / Backpack

Chrome extension
  -> Dialect/Blinks registry checks
  -> /actions.json
  -> /donate-sol metadata page
  -> /api/actions/donate-sol

Backend
  -> Solana Devnet RPC
```

### 4.2 Layered Responsibilities

| Layer | Responsibility |
|------|----------------|
| Social surface | Hosts the shared URL in timeline or DM |
| Extension layer | Detects, resolves, classifies, and renders Blinks |
| Resolution layer | Maps shared URLs to action endpoints |
| Provider layer | Returns metadata and unsigned transactions |
| Wallet layer | Connects and signs locally |
| Settlement layer | Broadcasts and confirms on Solana Devnet |

### 4.3 Resolution Strategies

The extension supports three resolution strategies, in this order:

1. **Direct action URL**  
   If the shared URL already returns a valid action payload, it can be used directly.

2. **`/actions.json` mapping**  
   The extension requests `/actions.json` and maps a share URL to the matching action endpoint.

3. **Page metadata fallback**  
   The extension reads `solana:action:apiUrl` from page metadata when direct mapping is not enough.

This layered approach improves resilience and allows user-friendly links to resolve into machine-friendly action endpoints.

---

## 5. Trust, Registry, and Security Model

### 5.1 Registry Reality on X.com

One of the important ecosystem constraints is that Blink rendering on X.com is not simply a matter of publishing a valid endpoint. Trust classification matters.

In practical terms:

- Dialect/Blinks registry data is used to classify websites and action URLs
- native or registry-backed unfurling is strongest for verified or trusted Blinks
- untrusted or malicious links must not be rendered blindly

This is why this Blink App includes explicit trust checks before mounting preview content.

### 5.2 Security States

The project treats link safety using three states:

- `trusted`
- `unknown`
- `malicious`

For allowlisted custom preview flows, the extension checks both:

- the **website state**
- the **action state**

If either state is malicious, the preview is blocked.

### 5.3 Trust Policy Modes

The Blink ecosystem logic used by the extension supports three trust policy levels:

| Mode | Meaning | Typical use |
|------|---------|-------------|
| `trusted-only` | Only trusted / verified Blinks are rendered | strict production posture |
| `non-malicious` | Trusted and unknown are allowed, malicious is blocked | balanced default |
| `all` | Everything can be rendered | debugging or tightly controlled environments |

### 5.4 How This Repo Uses Those Modes

This repository uses the modes carefully:

- the standard Dialect Twitter observer is initialized with `securityLevel: "non-malicious"`
- the custom preview path blocks malicious websites and malicious actions before mounting
- the mounted Blink component is rendered with `securityLevel: "all"` only after those prechecks have already passed

That combination gives a practical developer workflow without disabling security classification entirely.

### 5.5 Extension Unfurl Options

From a product and operator perspective, the extension is designed around three unfurl options:

- **Trusted only**
- **Non-malicious**
- **All**

These correspond directly to the trust policy model above. For this implementation, the important operational behavior is that the project does not blindly unfurl arbitrary third-party links. It favors:

- verified or trusted registry-backed links when possible
- controlled preview for allowlisted hosts
- hard blocking for malicious classifications

### 5.6 Host Allowlist

The custom preview path is intentionally limited to an allowlist, including local and deployment hosts such as:

- `demo-blinks.vercel.app`
- `localhost:3000`
- `127.0.0.1:3000`

This reduces the blast radius of preview behavior and makes the extension safer during development and demos.

---

## 6. Detailed Execution Flow

### 6.1 Discovery and Resolution

1. The extension scans the X.com DOM for candidate anchors
2. If the link is a `t.co` short link, it resolves the final target
3. It checks whether the host is allowlisted for custom preview logic
4. It queries registry-derived website security state
5. It tries direct action discovery
6. If needed, it tries `/actions.json`
7. If needed, it falls back to page metadata
8. It checks the action security state
9. It fetches Blink metadata and mounts the UI

### 6.2 Wallet and Transaction Flow

1. The user clicks a donation action
2. The extension requests provider information from the page bridge
3. Phantom or Backpack connects if needed
4. The extension calls the action `POST` endpoint with amount and account
5. The backend returns an unsigned transaction
6. The wallet signs the transaction locally
7. The extension submits the signed transaction via RPC
8. The extension confirms the transaction and updates UI state

### 6.3 Error Handling

The implementation includes user-focused handling for:

- missing wallet provider
- wallet rejection
- invalid amount
- invalid account
- insufficient SOL balance
- duplicate transaction submission
- Solana simulation and send failures

An important implemented improvement is duplicate-send handling: if a signed transaction has already been processed, the extension reuses the known signature instead of surfacing a false hard failure.

---

## 7. Non-Custodial Security Properties

This Blink App preserves the key property that makes Blinks operationally attractive: the backend never holds user funds or private keys.

### 7.1 What Happens on the Server

The server may:

- validate input
- read chain state
- estimate fees
- build unsigned transactions

### 7.2 What Never Happens on the Server

The server does not:

- access private keys
- sign transactions for the user
- custody user assets

### 7.3 What Happens in the Wallet

The wallet:

- exposes the public key
- shows connect prompts
- shows signature approval UI
- signs transactions locally

This preserves user custody while still enabling an embedded social flow.

---

## 8. Problem-Solution Mapping

| Problem | Implemented Solution |
|------|----------------------|
| Social discovery does not convert to action | Inline X.com unfurling via extension |
| Friendly URLs are not action endpoints | `/actions.json` and metadata-based resolution |
| Wallet provider inaccessible from content script | page-context wallet bridge |
| Unsafe links should not be rendered | registry checks plus allowlist plus trust modes |
| Users need fast donation choices | preset amounts and custom amount input |
| Transaction failure messages are confusing | friendly parsing and diagnostic logging |
| Duplicate submissions can appear as failures | signed signature reuse on already-processed transactions |

---

## 9. Why the Architecture Matters

This architecture is valuable because it is realistic, modular, and portable.

### 9.1 Realistic

It deals with actual platform constraints:

- X.com DOM volatility
- `t.co` redirection
- wallet provider isolation in Chrome extensions
- registry trust classification
- incomplete native Blink support

### 9.2 Modular

Each part can evolve independently:

- the share page can change without changing the action API
- the extension can change discovery rules without changing the backend
- the wallet bridge can support more providers over time
- the action API can expand beyond donations

### 9.3 Portable

The same action API can be consumed by:

- the Chrome extension
- the `/blink` client route
- future wallet integrations
- future native social clients

---

## 10. Current Limitations

This project is production-shaped, but still intentionally scoped as a reference implementation.

Current limitations include:

- Solana Devnet only
- focused on a single donation use case
- X.com relies on an extension rather than native platform support
- trust posture depends partly on external registry classification
- custom preview is intentionally restricted to allowlisted hosts

These are acceptable constraints for a reference architecture and demo system.

---

## 11. Future Directions

Natural next steps include:

- mainnet support
- multiple Blink actions beyond donations
- admin-configurable trust mode selection in the extension UI
- richer analytics around unfurl conversion
- support for additional wallet providers
- deeper compatibility with native Blink clients as ecosystem support improves

---

## 12. Conclusion

This Blink App shows that the core Blink promise is viable today when supported by the right infrastructure around it. The project demonstrates more than a donation page; it demonstrates a practical architecture for resolving, classifying, rendering, signing, and settling blockchain actions from inside a social context.

Most importantly, it addresses the real-world gap between standards compliance and user-visible social execution. Dialect registry trust, X.com rendering behavior, wallet isolation, and URL resolution are not theoretical concerns in this system; they are implemented concerns with implemented answers.

The result is a complete reference flow built around:

- a shareable social URL
- standards-aligned action endpoints
- secure trust filtering
- inline unfurling on X.com
- non-custodial wallet signing
- confirmed on-chain execution

That combination is the central contribution of this repository.
