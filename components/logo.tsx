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
      <img
        src="/logo.svg"
        alt={alt}
        loading="eager"
        style={{
          objectFit: "contain",
          width: "100%",
          height: "100%",
          display: "block",
        }}
        // We intentionally avoid next/image for SVG to ensure it renders on Passenger/standalone
      />
    </div>
  );
}
