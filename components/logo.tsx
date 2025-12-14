import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  size?: number;
  alt?: string;
}

export function Logo({ className, size = 36, alt = "Plisa" }: LogoProps) {
  const dimension = `${size}px`;
  return (
    <div
      className={cn("relative", className)}
      style={{ height: dimension, width: dimension }}
    >
      <Image
        src="/logo.svg"
        alt={alt}
        fill
        sizes={dimension}
        className="object-contain"
        priority
      />
    </div>
  );
}
