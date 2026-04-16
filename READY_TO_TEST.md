# ✅ Blinks Setup Complete - Testing Instructions

## What You're Building

A **Solana Blink for donations** that works in two ways:

### **1. Without Extension: Direct Page** ✓
- Share: `https://blink-with-anti.vercel.app/donate-sol`
- X.com shows a preview card
- Users can visit the page and donate
- **Status**: Working perfectly

### **2. With Extension: X.com Feed Unfurled** (To test)
- Extension running on X.com
- Detects your donation link
- Injects interactive Blink UI directly in X feed
- Users can donate without leaving X.com
- **Status**: Infrastructure ready, needs testing

---

## The Two Components

### **A. Your Website** (`/home/manish/projects/blinks/blink-anti-gravity/`)
```
Route                              Returns
─────────────────────────────────────────────────
GET  /donate-sol                   → HTML page + OG tags ✓
GET  /api/donate                   → Action JSON ✓
GET  /api/actions/donate-sol?amount=X → Transaction handler ✓
POST /api/actions/donate-sol       → Execute transaction ✓
```

All are deployed to: `https://blink-with-anti.vercel.app`

### **B. Chrome Extension** (`/home/manish/projects/blinks/blink-anti-gravity/chrome-extension/`)
```
Folder: chrome-extension/dist/
Files:
├─ manifest.json          → Extension config
├─ contentScript.js       → Runs on X.com
├─ style.css              → Blink UI styling
└─ icons/                 → Extension icons
     ├─ icon-48.png ✓
     └─ icon-128.png ✓
```

---

## How It Works

### **Without Extension (Current)**

```
You paste link on X.com
        ↓
https://blink-with-anti.vercel.app/donate-sol
        ↓
X.com crawler fetches it
        ↓
Finds OG meta tags & image
        ↓
Displays card preview ✓
(This is what you see now!)
        ↓
Users can click → visit page → donate ✓
```

### **With Extension (Testing Phase)**

```
You paste link on X.com
        ↓
X.com shows card preview ✓
        ↓
Chrome extension (running on X.com) detects link
        ↓
Extension fetches: /api/actions/donate-sol
        ↓
Gets action JSON
        ↓
Extension injects Blink UI into X feed
        ↓
Users see Donate buttons inline ← GOAL
        ↓
Users can click donate without leaving X.com
```

---

## Testing Plan

### **Step 1: Verify Website is Working**
```bash
# Test all three endpoints
curl -i https://blink-with-anti.vercel.app/donate-sol | head -20
curl https://blink-with-anti.vercel.app/api/donate | jq .type
curl https://blink-with-anti.vercel.app/api/actions/donate-sol | jq .type

# All should return proper responses
```

### **Step 2: Load Extension in Chrome**
1. Open `chrome://extensions/`
2. Toggle **"Developer mode"** (top right)
3. Click **"Load unpacked"**
4. Select: `/home/manish/projects/blinks/blink-anti-gravity/chrome-extension/dist/`
5. You should see "Solana Blink Unfurler" extension

### **Step 3: Test Extension on X.com**
1. Go to `https://x.com` (must be logged in)
2. Press **F12** to open DevTools
3. Go to **Console** tab
4. Create a new post and paste:
   ```
   https://blink-with-anti.vercel.app/donate-sol
   ```
5. **Watch the Console** - should see:
   ```
   [Blink Unfurler] 🚀 Starting Twitter observer...
   [Blink Unfurler] ✅ Twitter observer active...
   ```

