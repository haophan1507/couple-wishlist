# Admin CRUD compact list UX

Date: 2026-09-17  
Status: approved (conversation) — pending file review  
Scope: admin list pages only; image performance deferred

## Goal

Admin pages for wishlist, gallery, gift history, special days, and places currently show an always-open create form plus a full edit form inside every list row. That makes pages long and hard to scan.

Change to **pattern C (inline compact)**:

- Compact list rows by default
- Create form collapsed behind “Thêm mới”
- Edit form expands in-place for one item at a time

Admin home / couple profile stays as-is. Public image loading optimization is a later phase.

## Non-goals

- Dialog/sheet-based create/edit (rejected)
- Separate create/edit routes (rejected)
- Changing admin home profile layout
- Lazy/srcset image CDN pipeline (phase 2)
- New backend APIs or data model changes

## Approach

**Expand-in-place accordion** shared across the five CRUD pages.

Rationale: matches chosen pattern C, reuses existing Formik forms and server functions, no new routes, one interaction model everywhere including places (map mounts only when the form panel is open).

## Page structure

Each CRUD page becomes:

1. **Header** — title, short description (optional), primary button **Thêm mới**
2. **Create panel** — visible only when mode is `create`
3. **List** — compact rows; optional expanded edit panel under the active row
4. **Pagination** — keep current `PaginationControls` + page size behavior

## Interaction model

Shared UI state per page:

```ts
type AdminEditorMode =
  | { type: "idle" }
  | { type: "create" }
  | { type: "edit"; id: string };
```

Rules:

- Only **one** panel open at a time (create **or** a single edit)
- Opening create closes any edit; opening edit closes create and any other edit
- **Lưu thành công** → set mode `idle`, invalidate related TanStack Query keys (same as today)
- **Hủy** (and Escape when focus is in the panel) → set mode `idle` without saving
- **Xóa** stays on `ConfirmDeleteButton` (Dialog); after success, if that id was being edited, return to `idle`

## Compact row content

Each row shows:

- Thumbnail when an image URL exists (wishlist, gallery, gift photo, place cover); otherwise a small placeholder
- Title (primary text)
- 1–2 meta chips/lines
- Actions: **Sửa**, **Xóa**

| Page | Meta |
|---|---|
| Wishlist | owner label · priority · status |
| Gallery | memory date (if any) |
| Gift history | giver · received date · status |
| Special days | date · type |
| Places | status · city/country (fallback location name) |

## Form behavior when expanded

- Keep existing Formik forms (`wishlist-form`, `gallery-form`, `gift-history-form`, `special-day-form`) and places inline form logic; only change **where** they mount
- Show **preview of existing image** above the file input when editing (path/URL already available on list items)
- Places: mount map / location picker **only** while create or edit panel is open for that item
- Submit buttons can move to shadcn `Button` for consistency with delete/login; visual language stays mocha/cream/rose via existing theme

## Shared components

Introduce small admin building blocks (names can vary in implementation):

- `AdminListHeader` — title, description, “Thêm mới” / “Hủy thêm”
- `AdminItemRow` — thumb, title, meta slot, Sửa/Xóa, optional children for expanded form
- Optional `useAdminEditorMode()` hook for the mode state + Esc handling

Do **not** rewrite business validation or server functions.

## Pages in scope

| Page | Feature file |
|---|---|
| Wishlist | `src/features/admin/admin-wishlist-page.tsx` |
| Gallery | `src/features/admin/admin-gallery-page.tsx` |
| Gift history | `src/features/admin/admin-gift-history-page.tsx` |
| Special days | `src/features/admin/admin-special-days-page.tsx` |
| Places | `src/features/admin/admin-places-page.tsx` |

Out of scope this phase: `admin-home-page.tsx`.

## Visual / design system

- Reuse CSS `.card` for panels and rows
- shadcn `Button` for primary/secondary actions
- Keep existing `SectionSkeleton`, `PaginationControls`, empty copy
- No new purple/dark AI-default look; stay on blush/rose/mocha/cream

## Success criteria

- Opening any admin CRUD page shows a scannable list without nested full forms
- Create requires one click on “Thêm mới”
- Editing one item does not leave other items’ forms mounted
- Save / cancel / delete behaviors match today functionally
- Places map is not mounted for every row on first paint
- Admin home unchanged

## Follow-up (explicitly later)

Image loading: lazy loading, responsive sizes / Supabase transforms or smaller derivatives, width/height or placeholders on public + admin thumbs.

## Risks

- Places form is large; expand-in-place may still feel heavy on mobile — accept for v1; sheet can be revisited later if needed
- Esc handler must not fight map/search focus inside places form
