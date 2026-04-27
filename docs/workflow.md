# Blink Workflow

This document describes the current end-to-end workflow in this project:

- how a Blink URL is shared on `x.com`
- how the Chrome extension discovers and unfurls it
- why `/actions.json` matters
- when each API endpoint is called
- how Phantom/Backpack is used for transaction confirmation
- how transaction submission and status handling work

The behavior described here reflects the current implementation in:

- [src/app/actions.json/route.ts](/home/manish/projects/blinks/blink-anti-gravity/src/app/actions.json/route.ts)
- [src/app/api/actions/donate-sol/route.ts](/home/manish/projects/blinks/blink-anti-gravity/src/app/api/actions/donate-sol/route.ts)
- [src/app/donate-sol/page.tsx](/home/manish/projects/blinks/blink-anti-gravity/src/app/donate-sol/page.tsx)
- [chrome-extension/src/contentScript.ts](/home/manish/projects/blinks/blink-anti-gravity/chrome-extension/src/contentScript.ts)
- [chrome-extension/src/pageWalletBridge.ts](/home/manish/projects/blinks/blink-anti-gravity/chrome-extension/src/pageWalletBridge.ts)

## 1. Main URLs in This Project

There are three important URL types:

### 1. Share Page URL

Example:

```text
https://demo-blinks.vercel.app/donate-sol
```

This is the human-friendly page URL. It returns HTML and metadata for sharing.

Its job is:

- render the standalone donate page in a normal browser
- provide OG/social metadata for previews
- expose `solana:action:apiUrl` metadata pointing to the action endpoint

### 2. Action Mapping URL

Example:

```text
https://demo-blinks.vercel.app/actions.json
```

This is the Solana Actions mapping file. It tells Blink clients how to convert a normal website URL into an Action API URL.

In this repo it currently maps broad website paths to `/api/actions/*`.

### 3. Action API URL

Example:

```text
https://demo-blinks.vercel.app/api/actions/donate-sol
```

This is the real Blink provider endpoint.

Its job is:

- on `GET`: return Blink metadata and button definitions
- on `POST`: create an unsigned Solana transaction for the selected action

## 2. What Happens When a User Sees a Blink URL on X

Suppose a tweet contains:

```text
https://demo-blinks.vercel.app/donate-sol
```

### Without the extension

X itself does not natively execute Solana Actions.

Without a Blink client, the user just sees:

- a normal link
- maybe an OG preview card from the page metadata

They do not get interactive Blink buttons injected into the timeline.

### With this Chrome extension installed

When the X page loads, the content script runs on:

- `https://x.com/*`
- `https://twitter.com/*`
- `https://pro.x.com/*`

The script does two kinds of Blink discovery:

1. Dialect observer:
   - `setupTwitterObserver(adapter, callbacks, { securityLevel: "non-malicious" })`
   - this handles standard Blink discovery on X using Dialect’s observer logic

2. Custom preview observer:
   - scans tweet anchors directly
   - resolves URLs for allowlisted hosts
   - supports page metadata fallback for `/donate-sol`

## 3. How URL Discovery Works

When the extension finds a candidate link in a tweet, it tries to classify it.

### Step 1: Resolve `t.co` if needed

If the tweet contains a shortened X URL, the extension resolves it back to the real destination URL.

### Step 2: Check whether the host is allowed for custom preview

The custom preview path only runs for hosts in `PREVIEW_ALLOWED_HOSTS`.

This protects the extension from blindly rendering arbitrary unknown third-party sites.

### Step 3: Try to recognize the link as a Blink

The extension tries three strategies:

#### Strategy A: Direct action URL

It fetches the URL directly and checks whether it already returns:

```json
{ "type": "action", ... }
```

If yes, it can be used as the Blink API URL immediately.

#### Strategy B: `/actions.json`

If the URL is a normal website URL, the extension fetches:

```text
https://<origin>/actions.json
```

Why this exists:

- a share page like `/donate-sol` is not itself an action API
- Blink clients need a way to map website URLs to actual action endpoints
- `/actions.json` is the standard mapping mechanism for that

In this repo, `/actions.json` is served by [src/app/actions.json/route.ts](/home/manish/projects/blinks/blink-anti-gravity/src/app/actions.json/route.ts).

That route returns rules like:

- `pathPattern`
- `apiPath`

The extension uses `BlinksURLMapper` to convert the original website URL into the correct action API URL.

#### Strategy C: Page metadata fallback

