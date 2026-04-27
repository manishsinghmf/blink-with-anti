# Blink Anti Gravity

Solana Blink provider with:

- Donate SOL action flow
- Send SOL action flow
- Shareable Blink pages
- X.com/Twitter unfurl support via custom Chrome extension

## Prerequisites

- Node.js 18+ (recommended: latest LTS)
- npm
- Chrome browser (for extension testing on X.com)

## Deployed URL

- Base URL: `https://demo-blinks.vercel.app/`
- Donate Blink URL: `https://demo-blinks.vercel.app/donate-sol`
- Send Blink URL: `https://demo-blinks.vercel.app/send-sol`

## Project Structure

- `src/app/api/actions/donate-sol/route.ts` - Donate action API
- `src/app/api/actions/send-sol/route.ts` - Send action API
- `src/app/actions.json/route.ts` - Solana Actions discovery mapping
- `src/app/donate-sol/` - Donate share page + Blink UI
- `src/app/send-sol/` - Send share page + Blink UI
- `src/app/blink/` - Generic Blink client page
- `chrome-extension/` - X.com unfurler extension (content script + wallet bridge)

## Local Development

1) Install dependencies:

```bash
npm install
```

2) Run Next.js app:

```bash
npm run dev
```

3) Open app URLs:

- Home: `http://localhost:3000/`
- Donate page: `http://localhost:3000/donate-sol`
- Send page: `http://localhost:3000/send-sol`
- Blink client: `http://localhost:3000/blink`
- Actions JSON: `http://localhost:3000/actions.json`

## Action Endpoints

- `GET/POST/OPTIONS /api/actions/donate-sol`
- `GET/POST/OPTIONS /api/actions/send-sol`
- `GET/OPTIONS /actions.json`

Both action APIs target Solana Devnet and return Solana Action-compatible payloads.

## Chrome Extension (X.com Unfurl)

### 1) Setup extension environment

Create `chrome-extension/.env` and configure allowed hosts:

```env
VITE_PREVIEW_ALLOWED_HOSTS=demo-blinks.vercel.app,localhost:3000,127.0.0.1:3000
```

You can include multiple hosts separated by commas.

### 2) Build extension

```bash
cd chrome-extension
npm install
npm run build
```

### 3) Load extension in Chrome

1. Open `chrome://extensions`
2. Enable Developer Mode
3. Click "Load unpacked"
4. Select `chrome-extension/dist`

### 4) Unfurl behavior and allowed hosts

- Unfurling on X.com works only when the posted URL host is included in `VITE_PREVIEW_ALLOWED_HOSTS`.
- For production usage, include your deployed host (for example `demo-blinks.vercel.app`).
- For local testing, include `localhost:3000` and/or `127.0.0.1:3000`.
- After changing `chrome-extension/.env`, rebuild the extension with `npm run build` and reload it in Chrome.
- Share deployed Blink URLs like `https://demo-blinks.vercel.app/donate-sol` to ensure reliable unfurl behavior.

## Diagrams

Diagram sources are in `docs/`:

- `docs/sequence_diagram.md`
- `docs/sequence_diagram_with_extension.md`
- `docs/architecture_diagram.md`

Each file contains only diagram code for direct paste into [sequencediagram.org](https://sequencediagram.org/).
