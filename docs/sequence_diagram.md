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
