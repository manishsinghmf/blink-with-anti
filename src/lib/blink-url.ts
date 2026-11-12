export function resolveBlinkActionUrl(rawAction: string | null): string {
  if (!rawAction) {
    return "";
  }

  let actionUrl = rawAction.trim();

  if (!actionUrl) {
    return "";
  }

  try {
    actionUrl = decodeURIComponent(actionUrl);
  } catch {
    // Leave raw value as-is if the input is not URL-encoded.
  }

  if (actionUrl.startsWith("solana-action://")) {
    return actionUrl.replace("solana-action://", "");
  }

  return actionUrl;
}
