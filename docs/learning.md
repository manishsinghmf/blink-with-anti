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

## Summary
Through this process, we covered the full lifecycle of creating a Solana Action provider. We handled the standard REST interface parsing required by the `@solana/actions` specification, built robust localized tooling to simulate Blink client unfurling, and successfully troubleshooted integration issues with the Dialect Blink UI components.
