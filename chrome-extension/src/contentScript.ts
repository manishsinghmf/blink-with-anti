/**
 * Solana Blink Unfurler — Chrome Extension Content Script
 *
 * This content script runs on X.com/Twitter and unfurls Solana Blink URLs
 * into interactive Blink UIs. Trusted ecosystem actions are still handled by
 * Dialect's built-in observer, while this file adds an allowlisted preview
 * path for local testing of unregistered hosts such as this project.
 */

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import { setupTwitterObserver } from "@dialectlabs/blinks/ext/twitter";
import {
  BlinkComponent,
  BlinkInstance,
  BlinksRegistry,
  BlinksURLMapper,
  type ActionAdapter,
  type BlinkCallbacksConfig,
  type SignMessageData,
  BlockchainIds,
  checkSecurity,
  createSignMessageText,
  defaultBlinkSupportStrategy,
  getExtendedBlinkState,
  getExtendedWebsiteState,
} from "@dialectlabs/blinks";
import "@dialectlabs/blinks/index.css";
import bs58 from "bs58";
import {
  Connection,
  SendTransactionError,
  VersionedTransaction,
} from "@solana/web3.js";

const LOG_PREFIX = "[Blink Unfurler]";
const RPC_URL = "https://api.devnet.solana.com";
const connection = new Connection(RPC_URL, "confirmed");
const BRIDGE_SCRIPT_ID = "blink-unfurler-page-wallet-bridge";
const BRIDGE_REQUEST_SOURCE = "blink-unfurler-content-script";
const BRIDGE_RESPONSE_SOURCE = "blink-unfurler-page-bridge";
const BRIDGE_TIMEOUT_MS = 30000;
const DEFAULT_PREVIEW_ALLOWED_HOSTS = [
  "blink-with-anti.vercel.app",
  "binksy.vercel.app",
  "localhost:3000",
  "127.0.0.1:3000",
];
const PREVIEW_ALLOWED_HOSTS = new Set(
  (import.meta.env.VITE_PREVIEW_ALLOWED_HOSTS ?? DEFAULT_PREVIEW_ALLOWED_HOSTS.join(","))
    .split(",")
    .map((host) => host.trim())
    .filter(Boolean)
);

const CUSTOM_WRAPPER_SELECTOR = '[data-blink-unfurler="preview"]';
const SCAN_INTERVAL_MS = 2000;

type SecurityState = "trusted" | "unknown" | "malicious";

type ResolvedPreview = {
  originalUrl: URL;
  blinkApiUrl: string;
  source: "direct-action" | "actions-json" | "page-meta";
  websiteState: SecurityState;
  actionState: SecurityState;
};

const customRoots = new WeakMap<Element, Root>();
const handledUrlsByTweet = new WeakMap<Element, Set<string>>();
const processedAnchors = new WeakSet<HTMLAnchorElement>();
let pageBridgeReady = false;
let pageBridgeLoading: Promise<void> | null = null;

function debug(message: string, details?: unknown) {
  if (details === undefined) {
    console.log(`${LOG_PREFIX} ${message}`);
    return;
  }
  console.log(`${LOG_PREFIX} ${message}`, details);
}

function warn(message: string, details?: unknown) {
  if (details === undefined) {
    console.warn(`${LOG_PREFIX} ${message}`);
    return;
  }
  console.warn(`${LOG_PREFIX} ${message}`, details);
}

