import { useRef, useState, type ComponentProps, type Ref } from "react";
import { ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils/cn";

type FileInputProps = Omit<ComponentProps<"input">, "type"> & {
  buttonLabel?: string;
  emptyLabel?: string;
};

function assignRef<T>(ref: Ref<T> | undefined, value: T | null) {
  if (typeof ref === "function") ref(value);
  else if (ref) ref.current = value;
}

export function FileInput({
  className,
  buttonLabel = "Chọn ảnh",
  emptyLabel = "Chưa chọn ảnh nào",
  multiple,
  onChange,
  ref,
  ...props
}: FileInputProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [fileLabel, setFileLabel] = useState<string | null>(null);

  return (
    <div
      className={cn(
        "flex h-10 w-full min-w-0 items-center gap-3 rounded-xl border border-rose/30 bg-white pr-4 pl-1.5 text-sm transition focus-within:border-rose focus-within:ring-2 focus-within:ring-rose/20 dark:border-white/20 dark:bg-white/5",
        className,
      )}
    >
      <input
        {...props}
        ref={(node) => {
          inputRef.current = node;
          assignRef(ref, node);
        }}
        type="file"
        data-slot="file-input"
        multiple={multiple}
        tabIndex={-1}
        className="sr-only"
        onChange={(event) => {
          const files = event.currentTarget.files;
          setFileLabel(
            !files?.length
              ? null
              : files.length === 1
                ? files[0].name
                : `Đã chọn ${files.length} ảnh`,
          );
          onChange?.(event);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="inline-flex h-7 shrink-0 items-center gap-1.5 rounded-lg bg-secondary px-3 font-medium text-foreground transition outline-none hover:bg-rose/30 dark:bg-white/10 dark:hover:bg-white/15"
      >
        <ImagePlus className="h-4 w-4" />
        {buttonLabel}
      </button>
      <span className={cn("truncate", fileLabel ? "text-foreground" : "text-muted-foreground")}>
        {fileLabel ?? emptyLabel}
      </span>
    </div>
  );
}
