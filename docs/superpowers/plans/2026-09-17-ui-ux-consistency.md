# UI/UX Consistency & Declutter Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Unify the app’s visual system (warm cream/rose, light+dark), declutter public/admin UI, fix gift↔wishlist link + places captions, and make lists content-height instead of fixed inner scroll.

**Architecture:** Ship shared primitives first (`PageHeader`, surface, `FormField`, native `Select`), then restyle public pages, then admin shell/forms, then polish. Behavior fixes land in Phase-adjacent admin tasks without schema migrations.

**Tech Stack:** TanStack Start/Router/Query, React 19, Tailwind 4, shadcn/ui (`Button`, `Input`, `Textarea`, `Badge`), Formik admin forms, Supabase server fns. Verify with `npm run typecheck` / `npm run lint` (no unit test runner).

## Global Constraints

- Keep cream / rose / mocha / Playfair + Plus Jakarta; medium declutter only
- Light and dark equal quality; prefer semantic tokens over ad-hoc `dark:text-white`
- Do not change unrelated APIs/schema; gift link = mark `gifted` (never delete wishlist row)
- Places captions must save without re-upload; hide places `slug` in UI
- Default lists: no fixed `max-h-[70/72vh]`; page scrolls; map/calendar panels may use `calc(100dvh - offset)`
- Keep admin compact expand-in-place pattern
- Spec: `docs/superpowers/specs/2026-09-17-ui-ux-consistency-design.md`

## File map

| File                                     | Responsibility                                                    |
| ---------------------------------------- | ----------------------------------------------------------------- |
| Create `components/ui/page-header.tsx`   | Shared page title + subtitle                                      |
| Create `components/ui/form-field.tsx`    | Label + control + error wrapper                                   |
| Create `components/ui/native-select.tsx` | `h-10` select with `data-slot`                                    |
| Modify `src/styles.css`                  | One `.card`/surface; control heights; reduce dual input CSS clash |
| Modify `src/server/gift-history.ts`      | Mark wishlist `gifted` instead of delete                          |
| Modify `src/server/places.ts`            | Update existing image captions without new files                  |
| Modify public feature pages + cards      | Declutter + list height                                           |
| Modify admin forms/pages                 | FormField, slug hide, list height, shell polish                   |

---

### Task 1: Foundation primitives

**Files:**

- Create: `components/ui/page-header.tsx`
- Create: `components/ui/form-field.tsx`
- Create: `components/ui/native-select.tsx`
- Modify: `src/styles.css` (`.card`, section titles, native control alignment)
- Modify: `components/ui/input.tsx` — use `h-10` for form parity (or `className` default override in FormField)

**Interfaces:**

- Produces:
  - `PageHeader({ title, description?, actions?, className? })`
  - `FormField({ label, htmlFor?, error?, children, className? })`
  - `NativeSelect(props: ComponentProps<"select">)`
  - Surface: keep class name `card` but single visual language

- [ ] **Step 1: Add `PageHeader`**

```tsx
import type { ReactNode } from "react";
import { cn } from "@/lib/utils/cn";

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h1 className="section-title">{title}</h1>
        {description ? <p className="section-subtitle">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap gap-2">{actions}</div> : null}
    </div>
  );
}
```

- [ ] **Step 2: Add `FormField` + `NativeSelect`**

`FormField`: label `text-sm font-medium`, `space-y-2`, optional error `text-sm text-destructive`.

`NativeSelect`: `data-slot="select"`, `h-10 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm` (+ dark tokens), so it matches Input height and skips the legacy `select:not([data-slot])` CSS.

- [ ] **Step 3: Align `.card` + Input height**

In `src/styles.css`, keep one `.card` definition (rounded-3xl, soft border, soft shadow light / flat dark). Set `Input` default to `h-10` (replace `h-8`) for admin form grids. Leave Button sizes as-is.

- [ ] **Step 4: Verify**

Run: `npm run typecheck`  
Expected: PASS

- [ ] **Step 5: Commit** (only if user asked)

