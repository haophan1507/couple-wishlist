function sanitize(value: string) {
  return value.trim();
}

export function parseWishlistProductUrls(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return value
    .split(/\r?\n|,/g)
    .flatMap((part) => {
      const cleaned = sanitize(part);
      return cleaned ? [cleaned] : [];
    });
}

export function joinWishlistProductUrls(urls: string[]) {
  return urls
    .flatMap((url) => {
      const cleaned = sanitize(url);
      return cleaned ? [cleaned] : [];
    })
    .join("\n");
}

export function isValidHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

