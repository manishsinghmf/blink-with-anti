## Context

The current system exposes a donation-only Solana Action where the receiver wallet is fixed in server code. Existing clients (web Blink pages and the X/Twitter extension) are already capable of loading arbitrary action URLs and signing/sending versioned transactions on Devnet. The `send-sol` change extends this architecture with a general transfer action while preserving current wallet integration and extension adapter behavior.

## Goals / Non-Goals

**Goals:**
- Add a new action capability to send SOL to a user-specified recipient wallet.
- Reuse the existing Solana Actions transaction-building pipeline and Devnet configuration.
- Keep extension compatibility by returning standard `ActionGetResponse` and `ActionPostResponse` payloads.
- Provide deterministic validation and user-friendly failures for invalid recipient, invalid amount, and insufficient funds.

**Non-Goals:**
- Migrating from Devnet to mainnet.
- Introducing token transfers (SPL) or multi-recipient batching.
- Replacing the extension wallet bridge protocol.
- Changing existing donation behavior unless explicitly wired by route/action URL usage.

## Decisions

1. **Create `send-sol` as a separate action route**
   - Decision: Add a dedicated route (parallel to donation) under `src/app/api/actions/send-sol`.
   - Rationale: Isolates semantics and validation from donation-specific logic and keeps backward compatibility.
   - Alternative considered: Reusing `donate-sol` with optional recipient parameter. Rejected because it overloads endpoint intent and increases risk of accidental behavior drift.

2. **Recipient passed as explicit action parameter**
   - Decision: Include recipient as a required parameter in action links (templated custom action and/or fixed amount links).
   - Rationale: Keeps action execution explicit and auditable in request URL composition.
   - Alternative considered: Passing recipient only in POST body. Rejected because standard Blink action links are query-driven for parameterized transaction generation.

3. **Reuse current transfer + fee/buffer checks**
   - Decision: Keep the existing lamports conversion, v0 transaction message compilation, fee estimation, and minimum balance buffer pattern.
   - Rationale: Existing logic already matches current extension/web wallet execution expectations.
   - Alternative considered: Removing buffer checks and relying only on preflight failure. Rejected due to poorer UX and less actionable errors.

4. **No extension protocol changes**
   - Decision: Extension continues to treat `send-sol` like any other fetched Blink action.
   - Rationale: Adapter is action-agnostic and already handles sign/send/confirm and friendly error surfacing.
   - Alternative considered: Introducing new bridge methods. Rejected as unnecessary for this capability.

## Risks / Trade-offs

- **[Risk] Recipient input mistakes could direct funds to unintended addresses** -> **Mitigation:** Strict `PublicKey` parsing and clear validation errors before transaction response.
- **[Risk] Query-parameter recipient exposure in shared links** -> **Mitigation:** Document expected behavior; this is consistent with action-link transparency in current architecture.
- **[Risk] Duplicate validation logic across action routes** -> **Mitigation:** Extract shared validation/helpers if duplication grows during implementation.
- **[Risk] Increased user confusion between donate and send routes** -> **Mitigation:** Keep route labels/title/description explicit in each action metadata response.