```bash
git add components/ui/page-header.tsx components/ui/form-field.tsx components/ui/native-select.tsx components/ui/input.tsx src/styles.css
git commit -m "$(cat <<'EOF'
feat(ui): add shared page header, form field, and select primitives

EOF
)"
```

---

### Task 2: Behavior fixes + list height quick wins

**Files:**

- Modify: `src/server/gift-history.ts` (replace delete block with status update)
- Modify: `src/server/places.ts` (caption-only update path)
- Modify: `src/features/wishlist/wishlist-page.tsx` — remove `max-h-[70vh] overflow-y-auto`
- Modify: `src/features/gallery/gallery-page.tsx` — remove list max-h
- Modify: `src/features/gift-history/gift-history-page.tsx` — remove list max-h
- Modify: `src/features/admin/admin-*-page.tsx` (5 CRUD) — remove `max-h-[72vh] overflow-y-auto`
- Modify: `components/heart-mapping-experience.tsx` — side list `max-h-[calc(100dvh-12rem)]` only if needed; prefer content height on mobile
- Modify: `components/love-calendar.tsx` — detail list use viewport cap only when panel-constrained
- Modify: `src/features/admin/admin-places-page.tsx` — hide slug input; keep hidden auto slug or omit and let server slugify title

**Interfaces:**

- Consumes: existing `upsertGiftHistoryItemFn` / `upsertPlaceMemoryFn` FormData contracts
- Produces: gift save keeps `wishlist_item_id`; places captions update for existing rows

- [ ] **Step 1: Fix gift→wishlist link**

In `src/server/gift-history.ts`, replace:

```ts
if (payload.wishlist_item_id) {
  const { error } = await supabase
    .from("wishlist_items")
    .delete()
    .eq("id", payload.wishlist_item_id);
  // ...
}
```

with:

```ts
if (payload.wishlist_item_id) {
  const { error } = await supabase
    .from("wishlist_items")
    .update({ status: "gifted", updated_at: new Date().toISOString() })
    .eq("id", payload.wishlist_item_id);
  if (error) {
    throw new Error(
      `Đã lưu lịch sử quà nhưng không thể đánh dấu wishlist đã tặng: ${error.message}`,
    );
  }
}
```

- [ ] **Step 2: Fix places captions without re-upload**

After cover/gallery upload handling in `upsertPlaceMemoryFn`, when `galleryFiles.length === 0` and place `id` exists:

1. Read `gallery_captions` lines via existing `splitLines`.
2. Load existing `place_memory_images` ordered by `sort_order`.
3. For each image index, `update` `caption` / `image_alt` from `captions[index] ?? null` (empty string → null).
4. Do not delete/reupload files in this path.

- [ ] **Step 3: Remove fixed list max-heights**

Strip `max-h-[70vh|72vh|75vh] overflow-y-auto` wrappers listed in File map. Keep pagination below lists. For heart-map side list / calendar detail only, if layout requires a panel: `max-h-[min(100%,calc(100dvh-12rem))] overflow-y-auto` (or equivalent Tailwind).

- [ ] **Step 4: Hide places slug**

Remove visible slug `<input>` from `PlaceForm`. Keep server `slugify(title)` when slug empty (already supported). Optionally send hidden slug on edit: `<input type="hidden" name="slug" value={item.slug} />` so existing slug preserved.

- [ ] **Step 5: Verify**

Run: `npm run typecheck`  
Manual: create gift linked to wishlist → reopen edit → select still shows that item; item status `gifted`. Edit place captions only → reopen → captions stick.

---

### Task 3: Public Home + Nav

**Files:**

- Modify: `components/sections/hero-section.tsx`
- Modify: `src/features/home/home-page.tsx`
- Modify: `components/navbar.tsx`
- Modify: `components/nav-links.tsx` (only if needed for Button/active consistency)

- [ ] **Step 1: Hero** — `Button`/`Button asChild` + `Link` for CTAs; remove absolute overlay on cover image.
- [ ] **Step 2: Home story** — single text column inside one surface; remove pill + nested promo box.
- [ ] **Step 3: Nav** — “Quản trị” uses `Button variant="outline"` (asChild Link).
- [ ] **Step 4: typecheck**

