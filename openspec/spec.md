# Blink Donation System Baseline Spec

## Scope

This document captures the **current implemented behavior** of the Blink donation system in this repository. It is a baseline for OpenSpec and intentionally excludes future ideas.

## Architecture

### Components

- **Next.js app (App Router)**  
  Hosts the Blink action APIs and web pages for sharing and testing donation flows.

- **Solana Action API layer**  
  Provides Solana Action-compatible endpoints for action discovery and transaction construction.

- **Donation Blink UI pages**  
  Renders Blink cards using `@dialectlabs/blinks` and wallet adapters for local/manual execution.

- **Chrome extension (`chrome-extension/`)**  
  Injects Blink unfurl behavior into X.com/Twitter and provides wallet bridge support from content script to page context.

- **Solana Devnet RPC**  
  Used by both server and extension for fee/balance checks, submission, and confirmation.

### Runtime boundaries

- **Server-side transaction construction** happens in `src/app/api/actions/donate-sol/route.ts`.
- **Client-side wallet signing** happens in:
  - web pages via `@solana/wallet-adapter-react`
  - extension via injected page bridge (`pageWalletBridge.ts`) + content script adapter.
- **Transaction broadcast**:
  - standard Blink clients can broadcast from their own adapters.
  - extension adapter broadcasts with `connection.sendRawTransaction(...)` after wallet signing.

### Network and chain

- Solana network target: **Devnet** (`https://api.devnet.solana.com`).
- Donation recipient is a fixed wallet address in API code.

## Endpoints

### `GET /actions.json`

- Returns `ActionsJson` mapping:
  - `/*` -> `/api/actions/*`
  - `/api/actions/**` -> `/api/actions/**`
- Includes `ACTIONS_CORS_HEADERS`.
- `OPTIONS /actions.json` mirrors `GET`.

### `OPTIONS /api/actions/donate-sol`

- Returns CORS + action headers:
  - `ACTIONS_CORS_HEADERS`
  - `x-blockchain-ids` = Solana Devnet CAIP-2 id
  - `x-action-version` = `2.4`

### `GET /api/actions/donate-sol`

- Returns Action metadata (`type: "action"`) including:
  - icon (`/donate-sol.jpg`)
  - label/title/description
  - action links for fixed donations:
    - `0.1 SOL`
    - `0.05 SOL`
    - `0.01 SOL`
  - custom amount action with numeric `amount` parameter

### `POST /api/actions/donate-sol?amount=<number>`

- Request body: `ActionPostRequest` with `account` (payer public key).
- Validation:
  - amount must be numeric and `> 0`
  - account must parse as a valid Solana public key
- Transaction building:
  - creates `SystemProgram.transfer` from payer -> donation wallet
  - compiles to v0 message + versioned transaction
- Pre-flight balance safety checks:
  - estimates fee with `getFeeForMessage`
  - fetches payer balance
  - enforces `donation + fee + MIN_BALANCE_BUFFER_LAMPORTS` (buffer = 5000 lamports)
- Success response:
  - `ActionPostResponse` with base64 serialized transaction (`type: "transaction"`)
- Error responses:
  - `400` for invalid amount/account or insufficient funds
  - `500` for unexpected server failure

## Extension Flow

### Trigger and discovery

- Content script runs on:
  - `https://twitter.com/*`
  - `https://x.com/*`
  - `https://pro.x.com/*`
- Two parallel unfurl paths:
  - **Dialect standard observer** via `setupTwitterObserver(...)` (non-malicious security level)
  - **Custom allowlisted preview observer** for specific hosts (including local/dev hosts)

### URL resolution pipeline (custom preview path)

For candidate links found in tweets/DMs:

1. Resolve `t.co` short links to destination URL.
2. Enforce host allowlist (`VITE_PREVIEW_ALLOWED_HOSTS` or default list).
3. Evaluate website registry security state (`non-malicious` required).
4. Resolve action URL via first successful method:
   - direct action probe (GET target returns `type: "action"`)
   - `actions.json` mapping using `BlinksURLMapper`
   - page metadata extraction (`<meta name="solana:action:apiUrl" ...>`)
5. Evaluate resolved action security state (`non-malicious` required).
6. Fetch blink with `BlinkInstance.fetch(...)` and mount `BlinkComponent` into tweet/DM container.

### Rendering and lifecycle

- Prevents duplicate mounts using URL tracking per tweet/message.
- Uses mutation observers + interval anchor scanning to catch dynamically loaded content.
- Cleans up mounted React roots when DOM nodes are removed.

## Wallet Flow

### Web app wallet flow (`/`, `/donate-sol`, `/blink`)

- Uses Solana wallet adapter providers and wallet modal UI.
- Blink component obtains wallet adapter through `useBlinkSolanaWalletAdapter`.
- User connects wallet, selects amount, approves transaction in wallet UI.

### Extension wallet flow (X/Twitter)

- Content script cannot directly access injected wallet providers, so it injects `pageWalletBridge.js`.
- Bridge RPC methods over `window.postMessage`:
  - `getProviderInfo`
  - `connect`
  - `signTransaction`
  - `signMessage`
- Page bridge detects provider (`window.solana` / Phantom / Backpack) and performs wallet operations in page context.
- Signed transaction is returned to content script (base64), deserialized, and sent via Devnet RPC.
- Confirmation is awaited with `confirmTransaction(..., "confirmed")`.
- Error handling includes:
  - missing wallet provider messages
  - timeout handling for bridge calls
  - friendly insufficient-funds messages from Solana transaction logs
  - "already processed" signature reuse behavior

## Non-goals for this baseline

- No roadmap, proposed improvements, or unimplemented features.
- No assumptions beyond currently present code paths and configuration.
