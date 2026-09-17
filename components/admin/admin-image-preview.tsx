import { AppImage } from "@/components/ui/app-image";

type AdminImagePreviewProps = {
  path?: string | null;
  url?: string | null;
  alt: string;
};

export function AdminImagePreview({ path, url, alt }: AdminImagePreviewProps) {
  if (!path && !url) return null;
  return (
    <div className="overflow-hidden rounded-xl border border-mocha/10 dark:border-white/10">
      <AppImage
        path={path}
        src={path ? undefined : url}
        alt={alt}
        variant="thumb"
        aspect="wide"
        className="h-36"
      />
    </div>
  );
}