---

### Task 4: Public Wishlist + cards

**Files:**

- Modify: `components/wishlist-card.tsx`
- Modify: `src/features/wishlist/wishlist-page.tsx`
- Modify: `components/wishlist-filter.tsx` (spacing only if noisy)

- [ ] **Step 1:** Use `PageHeader` on wishlist page.
- [ ] **Step 2:** Simplify `WishlistCard` to shared `card` surface; keep priority dot + status one line; fewer pill chips.
- [ ] **Step 3:** typecheck

---

### Task 5: Special days, Gallery, Gift history, Heart map

**Files:**

- Modify: `src/features/special-days/special-days-page.tsx`
- Modify: `components/special-day-card.tsx`
- Modify: `components/gallery-grid.tsx`
- Modify: `src/features/gallery/gallery-page.tsx`
- Modify: `components/gift-history-card.tsx`
- Modify: `src/features/gift-history/gift-history-page.tsx`
- Modify: `components/heart-mapping-experience.tsx`

- [ ] **Step 1:** Special days — quieter facts; `PageHeader`; keep calendar.
- [ ] **Step 2:** Gallery — `PageHeader`; lighter frame around images.
- [ ] **Step 3:** Gift card — collapse 4 meta cells to 2–3 lines; keep status chip.
- [ ] **Step 4:** Heart map — map-first; secondary list.
- [ ] **Step 5:** typecheck

---

### Task 6: Admin forms on shared fields

**Files:**

- Modify: `components/admin/gift-history-form.tsx`
- Modify: `components/admin/wishlist-form.tsx`
- Modify: `components/admin/gallery-form.tsx`
- Modify: `components/admin/special-day-form.tsx`
- Modify: `src/features/admin/admin-places-page.tsx` (`PlaceForm`)
- Modify: `components/admin/admin-list-header.tsx` — compose `PageHeader`
- Modify: `components/admin/form-submit-button.tsx` if present / unify submit to `Button`

- [ ] **Step 1:** Wrap controls in `FormField`; use `Input`/`Textarea`/`NativeSelect` with `h-10` parity.
- [ ] **Step 2:** Remove empty spacer `<div />` in gift + places forms.
- [ ] **Step 3:** Submit via `Button` (drop custom mocha `<button>` styles).
- [ ] **Step 4:** typecheck

---

### Task 7: Admin shell + dashboard polish

**Files:**

- Modify: `components/admin/admin-sidebar.tsx`
- Modify: `components/admin/admin-shell.tsx`
- Modify: `src/features/admin/admin-home-page.tsx`
- Modify: `components/admin/admin-item-row.tsx` (spacing only)

- [ ] **Step 1:** Sidebar active state matches public nav language.
- [ ] **Step 2:** Dashboard stats lighter; profile fields use `FormField`.
- [ ] **Step 3:** typecheck + lint

---

### Task 8: Polish pass

**Files:** any remaining ad-hoc `dark:text-white` on touched surfaces; `components/ui/empty-state.tsx`; `components/ui/section-skeleton.tsx`

- [ ] **Step 1:** Dark contrast pass on pages touched above.
- [ ] **Step 2:** Empty/loading parity.
- [ ] **Step 3:** `npm run typecheck && npm run lint`
- [ ] **Step 4:** Manual smoke light+dark mobile/desktop per spec §7.

---

## Spec coverage checklist

| Spec section     | Task(s)                     |
| ---------------- | --------------------------- |
| §1 Design system | Task 1                      |
| §2 Public pages  | Tasks 3–5                   |
| §3 Admin shell   | Task 7                      |
| §3b Forms + bugs | Tasks 2, 6                  |
| §4 List height   | Task 2 (+ 5 heart/calendar) |
| §5 Phases        | Tasks ordered 1→8           |
| §6 Done criteria | Task 8 verification         |

## Self-review notes

- No placeholder steps; gift/places fixes include concrete code direction.
- Commit steps optional until user requests commits.
- Caption fix is mandatory update path (not “hide field”).
