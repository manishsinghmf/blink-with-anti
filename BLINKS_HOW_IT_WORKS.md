# Blinks Integration Guide: Native vs Extension

## How Blinks Work (Two Approaches)

### **Approach 1: Native X.com Support (No Extension Needed) ✨**

When you share a URL on X.com:
1. **X fetches your URL** to read meta tags
2. **Displays a card preview** based on OG tags (image, title, description)
3. **For Solana Actions**, X can natively recognize certain patterns and **inject interactive Blink UI directly** in the feed with buttons

**Your Setup:**
- URL: `https://demo-blinks.vercel.app/donate-sol`
- Returns: HTML page with proper OG meta tags + meta tag pointing to action endpoint
- OG Image: Beautiful Solana coin donation image
- Action URL: `solana:action:apiUrl` → points to `/api/actions/donate-sol`

**What X sees:**
```html
<meta property="og:title" content="Donate SOL — Solana Blink" />
<meta property="og:description" content="Support the project..." />
<meta property="og:image" content="https://demo-blinks.vercel.app/donate-sol.jpg" />
<meta name="solana:action:apiUrl" content="https://demo-blinks.vercel.app/api/actions/donate-sol" />
```

X.com then:
- Shows the card preview (that's the image you saw!)
- Optionally fetches the action endpoint
- If it recognizes it as a Solana Action, may inject Blink UI

**Status:** ✓ Card showing, ⚠ Interactive buttons not yet appearing (X may have limited Blink support on their own)

---

### **Approach 2: Chrome Extension (Fallback/Enhancement) 🔧**

For sites/situations where native support doesn't work, the Chrome extension:

1. **Loads on X.com**
2. **Watches for links**
3. **If a link looks like an action URL** → fetches it
4. **If it returns `{type: "action", ...}` JSON** → injects Dialect's Blink UI component
5. **User can interact** with buttons in the feed

**How the extension detects action URLs:**
- Looks for known patterns: `/api/actions/`, `/api/donate`, custom domains
- Tries to fetch the URL with `Accept: application/json` header
- If response has `type: "action"` → unfurls as Blink

---

## Your Setup Architecture

```
User shares on X.com
↓
https://demo-blinks.vercel.app/donate-sol
↓
┌─ X.com Crawler ────────────────┐
│ Fetches the URL for OG meta tags│
└────────────┬──────────────────┘
             ↓
      Shows card preview ✓
      (But buttons not triggering)
             ↓
   ┌─ Chrome Extension ────────────┐
   │ Runs on X.com page            │
   │ Detects the URL in feed       │
   │ Fetches /api/actions/donate-sol
   │ Gets action JSON              │
   │ Injects Blink UI              │
   └───────────────────────────────┘
             ↓
      User sees interactive
      Donate buttons!


Endpoints:
├─ GET /donate-sol → HTML page + OG tags ✓
├─ GET /api/donate → Pure action JSON ✓
└─ GET /api/actions/donate-sol?amount=X → Transaction handler ✓
```

---

## Endpoints Explained

### **1. `/donate-sol` - Main Share URL**
```
GET https://demo-blinks.vercel.app/donate-sol

Returns: HTML page + OG meta tags
Content-Type: text/html
Status: 200

Why:
- X.com expects a webpage to scan for OG tags
- Browsers see the interactive UI
- Good for sharing on X.com with preview card
```

###  **2. `/api/donate` - Direct Action Endpoint**
```
GET https://demo-blinks.vercel.app/api/donate

Returns: {
  type: "action",
  icon: "...",
  title: "Donate SOL",
  links: { actions: [...] }
}
Content-Type: application/json
Status: 200

Why:
- Direct action specification
- Can be shared in places where native Blink support exists
- Extension can fetch and unfurl directly
```

### **3. `/api/actions/donate-sol?amount=X` - Transaction Handler**
```
POST https://demo-blinks.vercel.app/api/actions/donate-sol?amount=0.1

Body: { account: "pubkey..." }

Returns: {
  type: "transaction",
  transaction: "base64..."
}
Content-Type: application/json
Status: 200

Why:
- Called by Blink UI when user clicks donate
- Prepares the transaction
- User signs and sends it
- Confirms on Solana devnet
```

---

## Why Buttons Aren't Appearing Yet

**Issue**: The card preview shows (X.com's native OG preview), but interactive Blink buttons don't appear in the X feed.

**Possible Reasons**:
1. **X.com doesn't automatically inject Blink UI** for all URLs
   - X may require special registration or partnership
   - Or they only inject for known/whitelisted endpoints
   - Or the functionality is new and limited

2. **Extension detection may need fine-tuning**
   - `setupTwitterObserver` might not recognize your URL pattern
   - Extension logs show it's active, but not detecting the specific URL

3. **Missing `solana-actions:` protocol**
   - Some Blinks use URLs like `solana-actions:https://...`
   - This explicitly signals to clients it's a Blink

**What to Try**:
```
Test these URLs on X in order:

1. https://demo-blinks.vercel.app/donate-sol
   (Current - card shows, buttons should appear via extension)

2. solana-actions:https://demo-blinks.vercel.app/api/donate
   (Special protocol - might work natively)

3. https://demo-blinks.vercel.app/api/donate
   (Direct action - clearer signal for extension)
```

---

## Extension Configuration

Your extension (`chrome-extension/dist/`) currently:

```typescript
// Loads on X.com
setupTwitterObserver(adapter);

// Where adapter = SolanaBlinkAdapter with methods:
- connect() → prompts wallet
- signTransaction() → signs tx via Phantom/Backpack
- confirmTransaction() → waits for confirmation
- signMessage() → signs messages
```

**How to improve detection:**
1. ✓ Already detects URLs with `demo-blinks.vercel.app`
2. ✓ Logs when it finds them
3. ⚠ May need explicit pattern matching for your `/donate-sol` endpoint

---

## Testing Workflow

### **Test 1: Verify Endpoints**
```bash
# Should return HTML with OG tags
curl -i https://demo-blinks.vercel.app/donate-sol | head -50

# Should return action JSON
curl -H "Accept: application/json" https://demo-blinks.vercel.app/api/donate | jq .

# Should return another action variant
curl -H "Accept: application/json" https://demo-blinks.vercel.app/api/actions/donate-sol | jq .
```

### **Test 2: On X.com Without Extension**
1. Share URL on X
2. Card preview should appear (it does ✓)
3. Open DevTools (F12)
4. Try clicking the card area
5. See if interactive buttons appear

### **Test 3: On X.com With Extension**
1. Install extension (`chrome://extensions/` → Load unpacked → `chrome-extension/dist/`)
2. Reload X.com
3. Open DevTools Console
4. Look for `[Blink Unfurler]` messages
5. Paste URL in new tweet
6. See if extension detects and unfurls it

### **Test 4: Visit Page Directly**
1. Open https://demo-blinks.vercel.app/donate-sol in browser
2. Should see beautiful interactive Donate page
3. Connect wallet button works
4. Can select donation amounts

---

## Next Actions

### **If native X support is limited:**
- Focus on making the extension work reliably
- Users with extension will see Blink UI in X feed
- Users without extension can visit the page directly

### **To enable X native support:**
- May need to register Blink in Solana registry
- Or use `solana-actions://` URL scheme
- Or integrate with Blink aggregators

### **Better Chrome Extension Detection:**
- Add more explicit URL pattern matching
- Log what the observer finds
- Verify it can fetch and parse the JSON response

---

## Summary

| Feature  | Status | How |
|----------|--------|-----|
| Share page on X | ✓ Works | Card preview from OG tags |
| View page in browser | ✓ Works | Interactive UI | 
| Native X Blinks | ⚠ Limited | Needs X support |
| Extension unfurl | ⚠ Pending | Needs proper detection/injection |
| Donate on page | ✓ Works | Connect wallet + select amount |
| Transaction execution | ✓ Works | Solana devnet signing |

Your infrastructure is correct and complete. The next step is ensuring the extension reliably detects and injects the Blink UI when your URL appears on X.com.
