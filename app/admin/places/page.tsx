import { deletePlaceMemoryAction, upsertPlaceMemoryAction } from "@/app/actions/places";
import { ConfirmDeleteButton } from "@/components/admin/confirm-delete-button";
import { EditPlaceLocation } from "@/components/admin/edit-place-location";
import { FormSubmitButton } from "@/components/admin/form-submit-button";
import { PlaceMapPicker } from "@/components/admin/place-map-picker";
import { PaginationControls } from "@/components/ui/pagination-controls";
import { getPlaceMemories } from "@/lib/data/queries";

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
}: {
  item?: PlaceFormItem;
  showLocationPicker?: boolean;
}) {
  return (
    <form action={upsertPlaceMemoryAction} className="grid gap-3 rounded-2xl border border-mocha/10 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
      <input type="hidden" name="id" defaultValue={item.id} />
      <input type="hidden" name="existing_cover_image_path" defaultValue={item.cover_image_path} />

      <div className="grid gap-3 md:grid-cols-2">
        <input name="title" placeholder="Tên kỷ niệm địa điểm" defaultValue={item.title} required />
        <input name="slug" placeholder="slug-tu-chinh (không bắt buộc)" defaultValue={item.slug} />
      </div>

      <textarea name="description" rows={3} placeholder="Mô tả cảm xúc hoặc kỷ niệm ở nơi này" defaultValue={item.description} />

      <div className="grid gap-3 md:grid-cols-2">
        <select name="status" defaultValue={item.status}>
          <option value="planned">Dự định</option>
          <option value="visited">Đã đi</option>
        </select>
        <input name="visit_date" type="date" defaultValue={item.visit_date} />
      </div>

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

      <div className="grid gap-3 md:grid-cols-2">
        <input type="file" name="cover_image_file" accept="image/*" />
        <div />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-mocha/80 dark:text-white/70">
            Ảnh chi tiết
          </label>
          <input type="file" name="gallery_image_files" accept="image/*" multiple />
          <p className="text-xs text-mocha/60 dark:text-white/45">
            Nếu tải ảnh mới khi chỉnh sửa, bộ ảnh cũ sẽ được thay thế toàn bộ.
          </p>
        </div>
        <div className="space-y-2">
          <textarea
            name="gallery_captions"
            rows={4}
            placeholder="Mỗi dòng là caption cho một ảnh theo đúng thứ tự file"
            defaultValue={item.gallery_captions}
          />
        </div>
      </div>

      <FormSubmitButton
        idleLabel={item.id ? "Cập nhật địa điểm" : "Thêm địa điểm"}
        loadingLabel={item.id ? "Đang cập nhật..." : "Đang thêm..."}
      />
    </form>
  );
}

export default async function AdminPlacesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const places = await getPlaceMemories();
  const page = Math.max(1, Number(params.page ?? "1") || 1);
  const pageSize = 3;
  const totalPages = Math.max(1, Math.ceil(places.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedPlaces = places.slice((safePage - 1) * pageSize, safePage * pageSize);

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold dark:text-white">Heart Mapping</h1>
        <p className="mt-1 text-sm text-mocha/70 dark:text-white/55">
          Quản lý những nơi đã đi và những nơi còn muốn cùng nhau ghé đến.
        </p>
        <div className="mt-4">
          <PlaceForm />
        </div>
      </section>

      <section>
        <div className="max-h-[72vh] space-y-3 overflow-y-auto pr-1">
        {paginatedPlaces.map((place) => (
          <div key={place.id} className="card p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium dark:text-white">{place.title}</p>
                <p className="mt-1 text-xs text-mocha/65 dark:text-white/45">
                  {place.location_name} • {place.status === "visited" ? "Đã đi" : "Dự định"} • {place.images.length} ảnh chi tiết
                </p>
              </div>
              <form id={`delete-place-${place.id}`} action={deletePlaceMemoryAction}>
                <input type="hidden" name="id" value={place.id} />
                <ConfirmDeleteButton formId={`delete-place-${place.id}`} itemName={place.title} />
              </form>
            </div>

            <PlaceForm
              showLocationPicker={false}
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
          </div>
        ))}
        {!places.length ? (
          <p className="card p-6 text-sm text-mocha/70 dark:text-white/50">
            Chưa có địa điểm nào trong Heart Mapping.
          </p>
        ) : null}
        </div>
        <PaginationControls
          basePath="/admin/places"
          currentPage={safePage}
          totalPages={totalPages}
          searchParams={{}}
        />
      </section>
    </>
  );
}
