import Link from "next/link";
import { cn } from "@/lib/utils";

type BackLinkProps = {
  href?: string;
  label?: string;
  className?: string;
};

export function BackLink({
  href = "/dashboard",
  label = "← Retour",
  className,
}: BackLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        "inline-flex items-center gap-2 rounded-lg border border-[#e5e7eb] bg-white px-3 py-2 text-sm font-semibold text-[#1b2653] shadow-sm transition hover:bg-[#f8fafc]",
        className,
      )}
    >
      {label}
    </Link>
  );
}