function errorLog(message: string, details?: unknown) {
  if (details === undefined) {
    console.error(`${LOG_PREFIX} ${message}`);
    return;
  }
  console.error(`${LOG_PREFIX} ${message}`, details);
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function getSignedTransactionSignature(transaction: VersionedTransaction): string | null {
  const signature = transaction.signatures[0];
  if (!signature || signature.every((byte) => byte === 0)) {
    return null;
  }

  return bs58.encode(signature);
}

function formatLamportsAsSol(lamports: number): string {
  return (lamports / 1_000_000_000).toFixed(6);
}

function buildFriendlyTransactionError(
  err: SendTransactionError,
  logs: string[]
): string | null {
  const combined = [err.message, ...logs].join("\n");
  const insufficientMatch = combined.match(
    /insufficient lamports\s+(\d+), need\s+(\d+)/i
  );

  if (insufficientMatch) {
    const [, have, need] = insufficientMatch;
    return `Insufficient SOL balance. Wallet has ${formatLamportsAsSol(
      Number(have)
    )} SOL, but this transaction needs ${formatLamportsAsSol(
      Number(need)
    )} SOL.`;
  }

  return null;
}

type BridgeMethod = "getProviderInfo" | "connect" | "signTransaction" | "signMessage";

type BridgePayloadMap = {
  getProviderInfo: {
    found: boolean;
    isPhantom?: boolean;
    isBackpack?: boolean;
    publicKey?: string | null;
  };
  connect: {
    publicKey: string;
  };
  signTransaction: {
    signedTx: string;
  };
  signMessage: {
    signature: string;
  };
};

function ensurePageBridge(): Promise<void> {
  if (pageBridgeReady) {
    return Promise.resolve();
  }

  if (pageBridgeLoading) {
    return pageBridgeLoading;
  }

  pageBridgeLoading = new Promise((resolve, reject) => {
    const existing = document.getElementById(BRIDGE_SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => {
        pageBridgeReady = true;
        resolve();
      });
      existing.addEventListener("error", () => {
        reject(new Error("Failed to load existing page wallet bridge script."));
      });
      return;
    }

    const script = document.createElement("script");
    script.id = BRIDGE_SCRIPT_ID;
    script.src = chrome.runtime.getURL("pageWalletBridge.js");
    script.async = false;
    script.onload = () => {
      pageBridgeReady = true;
      debug("Page wallet bridge loaded.");
      script.remove();
      resolve();
    };
    script.onerror = () => {
      errorLog("Failed to load page wallet bridge script.");
      reject(new Error("Failed to load page wallet bridge script."));
    };

    (document.head || document.documentElement).appendChild(script);
  });

  return pageBridgeLoading;
}

async function requestBridge<T extends BridgeMethod>(
  method: T,
  payload: Omit<Record<string, unknown>, "method">
): Promise<BridgePayloadMap[T]> {
  await ensurePageBridge();

  const id = `${method}:${crypto.randomUUID()}`;

  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      window.removeEventListener("message", handleMessage);
      reject(new Error(`Wallet bridge timed out while calling ${method}.`));
    }, BRIDGE_TIMEOUT_MS);

    function handleMessage(event: MessageEvent) {
      if (event.source !== window) {
        return;
      }

      const data = event.data;
      if (!data || data.source !== BRIDGE_RESPONSE_SOURCE || data.id !== id) {
        return;
      }

      window.clearTimeout(timeoutId);
      window.removeEventListener("message", handleMessage);

      if (!data.ok) {
        reject(new Error(data.error ?? `Wallet bridge ${method} failed.`));
        return;
      }

      resolve(data as BridgePayloadMap[T]);
    }

    window.addEventListener("message", handleMessage);
    window.postMessage(
      {
        source: BRIDGE_REQUEST_SOURCE,
        id,
        method,
        ...payload,
      },
      window.location.origin
    );
  });
}

class SolanaBlinkAdapter implements ActionAdapter {
  get metadata() {
    return {
      supportedBlockchainIds: [BlockchainIds.SOLANA_DEVNET],
    };
  }

  async connect(_context: unknown) {
    const info = await requestBridge("getProviderInfo", {});
    if (!info.found) {
      throw new Error("No Solana wallet found. Please install Phantom or Backpack.");
    }

    const response = await requestBridge("connect", {});
    return response.publicKey;
  }

  async signTransaction(tx: string, _context: unknown) {
    const info = await requestBridge("getProviderInfo", {});
    if (!info.found) {
      throw new Error("No Solana wallet found.");
    }

    const signed = await requestBridge("signTransaction", { tx });
    const txBytes = Uint8Array.from(atob(signed.signedTx), (c) => c.charCodeAt(0));
    const signedTx = VersionedTransaction.deserialize(txBytes);
    const rawTx = signedTx.serialize();
    const signedSignature = getSignedTransactionSignature(signedTx);

    try {
      const signature = await connection.sendRawTransaction(rawTx, {
        skipPreflight: false,
        preflightCommitment: "confirmed",
      });

      return { signature };
    } catch (err) {
      if (err instanceof SendTransactionError) {
        let logs: string[] = [];
        try {
          logs = await err.getLogs(connection);
        } catch (logsError) {
          warn("Failed to fetch transaction logs from SendTransactionError", {
            logsError,
            signature: err.signature ?? signedSignature,
          });
        }

        errorLog("Transaction send failed with Solana logs", {
          message: err.message,
          signature: err.signature ?? signedSignature,
          logs,
        });

        if (
          signedSignature &&
          err.message.includes("already been processed")
        ) {
          warn("Signed transaction was already processed; reusing signature.", {
            signature: signedSignature,
          });
          return { signature: signedSignature };
        }

        const friendlyMessage = buildFriendlyTransactionError(err, logs);
        if (friendlyMessage) {
          throw new Error(friendlyMessage);
        }
      }

      throw err;
    }
  }

