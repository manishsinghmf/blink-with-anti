# Solana Blinks: Sequence & Architecture Diagrams

This file contains 3 diagrams:

1. `Solana Blinks - Sequence Diagram`
2. `Solana Blinks with extension - Sequence Diagram`
3. `Solana Blinks - Architecture Diagram`

These diagrams are written for [sequencediagram.org](https://sequencediagram.org/).

## 1. Solana Blinks - Sequence Diagram

**What it shows:** A generic Blink execution flow without the custom unfurler extension details. This is the simpler conceptual flow.

**How to use:**
1. Go to https://sequencediagram.org/
2. Copy the code below
3. Paste into the editor
4. Render/export as needed

**Code:**

```text
title Solana Blinks - Sequence Diagram

Note over User,RPC: Phase 1: Share & Blink Discovery

User->>X: Paste Blink URL
X->>Provider: GET /donate-sol or GET /api/actions/donate-sol
Provider-->>X: Metadata / action definition
X->>User: Show link preview or Blink-aware UI

Note over User,RPC: Phase 2: Action Execution

User->>X: Click "Donate 0.1 SOL"
X->>Provider: POST /api/actions/donate-sol?amount=0.1
Note right of Provider: Validate input\nBuild unsigned transaction
Provider->>RPC: getLatestBlockhash()
RPC-->>Provider: blockhash
Provider-->>X: { type: "transaction", transaction: base64 }

Note over User,RPC: Phase 3: Wallet Interaction

X->>Wallet: Request wallet connect/sign
Wallet->>User: Show approval dialog
User->>Wallet: Approve
Wallet-->>X: Signed transaction

Note over User,RPC: Phase 4: Broadcast & Confirmation

X->>RPC: send signed transaction
RPC-->>X: signature
X->>RPC: confirmTransaction(signature)
RPC-->>X: confirmed
X->>User: Show success / error state
```

---

## 2. Solana Blinks with extension - Sequence Diagram

**What it shows:** The actual workflow in this repo, including the custom unfurler extension, `/actions.json`, metadata fallback, page wallet bridge, Phantom/Backpack signing, send, and confirmation.

**How to use:**
1. Go to https://sequencediagram.org/
2. Copy the code below
3. Paste into the editor
4. Render/export as needed

**Code:**

```text
title Solana Blinks with extension - Sequence Diagram

Note over User,RPC: Phase 1: X Post + Extension Unfurl

User->>X: Open tweet containing https://demo-blinks.vercel.app/donate-sol
Extension->>X: Scan tweet DOM for candidate links
Extension->>X: Resolve t.co URL if needed

alt Direct action URL
  Extension->>Provider: GET direct action URL
  Provider-->>Extension: { type: "action", ... }
else Website URL
  Extension->>Provider: GET /actions.json
  Provider-->>Extension: Action mapping rules
  Extension->>Provider: Map /donate-sol -> /api/actions/donate-sol
end

opt Metadata fallback
  Extension->>Provider: GET /donate-sol
  Provider-->>Extension: HTML + solana:action:apiUrl
end

Extension->>Provider: GET /api/actions/donate-sol
Provider-->>Extension: Blink metadata + buttons
Extension->>X: Mount Blink UI inside tweet
X->>User: Show unfurled donate buttons inline

Note over User,RPC: Phase 2: Button Click

User->>Extension: Click "Donate 0.1 SOL"
Extension->>PageBridge: Request wallet public key / provider info
PageBridge->>Wallet: Connect if needed
Wallet->>User: Show connect prompt
User->>Wallet: Approve connect
Wallet-->>PageBridge: publicKey
PageBridge-->>Extension: publicKey

Extension->>Provider: POST /api/actions/donate-sol?amount=0.1\n{ account: publicKey }
Note right of Provider: Validate amount/account\nBuild unsigned tx\nEstimate fee\nCheck balance
Provider->>RPC: getLatestBlockhash()
RPC-->>Provider: blockhash
Provider->>RPC: getFeeForMessage()
RPC-->>Provider: estimated fee
Provider->>RPC: getBalance(payer)
RPC-->>Provider: payer balance
Provider-->>Extension: { type: "transaction", transaction: base64 }

Note over User,RPC: Phase 3: Wallet Signing

Extension->>PageBridge: signTransaction(base64 tx)
PageBridge->>Wallet: signTransaction(tx)
Wallet->>User: Show transaction approval
User->>Wallet: Approve
Wallet-->>PageBridge: signed transaction
PageBridge-->>Extension: signed base64 tx

Note over User,RPC: Phase 4: Broadcast & Status

Extension->>RPC: sendRawTransaction(signed tx)
alt Successful send
  RPC-->>Extension: transaction signature
else Duplicate send
  RPC-->>Extension: SendTransactionError: already processed
  Extension->>Extension: Reuse signed transaction signature
else Simulation/send failure
  RPC-->>Extension: SendTransactionError + logs
  Extension->>Extension: Parse logs into friendly error
end

Extension->>RPC: confirmTransaction(signature)
RPC-->>Extension: confirmed / failed
Extension->>X: Update Blink execution state
X->>User: Show success or friendly error message
```

---

## 3. Solana Blinks - Architecture Diagram

**What it shows:** A high-level system architecture of the current Blink setup in this repo.

**How to use:**
1. Go to https://sequencediagram.org/
2. Copy the code below
3. Paste into the editor
4. Render/export as needed

**Code:**

```text
title Solana Blinks - Architecture Diagram

participant User
participant X as X.com Timeline
participant Ext as Chrome Extension\n(contentScript.ts)
participant Bridge as Page Wallet Bridge\n(pageWalletBridge.ts)
participant Provider as Next.js Blink Provider
participant Actions as /actions.json
participant Donate as /donate-sol page
participant API as /api/actions/donate-sol
participant Wallet as Phantom / Backpack
participant RPC as Solana Devnet RPC

Note over User,RPC: Layer 1: User Surface
User->>X: Views post / clicks Blink

Note over User,RPC: Layer 2: Blink Client Layer
X->>Ext: Extension scans tweet DOM
Ext->>X: Inject Blink UI into tweet

Note over User,RPC: Layer 3: URL Resolution Layer
Ext->>Actions: GET /actions.json
Actions-->>Ext: pathPattern -> apiPath rules
Ext->>Donate: GET /donate-sol
Donate-->>Ext: HTML + solana:action:apiUrl

Note over User,RPC: Layer 4: Blink Provider Layer
Ext->>API: GET /api/actions/donate-sol
API-->>Ext: Blink metadata + button config
Ext->>API: POST /api/actions/donate-sol?amount=...
API->>RPC: blockhash / fee / balance lookups
RPC-->>API: chain state
API-->>Ext: unsigned transaction

Note over User,RPC: Layer 5: Wallet Signing Layer
Ext->>Bridge: request connect / sign
Bridge->>Wallet: connect / signTransaction / signMessage
Wallet->>User: approval UI
User->>Wallet: approve or reject
Wallet-->>Bridge: signed tx / signature
Bridge-->>Ext: wallet result

Note over User,RPC: Layer 6: Chain Settlement Layer
Ext->>RPC: sendRawTransaction
RPC-->>Ext: tx signature / error
Ext->>RPC: confirmTransaction
RPC-->>Ext: confirmed / failed
Ext->>X: render success/error state
X->>User: final Blink result
```

---

## Summary

These 3 diagrams represent:

1. A generic Blink sequence
2. The actual extension-based Blink unfurl flow in this repo
3. The system architecture across user, X.com, extension, provider, wallet, and Solana RPC