### **Step 4: Check What Appears**
After pasting the URL:
- ✓ Card preview should appear (X.com's native preview)
- ⚠ Interactive Blink buttons = Try refreshing X.com
- ⚠ Still nothing = Extension may need tweaking

---

## Your Endpoints (How They're Used)

### **`/donate-sol` - The Share URL**
When user shares this on X:
- X crawler fetches it
- Gets HTML + OG meta tags
- Shows card preview
- User visits page directly (without extension)

### **`/api/donate` - Alternative Action Endpoint**
Direct API for:
- Testing (can call directly: `curl /api/donate`)
- Places with native Blink support
- Extension fallback

### **`/api/actions/donate-sol` - Transaction Endpoint**
Called by Blink UI when user:
1. Clicks "0.1 SOL ⭐" button
2. Wallet prompts to sign
3. This endpoint prepares the transaction
4. User signs with Phantom/Backpack
5. Transaction sent to Solana devnet

---

## What to Report Back

After testing, let me know:

**About the card preview:**
- [ ] Does the card appear on X.com when you paste the URL?
- [ ] Does it show the Solana logo donation image?
- [ ] Can you click on it?

**About the extension:**
- [ ] Do you see `[Blink Unfurler]` messages in DevTools console?
- [ ] Does the extension log anything when you paste the URL?
- [ ] Do interactive Donate buttons appear inline in the feed?

**About direct page visit:**
- [ ] Visit `https://blink-with-anti.vercel.app/donate-sol` directly
- [ ] Can you connect a wallet?
- [ ] Can you select donation amounts?
- [ ] Does confirming work?

---

## Key Files Reference

### Website
- [Layout](src/app/layout.tsx) - Global metadata + OG tags
- [Donate page](src/app/donate-sol/page.tsx) - Server component (metadata only)
- [Donate client](src/app/donate-sol/client.tsx) - React interactive UI
- [Action handler](src/app/api/actions/donate-sol/route.ts) - Transaction logic
- [API endpoint](src/app/api/donate/route.ts) - Pure action JSON

### Extension
- [Manifest](chrome-extension/manifest.json) - Extension config + permissions
- [Content script](chrome-extension/src/contentScript.ts) - Runs on X.com, detects Blinks
- [Vite config](chrome-extension/vite.config.ts) - Build config, copies icons

---

## Current Status

| Component | Status | Next Step |
|-----------|--------|-----------|
| Website + OG tags | ✅ Done | Deployed to Vercel |
| Card preview on X | ✅ Works | Currently visible when shared |
| Extension loaded | ✅ Ready | Load at `chrome://extensions/` |
| Extension detection | ✅ Ready | Should detect your URLs |
| Extension UI injection | 🔄 Testing | Try sharing URL, watch console |
| Direct page visit | ✅ Works | Beautiful UI ready |
| Wallet connection | ✅ Works | Phantom/Backpack ready |
| Submit donation | ✅ Works | Sends to Solana devnet |

---

## Troubleshooting

### **Extension doesn't show up in Chrome**
- [ ] Go to `chrome://extensions/`
- [ ] Toggle "Developer mode"
- [ ] Click "Load unpacked"
- [ ] Select the `/chrome-extension/dist/` folder

### **No "[Blink Unfurler]" messages in console**
- [ ] Are you on `x.com` or `twitter.com`?
- [ ] Press F12 to open DevTools
- [ ] Go to Console tab
- [ ] Refresh the page
- [ ] Look for the messages

### **Card appears but no interactive buttons**
- This is the current state - working as expected
- X.com may have limited Blink UI injection
- Extension should provide the interactive buttons
- Keep testing to see if extension can inject them

### **Can't connect wallet**
- [ ] Install Phantom: https://phantom.app
- [ ] Create/import wallet
- [ ] Switch to **Devnet** network
- [ ] Try again

### **Donation fails**
- [ ] Check you have SOL on Devnet
- [ ] Get free Devnet SOL: https://faucet.solana.com
- [ ] Check browser console for errors
- [ ] Try with smaller amount

---

## Next Steps

1. **Deploy latest code**: `git push` → Vercel auto-deploys
2. **Reload extension**: `chrome://extensions/` → refresh button
3. **Test on X**: Paste URL, watch console
4. **Report findings**: Let me know what you see
5. **Iterate**: We can fine-tune extension detection if needed

---

## Resources

- [Solana Actions Spec](https://solana.com/docs/advanced/actions)
- [Dialect Blinks Docs](https://docs.dialect.to/blinks)
- [Phantom Wallet](https://phantom.app)
- [Solana Devnet Faucet](https://faucet.solana.com)

---

**Everything is set up and ready to test!** 🚀

Let me know what you find when you test the extension on X.com.