  async confirmTransaction(sig: string, _context: unknown) {
    await connection.confirmTransaction(sig, "confirmed");
  }

  async signMessage(data: string | SignMessageData, _context: unknown) {
    const info = await requestBridge("getProviderInfo", {});
    if (!info.found) {
      throw new Error("No Solana wallet found.");
    }

    const messageText =
      typeof data === "string" ? data : createSignMessageText(data);
    const message = new TextEncoder().encode(messageText);
    const signature = await requestBridge("signMessage", {
      message: encodeBase64(message),
    });

    return { signature: signature.signature };
  }
}

function isAllowlistedHost(host: string): boolean {
  return PREVIEW_ALLOWED_HOSTS.has(host);
}

function getPreferredStylePreset(): "x-dark" | "x-light" {
  const colorScheme = document.querySelector("html")?.style.colorScheme;
  if (colorScheme === "dark") {
    return "x-dark";
  }
  if (colorScheme === "light") {
    return "x-light";
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "x-dark"
    : "x-light";
}

function findElementByTestId(element: Element, testId: string): Element | null {
  if (element.getAttribute("data-testid") === testId) {
    return element;
  }
  return element.querySelector(`[data-testid="${testId}"]`);
}

function findContainerInTweet(element: Element, searchUp: boolean): Element | null {
  const message = searchUp
    ? element.closest(`[data-testid="tweet"]`) ??
    element.closest(`[data-testid="messageEntry"]`)
    : findElementByTestId(element, "tweet") ??
    findElementByTestId(element, "messageEntry");

  if (message) {
    return message.querySelector(".dialect-wrapper");
  }

  return null;
}

function findLinkPreview(element: Element) {
  const card = findElementByTestId(element, "card.wrapper");
  if (!card) {
    return null;
  }

  const anchor = card.children[0]?.children[0];
  return anchor instanceof HTMLAnchorElement ? { anchor, card } : null;
}

function findLastLinkInText(element: Element) {
  const tweetText = findElementByTestId(element, "tweetText");
  if (!tweetText) {
    return null;
  }

  const links = tweetText.getElementsByTagName("a");
  if (links.length === 0) {
    return null;
  }

  const anchor = links[links.length - 1];
  return { anchor, tweetText };
}

function findTweetText(element: Element): Element | null {
  const tweetText = element.closest(`[data-testid="tweetText"]`);
  if (tweetText) {
    return tweetText;
  }

  const tweetOrMessage =
    element.closest(`[data-testid="tweet"]`) ??
    element.closest(`[data-testid="messageEntry"]`) ??
    element.closest("article");

  return tweetOrMessage?.querySelector(`[data-testid="tweetText"]`) ?? null;
}

function getContainerForLink(tweetText: Element): HTMLDivElement | null {
  const root = document.createElement("div");
  root.className = "dialect-wrapper";
  root.dataset.blinkUnfurler = "preview";

  const dm = tweetText.closest(`[data-testid="messageEntry"]`);
  if (dm) {
    root.classList.add("dialect-dm");
    tweetText.parentElement?.parentElement?.prepend(root);
    return root;
  }

  tweetText.parentElement?.append(root);
  return root.parentElement ? root : null;
}

function addStyles(container: Element): Element {
  container.classList.add("dialect-wrapper");
  container.setAttribute("data-blink-unfurler", "preview");
  return container;
}

function getHandledSet(tweetOrMessage: Element): Set<string> {
  let handled = handledUrlsByTweet.get(tweetOrMessage);
  if (!handled) {
    handled = new Set<string>();
    handledUrlsByTweet.set(tweetOrMessage, handled);
  }
  return handled;
}

function rememberHandledUrl(container: Element, resolvedUrl: string) {
  const tweetOrMessage =
    container.closest(`[data-testid="tweet"]`) ??
    container.closest(`[data-testid="messageEntry"]`);

  if (!tweetOrMessage) {
    return;
  }

  getHandledSet(tweetOrMessage).add(resolvedUrl);
}

function wasHandled(container: Element, resolvedUrl: string): boolean {
  const tweetOrMessage =
    container.closest(`[data-testid="tweet"]`) ??
    container.closest(`[data-testid="messageEntry"]`);

  if (!tweetOrMessage) {
    return false;
  }

  return getHandledSet(tweetOrMessage).has(resolvedUrl);
}

async function resolveTwitterUrl(anchorHref: string): Promise<URL> {
  const url = new URL(anchorHref);
  if (url.hostname !== "t.co") {
    return url;
  }

  debug("Resolving X shortened URL", anchorHref);
  const response = await fetch(anchorHref);
  const html = await response.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  const title = doc.querySelector("title")?.textContent?.trim();

  if (!title) {
    throw new Error("Unable to resolve X shortened URL.");
  }

  return new URL(title);
}

async function fetchJson(url: string): Promise<unknown> {
  const response = await fetch(url, {
    headers: {
      Accept: "application/json, text/plain, */*",
    },
  });

  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }

  return response.json();
}

