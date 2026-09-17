# Admin Compact List UX Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor five admin CRUD pages so lists are compact by default, create is behind “Thêm mới”, and edit expands in-place for one item at a time.

**Architecture:** Shared `AdminEditorMode` hook + `AdminListHeader` / `AdminItemRow` building blocks. Existing Formik forms and places form stay; pages only change layout/mounting. Image performance is out of scope.

**Tech Stack:** React 19, TanStack Query, Formik forms, shadcn `Button` + `ConfirmDeleteButton`, CSS `.card` theme.

## Global Constraints

- Pattern C only: inline expand, not dialog/sheet routes
- Do not change `admin-home-page.tsx` / couple profile
- Do not change server functions or validation schemas
- Only one panel open: `idle` | `create` | `edit(id)`
- Keep blush/rose/mocha/cream visual language
- Verify with `npm run typecheck` (no unit test runner in repo)

## File map

| File | Responsibility |
|---|---|
| Create `components/admin/use-admin-editor-mode.ts` | Mode state + openCreate/openEdit/close + Esc |
| Create `components/admin/admin-list-header.tsx` | Title, description, Thêm mới / Hủy thêm |
| Create `components/admin/admin-item-row.tsx` | Thumb, title, meta, Sửa/Xóa, expanded children |
| Create `components/admin/admin-image-preview.tsx` | Small existing-image preview for forms |
| Modify `components/admin/wishlist-form.tsx` | Optional `imageUrl` preview + optional `onCancel` |
| Modify `components/admin/gallery-form.tsx` | Same |
| Modify `components/admin/gift-history-form.tsx` | Same |
| Modify `components/admin/special-day-form.tsx` | Optional `onCancel` only (no image) |
| Modify `src/features/admin/admin-wishlist-page.tsx` | Compact list layout |
| Modify `src/features/admin/admin-gallery-page.tsx` | Compact list layout |
| Modify `src/features/admin/admin-gift-history-page.tsx` | Compact list layout |
| Modify `src/features/admin/admin-special-days-page.tsx` | Compact list layout |
| Modify `src/features/admin/admin-places-page.tsx` | Compact list + mount map only when panel open |

---

### Task 1: Shared editor mode hook + list chrome

**Files:**
- Create: `components/admin/use-admin-editor-mode.ts`
- Create: `components/admin/admin-list-header.tsx`
- Create: `components/admin/admin-item-row.tsx`
- Create: `components/admin/admin-image-preview.tsx`

**Interfaces:**
- Produces:
  - `type AdminEditorMode = { type: "idle" } | { type: "create" } | { type: "edit"; id: string }`
  - `useAdminEditorMode(): { mode, openCreate, openEdit, close, isCreating, isEditingId }`
  - `AdminListHeader({ title, description?, isCreating, onToggleCreate })`
  - `AdminItemRow({ title, meta?, imageUrl?, isExpanded, onEdit, onDelete, children? })`
  - `AdminImagePreview({ url, alt })`

- [ ] **Step 1: Add mode hook**

Create `components/admin/use-admin-editor-mode.ts`:

```tsx
import { useEffect, useState } from "react";

export type AdminEditorMode =
  | { type: "idle" }
  | { type: "create" }
  | { type: "edit"; id: string };

export function useAdminEditorMode() {
  const [mode, setMode] = useState<AdminEditorMode>({ type: "idle" });

  const openCreate = () => setMode({ type: "create" });
  const openEdit = (id: string) => setMode({ type: "edit", id });
  const close = () => setMode({ type: "idle" });

  useEffect(() => {
    if (mode.type === "idle") return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      const target = event.target as HTMLElement | null;
      if (target?.closest("input, textarea, select, [contenteditable=true]")) {
        return;
      }
      close();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mode.type]);

  return {
    mode,
    openCreate,
    openEdit,
    close,
    isCreating: mode.type === "create",
    isEditingId: (id: string) => mode.type === "edit" && mode.id === id,
  };
}
```

- [ ] **Step 2: Add header, row, image preview**

Create `components/admin/admin-list-header.tsx`:

