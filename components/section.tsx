import type { ComponentPropsWithoutRef, ElementType } from "react";
import { cn } from "@/lib/utils";

type SectionProps = ComponentPropsWithoutRef<"section"> & { as?: ElementType };

export function Section({
  className,
  as: Tag = "section",
  ...props
}: SectionProps) {
  return (
    <Tag
      className={cn(
        "relative mx-auto w-full max-w-6xl px-6 py-10 sm:px-8 sm:py-12",
        className,
      )}
      {...props}
    />
  );
}
