# UI/UX Consistency & Declutter — Design Spec

**Date:** 2026-09-17  
**App:** Góc Của Tụi Mình (couple-wishlist)  
**Status:** Approved — implementation in progress  

## Goal

Make the whole app feel consistent, warmer, and less visually noisy — light and dark equally — without changing product features or APIs/schema (except gift→wishlist link behavior and places gallery caption save).

## Decisions (locked)

| Topic | Choice |
|--------|--------|
| Scope | Entire app, phased |
| Visual tone | Warm / romantic / soft (keep cream–rose–mocha), cleaner |
| Declutter level | Medium — fewer pills/boxes, merge sections, more whitespace; keep core content |
| Dark mode | Equal priority with light |
| Approach | Design system first, then apply page-by-page |
| Gift ↔ wishlist link | Keep wishlist item; set status to `gifted` (do **not** delete) |
| Lists | Content-height by default; internal scroll only when content exceeds viewport |

## Related specs

- `2026-09-17-admin-compact-list-ux-design.md` — expand-in-place create/edit for admin lists (already in product). **This spec overrides** that doc’s fixed `max-h-[72vh]` list wrappers: lists become content-height / viewport-aware per §4.

## Out of scope

- New features unrelated to UI consistency
- Brand name / font family swap (Playfair + Plus Jakarta stay)
- Map search/geocode logic redesign
- Schema migrations (behavior fixes only within existing columns)
- Dropdown search panels and place detail sheet overlays (keep constrained scroll)
- Reverting admin compact expand-in-place pattern (keep it; only change list scrolling)

---

## 1. Design system

### Color

- Keep semantic tokens: `background`, `foreground`, `muted`, `card`, `primary`, `accent`, `border`, `ring`.
- Accent rose used sparingly (CTA, active nav, emphasis).
- One soft shadow in light; dark mostly flat with light borders.
- Prefer tokens over scattered `dark:text-white` / ad-hoc hex.

### Typography

- Heading: Playfair Display; body: Plus Jakarta Sans.
- Fixed scale: page title → section title → card title → body → caption.
- Each section: one headline + one short subtitle.

### Spacing & radius

- Container: `max-w-6xl`, page padding `py-10` / `py-12`.
- Grid gaps: prefer `gap-4` / `gap-6` only.
- Controls smaller radius than surfaces; limit `rounded-full` to chips/status that truly need it.

### Shared primitives

| Primitive | Role |
|-----------|------|
| `PageHeader` | Title + subtitle for public & admin list pages |
| Surface / card | **One** surface style (replace divergent WishlistCard shadows vs `.card`) |
| `Button` | Primary / outline / ghost only — including hero CTAs and admin submit |
| Badge / chip | At most 1–2 variants |
| Empty / loading / error | Shared patterns |
| `FormField` | Label + control + error; fixed control height (`h-10` inputs/selects; textarea separate) |

### Declutter rules

- Cards only for real content/interaction blocks.
- Avoid stacking pill + mini-box + status bar in one card when they can merge.
- Dark mode must keep the same hierarchy as light (no near-black-on-black mud).

---

## 2. Public pages

### Home

- Hero: couple names + one line + two `Button` CTAs.
- Remove text overlay on cover image.
- Below hero: one row of three highlight surfaces (upcoming day / wishlist me / wishlist honey).
- Story section: single text column; drop extra pill + nested promo box.

### Wishlist

- `PageHeader` + compact filter.
- Two owner sections; **no** nested `max-h` scroll — page scrolls.
- Card: image → title → short meta → one status line; simplify shadows/pills.

### Special days

- Top: one summary (days in love + next milestone).
- Middle: calendar.
- Bottom: upcoming list / timeline.
- Couple facts: one quieter block, fewer tiny cells.

### Gallery

- Keep masonry; unify padding/caption; avoid card-in-card feel.

### Gift history

- Simpler card: image + name + status + 2–3 key metas; note only when present.
- Reduce dense 4-cell meta grids.

### Heart map

- Header + view toggle + map as focus.
- Side list secondary; list height follows §4.

### Nav / footer

- One active nav style; “Quản trị” = outline button.
- Footer stays short.

---

## 3. Admin shell & lists

