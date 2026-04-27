# 🔧 Blink Unfurling Troubleshooting

## Step-by-Step to Get It Working

### 1. **Reload Chrome Extension** (CRITICAL)
The extension needs to be reloaded for your changes to take effect:

```
1. Open chrome://extensions/
2. Find "Solana Blink Unfurler"
3. Click the refresh icon 🔄
   (or toggle off/on)
```

### 2. **Verify Extension is Working**
After reloading, go to X.com and check the console:

```
1. On X.com, press F12 (open DevTools)
2. Go to Console tab
3. Look for this message:
   "[Blink Unfurler] ✅ Twitter observer active..."
4. If you don't see it, extension isn't working:
   - Check Extensions panel (chrome://extensions/)
   - Make sure "Solana Blink Unfurler" is enabled
   - Check if there are any red errors
```

### 3. **Try Different URLs on X.com**

Copy ONE of these and paste on X.com as a new post:

**Option A: Direct Action Endpoint** ⭐ RECOMMENDED
```
https://demo-blinks.vercel.app/api/donate
```

**Option B: Donate Page** (Alternative)
```
https://demo-blinks.vercel.app/donate-sol
```

**Option C: Full Action with Amount**
```
https://demo-blinks.vercel.app/api/actions/donate-sol?amount=0.1
```

### 4. **Check if Blink Unfurls**

After pasting the URL on X.com:
- With extension working → should see a "Donate SOL" button card appear inline
- Without extension → just see a link preview

---

## What Should Happen

1. **You paste the link on X.com**
   ```
   https://demo-blinks.vercel.app/api/donate
   ```

2. **Chrome extension detects it** (runs in background)
   - Fetches the URL  
   - Sees it returns `{type: "action", ...}`
   - Recognizes it as a Blink ✓

3. **User sees an unfurled card** with:
   - Icon (donate-sol.jpg)
   - Title: "Donate SOL"
   - Buttons: "0.1 SOL ⭐", "0.05 SOL", "0.01 SOL", Custom amount

4. **When clicked** → User can connect wallet & donate

---

## If It Still Doesn't Work

### A. Extension Not Loading

Check these:
```bash
# 1. Extension files exist?
ls -la chrome-extension/dist/
# Should show: manifest.json, contentScript.js, style.css, icons/

# 2. Icons exist?
ls -la chrome-extension/dist/icons/
# Should show: icon-48.png, icon-128.png

# 3. Manifest version?
cat chrome-extension/dist/manifest.json | grep manifest_version
# Should be: "manifest_version": 3
```

### B. API Not Returning JSON

Test from terminal:
```bash
# Should return action JSON:
curl -s https://demo-blinks.vercel.app/api/donate | jq .

# Should contain:
# {
#   "type": "action",
#   "title": "Donate SOL",
#   "links": { "actions": [...] }
# }
```

### C. Extension Log Shows Nothing

If console doesn't show `[Blink Unfurler]` messages:

```javascript
// Open DevTools Console on X.com and run:
window.location.href  // Check you're actually on X.com
```

Make sure you're on:
- `x.com` ✓
- `twitter.com` ✓  
- `pro.x.com` ✓

NOT: `localhost` or other sites

### D. "No Solana Wallet" Error

When clicking the button, if you see this error:
```
"No Solana wallet found. Please install Phantom or Backpack."
```

**Fix**: 
1. Install [Phantom Wallet](https://phantom.app) browser extension
2. Create/connect wallet
3. Switch to Devnet
4. Try the Blink again

---

## Checklist Summary

- [ ] Chrome extension reloaded (`chrome://extensions/` → refresh button)
- [ ] Extension shows as "enabled" (blue toggle)
- [ ] No red errors in extension details panel
- [ ] Console on X.com shows `[Blink Unfurler]` messages
- [ ] Pasted URL returns JSON when tested with curl
- [ ] Phantom wallet installed & connected to Devnet
- [ ] URL pasted on X.com (not in DMs or elsewhere)
- [ ] Waiting 2-3 seconds after pasting for observer to scan DOM

---

## Still Stuck?

Try these debugging steps:

1. **Hard reload Chrome** (Ctrl+Shift+R or Cmd+Shift+R)
2. **Rebuild extension locally**:
   ```bash
   cd chrome-extension
   npm run build
   rm -rf dist node_modules
   npm install
   npm run build
   ```
3. **Reload extension again** in `chrome://extensions/`
4. **Check all 3 URLs** - one might work better than others
5. **Check error logs** in DevTools (F12 on X.com)

---

## Direct Testing

You can also test the Blink UI directly by visiting:
```
https://demo-blinks.vercel.app/donate-sol
```

This page shows the Blink UI without needing the extension. The extension just makes it appear inline on X.com feeds.