async function tryResolveDirectAction(url: URL): Promise<string | null> {
  try {
    const payload = await fetchJson(url.toString());
    if (
      payload &&
      typeof payload === "object" &&
      "type" in payload &&
      (payload as { type?: string }).type === "action"
    ) {
      return url.toString();
    }
  } catch (err) {
    debug("Direct action probe missed", { url: url.toString(), err });
  }

  return null;
}

async function tryResolveViaActionsJson(url: URL): Promise<string | null> {
  try {
    const actionsJsonUrl = `${url.origin}/actions.json`;
    const payload = await fetchJson(actionsJsonUrl);
    const mapper = new BlinksURLMapper(payload);
    const mapped = mapper.mapUrl(url);

    if (mapped) {
      return mapped;
    }
  } catch (err) {
    debug("actions.json mapping missed", { url: url.toString(), err });
  }

  return null;
}

async function extractActionUrlFromPage(pageUrl: string): Promise<string | null> {
  try {
    const response = await fetch(pageUrl);
    const html = await response.text();
    const match = html.match(
      /<meta\s+name=["']solana:action:apiUrl["']\s+content=["']([^"']+)["']/
    );

    if (match?.[1]) {
      return match[1];
    }
  } catch (err) {
    debug("Page metadata probe missed", { pageUrl, err });
  }

  return null;
}

async function resolvePreviewCandidate(url: URL): Promise<ResolvedPreview | null> {
  if (!isAllowlistedHost(url.host)) {
    debug("Skipping non-allowlisted host", url.host);
    return null;
  }

  const websiteState = getExtendedWebsiteState(url.toString()) as SecurityState;
  debug("Registry lookup for website", {
    url: url.toString(),
    host: url.host,
    websiteState,
  });

  if (websiteState === "malicious" || !checkSecurity(websiteState, "non-malicious")) {
    warn("Blocking website due to registry security state", {
      url: url.toString(),
      websiteState,
    });
    return null;
  }

  const directAction = await tryResolveDirectAction(url);
  if (directAction) {
    const actionState = getExtendedBlinkState(directAction) as SecurityState;
    debug("Resolved direct action URL", {
      originalUrl: url.toString(),
      blinkApiUrl: directAction,
      actionState,
    });
    if (checkSecurity(actionState, "non-malicious")) {
      return {
        originalUrl: url,
        blinkApiUrl: directAction,
        source: "direct-action",
        websiteState,
        actionState,
      };
    }

    warn("Blocking action due to registry security state", {
      blinkApiUrl: directAction,
      actionState,
    });
  }

  const mappedAction = await tryResolveViaActionsJson(url);
  if (mappedAction) {
    const actionState = getExtendedBlinkState(mappedAction) as SecurityState;
    debug("Resolved action URL via actions.json", {
      originalUrl: url.toString(),
      blinkApiUrl: mappedAction,
      actionState,
    });
    if (checkSecurity(actionState, "non-malicious")) {
      return {
        originalUrl: url,
        blinkApiUrl: mappedAction,
        source: "actions-json",
        websiteState,
        actionState,
      };
    }

    warn("Blocking mapped action due to registry security state", {
      blinkApiUrl: mappedAction,
      actionState,
    });
  }

  const metaAction = await extractActionUrlFromPage(url.toString());
  if (metaAction) {
    const actionState = getExtendedBlinkState(metaAction) as SecurityState;
    debug("Resolved action URL via page metadata", {
      originalUrl: url.toString(),
      blinkApiUrl: metaAction,
      actionState,
    });
    if (checkSecurity(actionState, "non-malicious")) {
      return {
        originalUrl: url,
        blinkApiUrl: metaAction,
        source: "page-meta",
        websiteState,
        actionState,
      };
    }

    warn("Blocking metadata action due to registry security state", {
      blinkApiUrl: metaAction,
      actionState,
    });
  }

  return null;
}

function createBlinkContainer(): HTMLDivElement {
  const container = document.createElement("div");
  container.className = "dialect-blink-root-container";
  return container;
}

function cleanupRoot(container: Element) {
  const root = customRoots.get(container);
  if (!root) {
    return;
  }

  root.unmount();
  customRoots.delete(container);
}

function mountBlink(
  adapter: ActionAdapter,
  container: Element,
  blink: BlinkInstance,
  originalUrl: URL
) {
  const blinkContainer = createBlinkContainer();
  const root = createRoot(blinkContainer);

  root.render(
    createElement(
      "div",
      { onClick: (event: MouseEvent) => event.stopPropagation() },
      createElement(BlinkComponent, {
        adapter,
        stylePreset: getPreferredStylePreset(),
        blink,
        websiteUrl: originalUrl.toString(),
        websiteText: originalUrl.hostname,
        securityLevel: "all",
      })
    )
  );

  cleanupRoot(container);
  customRoots.set(container, root);
  addStyles(container).replaceChildren(blinkContainer);

  new MutationObserver((mutations, observer) => {
    for (const mutation of mutations) {
      for (const removedNode of Array.from(mutation.removedNodes)) {
        if (removedNode === blinkContainer || !document.body.contains(blinkContainer)) {
          cleanupRoot(container);
          observer.disconnect();
          return;
        }
      }
    }
  }).observe(document.body, { childList: true, subtree: true });
}

async function renderPreviewIntoNode(
  element: Element,
  adapter: ActionAdapter
): Promise<void> {
  if (element.localName !== "div") {
    return;
  }

  let anchor: HTMLAnchorElement | null = null;
  let container: Element | null = null;

  const linkPreview = findLinkPreview(element);
  if (linkPreview) {
    anchor = linkPreview.anchor;
    container =
      findContainerInTweet(linkPreview.card, true) ?? linkPreview.card.parentElement;
  } else {
    if (findContainerInTweet(element, false)) {
      return;
    }
    const link = findLastLinkInText(element);
    if (link) {
      anchor = link.anchor;
      container = getContainerForLink(link.tweetText);
    }
  }

  if (!anchor || !container) {
    return;
  }

  const existingPreview = container.querySelector(CUSTOM_WRAPPER_SELECTOR);
  if (existingPreview) {
    return;
  }

  debug("Observer found candidate link", { href: anchor.href });

  let resolvedUrl: URL;
  try {
    resolvedUrl = await resolveTwitterUrl(anchor.href);
  } catch (err) {
    warn("Failed to resolve candidate URL", { href: anchor.href, err });
    return;
  }

  if (wasHandled(container, resolvedUrl.toString())) {
    debug("Skipping already handled URL", resolvedUrl.toString());
    return;
  }

  const preview = await resolvePreviewCandidate(resolvedUrl);
  if (!preview) {
    return;
  }

  debug("Preview candidate classified", preview);

  let blink: BlinkInstance;
  try {
    blink = await BlinkInstance.fetch(
      preview.blinkApiUrl,
      defaultBlinkSupportStrategy
    );
    debug("Blink fetch succeeded", {
      blinkApiUrl: preview.blinkApiUrl,
      source: preview.source,
    });
  } catch (err) {
    errorLog("Blink fetch failed", {
      blinkApiUrl: preview.blinkApiUrl,
      err,
    });
    return;
  }

  try {
    rememberHandledUrl(container, resolvedUrl.toString());
    mountBlink(adapter, container, blink, preview.originalUrl);
    debug("Blink mounted successfully", {
      originalUrl: preview.originalUrl.toString(),
      blinkApiUrl: preview.blinkApiUrl,
      source: preview.source,
    });
  } catch (err) {
    errorLog("Blink mount failed", {
      originalUrl: preview.originalUrl.toString(),
      blinkApiUrl: preview.blinkApiUrl,
      err,
    });
  }
}

async function renderPreviewForAnchor(
  anchor: HTMLAnchorElement,
  adapter: ActionAdapter
): Promise<void> {
  if (processedAnchors.has(anchor)) {
    return;
  }

  processedAnchors.add(anchor);

  let container: Element | null = null;
  const card = anchor.closest(`[data-testid="card.wrapper"]`);
  if (card?.parentElement) {
    container = findContainerInTweet(card, true) ?? card.parentElement;
  } else {
    const tweetText = findTweetText(anchor);
    if (tweetText) {
      container = findContainerInTweet(tweetText, true) ?? getContainerForLink(tweetText);
    }
  }

  if (!container) {
    debug("Anchor found but no mount container resolved", { href: anchor.href });
    return;
  }

  const existingPreview = container.querySelector(CUSTOM_WRAPPER_SELECTOR);
  if (existingPreview) {
    return;
  }

  debug("Anchor scan found candidate link", { href: anchor.href });

  let resolvedUrl: URL;
  try {
    resolvedUrl = await resolveTwitterUrl(anchor.href);
  } catch (err) {
    warn("Failed to resolve anchor candidate URL", { href: anchor.href, err });
    return;
  }

  if (wasHandled(container, resolvedUrl.toString())) {
    return;
  }

  const preview = await resolvePreviewCandidate(resolvedUrl);
  if (!preview) {
    return;
  }

  let blink: BlinkInstance;
  try {
    blink = await BlinkInstance.fetch(
      preview.blinkApiUrl,
      defaultBlinkSupportStrategy
    );
  } catch (err) {
    errorLog("Blink fetch failed during anchor scan", {
      blinkApiUrl: preview.blinkApiUrl,
      err,
    });
    return;
  }

  try {
    rememberHandledUrl(container, resolvedUrl.toString());
    mountBlink(adapter, container, blink, preview.originalUrl);
    debug("Blink mounted successfully via anchor scan", {
      originalUrl: preview.originalUrl.toString(),
      blinkApiUrl: preview.blinkApiUrl,
      source: preview.source,
    });
  } catch (err) {
    errorLog("Blink mount failed during anchor scan", {
      originalUrl: preview.originalUrl.toString(),
      blinkApiUrl: preview.blinkApiUrl,
      err,
    });
  }
}

function scanAnchors(root: ParentNode, adapter: ActionAdapter) {
  root.querySelectorAll("a[href]").forEach((anchor) => {
    renderPreviewForAnchor(anchor, adapter).catch((err) => {
      errorLog("Anchor scan failed", err);
    });
  });
}

function setupPreviewObserver(adapter: ActionAdapter) {
  const root = document.getElementById("react-root");
  if (!root) {
    warn("X root node not found; preview observer not started.");
    return;
  }

  debug("Setting up allowlisted preview observer", {
    allowedHosts: Array.from(PREVIEW_ALLOWED_HOSTS),
  });

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      for (const node of Array.from(mutation.addedNodes)) {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          continue;
        }

        renderPreviewIntoNode(node as Element, adapter).catch((err) => {
          errorLog("Preview observer processing failed", err);
        });
      }
    }
  });

  observer.observe(root, { childList: true, subtree: true });

  root.querySelectorAll("div").forEach((node) => {
    renderPreviewIntoNode(node, adapter).catch((err) => {
      errorLog("Initial preview scan failed", err);
    });
  });

  scanAnchors(root, adapter);

  window.setInterval(() => {
    scanAnchors(root, adapter);
  }, SCAN_INTERVAL_MS);
}

function getStandardObserverCallbacks(): Partial<BlinkCallbacksConfig> {
  return {
    onActionMount: (_blink, originalUrl, type) => {
      debug("Dialect observer mounted Blink", { originalUrl, type });
    },
    onActionError: (_blink, action, reason, payload) => {
      warn("Dialect observer action error", {
        actionLabel: action.label,
        reason,
        payload,
      });
    },
    onActionComplete: (_blink, action, signature) => {
      debug("Dialect observer action completed", {
        actionLabel: action.label,
        signature,
      });
    },
  };
}

function init() {
  debug("🚀 Starting Twitter observer for Solana Blinks...");

  const adapter = new SolanaBlinkAdapter();
  BlinksRegistry.getInstance().init().catch((err) => {
    warn("Failed to initialize Dialect registry", err);
  });

  setupTwitterObserver(
    adapter,
    getStandardObserverCallbacks(),
    { securityLevel: "non-malicious" }
  );
  setupPreviewObserver(adapter);

  debug("✅ Twitter observer active. Blink URLs will be unfurled.");
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
