## 1. API Route and Validation

- [x] 1.1 Create `src/app/api/actions/send-sol/route.ts` with `OPTIONS`, `GET`, and `POST` handlers using current action headers/version conventions.
- [x] 1.2 Implement `GET` metadata response for `send-sol` with recipient + amount parameterized transaction links and clear send-specific labels/descriptions.
- [x] 1.3 Implement `POST` parsing/validation for payer account, recipient account, and amount, returning client errors for invalid inputs.
- [x] 1.4 Build transfer transaction creation (payer -> recipient), fee estimation, and balance safety-buffer checks before returning serialized transaction.

## 2. UI and Action Wiring

- [x] 2.1 Add/adjust a send-focused page route and metadata so Blink clients can discover and render the `send-sol` action URL.
- [x] 2.2 Update any in-app Blink preview/share wiring needed to load `send-sol` without breaking existing donation flow.
- [x] 2.3 Ensure action discovery paths (`/actions.json` mapping and page `solana:action:apiUrl` metadata where applicable) expose the send action correctly.

## 3. Extension Compatibility and Verification

- [x] 3.1 Verify extension unfurl pipeline can resolve and mount `send-sol` action URLs via existing direct-action/actions.json/page-meta resolution paths.
- [x] 3.2 Verify wallet bridge sign/send/confirm flow works for `send-sol` transactions without protocol changes.
- [x] 3.3 Validate failure UX for send flow (invalid recipient, invalid amount, insufficient balance) in both web Blink execution and extension execution.
