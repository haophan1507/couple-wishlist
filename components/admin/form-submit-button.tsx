import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type FormSubmitButtonProps = {
  idleLabel: string;
  loadingLabel: string;
  className?: string;
};

export function FormSubmitButton({ idleLabel, loadingLabel, className }: FormSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      size="lg"
      className={cn("w-fit rounded-xl px-4", className)}
    >
      {pending ? loadingLabel : idleLabel}
    </Button>
  );
}