- Keep sidebar + content layout; active nav matches public language.
- Shared spacing `space-y-6`.
- `AdminListHeader` → `PageHeader` + one “Thêm mới” CTA.
- Rows: title + short meta + actions; fewer nested boxes.
- Dashboard: lighter stats row; profile form grouped clearly; email block secondary.
- Map picker / place forms: restyle only; no geocode redesign.

---

## 3b. Admin forms

### Bug: gift history wishlist link

**Cause:** On save with `wishlist_item_id`, server deletes the wishlist row; FK `on delete set null` clears the link, so the select shows “Không liên kết wishlist”.

**Fix:**

1. Stop deleting wishlist items on gift save.
2. Set linked wishlist item `status` to `gifted`.
3. Keep `wishlist_item_id` (and title snapshot) so edit form rehydrates correctly.
4. Public wishlist may show gifted badge / filter as today; item remains in DB.

### Bug: places gallery captions

**Cause:** Caption textarea always shows on edit, but captions only persist when new gallery files are uploaded.

**Fix:** Allow updating captions for existing images without re-upload (do not leave a dead textarea that only works with new files).

### Related edge (document only / light harden)

- Gift `special_day_id`: can null if special day is later deleted (`on delete set null`). Optional: show snapshot label if we add/store one later — not required for v1 if A-path wishlist is fixed.

### Unused / noisy fields

| Item | Action |
|------|--------|
| Places `slug` | Hide from UI; auto-generate from title |
| Empty spacer `<div />` in gift/places forms | Remove |
| Gallery captions UX | Save captions for existing images without requiring re-upload |

### Form layout consistency

- Shared `FormField` + shared Input/Select/Textarea styling (align with shadcn `data-slot` controls; reduce dual CSS paths).
- Uniform control heights in 2-column grids.
- Submit actions use shared `Button`.

Audit note: No other admin select was found with the same “delete then null” pattern as wishlist link. Category/status/date fields rehydrate correctly when options still exist.

---

## 4. Dynamic list height

### Problem

Fixed `max-h-[70vh]` / `72vh` + `overflow-y-auto` forces inner scroll even on tall screens.

### Affected (remove fixed max-height unless noted)

- Public: Wishlist owner grids, Gallery, Gift history, Heart map place list, Love calendar event list (if still capped)
- Admin: wishlist, gallery, places, special-days, gift-history list wrappers

### Rules

1. **Default lists:** height = content; **page** scrolls. Remove fixed `max-h-*`.
2. **Constrained panels only** (map side list, calendar detail beside layout):  
   `max-height: min(content, calc(100dvh - chromeOffset))` so short lists do not scroll internally.
3. Admin sticky sidebar may keep `max-h: calc(100dvh - offset)` (sticky panel).
4. **Do not change:** map search result dropdown (`max-h-72`), place details sheet/drawer.

---

## 5. Implementation phases

| Phase | Work |
|-------|------|
| **1 — Foundation** | Tokens (light/dark), `PageHeader`, one surface, Button/Badge/Empty/Loading/Error, `FormField` |
| **2 — Public** | Home → Wishlist → Special days → Gallery → Gift history → Heart map + list height |
| **3 — Admin** | Shell, list headers/rows, dashboard, **forms** (wishlist gift link fix, caption fix, slug hide, heights) + list height |
| **4 — Polish** | Dark pass, spacing/motion light touch, empty/loading parity, mobile check |

Phases may overlap slightly (e.g. list height can ship with each page), but foundation lands first.

---

## 6. Done criteria

- Light and dark: clear hierarchy, no muddy low-contrast stacks.
- No 2–3 unrelated card/button styles on the same user flow.
- Home / Wishlist / Gift feel airier (fewer pills/mini-boxes).
- Wishlist and admin lists: no unnecessary inner scroll on large viewports.
- Gift→wishlist link survives edit reopen; item is `gifted`, not deleted.
- Places captions behave as specified (save sticks or field is honestly gated).
- Admin forms: aligned control heights; slug hidden; no empty spacers.
- No intentional API/schema product expansion beyond the behavior fixes above.

## 7. Verification

- Manual: Home, Wishlist, Special days, Gallery, Gift, Heart map — light + dark, mobile + desktop.
- Manual: Admin CRUD smoke on each form; especially gift link + reopen; places captions.
- `npm run typecheck` and `npm run lint` (and `/doctor` if React UI touched heavily).
