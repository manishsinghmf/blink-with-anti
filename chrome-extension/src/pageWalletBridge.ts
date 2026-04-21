import { VersionedTransaction } from "@solana/web3.js";

const REQUEST_SOURCE = "blink-unfurler-content-script";
const RESPONSE_SOURCE = "blink-unfurler-page-bridge";

type WalletRequest =
  | {
      source: typeof REQUEST_SOURCE;
      id: string;
      method: "getProviderInfo";
    }
  | {
      source: typeof REQUEST_SOURCE;
      id: string;
      method: "connect";
    }
  | {
      source: typeof REQUEST_SOURCE;
      id: string;
      method: "signTransaction";
      tx: string;
    }
  | {
      source: typeof REQUEST_SOURCE;
      id: string;
      method: "signMessage";
      message: string;
    };

function getProvider(): any {
  if ("solana" in window) {
    const provider = (window as any).solana;
    if (provider?.isPhantom || provider?.isBackpack || provider?.publicKey) {
      return provider;
    }
  }

  if ("phantom" in window) {
    const phantom = (window as any).phantom;
    if (phantom?.solana) {
      return phantom.solana;
    }
  }

  return null;
}

function encodeBase64(bytes: Uint8Array): string {
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function postResponse(id: string, ok: boolean, payload: Record<string, unknown>) {
  window.postMessage(
    {
      source: RESPONSE_SOURCE,
      id,
      ok,
      ...payload,
    },
    window.location.origin
  );
}

window.addEventListener("message", async (event: MessageEvent<WalletRequest>) => {
  if (event.source !== window) {
    return;
  }

  const data = event.data;
  if (!data || data.source !== REQUEST_SOURCE) {
    return;
  }

  const provider = getProvider();

  try {
    if (data.method === "getProviderInfo") {
      postResponse(data.id, true, {
        found: Boolean(provider),
        isPhantom: Boolean(provider?.isPhantom),
        isBackpack: Boolean(provider?.isBackpack),
        publicKey: provider?.publicKey?.toString?.() ?? null,
      });
      return;
    }

    if (!provider) {
      throw new Error("No Solana wallet found in page context.");
    }

    if (data.method === "connect") {
      const response = await provider.connect();
      postResponse(data.id, true, {
        publicKey: response.publicKey.toString(),
      });
      return;
    }

    if (data.method === "signTransaction") {
      if (!provider.publicKey) {
        await provider.connect();
      }

      const txBytes = Uint8Array.from(atob(data.tx), (char) => char.charCodeAt(0));
      const transaction = VersionedTransaction.deserialize(txBytes);
      const signedTransaction = await provider.signTransaction(transaction);

      postResponse(data.id, true, {
        signedTx: encodeBase64(signedTransaction.serialize()),
      });
      return;
    }

    if (data.method === "signMessage") {
      if (!provider.publicKey) {
        await provider.connect();
      }

      const message = Uint8Array.from(atob(data.message), (char) =>
        char.charCodeAt(0)
      );
      const { signature } = await provider.signMessage(message);

      postResponse(data.id, true, {
        signature: encodeBase64(signature),
      });
    }
  } catch (error) {
    postResponse(data.id, false, {
      error: error instanceof Error ? error.message : String(error),
    });
  }
});
