# Image Upload + Display Optimization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Speed up image loading with thumbs + tighter uploads, and stabilize aspect ratios (cards fixed, gallery natural) without Supabase Image Transforms.

**Architecture:** Path-convention thumbs (`*.thumb.webp`) written beside display WebP on upload; `AppImage` picks thumb/display and aspect; consumers replace raw `<img>`.

**Tech Stack:** sharp, Supabase Storage, React, existing `getPublicStorageUrl`.

## Global Constraints

- Supabase Free: no Image Transformation URLs
- No DB migration / no new columns
- Thumb path: `uuid.webp` → `uuid.thumb.webp`
- Old assets: fallback to display URL on thumb error
- Keep blush/mocha visual language; do not redesign pages
- Verify with `npm run typecheck`

## File map

| File | Role |
|---|---|
| Modify `lib/storage/constants.ts` | Lower size/dimension caps |
| Modify `lib/storage/paths.ts` or `public-url.ts` | `toThumbStoragePath`, `getPublicThumbUrl` |
| Modify `lib/storage/upload.ts` | Quality ladder + thumb upload + rollback |
| Modify `lib/storage/delete.ts` | Delete display + thumb |
| Create `components/ui/app-image.tsx` | Shared image component |
| Modify card/grid/hero/admin image call sites | Use `AppImage` |

---

### Task 1: Storage path helpers + tighter rules

**Files:**
- Modify: `lib/storage/constants.ts`
- Modify: `lib/storage/public-url.ts`
- Optional small helper in same file or `lib/storage/paths.ts`

**Interfaces:**
- Produces:
  - `toThumbStoragePath(path: string): string`
  - `getPublicThumbUrl(path: string | null): string | null`

- [ ] **Step 1: Add thumb path helpers**

In `lib/storage/public-url.ts` (or paths):

```ts
export function toThumbStoragePath(path: string) {
  if (path.endsWith(".thumb.webp")) return path;
  if (path.endsWith(".webp")) return path.replace(/\.webp$/i, ".thumb.webp");
  // absolute URLs or odd paths: return as-is (caller should not thumb them)
  return path;
}

export function getPublicThumbUrl(path: string | null) {
  if (!path) return null;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return getPublicStorageUrl(toThumbStoragePath(path));
}
```

- [ ] **Step 2: Tighten STORAGE_RULES**

Update `lib/storage/constants.ts` approximately to:

```ts
wishlist / giftHistory: maxWidth/Height 1600, maxSizeBytes 2.5 * 1024 * 1024
gallery / placeGallery: 2000, 4 * 1024 * 1024
cover: 2000×1200, 3.5 * 1024 * 1024
placeCover: 2000×1500, 3.5 * 1024 * 1024
```

Keep `maxOriginalBytes` as-is or slightly lower if desired.

- [ ] **Step 3: Typecheck + commit**

```bash
npm run typecheck
git add lib/storage/constants.ts lib/storage/public-url.ts lib/storage/paths.ts
git commit -m "feat(storage): add thumb path helpers and tighter limits"
```

---

### Task 2: Upload thumb + delete both

**Files:**
- Modify: `lib/storage/upload.ts`
- Modify: `lib/storage/delete.ts`

**Interfaces:**
- Consumes: `toThumbStoragePath`, updated `STORAGE_RULES`
- Produces: upload writes display + thumb; delete removes both

- [ ] **Step 1: Change quality ladder** to `[78, 72, 66, 60, 55]`.

- [ ] **Step 2: After successful main upload, write thumb**

```ts
const thumbPath = toThumbStoragePath(path);
const thumbBuffer = await sharp(finalBuffer, { failOn: "none" })
  .resize({ width: 480, height: 480, fit: "inside", withoutEnlargement: true })
  .webp({ quality: 70, effort: 4 })
  .toBuffer();

const { error: thumbError } = await supabase.storage
  .from(STORAGE_BUCKET)
  .upload(thumbPath, thumbBuffer, { contentType: "image/webp", upsert: true });

if (thumbError) {
  await supabase.storage.from(STORAGE_BUCKET).remove([path]);
  throw new Error(`Tải ảnh thumb thất bại: ${thumbError.message}`);
}
```

- [ ] **Step 3: Update deleteStorageFile**

```ts
const paths = [path];
const thumb = toThumbStoragePath(path);
if (thumb !== path) paths.push(thumb);
await supabase.storage.from(STORAGE_BUCKET).remove(paths);
// do not fail hard if thumb missing — Supabase remove is tolerant; keep throw only on real errors
```

- [ ] **Step 4: Typecheck + commit**

```bash
npm run typecheck
git add lib/storage/upload.ts lib/storage/delete.ts
git commit -m "feat(storage): write and delete webp thumbs"
```

---

### Task 3: AppImage component

**Files:**
- Create: `components/ui/app-image.tsx`

**Interfaces:**
- Produces: `AppImage` as specified in the design doc

