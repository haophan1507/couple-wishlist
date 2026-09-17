import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { AdminImagePreview } from "@/components/admin/admin-image-preview";
import { AdminItemRow } from "@/components/admin/admin-item-row";
import { AdminListHeader } from "@/components/admin/admin-list-header";
import { EditPlaceLocation } from "@/components/admin/edit-place-location";
import { PlaceMapPicker } from "@/components/admin/place-map-picker";
import { useAdminEditorMode } from "@/components/admin/use-admin-editor-mode";
import { Button } from "@/components/ui/button";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { fetchAdminPlacesPage, queryKeys } from "@/lib/data/client-queries";
import { deletePlaceMemoryFn, upsertPlaceMemoryFn } from "@/src/server/places";

const PAGE_SIZE = 10;

type PlaceFormItem = {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: "visited" | "planned";
  visit_date: string;
  location_name: string;
  latitude: string;
  longitude: string;
  city: string;
  country: string;
  cover_image_path: string;
  gallery_captions: string;
};

const defaultValues: PlaceFormItem = {
  id: "",
  title: "",
  slug: "",
  description: "",
  status: "planned",
  visit_date: "",
  location_name: "",
  latitude: "",
  longitude: "",
  city: "",
  country: "",
  cover_image_path: "",
  gallery_captions: "",
};

