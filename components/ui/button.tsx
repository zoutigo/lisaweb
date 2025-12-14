import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-[#3B5BFF] text-white shadow-[0_12px_30px_rgba(59,91,255,0.25)] hover:bg-[#324edb] focus-visible:outline-[#3B5BFF]",
  secondary:
    "bg-white/90 text-[#1b2653] border border-white/80 shadow-[0_8px_24px_rgba(0,0,0,0.05)] hover:bg-white focus-visible:outline-[#3B5BFF]",
  ghost: "text-inherit hover:bg-black/5 focus-visible:outline-[#3B5BFF]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[12px] px-5 py-3 text-sm font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  ),
);

Button.displayName = "Button";
