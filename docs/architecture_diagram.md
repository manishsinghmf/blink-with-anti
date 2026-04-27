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