If mapping is not enough, the extension fetches the page HTML and extracts:

```html
<meta name="solana:action:apiUrl" content="...">
```

This is especially useful for:

- human-friendly share pages like `/donate-sol`
- cases where the extension needs an explicit action API target

In this repo, that metadata is defined on [src/app/donate-sol/page.tsx](/home/manish/projects/blinks/blink-anti-gravity/src/app/donate-sol/page.tsx).

## 4. Why `/actions.json` Is Checked

`/actions.json` is checked because a Blink URL is often a website page, not the raw action API endpoint.

Example: 

- shared URL: `/donate-sol`
- real action endpoint: `/api/actions/donate-sol`

The extension needs a standard way to answer:

> “Given this website URL, which Action API should I use?”

That standard way is `/actions.json`.

So the extension checks `/actions.json` to:

- understand whether the website supports Actions
- map public/share URLs to actual API URLs
- keep website URLs and API URLs decoupled

## 5. Security and Trust Handling

There are two layers of trust/security handling in the extension.

### 1. Discovery layer

The Dialect observer is configured with:

```ts
securityLevel: "non-malicious"
```

Meaning:

- `trusted`: allowed
- `unknown`: allowed
- `malicious`: blocked

This is intentionally more permissive than `only-trusted` because this project needs to preview unregistered Blinks while Dialect registration is unavailable.

### 2. Custom preview layer

Before the extension mounts a Blink via the custom path, it also checks:

- host allowlist
- website security state
- action security state

It only continues when the result is non-malicious.

### 3. Render layer

When the Blink is actually rendered, the component is mounted with:

```ts
securityLevel: "all"
```

This does not mean “render every site on the internet.”

It means:

- the extension has already filtered candidates before this point
- once a Blink has been explicitly approved for preview, the UI should not block it again just because it is still `unknown`

## 6. How Unfurling Actually Happens

Once the extension has a valid Blink API URL, it does this:

1. Fetches the Blink definition with `BlinkInstance.fetch(...)`
2. Creates a React root inside the tweet container
3. Renders `BlinkComponent`
4. Injects the Blink UI into the X timeline

So the unfurl is not done by X.

The unfurl is done by the extension by:

- detecting the URL
- resolving the action endpoint
- fetching Blink metadata
- mounting the Blink React UI into the tweet DOM

## 7. Which API Endpoints Are Called, and When

### A. `/donate-sol`

Called when:

- a browser opens the donate page directly
- the extension fetches the page HTML to inspect `solana:action:apiUrl`

Returns:

- HTML
- social metadata
- action metadata reference via `<meta name="solana:action:apiUrl">`

### B. `/actions.json`

Called when:

- the extension wants to map a website/share URL to its action API endpoint

Returns:

- action mapping rules

### C. `GET /api/actions/donate-sol`

Called when:

- the extension or Blink client wants the Blink definition
- the standalone Blink page loads the Blink

Returns:

- `type: "action"`
- title
- description
- icon
- action buttons
- `href` targets for each button

### D. `POST /api/actions/donate-sol?amount=...`

Called when:

- the user clicks a donate button

Request body contains:

- the connected wallet public key as `account`

Returns:

- an unsigned base64-encoded `VersionedTransaction`

## 8. What Happens When the User Clicks a Donate Button

Suppose the user clicks:

```text
0.1 SOL
```

The Blink UI knows from the metadata that the button points to:

```text
/api/actions/donate-sol?amount=0.1
```

The client then sends a `POST` request to that endpoint with the user wallet account.

On the server, [src/app/api/actions/donate-sol/route.ts](/home/manish/projects/blinks/blink-anti-gravity/src/app/api/actions/donate-sol/route.ts) does the following:

1. Reads the selected amount from the query string
2. Validates that the amount is positive
3. Reads the user wallet public key from the POST body
4. Builds a `SystemProgram.transfer(...)` instruction
5. Fetches a fresh recent blockhash
6. Compiles a `VersionedMessage`
7. Creates a `VersionedTransaction`
8. Estimates fee and checks wallet balance
9. If balance is too low:
   - returns a friendly `400` error immediately
10. Otherwise:
   - serializes the unsigned transaction to base64
   - returns it to the Blink client

Important:

- the server creates the transaction
- the server does not sign it

## 9. When and How the Wallet Opens

The wallet opens only after the server has already returned the unsigned transaction.

The signing flow is:

