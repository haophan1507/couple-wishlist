# Image display, upload, and aspect-ratio UX

Date: 2026-09-17  
Status: approved (conversation)  
Scope: frontend image component + upload thumbs + aspect rules  
Constraint: Supabase Free — no Image Transformation API

## Goal

Images feel slow because the app always downloads full-size WebP into small UI slots, with little lazy-loading and unstable layout. Uploads are already sharp-processed but still large for cards.

Deliver:

1. Faster display (lazy + thumbnails for cards)
2. Tighter upload limits + generate a thumb sibling on each upload
3. Correct aspect handling by surface (option C)

## Locked decisions

- Aspect **C**: gallery/place gallery keep natural ratio; card/hero/admin thumbs use fixed aspect + `object-cover` and stable boxes
- Delivery: no Supabase transforms (Free plan)
- Upload **C**: tighten `STORAGE_RULES` + write `*.thumb.webp` beside the main object
- No DB schema change — thumb URL derived from `image_path` / `photo_path` / `cover_image_path`
- No client-side pre-compress; no bulk backfill of old thumbs (fallback to full URL)

## Non-goals

- Supabase Image Transformation / Pro upgrade
- Storing `width`/`height` columns
- Changing public page visual brand (colors/fonts)
- Re-encoding every historical asset

## Thumb path convention

Given storage path `folder/yyyy/mm/entity/uuid.webp`:

```text
display: folder/yyyy/mm/entity/uuid.webp
thumb:   folder/yyyy/mm/entity/uuid.thumb.webp
```

Helpers:

- `toThumbStoragePath(path: string): string`
- `getPublicStorageUrl(path)` — unchanged behavior for display
- `getPublicThumbUrl(path)` — builds public URL for thumb path; callers may still pass display if thumb missing at runtime (browser 404 → optional `onError` fallback to display)

## Upload pipeline changes (`lib/storage/upload.ts`)

1. Lower caps in `STORAGE_RULES` (targets, approximate):

| Target                 | maxWidth×Height | maxSizeBytes |
| ---------------------- | --------------- | ------------ |
| wishlist / giftHistory | 1600×1600       | 2.5 MB       |
| gallery / placeGallery | 2000×2000       | 4 MB         |
| cover                  | 2000×1200       | 3.5 MB       |
| placeCover             | 2000×1500       | 3.5 MB       |

2. WebP quality ladder start lower: `[78, 72, 66, 60, 55]`.

3. After main upload succeeds, generate thumb:

- Resize longest edge ≤ **480px**, `fit: "inside"`, `withoutEnlargement: true`
- WebP quality ~70
- Upload to `toThumbStoragePath(path)` with `upsert: true` (idempotent on retry)

4. Return value stays `{ path, mimeType, sizeBytes }` (DB still stores display path only).

5. If thumb upload fails after main succeeded: log/throw soft? Prefer **throw** and delete main (or delete both) so state stays consistent — implement as: on thumb failure, remove main and rethrow.

## Delete (`lib/storage/delete.ts`)

`deleteStorageFile(path)` removes `[path, toThumbStoragePath(path)]` in one `storage.remove` call. Ignore missing thumb.

## Display — `AppImage`

Create `components/ui/app-image.tsx`:

```ts
type AppImageProps = {
  path?: string | null; // storage path preferred
  src?: string | null; // absolute URL override / Unsplash fallback
  alt: string;
  variant?: "thumb" | "display";
  aspect?: "card" | "wide" | "natural";
  className?: string;
  imgClassName?: string;
  priority?: boolean; // skip lazy for LCP/hero
};
```

Behavior:

- Resolve URL: if `src` absolute use it; else if `path` use thumb or display via helpers; if `variant=thumb` and load errors, swap to display URL once
- `loading={priority ? "eager" : "lazy"}`, `decoding="async"`
- Aspect:
  - `card` → wrapper `aspect-[4/3]` + img `object-cover h-full w-full`
  - `wide` → `aspect-[16/10]` or hero-friendly `aspect-[21/9]` + cover
  - `natural` → no fixed aspect; img `h-auto w-full object-contain` (or omit object-fit)

## Surface mapping

| Surface              | File                                       | variant       | aspect                                              |
| -------------------- | ------------------------------------------ | ------------- | --------------------------------------------------- |
| Wishlist card        | `components/wishlist-card.tsx`             | thumb         | card                                                |
| Gift history card    | `components/gift-history-card.tsx`         | thumb         | wide                                                |
| Hero cover           | `components/sections/hero-section.tsx`     | display       | wide (or keep min-h with cover)                     |
| Gallery grid         | `components/gallery-grid.tsx`              | display       | natural                                             |
| Place details cover  | `components/place-details-sheet.tsx`       | display/thumb | card/wide                                           |
| Place gallery images | same                                       | display       | natural                                             |
| Admin row thumb      | `components/admin/admin-item-row.tsx`      | thumb         | card (square-ish via existing box or aspect-square) |
| Admin form preview   | `components/admin/admin-image-preview.tsx` | thumb         | wide                                                |

Pass storage `path` when available from queries; keep Unsplash fallbacks as `src`.

## Success criteria

- New uploads create both `.webp` and `.thumb.webp`
- Deleting an asset removes both objects
- Card/list UIs prefer thumb URLs and do not layout-shift (fixed aspect boxes)
- Gallery keeps natural proportions and lazy-loads
- Old assets without thumbs still render via display fallback
- `npm run typecheck` passes

## Risks

- Thumb failure after main upload needs cleanup to avoid orphans
- External `https://` images (Unsplash) skip thumb logic
- First paint of gallery still downloads display size — acceptable without transforms; lazy mitigates
