import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full bg-[#e8d9ff] px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[#1b2653]",
        className,
      )}
      {...props}
    />
  );
}