```tsx
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type AdminListHeaderProps = {
  title: string;
  description?: string;
  isCreating: boolean;
  onToggleCreate: () => void;
  children?: ReactNode;
};

export function AdminListHeader({
  title,
  description,
  isCreating,
  onToggleCreate,
  children,
}: AdminListHeaderProps) {
  return (
    <section className="card p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold dark:text-white">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-mocha/70 dark:text-white/55">{description}</p>
          ) : null}
        </div>
        <Button type="button" variant={isCreating ? "outline" : "default"} onClick={onToggleCreate}>
          {isCreating ? "Hủy thêm" : "Thêm mới"}
        </Button>
      </div>
      {children}
    </section>
  );
}
```

Create `components/admin/admin-item-row.tsx`:

```tsx
import type { ReactNode } from "react";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { Button } from "@/components/ui/button";

type AdminItemRowProps = {
  title: string;
  meta?: ReactNode;
  imageUrl?: string | null;
  itemNameForDelete?: string;
  isExpanded: boolean;
  onEdit: () => void;
  onDelete: () => void | Promise<void>;
  children?: ReactNode;
};

export function AdminItemRow({
  title,
  meta,
  imageUrl,
  itemNameForDelete,
  isExpanded,
  onEdit,
  onDelete,
  children,
}: AdminItemRowProps) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-blush/60 dark:bg-white/10">
          {imageUrl ? (
            <img src={imageUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
          ) : null}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium dark:text-white">{title}</p>
          {meta ? (
            <div className="mt-1 text-xs text-mocha/65 dark:text-white/50">{meta}</div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button type="button" variant={isExpanded ? "secondary" : "outline"} size="sm" onClick={onEdit}>
            {isExpanded ? "Đóng" : "Sửa"}
          </Button>
          <ConfirmDeleteButton itemName={itemNameForDelete ?? title} onConfirm={onDelete} />
        </div>
      </div>
      {isExpanded && children ? (
        <div className="border-t border-mocha/10 p-4 dark:border-white/10">{children}</div>
      ) : null}
    </div>
  );
}
```

Create `components/admin/admin-image-preview.tsx`:

```tsx
type AdminImagePreviewProps = {
  url?: string | null;
  alt: string;
};

export function AdminImagePreview({ url, alt }: AdminImagePreviewProps) {
  if (!url) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-mocha/10 dark:border-white/10">
      <img src={url} alt={alt} className="h-36 w-full object-cover" loading="lazy" />
    </div>
  );
}
```

- [ ] **Step 3: Typecheck**

Run: `npm run typecheck`  
Expected: PASS (no errors from new files)

- [ ] **Step 4: Commit**

```bash
git add components/admin/use-admin-editor-mode.ts \
  components/admin/admin-list-header.tsx \
  components/admin/admin-item-row.tsx \
  components/admin/admin-image-preview.tsx
git commit -m "feat(admin): add compact list chrome helpers"
```

---

### Task 2: Form cancel + image preview props

**Files:**
- Modify: `components/admin/wishlist-form.tsx`
- Modify: `components/admin/gallery-form.tsx`
- Modify: `components/admin/gift-history-form.tsx`
- Modify: `components/admin/special-day-form.tsx`

**Interfaces:**
- Consumes: `AdminImagePreview`
- Produces: each form accepts optional `onCancel?: () => void` and image forms accept optional `imageUrl?: string | null`

- [ ] **Step 1: Extend WishlistForm**

Add props:

```tsx
type WishlistFormProps = {
  item?: WishlistFormItem;
  personOneName: string;
  personTwoName: string;
  imageUrl?: string | null;
  onSuccess?: () => void;
  onCancel?: () => void;
};
```

Near the top of the form JSX (before file input), render:

```tsx
<AdminImagePreview url={imageUrl} alt={item.title || "Ảnh wishlist"} />
```

Near submit button, if `onCancel`:

```tsx
<div className="flex flex-wrap gap-2">
  <button type="submit" ...>...</button>
  <Button type="button" variant="outline" onClick={onCancel}>Hủy</Button>
</div>
```

Keep existing submit button classes if preferred; `Button` outline for cancel is enough.

- [ ] **Step 2: Extend GalleryForm and GiftHistoryForm** similarly (`imageUrl` + `onCancel` + preview above file input).

- [ ] **Step 3: Extend SpecialDayForm** with `onCancel` only (no image).

- [ ] **Step 4: Typecheck**

