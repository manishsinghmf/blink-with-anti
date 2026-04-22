# Solana Blink Unfurler POC

## Slide 1: Title

**Solana Blink Unfurler POC**

- Custom Blink provider built with Next.js
- Chrome extension for Blink unfurling on `x.com`
- Wallet signing via Phantom / Backpack
- Devnet-based donate flow

**Presenter:** Manish  
**Goal:** Show that a Solana Blink can be shared on X, unfurled inline, and executed securely through a wallet

---

## Slide 2: Problem Statement

**Problem**

- X does not natively execute Solana Actions
- Dialect registration flow was unavailable during development
- We still needed a way to:
  - share a Blink URL
  - preview/unfurl it on X
  - connect wallet
  - create and submit a transaction

**POC Goal**

Build a working end-to-end Blink experience without depending on Dialect registration.

---

## Slide 3: What We Built

**This POC includes 3 core parts**

1. **Blink Provider API**
   - serves Blink metadata
   - builds unsigned Solana transactions

2. **Share Page**
   - human-friendly `/donate-sol` page
   - includes metadata + `solana:action:apiUrl`

3. **Chrome Unfurler Extension**
   - detects Blink URLs on X
   - resolves the correct action endpoint
   - injects interactive Blink UI into tweets

---

## Slide 4: Main URLs

**1. Share URL**

```text
/donate-sol
```

- normal browser page
- OG metadata for previews
- includes `solana:action:apiUrl`

**2. Mapping URL**

```text
/actions.json
```

- maps website URLs to Action API URLs

**3. Action API**

```text
/api/actions/donate-sol
```

- `GET` returns Blink metadata
- `POST` builds unsigned transaction

---

## Slide 5: End-to-End User Flow

**When user sees the X post**

1. Tweet contains Blink/share URL
2. Extension scans the X DOM
3. Extension resolves the URL
4. Extension checks:
   - direct action JSON
   - `/actions.json`
   - page metadata fallback
5. Extension fetches Blink definition
6. Extension mounts Blink UI into the tweet

**Result**

The user sees inline donate buttons inside the X post.

---

## Slide 6: What Happens on Button Click

**When user clicks Donate**

1. Blink client sends:

```text
POST /api/actions/donate-sol?amount=...
```

2. Server:
   - validates amount
   - reads payer account
   - builds transfer instruction
   - fetches blockhash
   - estimates fee
   - checks payer balance
   - returns unsigned transaction

**Important**

- server creates the transaction
- server does not sign it

---

## Slide 7: Wallet Signing Flow

**Why a bridge is needed**

- Chrome content scripts run in an isolated world
- Phantom is injected in page context
- content script cannot reliably access `window.solana` directly

**Solution**

- inject `pageWalletBridge.ts`
- communicate via `window.postMessage`

**Signing steps**

1. Content script asks bridge to sign
2. Bridge calls Phantom / Backpack
3. Wallet popup opens
4. User approves
5. Signed transaction returns to extension

---

## Slide 8: Transaction Submission and Status

**After signing**

1. Extension submits signed tx to Solana Devnet RPC
2. RPC returns transaction signature
3. Extension calls `confirmTransaction`
4. Blink UI updates to success or error

**Error handling added in POC**

- invalid amount
- invalid account
- insufficient SOL balance
- duplicate transaction reuse
- `SendTransactionError` log extraction
- friendly insufficient-funds messages

---

## Slide 9: Security Model

**Why this is safe**

- private key never touches our server
- wallet signs locally in Phantom / Backpack
- server only builds unsigned transaction
- extension blocks malicious sources
- custom preview path only works for allowlisted hosts

**Current preview policy**

- trusted: allowed
- unknown: allowed
- malicious: blocked

This was chosen to support unregistered Blink preview during POC development.

---

## Slide 10: Architecture Summary

**System components**

- User
- X.com
- Chrome extension
- Page wallet bridge
- Next.js Blink provider
- `/actions.json`
- `/donate-sol`
- `/api/actions/donate-sol`
- Phantom / Backpack
- Solana Devnet RPC

**References**

- Workflow: [workflow.md](/home/manish/projects/blinks/blink-anti-gravity/docs/workflow.md)
- Diagrams: [DIAGRAMS.md](/home/manish/projects/blinks/blink-anti-gravity/docs/DIAGRAMS.md)

---

## Slide 11: What This POC Proves

**Validated**

- Blink URL can be shared on X
- Extension can unfurl Blink inline
- Blink metadata can be resolved through website URL + mapping
- Wallet can connect and sign through page bridge
- Transaction can be built, submitted, and confirmed end-to-end

**POC Outcome**

We demonstrated a working Blink flow on X even without relying on Dialect registration during development.

---

## Slide 12: Demo Script

**Live demo flow**

1. Open X post containing `/donate-sol`
2. Show Blink unfurled inline
3. Click a donate button
4. Show backend-generated transaction flow
5. Show Phantom popup
6. Approve transaction
7. Show success or friendly validation error

**If balance is low**

Use that to demonstrate:

- server-side balance checks
- user-friendly error handling
- robustness of the POC

---

## Slide 13: Future Improvements

**Next steps**

- production registry / trust integration
- cleaner extension configuration via env
- better analytics / execution telemetry
- support for more Blink actions
- CI docs cleanup and diagram export
- optional published extension build

---

## Slide 14: Closing

**Summary**

- We built a functional Solana Blink unfurler POC
- It works on X through a custom Chrome extension
- It preserves wallet-side signing
- It demonstrates full provider-to-wallet-to-chain execution

**Discussion**

- feedback on architecture
- path to production readiness
- whether to extend this into a broader Blink platform/tooling effort
