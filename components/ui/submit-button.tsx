import type { ComponentPropsWithoutRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SubmitButtonProps extends Omit<
  ComponentPropsWithoutRef<typeof Button>,
  "type"
> {
  isSubmitting?: boolean;
  isValid?: boolean;
  loadingLabel?: string;
}

export function SubmitButton({
  children,
  isSubmitting,
  isValid = true,
  loadingLabel = "Envoi...",
  className,
  disabled,
  ...props
}: SubmitButtonProps) {
  return (
    <Button
      type="submit"
      aria-busy={isSubmitting}
      disabled={disabled || isSubmitting || !isValid}
      className={cn("min-w-32", className)}
      {...props}
    >
      {isSubmitting ? (
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-transparent" />
          {loadingLabel}
        </span>
      ) : (
        children
      )}
    </Button>
  );
}
