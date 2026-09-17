import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent, type ReactNode } from "react";
import { SectionSkeleton } from "@/components/ui/section-skeleton";
import { APP_NAME } from "@/lib/constants/app";
import { fetchAdminCounts, fetchCoupleProfile, queryKeys } from "@/lib/data/client-queries";
import { upsertCoupleProfileFn } from "@/src/server/couple-profile";
import { sendManualEmailFn } from "@/src/server/notifications";

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="block text-sm font-medium text-foreground/80">{label}</span>
      {children}
    </label>
  );
}

export function AdminHomePage() {
  const queryClient = useQueryClient();
  const [profilePending, setProfilePending] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [emailMessage, setEmailMessage] = useState<string | null>(null);
  const [emailError, setEmailError] = useState<string | null>(null);

  const profileQuery = useQuery({
    queryKey: queryKeys.coupleProfile,
    queryFn: fetchCoupleProfile,
  });
  const countsQuery = useQuery({
    queryKey: queryKeys.adminCounts,
    queryFn: fetchAdminCounts,
  });

  const emailMutation = useMutation({
    mutationFn: sendManualEmailFn,
    onSuccess: (result) => {
      if (!result.ok) {
        setEmailError(result.message);
        setEmailMessage(null);
        return;
      }
      setEmailError(null);
      setEmailMessage(
        `Đã gửi ${result.sent} email. Sự kiện hôm nay: ${result.events}.${result.reason ? ` ${result.reason}` : ""}`,
      );
    },
    onError: (error) => {
      setEmailError(error instanceof Error ? error.message : "Không thể gửi email");
      setEmailMessage(null);
    },
  });

  if ((profileQuery.isPending || countsQuery.isPending) && !profileQuery.data) {
    return <SectionSkeleton cards={3} withTitle />;
  }

  const profile = profileQuery.data;
  const counts = countsQuery.data;

  return (
    <>
      <section className="card p-6">
        <h1 className="text-2xl font-semibold dark:text-white">Bảng điều khiển</h1>
        <p className="mt-1 text-sm text-mocha/70 dark:text-white/55">
          Tổng quan không gian riêng của hai bạn: wishlist, kỷ niệm quà, ngày đặc biệt, ảnh và địa
          điểm yêu thương.
        </p>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-5">
          {[
            ["Wishlist", counts?.wishlist ?? 0],
            ["Ngày đặc biệt", counts?.specialDays ?? 0],
            ["Ảnh kỷ niệm", counts?.gallery ?? 0],
            ["Kỷ niệm quà", counts?.giftHistory ?? 0],
            ["Bản đồ yêu thương", counts?.places ?? 0],
          ].map(([label, value]) => (
            <div key={label as string}>
              <p className="text-sm text-muted-foreground">{label}</p>
              <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-xl font-semibold dark:text-white">Hồ sơ cặp đôi</h2>
        <p className="mt-1 text-sm text-mocha/70 dark:text-white/55">
          Hiển thị ở trang chủ và dùng để tự động tính cột mốc yêu nhau.
        </p>

        <form
          className="mt-6 space-y-6"
          onSubmit={(event: FormEvent<HTMLFormElement>) => {
            event.preventDefault();
            setProfilePending(true);
            setProfileError(null);
            void upsertCoupleProfileFn({ data: new FormData(event.currentTarget) })
              .then(() => {
                void queryClient.invalidateQueries({
                  queryKey: queryKeys.coupleProfile,
                });
              })
              .catch((error) => {
                setProfileError(error instanceof Error ? error.message : "Không thể lưu hồ sơ.");
              })
              .finally(() => setProfilePending(false));
          }}
        >
          <div className="rounded-3xl border border-mocha/10 bg-blush/50 p-5 dark:border-white/10 dark:bg-white/5">
            <h3 className="text-lg font-semibold dark:text-white">Thiết lập chung</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label="Tên người thứ nhất">
                <input
                  name="person_one_name"
                  defaultValue={profile?.person_one_name ?? ""}
                  required
                />
              </Field>
              <Field label="Tên người thứ hai">
                <input
                  name="person_two_name"
                  defaultValue={profile?.person_two_name ?? ""}
                  required
                />
              </Field>
              <Field label="Ngày bắt đầu yêu">
                <input
                  name="love_start_date"
                  type="date"
                  defaultValue={profile?.love_start_date ?? ""}
                  required
                />
              </Field>
              <Field label="Ảnh bìa">
                <>
                  <input
                    type="hidden"
                    name="existing_cover_image_path"
                    defaultValue={profile?.cover_image_path ?? ""}
                  />
                  <input type="file" name="cover_image_file" accept="image/*" />
                </>
              </Field>
              <div className="md:col-span-2">
                <Field label="Câu chuyện của hai bạn">
                  <textarea
                    name="story"
                    rows={5}
                    placeholder="Viết vài dòng về hành trình của hai bạn..."
                    defaultValue={profile?.story ?? ""}
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-mocha/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-lg font-semibold dark:text-white">
                {profile?.person_one_name || "Người thứ nhất"}
              </h3>
              <div className="mt-4 space-y-4">
                <Field label="Ngày sinh">
                  <input
                    name="person_one_birthday"
                    type="date"
                    defaultValue={profile?.person_one_birthday ?? ""}
                  />
                </Field>
                <Field label="Món yêu thích">
                  <input
                    name="person_one_favorite"
                    defaultValue={profile?.person_one_favorite ?? ""}
                  />
                </Field>
                <Field label="Sở thích">
                  <input name="person_one_hobby" defaultValue={profile?.person_one_hobby ?? ""} />
                </Field>
              </div>
            </div>
            <div className="rounded-3xl border border-mocha/10 bg-white/60 p-5 dark:border-white/10 dark:bg-white/5">
              <h3 className="text-lg font-semibold dark:text-white">
                {profile?.person_two_name || "Người thứ hai"}
              </h3>
              <div className="mt-4 space-y-4">
                <Field label="Ngày sinh">
                  <input
                    name="person_two_birthday"
                    type="date"
                    defaultValue={profile?.person_two_birthday ?? ""}
                  />
                </Field>
                <Field label="Món yêu thích">
                  <input
                    name="person_two_favorite"
                    defaultValue={profile?.person_two_favorite ?? ""}
                  />
                </Field>
                <Field label="Sở thích">
                  <input name="person_two_hobby" defaultValue={profile?.person_two_hobby ?? ""} />
                </Field>
              </div>
            </div>
          </div>

          {profileError ? (
            <p className="text-sm text-rose-700 dark:text-rose-300">{profileError}</p>
          ) : null}

          <button
            type="submit"
            disabled={profilePending}
            className="w-fit rounded-xl bg-mocha px-4 py-2 text-sm text-white dark:bg-white dark:text-[#1e1a1c]"
          >
            {profilePending ? "Đang lưu..." : "Lưu hồ sơ"}
          </button>
        </form>

        <div className="mt-6 border-t border-mocha/10 pt-4 dark:border-white/10">
          <details className="group">
            <summary className="cursor-pointer text-xs text-mocha/55 hover:text-mocha/75 dark:text-white/45">
              Công cụ hệ thống
            </summary>
            <div className="mt-3 space-y-3">
              <form
                className="grid gap-3 rounded-2xl border border-mocha/10 bg-white/50 p-4 dark:border-white/10 dark:bg-white/5"
                onSubmit={(event) => {
                  event.preventDefault();
                  const formData = new FormData(event.currentTarget);
                  emailMutation.mutate({
                    data: {
                      recipients: String(formData.get("manual_email_recipients") ?? ""),
                      subject: String(formData.get("subject") ?? ""),
                      customMessage: String(formData.get("manual_email_message") ?? ""),
                    },
                  });
                }}
              >
                <div className="grid gap-3 md:grid-cols-2">
                  <Field label="Người nhận">
                    <input
                      name="manual_email_recipients"
                      type="text"
                      placeholder="email@example.com, email-2@example.com"
                    />
                  </Field>
                  <Field label="Tiêu đề">
                    <input name="subject" type="text" placeholder={APP_NAME} />
                  </Field>
                </div>
                <Field label="Nội dung">
                  <textarea
                    name="manual_email_message"
                    rows={4}
                    placeholder="Nhập nội dung muốn gửi..."
                  />
                </Field>
                <button
                  type="submit"
                  disabled={emailMutation.isPending}
                  className="w-fit rounded-lg px-3 py-1.5 text-xs text-mocha/70 ring-1 ring-mocha/20 hover:bg-white dark:text-white/70 dark:ring-white/20"
                >
                  {emailMutation.isPending ? "Đang gửi..." : "Gửi email"}
                </button>
              </form>
              {emailMessage ? (
                <p className="text-xs text-emerald-700 dark:text-emerald-300">{emailMessage}</p>
              ) : null}
              {emailError ? (
                <p className="text-xs text-rose-700 dark:text-rose-300">
                  Lỗi gửi email: {emailError}
                </p>
              ) : null}
            </div>
          </details>
        </div>
      </section>
    </>
  );
}
