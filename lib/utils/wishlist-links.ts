function sanitize(value: string) {
  return value.trim();
}

export function parseWishlistProductUrls(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n|,/g)
    .map(sanitize)
    .filter(Boolean);
}

export function joinWishlistProductUrls(urls: string[]) {
  return urls.map(sanitize).filter(Boolean).join("\n");
}

export function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