- [ ] **Step 1: Implement AppImage**

```tsx
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { getPublicStorageUrl, getPublicThumbUrl } from "@/lib/storage/public-url";

type AppImageProps = {
  path?: string | null;
  src?: string | null;
  alt: string;
  variant?: "thumb" | "display";
  aspect?: "card" | "wide" | "natural";
  className?: string;
  imgClassName?: string;
  priority?: boolean;
};

export function AppImage({
  path,
  src,
  alt,
  variant = "display",
  aspect = "natural",
  className,
  imgClassName,
  priority = false,
}: AppImageProps) {
  const preferred =
    src ??
    (variant === "thumb" ? getPublicThumbUrl(path ?? null) : getPublicStorageUrl(path ?? null));
  const fallback = src ?? getPublicStorageUrl(path ?? null);
  const [url, setUrl] = useState(preferred);

  if (!url) return null;

  const aspectClass =
    aspect === "card"
      ? "aspect-[4/3]"
      : aspect === "wide"
        ? "aspect-[16/10]"
        : undefined;

  return (
    <div className={cn("overflow-hidden", aspectClass, className)}>
      <img
        src={url}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className={cn(
          aspect === "natural" ? "h-auto w-full" : "h-full w-full object-cover",
          imgClassName,
        )}
        onError={() => {
          if (variant === "thumb" && fallback && fallback !== url) setUrl(fallback);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Typecheck + commit**

```bash
npm run typecheck
git add components/ui/app-image.tsx
git commit -m "feat(ui): add AppImage with thumb and aspect variants"
```

---

### Task 4: Wire public surfaces

**Files:**
- Modify: `components/wishlist-card.tsx`
- Modify: `components/gift-history-card.tsx`
- Modify: `components/gallery-grid.tsx`
- Modify: `components/sections/hero-section.tsx`
- Modify: `components/place-details-sheet.tsx`

- [ ] **Step 1: Replace `<img>` with `AppImage`**

Mapping:

- Wishlist: `path={item.image_path}` or use existing `image_url` as `src` only if path unavailable — prefer passing path from item if present on type; else `src={item.image_url}` + `variant="thumb"` + `aspect="card"`
- Gift card: thumb + wide
- Gallery: display + natural (remove fixed cover cropping if any)
- Hero: display + wide, `priority`
- Place details: cover thumb/wide; gallery images display + natural

If list types only expose `image_url`, either:

- add `image_path` to the mapped client type in `client-queries.ts`, **or**
- pass `src={getPublicThumbUrl derived}` — cleanest is expose both `image_path` and `image_url` (path already on row before mapping).

Prefer extending mappers to keep `image_path` / `photo_path` / `cover_image_path` on returned objects alongside public URLs.

- [ ] **Step 2: Typecheck + commit**

```bash
npm run typecheck
git add components/wishlist-card.tsx components/gift-history-card.tsx \
  components/gallery-grid.tsx components/sections/hero-section.tsx \
  components/place-details-sheet.tsx lib/data/client-queries.ts
git commit -m "feat(ui): use AppImage on public surfaces"
```

---

### Task 5: Wire admin thumbs + verify

**Files:**
- Modify: `components/admin/admin-item-row.tsx`
- Modify: `components/admin/admin-image-preview.tsx`
- Possibly admin pages if they only pass full URLs — switch to path or thumb URL

- [ ] **Step 1: AdminItemRow** use `AppImage` with `variant="thumb"` `aspect="card"` (or square via `className="h-14 w-14"` + `aspect` natural inside fixed box). Keep empty placeholder when no URL.

- [ ] **Step 2: AdminImagePreview** use `AppImage` thumb + wide.

- [ ] **Step 3: Typecheck + commit**

```bash
npm run typecheck
git add components/admin/admin-item-row.tsx components/admin/admin-image-preview.tsx
git commit -m "feat(admin): use AppImage for thumbs and previews"
```

---

### Task 6: Manual verification

- [ ] **Step 1: Typecheck** `npm run typecheck`

- [ ] **Step 2: Checklist**
  1. Upload new wishlist image → Storage has `.webp` + `.thumb.webp`
  2. Delete item → both objects gone
  3. Wishlist/gift cards use smaller thumb (Network tab)
  4. Gallery keeps natural height; lazy offscreen
  5. Old image without thumb still shows (fallback)
  6. Hero not lazy / priority

- [ ] **Step 3: Commit polish only if needed**

---

## Spec coverage

| Spec item | Task |
|---|---|
| Tighter STORAGE_RULES | 1 |
| Thumb path helpers | 1 |
| Upload thumb + rollback | 2 |
| Delete both | 2 |
| AppImage aspect variants | 3 |
| Public surfaces | 4 |
| Admin surfaces | 5 |
| Fallback old assets | 3–4 |
| No DB / no transforms | Global |

## Placeholder scan

None intentional.
