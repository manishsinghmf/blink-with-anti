# ✅ New Setup - Ready to Test

## URLs to Use

**Primary Share URL** (use this):
```
https://blink-with-anti.vercel.app/donate-sol
```

This URL now:
- Returns beautiful HTML with OG tags for X preview ✓
- Has proper meta tags for sharing ✓
- Can serve action JSON to the extension if requested ✓

**Alternative** (API-only):
```
https://blink-with-anti.vercel.app/api/donate
```

---

## Test Steps

### 1. Reload Extension (Important!)
```
chrome://extensions/ → Find "Solana Blink Unfurler" → Click refresh icon 🔄
```

### 2. Go to X.com and Open DevTools
```
X.com → Press F12 → Go to "Console" tab
```

### 3. Paste this URL on X.com
```
https://blink-with-anti.vercel.app/donate-sol
```

### 4. Watch the Console
You should see messages like:
```
[Blink Unfurler] 🚀 Starting Twitter observer...
[Blink Unfurler] ✅ Twitter observer active...
[Blink Unfurler] Found Blink URL: https://blink-with-anti.vercel.app/donate-sol
[Blink Unfurler] ✅ Verified as Blink: https://blink-with-anti.vercel.app/donate-sol
```

### 5. What Should Happen
After pasting and waiting 2-3 seconds, you should see:
- A card appears inline showing "Donate SOL"
- Buttons for "0.1 SOL ⭐", "0.05 SOL", etc.
- A click reveals the full Blink UI

---

## Endpoint Details

### `/donate-sol` - HTML Page ✓
```bash
curl https://blink-with-anti.vercel.app/donate-sol
# Returns: HTML with OG tags + Solana Action metadata
```

### `/api/donate` - Pure Action JSON ✓
```bash
curl https://blink-with-anti.vercel.app/api/donate
# Returns: {"type": "action", "title": "Donate SOL", ...}
```

### `/api/actions/donate-sol` - Transaction Handler ✓
```bash
curl https://blink-with-anti.vercel.app/api/actions/donate-sol?amount=0.1
# Returns: {"type": "action", "links": {...}}
```

---

## Troubleshooting: If Still Not Working

### A. Console shows no "[Blink Unfurler]" messages
- Extension might not be loaded
- Open `chrome://extensions/` and verify enabled
- Try harder reload: Ctrl+Shift+R

### B. Console shows URL found, but no unfurl
- setupTwitterObserver might need a specific format
- Try scrolling up/down on the X.com feed
- Try pasting in a new tweet instead of reply

### C. Get "No Solana wallet" error
- Install Phantom: https://phantom.app
- Create/import wallet
- Switch to Devnet network
- Allow extension access in Phantom settings

---

## Key Updates in This Build

1. ✅ `/donate-sol` now returns HTML + proper OG tags
2. ✅ `/donate-sol` has `solana:action:apiUrl` meta tag pointing to action endpoint
3. ✅ `/api/donate` returns clean action JSON
4. ✅ Extension enhanced with explicit Blink URL detection
5. ✅ Extension logs when it finds and verifies Blink URLs

---

**Next Step**: Do the test above and report:
1. Do you see "[Blink Unfurler]" messages? ✓/✗
2. Do you see "[Blink Unfurler] Found Blink URL"? ✓/✗
3. Does the Blink unfurl on X? ✓/✗
