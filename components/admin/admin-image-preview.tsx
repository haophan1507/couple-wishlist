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
