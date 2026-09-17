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
