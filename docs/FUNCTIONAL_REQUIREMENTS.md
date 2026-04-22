# Solana Blink Unfurler POC - Functional & Non-Functional Requirements

**Project Title:** Solana Blink Unfurler POC  
**Version:** Final  
**Date:** April 22, 2026  
**Status:** Current Implementation Requirements

---

## 1. Overview

This project is a proof of concept that demonstrates:

- a Solana Blink provider built with Next.js
- a shareable Blink page (`/donate-sol`)
- Blink resolution through `/actions.json`
- a Chrome extension that unfurls Blink URLs inline on `x.com`
- wallet-based non-custodial signing using Phantom / Backpack
- transaction submission and confirmation on Solana Devnet

The current implementation is centered around:

- `/donate-sol`
- `/actions.json`
- `/api/actions/donate-sol`
- Chrome extension unfurling on X

---

## 2. Functional Requirements

### FR-1: Shareable Blink Page

The system shall expose a public share page at `/donate-sol`.

The page shall:

- render in a normal browser
- provide OG/social metadata
- expose `solana:action:apiUrl`
- act as the human-friendly URL users share on X

### FR-2: Action Mapping Endpoint

The system shall expose `/actions.json`.

The endpoint shall:

- return action mapping rules
- allow Blink clients to map website/share URLs to action API URLs
- support conversion of `/donate-sol` style URLs into `/api/actions/donate-sol`

### FR-3: Blink Metadata Endpoint

The system shall expose `GET /api/actions/donate-sol`.

The endpoint shall return Blink metadata including:

- `type: "action"`
- title
- description
- icon
- action buttons
- predefined donation amounts
- custom amount action parameter

### FR-4: Transaction Construction Endpoint

The system shall expose `POST /api/actions/donate-sol`.

The endpoint shall:

- accept the user wallet public key as `account`
- accept donation amount from query parameter
- validate input
- construct an unsigned Solana transfer transaction
- return the transaction as base64

### FR-5: Preset and Custom Donation Support

The Blink shall support:

- preset donation buttons
- custom amount input

The user shall be able to select a fixed amount or enter a custom amount before transaction creation.

### FR-6: Input Validation

The backend shall validate:

- donation amount is present and numeric
- donation amount is greater than zero
- account is a valid Solana public key

The backend shall return clear client errors for invalid input.

### FR-7: Balance and Fee Validation

Before returning an unsigned transaction, the backend shall:

- estimate transaction fee
- fetch payer balance
- verify the payer has enough balance for transfer plus fee

If insufficient funds are detected, the backend shall return a friendly validation error instead of allowing the transaction to proceed.

### FR-8: X.com Extension Injection

The Chrome extension shall run on:

- `x.com`
- `twitter.com`
- `pro.x.com`

The extension shall scan tweet content for candidate Blink URLs.

### FR-9: URL Resolution

The extension shall support Blink discovery through:

- direct action URLs
- `/actions.json` mapping
- page metadata fallback using `solana:action:apiUrl`

The extension shall resolve `t.co` links to their real target URL when required.

### FR-10: Inline Unfurling

The extension shall mount Blink UI inline into the X timeline when a supported Blink URL is detected.

The user shall see:

- Blink card content
- donation buttons
- interactive action UI directly in the tweet

### FR-11: Allowlisted Custom Preview

The extension shall support a custom preview path for configured hosts.

The host allowlist shall be configurable through extension env settings.

The extension shall only apply the custom preview flow to allowlisted hosts.

### FR-12: Trust and Security Filtering

The extension shall:

- allow trusted sources
- allow unknown sources for preview mode
- block malicious sources

This shall apply at Blink discovery time before rendering.

### FR-13: Wallet Detection

The extension shall support injected Solana wallets such as:

- Phantom
- Backpack

If the provider is not accessible from the content script directly, the extension shall use a page-context bridge.

### FR-14: Wallet Connection

The extension shall request wallet connection when needed before transaction execution.

If the user approves, the extension shall obtain the public key and continue.

If the user rejects, the Blink shall fail gracefully with an appropriate error.

### FR-15: Wallet Signing

The extension shall send unsigned transactions to the page wallet bridge for signing.

The page wallet bridge shall:

- access `window.solana`
- deserialize the unsigned transaction
- call `signTransaction`
- return the signed transaction to the content script

