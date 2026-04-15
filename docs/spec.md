# Solana Donate Blink - Project Specification

## 1. Overview
This project aims to create a basic "Donate Me" Solana Blink. A Blink (Blockchain Link) allows users to perform Solana transactions directly from a shareable link that unfurls into a rich UI within compatible clients (e.g., X.com, Phantom wallet, Backpack).

## 2. Technical Stack
- **Framework:** Next.js (App Router recommended)
- **Language:** TypeScript
- **UI/Styling:** React (built-in Next.js styling/Tailwind if requested, though mostly the UI is handled by the Blink Client, the server just provides metadata).
- **Blockchain SDKs:** 
  - `@solana/web3.js` - For constructing Solana transactions.
  - `@solana/actions` - Dialect standard library for providing actions and handling routing schemas.

## 3. Architecture & Core Concepts
- **Blink Provider (This Application):** A standard REST API exposing specific endpoints that a Blink Client queries.
- **Blink Client:** The consumer app (like X.com extension) displaying the UI.
- **Dialect's Role:** Dialect provides the standardized SDK (`@solana/actions`) for formatting these requests and the `dial.to` testing interface to validate the Blink behaves correctly.

## 4. Required Endpoints

The Next.js app will expose a route, typically at `/api/actions/donate-sol`.

### 4.1. `GET /actions.json`
- **Purpose:** Discovery. Maps website URLs to the underlying Action API.
- **Behavior:** Returns `rules` mapping root paths like `/` to the `/api/actions/*` path scheme.

### 4.2. `OPTIONS /api/actions/donate-sol`
- **Purpose:** CORS Preflight.
- **Behavior:** Returns `ACTIONS_CORS_HEADERS` and blockchain targeting info (`x-blockchain-ids`) to allow third-party clients to connect successfully.

### 4.3. `GET /api/actions/donate-sol`
- **Purpose:** Blink UI Metadata.
- **Behavior:** Returns JSON specifying:
  - `icon`: URL to a visually appealing image `donate-sol.jpg`.
  - `title`: e.g., "Donate SOL".
  - `description`: Details the purpose of the blink.
  - `links.actions`: An array defining the interaction buttons.
    - Example fixed amounts: 0.01 SOL, 0.05 SOL, 0.1 SOL.
    - Example custom input: A freeform input field allowing users to enter a specific number amount.

### 4.4. `POST /api/actions/donate-sol`
- **Purpose:** Transaction Construction.
- **Parameters:**
  - Query Param: `amount` (the amount of SOL to donate).
  - Body: `account` (the public key of the user initiating the action).
- **Behavior:**
  1. Establishes an RPC connection to Solana Devnet.
  2. Creates a `SystemProgram.transfer` instruction from `account` to the predefined `donationWallet` address.
  3. Fetches the latest blockhash.
  4. Compiles a versioned transaction.
  5. Returns the transaction encoded in base64 within an `ActionPostResponse`.

## 5. Deployment & Testing
- **Local Testing Mode:** Since `dial.to` is currently down, we will test the Blink by creating a simple client-side UI on our Next.js app's root page (`/`) using `@dialectlabs/blinks` React components. This allows us to validate the UI natively. We can also verify endpoint responses using `curl`.
- **Network:** Development phase will use Solana `devnet`.

## 6. Open Parameters (Pending Decision)
- **Donation Wallet Address:** Needs a Solana Devnet address to receive funds. We can generate a dummy one for testing.
- **Image Asset:** An image file is required. We will generate a mock image for it.