function PlaceForm({
  item = defaultValues,
  showLocationPicker = true,
  onSuccess,
  onCancel,
}: {
  item?: PlaceFormItem;
  showLocationPicker?: boolean;
  onSuccess?: () => void;
  onCancel?: () => void;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      await upsertPlaceMemoryFn({ data: new FormData(event.currentTarget) });
      onSuccess?.();
      if (!item.id) {
        event.currentTarget.reset();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không thể lưu địa điểm.");
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      className="grid gap-3 rounded-2xl border border-mocha/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
    >
      <input type="hidden" name="id" defaultValue={item.id} />
      <input type="hidden" name="existing_cover_image_path" defaultValue={item.cover_image_path} />

      <div className="grid gap-3 md:grid-cols-2">
        <input name="title" placeholder="Tên kỷ niệm địa điểm" defaultValue={item.title} required />
        <select name="status" defaultValue={item.status} aria-label="Trạng thái địa điểm">
          <option value="planned">Dự định</option>
          <option value="visited">Đã đi</option>
        </select>
      </div>
      <input type="hidden" name="slug" defaultValue={item.slug} />

      <textarea
        name="description"
        rows={3}
        placeholder="Mô tả cảm xúc hoặc kỷ niệm ở nơi này"
        defaultValue={item.description}
      />

      <input
        name="visit_date"
        type="date"
        defaultValue={item.visit_date}
        aria-label="Ngày ghé thăm"
      />

      {showLocationPicker ? (
        <PlaceMapPicker
          defaultLocationName={item.location_name}
          defaultCity={item.city}
          defaultCountry={item.country}
          defaultLatitude={item.latitude}
          defaultLongitude={item.longitude}
        />
      ) : (
        <EditPlaceLocation
          locationName={item.location_name}
          city={item.city}
          country={item.country}
          latitude={item.latitude}
          longitude={item.longitude}
        />
      )}

      <div className="space-y-2">
        <AdminImagePreview
          path={item.cover_image_path || null}
          alt={item.title || "Ảnh cover địa điểm"}
        />
        <input type="file" name="cover_image_file" accept="image/*" aria-label="Ảnh cover" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-mocha/80 dark:text-white/70">
            Ảnh chi tiết
            <input
              type="file"
              name="gallery_image_files"
              accept="image/*"
              multiple
              className="mt-2 block w-full font-normal"
            />
          </label>
          <p className="text-xs text-mocha/60 dark:text-white/45">
            Nếu tải ảnh mới khi chỉnh sửa, bộ ảnh cũ sẽ được thay thế toàn bộ.
          </p>
        </div>
        <div className="space-y-2">
          <textarea
            name="gallery_captions"
            rows={4}
            placeholder="Mỗi dòng là caption cho một ảnh (theo thứ tự). Có thể sửa caption ảnh cũ mà không cần tải lại."
            defaultValue={item.gallery_captions}
          />
        </div>
      </div>

      {error ? <p className="text-sm text-rose-700 dark:text-rose-300">{error}</p> : null}

      <div className="flex flex-wrap gap-2">
        <button
          type="submit"
          disabled={pending}
          className="w-fit rounded-xl bg-mocha px-4 py-2 text-sm text-white transition hover:opacity-95 disabled:opacity-60 dark:bg-white dark:text-[#1e1a1c]"
        >
          {pending
            ? item.id
              ? "Đang cập nhật..."
              : "Đang thêm..."
            : item.id
              ? "Cập nhật địa điểm"
              : "Thêm địa điểm"}
        </button>
        {onCancel ? (
          <Button type="button" variant="outline" onClick={onCancel} disabled={pending}>
            Hủy
          </Button>
        ) : null}
      </div>
    </form>
  );
}

export function AdminPlacesPage({ page }: { page: number }) {
  const queryClient = useQueryClient();
  const editor = useAdminEditorMode();
  const listQuery = useQuery({
    queryKey: queryKeys.adminPlacesPage({ page, pageSize: PAGE_SIZE }),
    queryFn: () => fetchAdminPlacesPage(page, PAGE_SIZE),
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin", "places"] });
    void queryClient.invalidateQueries({ queryKey: queryKeys.places });
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const formData = new FormData();
      formData.set("id", id);
      await deletePlaceMemoryFn({ data: formData });
    },
    onSuccess: invalidate,
  });

  if (listQuery.isPending && !listQuery.data) {
    return <SectionSkeleton cards={3} withTitle />;
  }

  const total = listQuery.data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const places = listQuery.data?.items ?? [];

  const handleSaved = () => {
    invalidate();
    editor.close();
  };

  return (
    <>
      <AdminListHeader
        title="Quản lý Địa điểm"
        description="Quản lý những nơi đã đi và những nơi còn muốn cùng nhau ghé đến."
        isCreating={editor.isCreating}
        onToggleCreate={() => (editor.isCreating ? editor.close() : editor.openCreate())}
      >
        {editor.isCreating ? (
          <div className="mt-4">
            <PlaceForm showLocationPicker onSuccess={handleSaved} onCancel={editor.close} />
          </div>
        ) : null}
      </AdminListHeader>

      <section>
        <div className="space-y-3 pr-1">
          {places.map((place) => {
            const expanded = editor.isEditingId(place.id);
            const location =
              [place.city, place.country].filter(Boolean).join(" / ") || place.location_name;
            return (
              <AdminItemRow
                key={place.id}
                title={place.title}
                imagePath={place.cover_image_path}
                meta={`${place.status === "visited" ? "Đã đi" : "Dự định"}${location ? ` · ${location}` : ""}`}
                isExpanded={expanded}
                onEdit={() => (expanded ? editor.close() : editor.openEdit(place.id))}
                onDelete={async () => {
                  await deleteMutation.mutateAsync(place.id);
                  if (editor.isEditingId(place.id)) editor.close();
                }}
              >
                {expanded ? (
                  <PlaceForm
                    showLocationPicker={false}
                    onSuccess={handleSaved}
                    onCancel={editor.close}
                    item={{
                      id: place.id,
                      title: place.title,
                      slug: place.slug ?? "",
                      description: place.description ?? "",
                      status: place.status,
                      visit_date: place.visit_date ?? "",
                      location_name: place.location_name,
                      latitude: place.latitude?.toString() ?? "",
                      longitude: place.longitude?.toString() ?? "",
                      city: place.city ?? "",
                      country: place.country ?? "",
                      cover_image_path: place.cover_image_path ?? "",
                      gallery_captions: place.images.map((image) => image.caption ?? "").join("\n"),
                    }}
                  />
                ) : null}
              </AdminItemRow>
            );
          })}
          {!places.length ? (
            <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">
              Chưa có địa điểm nào trong bản đồ yêu thương.
            </p>
          ) : null}
        </div>
        <PaginationControls
          basePath="/admin/places"
          currentPage={safePage}
          totalPages={totalPages}
        />
      </section>
    </>
  );
}
