import { describe, expect, it } from "vitest";
import { resolveBlinkActionUrl } from "./blink-url";

describe("resolveBlinkActionUrl", () => {
  it("returns an empty string when no action is provided", () => {
    expect(resolveBlinkActionUrl(null)).toBe("");
    expect(resolveBlinkActionUrl("")).toBe("");
  });

  it("removes the solana-action protocol prefix", () => {
    const raw = "solana-action://https://example.com/api/action";
    expect(resolveBlinkActionUrl(raw)).toBe("https://example.com/api/action");
  });

  it("decodes a URL-encoded action from the search param", () => {
    const encoded = encodeURIComponent("solana-action://https://example.com/api/action");
    expect(resolveBlinkActionUrl(encoded)).toBe("https://example.com/api/action");
  });
});
