# Solana Blinks: Practical Architecture Diagram

This file contains a single practical sequence diagram optimized for [sequencediagram.org](https://sequencediagram.org/). This diagram shows the realistic implementation flow that developers should build first—how Blinks work from user perspective through to on-chain settlement, including environment-specific wallet integration.

---

## Blink Architecture: Practical Implementation Flow

**Description:** Complete 4-phase flow showing end-to-end Blink execution. Shows all participants including RPC blockchain network. Includes desktop/mobile environment branching for wallet integration.

**Phases:**
1. **Sharing & Unfurl** — User pastes Blink URL, client fetches metadata, renders preview card
2. **Execution** — User clicks action, client POSTs to provider, provider queries RPC for blockhash, builds unsigned transaction
3. **Wallet Bridge** — Transaction routed to wallet (desktop: injected provider, mobile: deep link)
4. **Signing & Settlement** — Wallet shows confirmation, user approves, wallet signs and broadcasts to RPC, shows success

**Key Features:**
- 5 participants: User, X.com client, Provider API, Wallet, Solana RPC
- Realistic RPC interactions (blockhash query + broadcast)
- Desktop/mobile branching via alt/else blocks
- Complete flow from share to on-chain confirmation
- Non-custodial: wallet controls all signing

**How to use:**
1. Go to https://sequencediagram.org/
2. Copy the code below
3. Paste into the left editor pane
4. Watch the diagram render on the right
5. Optionally export as PNG/SVG for your documentation

**Code:**

```
title Solana Blinks - Practical Architecture (No Registry)

Note over User,RPC: Phase 1: Sharing & Unfurl (Preview Phase)

User->>X: Paste Blink URL
X->>Provider: GET /api/actions/donate
Note right of Provider: Returns HTML\n(OG tags + embedded action JSON)
Provider-->>X: Metadata\n(title, image, description, actions)
X->>User: Render card\n(image + text + button)

Note over User,RPC: Phase 2: Execution Phase (on click)

User->>X: Click "Donate 0.1 SOL"
X->>Provider: POST /api/actions/donate
Note right of Provider: Build transaction\n(fetch blockhash, construct tx)
Provider->>RPC: getLatestBlockhash()
RPC-->>Provider: blockhash
Provider-->>X: { type: "transaction",\ntransaction: base64 }

Note over User,RPC: Phase 3: Wallet Bridge (environment-dependent)

alt Desktop (extension present)
  X->>Wallet: window.solana.signAndSendTransaction(tx)
  Note right of Wallet: Injected provider\n(e.g., Phantom)
else Mobile (no injection)
  X->>Wallet: Deep link\n(phantom://signTransaction?tx=...)
end

Note over User,RPC: Phase 4: Signing & Settlement

Wallet->>User: Show confirmation UI
User->>Wallet: Approve
Wallet->>RPC: Send signed transaction
RPC-->>Wallet: Tx confirmed\n(signature)
Wallet-->>X: Result / callback
X->>User: Show success\n(TxHash + Solscan link)
```



---

## Phase-by-Phase Breakdown

**Phase 1: Sharing & Unfurl (Preview Phase)**
- User pastes Blink URL into X.com
- X.com sends GET request to Provider API endpoint
- Provider responds with HTML containing OG meta tags + embedded action JSON
- X.com renders a preview card with image, title, description, and action buttons

**Phase 2: Execution Phase (On Click)**
- User clicks an action button (e.g., "Donate 0.1 SOL")
- X.com sends POST request to Provider with action parameters
- Provider fetches latest blockhash from Solana RPC
- Provider constructs unsigned transaction and returns as base64
- X.com now has transaction ready for signing

**Phase 3: Wallet Bridge (Environment-Dependent)**
Routes unsigned transaction to wallet based on platform:
- **Desktop Path:** Uses injected provider (e.g., `window.solana.signAndSendTransaction(tx)`)
- **Mobile Path:** Uses deep link (e.g., `phantom://signTransaction?tx=...`)

**Phase 4: Signing & Settlement**
- Wallet displays transaction confirmation UI with details
- User reviews and approves (private key never leaves wallet)
- Wallet signs the transaction with user's private key
- Wallet broadcasts signed transaction to Solana RPC
- RPC confirms transaction and returns signature
- Wallet sends callback with result back to X.com
- X.com displays success message with TxHash and blockchain explorer link

---

## Implementation Checklist

✅ **Provider API**
- [ ] GET endpoint returns HTML with OG tags + action JSON
- [ ] POST endpoint accepts action parameters
- [ ] POST queries Solana RPC for latest blockhash
- [ ] POST builds and returns unsigned transaction (base64)
- [ ] Proper CORS headers (Access-Control-Allow-*)
- [ ] x-blockchain-ids header (e.g., "solana:*")

✅ **Client Integration**
- [ ] Fetch metadata from provider GET endpoint
- [ ] Parse action JSON and render buttons
- [ ] POST with user's public key and action parameters
- [ ] Route unsigned transaction to wallet (desktop or mobile)
- [ ] Display success/error state with callback

---

## Next Steps

For detailed code examples (TypeScript, request/response formats, error handling), see the [Technical White Paper](./TECHNICAL_WHITEPAPER.md).

To test this flow locally:
1. Implement GET and POST endpoints
2. Ensure proper headers (CORS + x-blockchain-ids)
3. Share your endpoint URL with a Blink-aware client (X.com or Phantom)
4. Click through the complete flow and verify on-chain confirmation