Run: `npm run typecheck`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add components/admin/wishlist-form.tsx \
  components/admin/gallery-form.tsx \
  components/admin/gift-history-form.tsx \
  components/admin/special-day-form.tsx
git commit -m "feat(admin): add form cancel and image preview"
```

---

### Task 3: Wishlist admin page compact layout

**Files:**
- Modify: `src/features/admin/admin-wishlist-page.tsx`

**Interfaces:**
- Consumes: `useAdminEditorMode`, `AdminListHeader`, `AdminItemRow`, `WishlistForm`

- [ ] **Step 1: Replace always-open forms with mode-driven layout**

Rewrite the success return of `AdminWishlistPage` to this structure (keep queries/mutations/PAGE_SIZE as-is):

```tsx
const editor = useAdminEditorMode();

const handleSaved = () => {
  invalidate();
  editor.close();
};

return (
  <>
    <AdminListHeader
      title="Quản lý wishlist"
      description="Tạo mới và chỉnh sửa món quà, điều muốn có hoặc ý tưởng bất ngờ."
      isCreating={editor.isCreating}
      onToggleCreate={() => (editor.isCreating ? editor.close() : editor.openCreate())}
    >
      {editor.isCreating ? (
        <div className="mt-4">
          <WishlistForm
            personOneName={personOneName}
            personTwoName={personTwoName}
            onSuccess={handleSaved}
            onCancel={editor.close}
          />
        </div>
      ) : null}
    </AdminListHeader>

    <section>
      <div className="max-h-[72vh] space-y-3 overflow-y-auto pr-1">
        {items.map((item) => {
          const expanded = editor.isEditingId(item.id);
          return (
            <AdminItemRow
              key={item.id}
              title={item.title}
              imageUrl={item.image_url}
              meta={`${item.owner_type === "me" ? personOneName : personTwoName} · ${item.priority} · ${item.status}`}
              isExpanded={expanded}
              onEdit={() => (expanded ? editor.close() : editor.openEdit(item.id))}
              onDelete={async () => {
                await deleteMutation.mutateAsync(item.id);
                if (editor.isEditingId(item.id)) editor.close();
              }}
            >
              <WishlistForm
                personOneName={personOneName}
                personTwoName={personTwoName}
                imageUrl={item.image_url}
                onSuccess={handleSaved}
                onCancel={editor.close}
                item={{
                  id: item.id,
                  owner_type: item.owner_type,
                  title: item.title,
                  description: item.description ?? "",
                  image_path: item.image_path ?? "",
                  product_urls: parseWishlistProductUrls(item.product_url).join("\n"),
                  price_min: item.price_min?.toString() ?? "",
                  price_max: item.price_max?.toString() ?? "",
                  category: item.category ?? "",
                  priority: item.priority,
                  note: item.note ?? "",
                  status: item.status,
                }}
              />
            </AdminItemRow>
          );
        })}
        {!items.length ? (
          <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">Chưa có món quà nào.</p>
        ) : null}
      </div>
      <PaginationControls
        basePath="/admin/wishlist"
        currentPage={safePage}
        totalPages={totalPages}
        searchParams={{}}
      />
    </section>
  </>
);
```

- [ ] **Step 2: Typecheck + smoke**

Run: `npm run typecheck`  
Manual: `/admin/wishlist` — list compact; Thêm mới opens one form; Sửa expands one row; Hủy closes.

- [ ] **Step 3: Commit**

```bash
git add src/features/admin/admin-wishlist-page.tsx
git commit -m "feat(admin): compact wishlist list UX"
```

---

### Task 4: Gallery + special days compact layouts

**Files:**
- Modify: `src/features/admin/admin-gallery-page.tsx`
- Modify: `src/features/admin/admin-special-days-page.tsx`

**Interfaces:**
- Consumes: same shared chrome + `GalleryForm` / `SpecialDayForm`

- [ ] **Step 1: Refactor gallery page** like wishlist:
  - Header “Quản lý Khoảnh khắc”
  - Create panel with `GalleryForm`
  - Rows: title `item.caption ?? "Ảnh"`, `imageUrl={item.image_url}`, meta = formatted `memory_date` or empty
  - Pass `imageUrl={item.image_url}` into edit form
  - Keep `md:grid-cols-2` optional; prefer single-column `space-y-3` for consistency with other admin lists

- [ ] **Step 2: Refactor special-days page** similarly:
  - Title “Quản lý Ngày Đặc Biệt”
  - Meta: `${item.date} · ${item.type}`
  - No `imageUrl`

- [ ] **Step 3: Typecheck + smoke both pages**

Run: `npm run typecheck`  
Manual: create/edit/cancel on `/admin/gallery` and `/admin/special-days`

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/admin-gallery-page.tsx \
  src/features/admin/admin-special-days-page.tsx
git commit -m "feat(admin): compact gallery and special-days UX"
```

