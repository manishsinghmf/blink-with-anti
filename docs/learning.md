# Solana Blink Project - Learning & Progress Log

## 1. Initial Request
**What you asked:** 
You requested to generate a "Donate Me" Solana Blink based on the [Dialect documentation](https://docs.dialect.to/blinks/blinks-provider/build-your-first-blink). You wanted to learn how Solana Blinks worked, what role Dialect played, and how to use the generated Blink. The technical stack requested was Next.js, React, TypeScript, and the `@solana/actions` SDK.

**What I did:** 
1. I read through the provided documentation link.
2. I created an initial `implementation_plan.md` outlining the basic concepts of Blinks (Blink Providers, Blink Clients, and Dialect's role as the standard-bearer and registry).
3. I detailed a plan to set up the Next.js project and the required `GET`/`POST` REST endpoints for the Blink.

## 2. Specification Review
**What you asked:**
Before proceeding, you requested a `spec.md` file to manually review the architectural approach. Later, you specified that the `spec.md` should be placed directly inside the `docs/` folder in your workspace.

**What I did:**
1. I created the `docs/spec.md` file outlining:
   - The architectural flow.
   - The specific endpoints required (`GET /actions.json`, `OPTIONS /api/actions/donate-sol`, `GET /api/actions/donate-sol`, `POST /api/actions/donate-sol`).
   - The initial plan to test using Dialect's `dial.to` playground.

## 3. Pivot on Testing Strategy
**What you asked:**
You notified me that `dial.to` was currently down and requested an alternative testing method.

**What I did:**
1. I updated `docs/spec.md` to remove the reliance on `dial.to`.
2. I proposed a new testing methodology: Building a custom frontend directly on the Next.js application's root page (`src/app/page.tsx`) utilizing the `@dialectlabs/blinks` React library to manually render and interact with the blink natively.
3. You confirmed and approved this pivot.

## 4. Execution & Implementation
**What you asked:**
To proceed with the code changes.

**What I did:**
1. **Next.js Initialization:** Ran `npx create-next-app` to set up the workspace.
2. **Dependencies:** Installed `@solana/web3.js`, `@solana/actions`, and `@dialectlabs/blinks`.
3. **API Implementation:** 
    - Created `src/app/actions.json/route.ts` to map the root routes as safely expected by Blink clients.
    - Created `src/app/api/actions/donate-sol/route.ts` which handles CORS preflight (OPTIONS), fetching Blink Metadata (GET), and returning the compiled `SystemProgram.transfer` transaction (POST). We set a generic Devnet wallet address for testing.
4. **Visuals:** I utilized my internal image generation tools to create a cinematic 3D render of a Solana coin on a glass pedestal to serve as the visual asset for the Blink (`public/donate-sol.jpg`).
5. **Client Simulator:** Built a sleek, dark-themed React UI on `src/app/page.tsx` that leverages `Action.fetch()` to fetch the local API route and displays it using Dialect's `<Blink />` component.
6. **Deployment:** Spun up the Next.js dev server on `localhost:3000` to allow you to interact with the finished product.

## 5. UI Rendering Troubleshooting
**What you asked:**
You ran the application and encountered a runtime TypeError: `Cannot read properties of undefined (reading 'url')` coming from the `Blink` component.

**What I did:**
1. I diagnosed that the `<Blink>` component requires a proper `BlinkInstance` loaded via the `useBlink()` hook, rather than directly using `Action.fetch()`.
2. It also requires an `adapter` prop provided via `useBlinkSolanaWalletAdapter()`, along with Solana wallet adapter context providers.
3. I rewrote `src/app/page.tsx` to properly set up the `ConnectionProvider`, `WalletProvider`, `WalletModalProvider`, and integrated the hooks correctly.
4. Installed additional required packages: `@solana/wallet-adapter-react`, `@solana/wallet-adapter-react-ui`, and `@solana/wallet-adapter-base`.
5. Restarted the dev server to apply these changes.

## 6. Build Error Troubleshooting
**What you asked:**
You reported a build error during the update: `Export useBlinkSolanaWalletAdapter doesn't exist in target module`. You also requested that all interactions be properly documented in `learning.md`.

**What I did:**
1. I checked the exports of `@dialectlabs/blinks` and identified that `useBlinkSolanaWalletAdapter` is exported from a specific subpath: `@dialectlabs/blinks/hooks/solana`.
2. I fixed the import statement in `src/app/page.tsx` to correctly target the subpath.
3. Updated this `learning.md` file to ensure every interaction, including these troubleshooting steps, is properly documented.

## 7. Understanding the Generated Blink
**What you asked:**
You noticed that the UI rendered perfectly but mentioned: "It is just showing UI, It should generate blink".

**Explanation:**
In the Solana ecosystem, a "Blink" isn't a separate downloadable file or a distinct "generated" widget. 

Instead, a Blink is simply **the URL of the Action API we created** (`http://localhost:3000/api/actions/donate-sol`). 

1. **How it works normally:** When you share this URL on a supporting platform (like X.com with the Phantom or Backpack extension installed), the platform intercepts the link, calls our `GET` endpoint, and dynamically "unfurls" it into the precise UI you are seeing on `localhost:3000`. 
2. **Why we built the local UI:** Since `dial.to` (the default testing environment) was down, we built a custom Blink Client directly on our root page (`page.tsx`) to simulate exactly what happens when X.com unfurls your link. 
3. **Using the Blink:** If you connect a Solana devnet wallet using the "Select Wallet" button in our local UI, you can click the 0.01 SOL button and it will execute the `POST` endpoint from our API to construct and prompt you to sign a real transaction on the devnet.
4. **Sharing the Blink:** To share this in the real world, you would deploy this Next.js app to a host (like Vercel). The link you would share on Twitter would just be `https://your-vercel-domain.com/api/actions/donate-sol`. The ecosystem handles the rest!

## 8. Blink Registration & Alternatives (dial.to is down)
**What you asked:**
You attempted to register the blink at `https://dial.to/register` but found the entire `dial.to` site is down. You then shared the [Starters](https://docs.dialect.to/blinks/blinks-starters/index) and [Blinks Client](https://docs.dialect.to/blinks/blinks-client) documentation pages and asked what our options are.

**What I found:**
After reading through both docs extensively, here's the situation and our options:

### The Problem
- **Registration** happens at `https://dial.to/register` — which is currently down.
- **Testing** typically happens at `dial.to` — also down.
- Without registration, blinks show as `unknown` (yellow warning) or may not render at all on strict clients.

### Our Options

**Option A: Use `securityLevel="all"` for local/unregistered testing (Already done ✅)**
Our local client on `page.tsx` already renders the blink regardless of registry status. The Dialect docs explicitly mention `<Blink action={action} securityLevel="all" />` as the way to test unregistered blinks.

**Option B: Use Dialect's Headless API (via `api.dial.to`)**
Even though the `dial.to` UI is down, their API at `https://api.dial.to` may still be operational. We can test by calling:
```
curl 'https://api.dial.to/v1/blink?apiUrl=<YOUR_DEPLOYED_URL>/api/actions/donate-sol'
```
This returns the blink JSON payload that a client would use to render the UI. This requires deploying the app first (e.g., to Vercel).

**Option C: Deploy to Vercel + Get a Blink Client Key from `dashboard.dialect.to`**
Dialect has a dashboard at `https://dashboard.dialect.to/` where you can get a `X-Blink-Client-Key`. This key provides:
- High-performance caching
- Analytics
- Customized metadata & status messages
This is a separate system from the dial.to registry and may still be functional.

**Option D: Wait for dial.to to come back**
Registration is a manual review process. Once `dial.to` is back online, you submit your deployed blink URL and Dialect's team reviews it. Once approved, your blink status changes from `unknown` → `trusted`.

**Option E: Reach out on Dialect Discord**
The docs suggest joining [Discord](https://discord.gg/saydialect) for non-React integrations and registry inquiries. This could be a way to get registered while dial.to is down.

### Recommendation
The most productive next step would be to **deploy to Vercel** so the blink has a public URL, then try **Option B** (headless API) to verify it works end-to-end, and **Option C** (dashboard) for a client key. Registration (**Option D/E**) can happen whenever dial.to comes back.

## 9. Deployed to Vercel, X.com Unfurling, Dialect Deep Dive
**What you asked:**
1. You deployed the app to Vercel (`blink-with-anti.vercel.app`) and confirmed the headless API returns a valid `preview` response.
2. But when you posted the link on X.com, it did **not unfurl** into the interactive Blink UI.
3. You wanted to understand what Dialect actually does, its relationship with Solana Blinks, and why it is legitimate.
4. You wanted a review of Dialect's UI Components and the Standard Blinks Library (SBL).

---

### 9.1 Why X.com Doesn't Unfurl Your Blink

X.com (Twitter) does **not natively unfurl Blinks**. Here's why:

1. **Blink unfurling requires a Blink Client** — X.com itself is not a Blink Client. The unfurling on X.com only works when the user viewing the tweet has a **browser extension** installed that acts as a Blink Client.
2. **The extension that does this** is the **Dialect Blinks Chrome Extension** or wallets like **Phantom/Backpack** that have built-in Blink support.
3. **Your blink must be registered** — Even with the extension installed, unregistered blinks show with a yellow "unknown" warning. Blinks marked as `blocked` won't render at all. Since `dial.to` (the registration portal) is down, your blink is currently `unknown`.
4. **The `websiteUrl` in your preview response** points to `dial.to` which is down — this is the URL that the extension would try to resolve to show the unfurled UI.

**What you need for X.com unfurling to work:**
- A viewer with Phantom/Backpack wallet extension or Dialect's Blinks Chrome Extension installed
- Your blink registered as `trusted` in Dialect's registry (blocked by dial.to being down)
- Alternatively, the viewer's extension set to show `all` blinks (including unknown)

---

### 9.2 What is Dialect? Its Role & Legitimacy

**What is Dialect?**
Dialect is a Solana ecosystem company that created and maintains the **Blinks infrastructure layer**. They are NOT a part of the Solana Foundation, but they are a well-known, venture-backed project deeply integrated into the Solana ecosystem.

**Dialect's Role in the Blinks Ecosystem:**

| Layer | What Dialect Provides |
|-------|----------------------|
| **Standard/Spec** | Co-authored the Solana Actions specification (`@solana/actions`) with the Solana team. They define how `GET`/`POST` endpoints should behave. |
| **SDK** | `@dialectlabs/blinks` and `@dialectlabs/blinks-core` — the React libraries for rendering Blinks. |
| **Registry** | The safety layer. They maintain a registry of `trusted`, `unknown`, and `blocked` blinks at `dial.to/registry`. |
| **Proxy/API** | `api.dial.to` — a proxy API that fetches, caches, and enriches blink metadata for clients. |
| **Dashboard** | `dashboard.dialect.to` — developer dashboard for API keys, analytics, and blink management. |
| **Chrome Extension** | A browser extension that detects Solana Action URLs on websites like X.com and unfurls them into interactive UIs. |
| **Standard Blinks Library** | Pre-built, production-ready blinks for major Solana protocols (Jupiter, Raydium, Kamino, etc.). |

**Why is Dialect Legitimate?**
- They are the **official maintainers** of the `@solana/actions` npm package (published under the `@solana` scope).
- They co-authored the [Solana Actions Specification](https://solana.com/docs/advanced/actions) with the Solana Foundation.
- They are backed by notable Solana ecosystem investors.
- Their code is open-source on [GitHub](https://github.com/dialectlabs).
- Major Solana protocols (Jupiter, Jito, Raydium, Kamino, Marginfi, etc.) use their infrastructure.

**In short:** Dialect is the infrastructure provider that makes Blinks possible. The Solana Foundation defines the low-level Actions spec, and Dialect builds the entire ecosystem on top — the SDKs, the registry, the proxy, and the client tools.

---

### 9.3 Review: Dialect UI Components

From the [UI Components docs](https://docs.dialect.to/blinks/blinks-client/integrate/ui-components/blinks):

**Available Components:**

| Component | Package | Purpose |
|-----------|---------|---------|
| `<Blink>` | `@dialectlabs/blinks` | Full interactive blink with buttons, inputs, forms |
| `<Miniblink>` | `@dialectlabs/blinks` | Compact version, renders a single action from a blink |
| `<ActionsOnlyBlink>` | `@dialectlabs/blinks` | Renders only the action buttons without metadata |

**Key Hooks:**
- `useBlink({ url })` — Fetches the `BlinkInstance` from a URL, handles registry check
- `useBlinkSolanaWalletAdapter(rpcUrl)` — Creates a `BlinkAdapter` that connects to Solana wallet adapter
- `useBlinksRegistryInterval()` — Fetches the security registry and refreshes every 10 minutes

**Style Presets:** `'default'`, `'x-dark'`, `'x-light'`, `'custom'`

**Platforms:**
- **Web:** `@dialectlabs/blinks` (React)
- **Mobile:** `@dialectlabs/blinks-react-native` (React Native)

**What we're using:** Our `page.tsx` correctly uses `useBlink` + `useBlinkSolanaWalletAdapter` + `<Blink>` with the Solana wallet adapter context providers — exactly matching the official docs.

---

### 9.4 Review: Standard Blinks Library (SBL)

From the [SBL docs](https://docs.dialect.to/standard-blinks-library):

The SBL is a **collection of production-ready, pre-built Blink APIs** hosted by Dialect for major Solana DeFi protocols. Instead of building your own blink from scratch, you can use SBL endpoints to instantly embed on-chain experiences.

**Supported Protocols:**
Jupiter, Raydium, Kamino, Marginfi, Meteora, Orca, Drift, SAVE, DefiTuna, DefiCarrot, Lulo, and basic Solana transfers.

**Use Cases:**
- Swap tokens via Jupiter Blink
- Provide liquidity on Raydium/Orca
- Lend/Borrow on Kamino/Marginfi
- Simple SOL transfers

**How it relates to us:**
- SBL is for **consumers** who want to embed existing DeFi experiences without writing backend code.
- What **we built** is a custom Blink Provider — we wrote our own `GET`/`POST` endpoints for a "Donate SOL" action.
- SBL and custom blinks coexist — SBL gives you pre-built actions, custom blinks let you create anything.

---

## 10. New Goal: Shareable Blink URL with Unfurling + Chrome Extension

**What you asked:**
1. Use SBL providers and update the code to use Dialect's UI components and SBL library.
2. Create a blink URL for "donate me 0.1 SOL" that can be shared on web2 apps / social media.
3. The blink should unfurl on share so end users can donate.
4. Possibly create a Chrome extension to enable unfurling.

**Research & Analysis:**

### The Core Problem
For a blink to unfurl on X.com (or any website), the **viewer** needs a Blink Client running in their browser. There are two paths:

| Path | How It Works | Pros | Cons |
|------|-------------|------|------|
| **Use existing extension** (Phantom/Backpack) | Users who already have these wallets get auto-unfurling | Zero work for us | Only works for users who have the extension |
| **Build our own Chrome Extension** | We create a content script that watches for our blink URLs and injects the UI | Works for anyone who installs our extension | Requires extension development + user adoption |

### What SBL Does NOT Do For Us
SBL provides **pre-built blink APIs** for existing protocols (Jupiter swaps, Raydium liquidity, etc.). Our "Donate Me" blink is a **custom action** — SBL doesn't have a generic "donate to any wallet" endpoint. However, SBL does have a **Solana Transfer** blink that could be adapted. Our custom provider API already does exactly what we need though.

### What We CAN Do With Dialect's UI Components
We already use `<Blink>`, `useBlink()`, and `useBlinkSolanaWalletAdapter()`. These are the correct UI components. No changes needed on the provider side.

### Chrome Extension Plan
From the [Chrome Extension docs](https://docs.dialect.to/blinks/blinks-client/integrate/chrome) and [GitHub README](https://github.com/dialectlabs/blinks):

Dialect provides `setupTwitterObserver()` from `@dialectlabs/blinks/ext/twitter` which:
1. Watches the X.com DOM for links matching Solana Action URLs
2. Automatically unfurls them into interactive `<Blink>` components
3. Requires a `BlinkAdapter` (or `BlinkSolanaConfig`) with `connect`, `signTransaction`, and `confirmTransaction` methods

**To build our Chrome Extension, we need:**
1. A `manifest.json` with content script matching `https://twitter.com/*` and `https://x.com/*`
2. A content script that calls `setupTwitterObserver()` with our adapter
3. The adapter needs to connect to a wallet (we can use window.solana from Phantom/Backpack if available)
4. Bundle with a tool like Webpack/Vite for Chrome extension format

**The shareable URL format would be:**
```
https://blink-with-anti.vercel.app/api/actions/donate-sol?amount=0.1
```
When someone with our extension (or Phantom/Backpack) sees this URL on X.com, it unfurls into the donate button UI.

### Recommended Approach
1. **Keep the existing provider API** — it's already working and deployed on Vercel
2. **Build a Chrome Extension** — using Dialect's `setupTwitterObserver()` to auto-unfurl blink URLs on X.com
3. **Add a landing page** — update `page.tsx` to also serve as a shareable web page where users without the extension can still interact with the blink directly

## 11. Clarification: Blink URL vs Action URL & Phantom Unfurling

**What you asked:**
Is `https://blink-with-anti.vercel.app/api/actions/donate-sol?amount=0.1` the blink URL? How does unfurling work? You have Phantom installed — what else do you need?

### Blink URL vs Action URL — They Are Different!

There are **two different URLs** in the blinks ecosystem:

| Type | URL | Purpose |
|------|-----|---------|
| **Action API URL** | `https://blink-with-anti.vercel.app/api/actions/donate-sol` | The raw REST API endpoint (GET returns metadata, POST returns transaction). This is the backend. |
| **Blink URL (Website URL)** | `https://blink-with-anti.vercel.app/donate-sol` | The URL you **share** with people. This is just a normal-looking URL. |

### How `actions.json` Connects Them

Your `actions.json` (at `https://blink-with-anti.vercel.app/actions.json`) contains:
```json
{
  "rules": [
    { "pathPattern": "/*", "apiPath": "/api/actions/*" }
  ]
}
```

This means: when a blink client (like Phantom) sees the URL `https://blink-with-anti.vercel.app/donate-sol`, it:
1. Fetches `https://blink-with-anti.vercel.app/actions.json`
2. Matches `/donate-sol` against the rule `/*`
3. Maps it to `/api/actions/donate-sol`
4. Calls `GET /api/actions/donate-sol` to get the UI metadata
5. Renders the interactive blink UI inline

### So what URL do you share?

**Share this on X.com:**
```
https://blink-with-anti.vercel.app/donate-sol
```

**NOT** the `/api/actions/...` URL. The website URL is what blink clients look for.

### What You Need With Phantom Installed

1. **Enable Blinks in Phantom** — Open Phantom → Settings → scroll to "Experimental Features" or "Blinks" → make sure it's turned ON.
2. **Your blink must be registered OR Phantom set to show "all"** — Since `dial.to` is down and your blink is unregistered, Phantom may hide it. In Phantom Settings, look for a Blink security setting and set it to show **all blinks** (not just trusted ones).
3. **Share the correct URL** — Post `https://blink-with-anti.vercel.app/donate-sol` on X.com.
4. **The `/donate-sol` page should exist** — Currently, visiting this URL in a browser will show a 404. We should create a fallback page at this route so non-extension users see something useful.

### What We Need to Change in Code

1. **Create a `/donate-sol` page** — A Next.js page at `src/app/donate-sol/page.tsx` that renders the blink UI directly (for users without extensions).
2. **Nothing on the API side** — The provider API is already correct and deployed.

## 12. Desktop Setup: Phantom Doesn't Have Blink Settings

**What you asked:**
1. Will your setup work? (Linux Ubuntu, Chrome 147, Phantom extension 26.11.0, accessing X.com)
2. You can't find any "Enable Blinks" or "Experimental Features" settings in Phantom.

**What I found:**

### Phantom Does NOT Have Standalone Blink Settings Anymore
After researching, it appears that Phantom's Chrome extension **does not have a dedicated Blinks toggle** in its current version (26.11.0). The "Experimental Features" / "Blinks" setting that was previously documented may have been:
- Removed in newer versions
- Merged into core functionality (always on)
- OR only available on Phantom's mobile app

**This means Phantom alone may NOT unfurl blinks on X.com on desktop Chrome.**

### The Solution: Dialect's Own Chrome Extension
There is a **separate, official "Dialect Blinks" Chrome extension** available on the Chrome Web Store. This is the dedicated extension that:
- Detects Solana Action URLs on X.com/Twitter
- Fetches `actions.json` from the domain
- Unfurls the blink UI inline in the feed
- Uses Phantom (or any injected Solana wallet) for transaction signing

### Your Action Plan

| Step | Action | Status |
|------|--------|--------|
| 1 | Go to Chrome Web Store and search for **"Dialect Blinks"** | 🔨 Do this |
| 2 | Install the official Dialect Blinks extension (verify developer is `dialect.to`) | 🔨 Do this |
| 3 | Make sure Phantom is also installed (for wallet signing) | ✅ Already done |
| 4 | Go to X.com and post: `https://blink-with-anti.vercel.app/donate-sol` | 🔨 Do this |
| 5 | The Dialect extension should detect the URL and unfurl it | 🤞 Test this |

### Will Your Setup Work?
**Yes** — Linux Ubuntu + Chrome + Phantom + Dialect Blinks extension should work. The Dialect extension handles the unfurling, Phantom handles the wallet signing. They work together.

### If Dialect Extension Also Doesn't Work (dial.to dependency)
The Dialect extension may rely on `dial.to` or `api.dial.to` for registry lookups. If those are down, even the extension might not unfurl your blink. In that case, our fallback options are:
1. **Build our own Chrome extension** using `setupTwitterObserver()` from `@dialectlabs/blinks/ext/twitter` (we control everything, no dial.to dependency)
2. **Create a standalone landing page** at `/donate-sol` that works for everyone without any extension

## 13. Chrome Extension Built & Ready

**What you asked:**
Build the extension.

**What I did:**
1. Updated `vite.config.ts` to copy `manifest.json` into `dist/` and output CSS as `style.css`
2. Updated `manifest.json` to load `style.css` alongside `contentScript.js`, and added `host_permissions` for devnet RPC and Dialect API
3. Ran `npm run build` — successfully produced:
   - `dist/contentScript.js` (549 KB) — bundled content script with Dialect SDK + Solana web3
   - `dist/style.css` (23 KB) — Dialect's blink component styles
   - `dist/manifest.json` — Chrome Manifest V3
   - `dist/icons/icon-48.png` and `icon-128.png` — placeholder icons
4. Created placeholder icons (solid purple squares) for the extension

### How to Load the Extension

1. Open Chrome and go to `chrome://extensions/`
2. Toggle **Developer mode** ON (top-right switch)
3. Click **"Load unpacked"**
4. Navigate to: `/home/manish/projects/blinks/blink-anti-gravity/chrome-extension/dist`
5. Click Select/Open
6. The "Solana Blink Unfurler" extension should appear in the list
7. Go to X.com and post a tweet containing: `https://blink-with-anti.vercel.app/donate-sol`
8. The extension should detect the URL and unfurl it into the interactive Blink UI

### Important Notes
- Make sure **Phantom** extension is also enabled (needed for wallet signing)
- The extension listens on `x.com/*`, `twitter.com/*`, and `pro.x.com/*`
- It uses **Solana devnet** — make sure your Phantom wallet is set to devnet for testing

## Summary
Through this process, we built a complete Solana Blinks project: a provider API deployed on Vercel, a standalone donate landing page, and a custom Chrome extension that unfurls blink URLs on X.com. The extension uses Dialect's `setupTwitterObserver()` with a custom adapter that bridges to Phantom wallet for transaction signing.