1. Blink UI asks the adapter to sign the transaction
2. `SolanaBlinkAdapter.signTransaction(...)` runs in the content script
3. The content script cannot reliably access Phantom directly because of Chrome’s isolated world
4. So it sends the transaction to the injected page bridge
5. The page bridge accesses `window.solana` / Phantom in page context
6. The page bridge calls:

```ts
provider.signTransaction(transaction)
```

At that exact moment:

- Phantom/Backpack opens its approval popup
- the user reviews and approves or rejects

So the wallet popup is triggered during signing, not during unfurling.

## 10. Why a Page Wallet Bridge Is Needed

Chrome content scripts run in an isolated JavaScript world.

That means:

- the extension UI can manipulate the page DOM
- but it often cannot directly read the injected wallet provider from `window.solana`

To solve that, this project injects [chrome-extension/src/pageWalletBridge.ts](/home/manish/projects/blinks/blink-anti-gravity/chrome-extension/src/pageWalletBridge.ts).

The bridge can:

- read `window.solana`
- call `connect`
- call `signTransaction`
- call `signMessage`

Communication between content script and page bridge happens with `window.postMessage(...)`.

## 11. When the Transaction Is Signed

After the wallet approves, the page bridge:

1. receives the unsigned base64 transaction
2. deserializes it into a `VersionedTransaction`
3. calls wallet `signTransaction(...)`
4. re-serializes the signed transaction
5. sends it back to the content script

At this point the transaction is now signed by the user wallet, but it has not yet been broadcast to Solana.

## 12. When the Transaction Is Sent

Back in the content script adapter:

1. the signed transaction is deserialized
2. raw bytes are extracted
3. the extension submits the transaction to Solana Devnet using:

```ts
connection.sendRawTransaction(rawTx, {
  skipPreflight: false,
  preflightCommitment: "confirmed",
})
```

This is when the transaction actually gets broadcast to the network.

## 13. How Transaction Status Is Handled

After send succeeds, the adapter returns the transaction signature.

Then the Blink client calls:

```ts
confirmTransaction(signature)
```

Your adapter implementation does:

```ts
connection.confirmTransaction(sig, "confirmed")
```

So the status flow is:

1. server creates unsigned transaction
2. wallet signs transaction
3. extension broadcasts transaction
4. extension waits for Solana confirmation
5. success or failure is reported back to the Blink UI

## 14. Error Handling

There are several layers of error handling in the current implementation.

### Server-side validation errors

From `POST /api/actions/donate-sol`:

- invalid amount
- invalid account
- insufficient SOL balance
- internal server failure

The server now performs a balance check before returning the transaction, so users get a friendlier insufficient-funds error earlier.

### Wallet errors

From the page bridge or adapter:

- no Phantom / Backpack found
- user rejects wallet connection
- user rejects transaction signing

### Network / Solana send errors

The extension catches `SendTransactionError` and:

- fetches logs via `getLogs(connection)` when possible
- logs detailed diagnostics in DevTools
- recognizes duplicate-send cases like `"already been processed"`
- converts some raw log patterns into friendlier messages

For example:

- insufficient lamports errors are translated into a readable “Insufficient SOL balance” message

## 15. End-to-End Summary

### Unfurl flow

1. A tweet contains a Blink/share URL
2. The extension scans the tweet DOM
3. It resolves the real URL
4. It checks trust/security
5. It checks direct action JSON, `/actions.json`, or `solana:action:apiUrl`
6. It fetches Blink metadata
7. It mounts the Blink UI into the tweet

### Click flow

1. User clicks a donate button
2. Blink client sends `POST /api/actions/donate-sol?amount=...`
3. Server creates unsigned transaction
4. Content script asks page bridge to sign
5. Page bridge calls Phantom/Backpack
6. Wallet popup opens
7. User approves
8. Signed transaction returns to content script
9. Extension broadcasts transaction to Solana
10. Extension confirms transaction
11. Blink UI shows success or error

## 16. Why This Architecture Exists

This split exists because each part has a different responsibility:

- `x.com`: shows posts
- Chrome extension: acts as the Blink client and injects interactive UI
- `/actions.json`: maps share URLs to action endpoints
- `/api/actions/donate-sol`:
  - `GET` describes the Blink
  - `POST` builds the transaction
- Phantom/Backpack: signs with the user’s private key
- Solana Devnet RPC: broadcasts and confirms the transaction

That separation is what allows:

- normal website sharing
- interactive Blink unfurling
- secure wallet signing
- server-generated transaction creation without exposing private keys
