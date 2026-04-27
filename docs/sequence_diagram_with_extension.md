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
