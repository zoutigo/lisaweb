import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  muted?: boolean;
}

export function Card({ className, muted, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-[20px] border border-white/60 bg-[var(--card)] p-8 shadow-[var(--shadow)] backdrop-blur",
        muted && "border-transparent bg-white/70 dark:bg-zinc-900/40",
        className,
      )}
      {...props}
    />
  );
}
