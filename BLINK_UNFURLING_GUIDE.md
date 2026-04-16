# Blink Unfurling Debug Guide

## Problem Summary
Your Blink at `https://blink-with-anti.vercel.app/donate-sol` is not unfurling on X.com, even though the Chrome extension is installed and the action metadata is available.

## Root Cause
The issue is about **URL discovery and action registration**:

1. **Page vs Action endpoint mismatch**
   - You're sharing: `https://blink-with-anti.vercel.app/donate-sol` (a React UI page)
   - Action metadata is at: `https://blink-with-anti.vercel.app/api/actions/donate-sol` (returns JSON)
   - The Chrome extension's `setupTwitterObserver` doesn't know these are connected

2. **How X unfurling works**
   - User shares URL on X → X crawler visits the URL → crawls OG meta tags
   - Chrome extension finds links → tries to fetch them as action endpoints
   - If the URL returns `{type: "action", ...}` JSON → unfurls as Blink
   - If URL returns HTML → extension can't automatically detect it as a Blink

## Solutions Implemented

### ✅ Solution 1: Added `/api/donate` Endpoint (Recommended)
- **Location**: `src/app/api/donate/route.ts`
- **What it does**: Returns the full Solana Action spec when accessed
- **Share URL**: `https://blink-with-anti.vercel.app/api/donate`
- **Why it works**: When users share this URL, crawlers and the extension can directly fetch the action JSON

### ✅ Solution 2: Enhanced Layout Metadata
- Added `og:url` and `solana:action:apiUrl` meta tags
- Helps crawlers understand the page structure

### ✅ Solution 3: Fixed Chrome Extension
- Icon files are versioned in `src/icons/` and auto-copied to `dist/` during build
- Extension rebuilt and ready to use

## How to Use

### Option A: Direct Action URL (Recommended for X Sharing)
```
Share: https://blink-with-anti.vercel.app/api/donate
```
✅ Pros: 
- Instantly unfurls on X with Chrome extension
- No page load needed
- Direct action discovery

### Option B: HTML Page URL
```
Share: https://blink-with-anti.vercel.app/donate-sol
```
⚠️ Cons:
- Returns HTML, not JSON
- Extension may not auto-detect it as a Blink
- Users must visit the page to see the UI

### Option C: Full Action Endpoint
```
Share: https://blink-with-anti.vercel.app/api/actions/donate-sol
```
- Most direct but less user-friendly
- Returns raw action JSON

## Testing Checklist

- [ ] **1. Next.js Build**
  ```bash
  npm run build
  # Should complete without errors
  # Check routes include: /api/donate, /api/actions/donate-sol, /donate-sol
  ```

- [ ] **2. Extension Build**
  ```bash
  cd chrome-extension
  npm run build
  # Verify dist/icons/icon-48.png and icon-128.png exist
  ```

- [ ] **3. Extension Installation**
  - Open `chrome://extensions/`
  - Toggle "Developer mode"
  - Load unpacked folder: `chrome-extension/dist/`
  - Verify extension is active

- [ ] **4. Deploy to Vercel**
  ```bash
  git push origin main
  # Wait for Vercel deployment
  ```

- [ ] **5. Test on X.com**
  - Visit X.com (must have Chrome extension installed)
  - Paste link: `https://blink-with-anti.vercel.app/api/donate`
  - Should see a card preview appear
  - Click to unfurl the Blink UI

- [ ] **6. Verify Action Endpoints**
  ```bash
  # Should return JSON:
  curl https://blink-with-anti.vercel.app/api/donate
  curl https://blink-with-anti.vercel.app/api/actions/donate-sol
  ```

## Architecture Diagram

```
┌─ User shares on X.com ─────────────┐
│  https://blink-with-anti.vercel.app/api/donate
└────────────────────────────────────┘
                  ↓
        ┌─ X Crawler ─┐
        │ Fetches URL │
        └──────┬──────┘
               ↓
    Returns JSON action spec
    {
      type: "action",
      icon: "...",
      links: {...}
    }
               ↓
    ┌─ Chrome Extension ─┐
    │ Detects Blink URL │
    │ Renders UI        │
    └───────────────────┘
               ↓
       User sees unfurled
       donate button in feed
```

## Code Changes Made

### 1. New File: `src/app/api/donate/route.ts`
- Dedicated endpoint for X unfurling
- Returns Solana Action JSON directly
- Handles CORS and OPTIONS requests

### 2. Updated: `src/app/layout.tsx`
- Added `og:url` and `solana:action:apiUrl` metadata
- Improves crawler and extension discovery

### 3. Updated: `src/app/page.tsx`
- Changed `SHARE_URL` to point to `/api/donate`
- Copy button now shares the action endpoint

### 4. Updated: `chrome-extension/vite.config.ts`
- Auto-copies icon files from `src/icons/` to `dist/icons/` during build  

### 5. Added: `chrome-extension/src/icons/`
- `icon-48.png` and `icon-128.png` versioned in source
- Persists across rebuilds

## Production Deployment Steps

1. **Push code to git**
   ```bash
   git add .
   git commit -m "Fix Blink unfurling on X - add /api/donate endpoint"
   git push
   ```

2. **Vercel auto-deploys** your Next.js app

3. **Update Chrome extension** (if you made changes)
   ```bash
   cd chrome-extension
   npm run build
   ```
   Then re-load it in Chrome at `chrome://extensions/`

4. **Share the URL on X**
   - Use: `https://blink-with-anti.vercel.app/api/donate`
   - With extension installed, it should unfurl inline

## Troubleshooting

| Issue | Cause | Fix |
|-------|-------|-----|
| Extension shows "Failed to load icon" | Missing icon files | Files added to `src/icons/` ✓ |
| Blink doesn't unfurl on X | Chrome extension not active | Open `chrome://extensions/` → enable extension |
| Blink unfurls but errors on sign | Wallet not connected | User must connect Phantom/Backpack first |
| API returns 404 | Route not deployed | Restart Next.js or redeploy to Vercel |
| Action buttons don't work | Wrong RPC endpoint | Using `https://api.devnet.solana.com` ✓ |

## File Structure

```
src/
├── app/
│   ├── page.tsx ..................... Home/demo page
│   ├── donate-sol/page.tsx .......... UI-only page  
│   ├── layout.tsx ................... Global metadata
│   ├── actions.json/route.ts ........ Action routing config
│   └── api/
│       ├── donate/route.ts .......... ✨ NEW: Direct action endpoint
│       └── actions/
│           └── donate-sol/route.ts .. Main action logic
│
chrome-extension/
├── src/
│   ├── contentScript.ts ............ Observes X.com for Blinks
│   └── icons/ ...................... ✨ Updated: Versioned icons
├── dist/ .......................... Built extension (auto-generated)
└── vite.config.ts ................. ✨ Updated: Icon copying logic
```

## Next Steps

1. **Deploy this code**: After pushing these changes, your Blink should work
2. **Test the new endpoint**: `curl https://your-domain.vercel.app/api/donate`
3. **Share and spread**: Use `https://blink-with-anti.vercel.app/api/donate` on X

Questions? Check the [Solana Actions spec](https://solana.com/docs/advanced/actions) or [Dialect Blinks docs](https://docs.dialect.to/blinks)
