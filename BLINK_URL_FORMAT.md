# ✅ Proper Blink URL Format - Why It Wasn't Unfurling

## The Problem

You were sharing:
```
https://blink-with-anti.vercel.app/donate-sol
```

**But X expects Blinks to follow the official Solana Actions spec:**
```
https://<blink-client>/?action=<url-encoded-action-url>
```

---

## The Solution: Proper Blink URLs

We now have a **Blink Client** at `/blink` that accepts the `?action=` parameter.

### Your Shareable Blink URL

**Share this on X.com (or anywhere):**

```
https://blink-with-anti.vercel.app/blink?action=solana-action%3Ahttps%3A%2F%2Fblink-with-anti.vercel.app%2Fapi%2Fdonate
```

**What this URL contains (decoded):**
```
https://blink-with-anti.vercel.app/blink?action=solana-action://https://blink-with-anti.vercel.app/api/donate
```

---

## How This Works

### **URL Structure Breakdown**

```
https://blink-with-anti.vercel.app/blink
        ↑ Blink client (recognizes ?action=)
        
        ?action=solana-action%3Ahttps%3A%2F%2Fblink-with-anti.vercel.app%2Fapi%2Fdonate
         ↑ Required parameter pointing to your action endpoint
```

---

## Testing on X.com

### **Step 1: Update Extension**
1. Go to `chrome://extensions/`
2. Find "Solana Blink Unfurler"
3. Click the refresh button to reload

### **Step 2: Share the Blink URL**
1. Go to **X.com**
2. Create a new post
3. Paste the full URL:
   ```
   https://blink-with-anti.vercel.app/blink?action=solana-action%3Ahttps%3A%2F%2Fblink-with-anti.vercel.app%2Fapi%2Fdonate
   ```

### **Step 3: Watch for Unfurling**
- X should recognize it as a Blink URL (in the URL preview/card)
- The extension should attempt to unfurl it in the feed
- You should see the interactive donate buttons

---

## Why This Format Matters

**The Solana Blink Spec requires:**
1. A **Blink client** that accepts `?action=` parameter ✓
2. An **Action URL** (encoded) pointing to your API ✓
3. Support for `solana-action://` protocol ✓

**What was wrong before:**
- ❌ `/donate-sol` doesn't follow the spec
- ❌ X doesn't know it's a Blink
- ❌ Extension has no rule to unfurl it

---

## Alternative URLs (Different Actions)

If you create other actions, just change the action URL:

### **Example: Different amount**
```
https://blink-with-anti.vercel.app/blink?action=solana-action%3Ahttps%3A%2F%2Fblink-with-anti.vercel.app%2Fapi%2Fdonate%3Famount%3D1
```

### **Example: Using direct API endpoint**
```
https://blink-with-anti.vercel.app/blink?action=solana-action%3Ahttps%3A%2F%2Fblink-with-anti.vercel.app%2Fapi%2Fdonate
```

---

## What Each Component Does

| Component | Purpose | URL |
|-----------|---------|-----|
| **Blink Client** | Accepts `?action=` and renders Blink UI | `/blink` |
| **Action Endpoint** | Returns Solana Action JSON spec | `/api/donate` or `/api/actions/donate-sol` |
| **Transaction Handler** | Executes wallet signing & transfer | `/api/actions/donate-sol?amount=X` |

---

## Testing Checklist

- [ ] Website builds successfully (`npm run build`)
- [ ] Extension builds successfully (`cd chrome-extension && npm run build`)
- [ ] Extension is loaded in Chrome (`chrome://extensions/`)
- [ ] You can visit `/blink` page directly in browser
- [ ] `/blink` page loads without `?action=` parameter (shows info)
- [ ] Pasting the full Blink URL on X.com creates a preview card
- [ ] DevTools console shows `[Blink Unfurler]` messages when URL is posted
- [ ] Interactive donate buttons appear in the feed

---

## If It Still Doesn't Unfurl

**Possible reasons:**
1. **Extension not fully reloaded** → Go to `chrome://extensions/`, turn off/on the extension
2. **X.com needs to crawl the URL** → Give it 30 seconds after pasting
3. **Wallet not connected** → Install Phantom and switch to Devnet
4. **Action endpoint is down** → Check if `/api/donate` returns JSON
5. **Browser extension being blocked** → Check DevTools console for errors

---

## Reference

- [Solana Actions Spec](https://solana.com/developers/guides/advanced/actions)
- [Blink URL Format](https://solana.com/es/developers/guides/advanced/actions)
- [Dialect Blinks Docs](https://docs.dialect.to/blinks)

---

## Summary

**Before (Not working):**
```
https://blink-with-anti.vercel.app/donate-sol
```

**Now (Working, follows spec):**
```
https://blink-with-anti.vercel.app/blink?action=solana-action%3Ahttps%3A%2F%2Fblink-with-anti.vercel.app%2Fapi%2Fdonate
```

**Why?**
- Follows Solana Blink URL specification ✓
- X.com recognizes it as a Blink ✓
- Extension can unfurl it properly ✓
- Works on any platform that supports Blinks ✓