---

### Task 5: Gift history compact layout

**Files:**
- Modify: `src/features/admin/admin-gift-history-page.tsx`

**Interfaces:**
- Consumes: shared chrome + `GiftHistoryForm`

- [ ] **Step 1: Refactor gift-history page**
  - Keep existing queries for profile / special days / wishlist options needed by the form
  - Compact rows: title `item.gift_name`, `imageUrl={item.photo_url}`, meta `giver · date · status`
  - Create/edit only mount `GiftHistoryForm` when panel open
  - On save success call `editor.close()` after invalidate

- [ ] **Step 2: Typecheck + smoke `/admin/gift-history`**

Run: `npm run typecheck`

- [ ] **Step 3: Commit**

```bash
git add src/features/admin/admin-gift-history-page.tsx
git commit -m "feat(admin): compact gift-history list UX"
```

---

### Task 6: Places compact layout (map only when open)

**Files:**
- Modify: `src/features/admin/admin-places-page.tsx`

**Interfaces:**
- Consumes: shared chrome; keep local `PlaceForm` but gate `showLocationPicker` / map mount by expanded state

- [ ] **Step 1: Wire editor mode around places list**

Replace always-visible create `PlaceForm` and per-row always-open edit forms with:

- `AdminListHeader` title “Quản lý Địa điểm”
- Create panel: `<PlaceForm showLocationPicker onSuccess={handleSaved} />` only when `isCreating`
- Each row: `AdminItemRow` with `imageUrl={place.cover_image_url}`, title `place.title`, meta `${place.status} · ${[place.city, place.country].filter(Boolean).join(" / ") || place.location_name}`
- Expanded edit: render `PlaceForm` with item values; use `showLocationPicker={true}` only while expanded (so Leaflet mounts only then). Prefer `EditPlaceLocation` inside `PlaceForm` as today when editing coordinates.

Ensure after delete of the editing id, call `editor.close()`.

- [ ] **Step 2: Add cover preview inside PlaceForm when `item.cover_image_path` / URL available**

If list item has `cover_image_url`, pass it into `PlaceForm` as optional `coverImageUrl` and render `AdminImagePreview` above the cover file input.

- [ ] **Step 3: Typecheck + smoke `/admin/places`**

Manual checklist:
- First paint: no map canvas in DOM for closed rows
- Thêm mới mounts map once
- Sửa one place mounts map; closing unmounts

Run: `npm run typecheck`

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/admin-places-page.tsx
git commit -m "feat(admin): compact places list and lazy map mount"
```

---

### Task 7: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full typecheck**

Run: `npm run typecheck`  
Expected: exit 0

- [ ] **Step 2: Manual checklist across all five pages**

For each of `/admin/wishlist`, `/admin/gallery`, `/admin/gift-history`, `/admin/special-days`, `/admin/places`:

1. Default view = compact rows, no nested forms
2. Thêm mới opens create; second click Hủy thêm closes
3. Sửa expands only that row; opening another closes the first
4. Lưu closes panel and refreshes list
5. Xóa still confirms via dialog
6. `/admin` home profile form unchanged

- [ ] **Step 3: Optional doctor on changed files**

Run: `npm run doctor:changed`  
Fix only new high-confidence regressions if any.

- [ ] **Step 4: Commit any leftover polish** (only if files changed)

```bash
git status
# if clean, skip
```

---

## Spec coverage check

| Spec requirement | Task |
|---|---|
| Pattern C create behind button | 3–6 |
| Compact rows + one edit expand | 1, 3–6 |
| Mode idle/create/edit + Esc | 1 |
| Image preview on edit | 2, 3–6 |
| Places map only when open | 6 |
| Home unchanged | 7 checklist |
| No server/API changes | all |
| Image perf deferred | non-goal |

## Placeholder scan

None intentional — all steps include concrete code or commands.