### FR-16: Transaction Broadcast

After signing, the extension shall:

- submit the signed transaction to Solana Devnet RPC
- capture the returned transaction signature

### FR-17: Transaction Confirmation

After broadcast, the extension shall:

- call `confirmTransaction`
- wait for network confirmation
- update Blink execution state based on success or failure

### FR-18: Friendly Error Handling

The system shall handle and surface clear errors for:

- invalid amount
- invalid account
- insufficient SOL balance
- wallet missing
- wallet rejection
- duplicate transaction submission
- Solana simulation/send failures

Known low-level errors such as insufficient lamports shall be translated into user-friendly messages where possible.

### FR-19: Debug Logging

The extension shall provide diagnostic logs for:

- link discovery
- URL resolution
- security checks
- Blink fetch
- Blink mount
- wallet bridge loading
- transaction send errors
- Solana log extraction

### FR-20: Standalone Blink Page

The app shall provide a standalone interactive Blink page at `/donate-sol` for browser-based preview outside X.

This page shall use the same action API endpoint as the extension flow.

---

## 3. Non-Functional Requirements

### NFR-1: Non-Custodial Security

The system must be non-custodial.

Specifically:

- private keys must never be sent to the backend
- signing must happen only in the user wallet
- the backend may only create unsigned transactions

### NFR-2: Browser Compatibility

The extension must work in modern Chrome with Manifest V3.

### NFR-3: Wallet Compatibility

The system must support modern injected Solana wallets, especially Phantom and Backpack.

### NFR-4: Standards Alignment

The provider endpoints must follow the Solana Actions / Blink response shape expected by Blink-aware clients.

### NFR-5: Security Isolation

The extension must not blindly unfurl arbitrary unknown third-party websites.

Custom preview behavior must remain limited to configured allowlisted hosts.

### NFR-6: Performance

The system should feel responsive enough for demo and interactive use.

Targets:

- metadata fetch should be fast enough for inline unfurling
- transaction construction should be fast enough for interactive wallet flow
- extension scanning/unfurling should feel near-immediate on X

### NFR-7: Reliability

The system should handle expected failure paths without crashing:

- wallet unavailable
- invalid user input
- insufficient funds
- Solana RPC send/simulation error
- duplicate transaction submission

### NFR-8: Observability

The extension and backend should provide enough logs to debug:

- unfurl failures
- mapping failures
- wallet bridge issues
- send/confirm failures

### NFR-9: Maintainability

The architecture should keep responsibilities separated:

- share page for human-facing URL
- `/actions.json` for mapping
- action endpoint for metadata + transaction creation
- extension for unfurling
- wallet bridge for page-context wallet access

### NFR-10: Environment Configurability

The extension and app should support environment-based configuration where appropriate, such as:

- preview allowed hosts
- RPC endpoint
- deployment-specific URLs

### NFR-11: Demo Readiness

The system should be documented well enough for:

- team walkthroughs
- POC submission
- architecture review
- live demo support

### NFR-12: Local and Hosted Support

The solution should support both:

- local development
- deployed preview / hosted usage

This includes support for localhost and deployed domains in the extension preview flow.

---

## 4. Scope of Current POC

### Included

- Solana Devnet donation flow
- Blink metadata and transaction construction
- X.com Chrome extension unfurling
- Phantom / Backpack signing
- Friendly transaction error handling
- Share page + action mapping

### Not Included

- production trust/registry workflow
- mainnet production hardening
- analytics dashboard
- published Chrome Web Store release
- multi-action Blink catalog

---

## 5. Acceptance Criteria

The POC is considered successful if:

1. A shared `/donate-sol` link can be detected on X by the extension
2. The extension can unfurl the Blink inline in the tweet
3. The user can click a donation action
4. The backend returns a valid unsigned transaction
5. Phantom / Backpack opens for approval
6. The signed transaction can be submitted to Devnet
7. The extension can confirm transaction status
8. Friendly errors appear for insufficient balance and known send failures

---

## 6. Reference Documents

- [workflow.md](/home/manish/projects/blinks/blink-anti-gravity/docs/workflow.md)
- [presentation.md](/home/manish/projects/blinks/blink-anti-gravity/docs/presentation.md)
- [DIAGRAMS.md](/home/manish/projects/blinks/blink-anti-gravity/docs/DIAGRAMS.md)
