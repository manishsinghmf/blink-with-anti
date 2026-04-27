## Why

The current Blink flow is donation-specific and always transfers to a fixed receiver wallet. We need a reusable send flow so users can transfer SOL to a chosen recipient using the same Blink + extension experience.

## What Changes

- Add a new `send-sol` action API that builds transfer transactions from the connected wallet to a user-provided recipient wallet.
- Add action metadata for fixed send amounts and custom amount input, plus recipient address input.
- Add validation and error handling for recipient public key, amount, and payer balance/fees.
- Add shareable/send page wiring so the new action can be loaded in Blink clients and in the extension unfurl path.

## Capabilities

### New Capabilities
- `send-sol`: Build and execute SOL transfer actions to user-specified recipient wallets on Solana Devnet.

### Modified Capabilities
- `none`

## Impact

- Affected APIs: new `send-sol` action route(s) under `src/app/api/actions/`.
- Affected UI: send page metadata/client wiring and Blink loading URL references.
- Affected extension behavior: no protocol change expected; it should consume the new action URL like existing actions.
- Dependencies/systems: existing Solana Actions, Dialect Blinks, wallet adapter, and Devnet RPC usage.
