"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { Eye, Pencil, Plus, Trash2, type LucideIcon } from "lucide-react";

type ActionType = "create" | "edit" | "delete" | "view";

const iconByAction: Record<ActionType, LucideIcon> = {
  create: Plus,
  edit: Pencil,
  delete: Trash2,
  view: Eye,
};

const labelByAction: Record<ActionType, string> = {
  create: "Créer",
  edit: "Modifier",
  delete: "Supprimer",
  view: "Voir",
};

type BaseProps = {
  action: ActionType;
  label?: string;
  className?: string;
  disabled?: boolean;
  tone?: "default" | "primary" | "danger";
};

type ButtonProps =
  | ({
      as?: "button";
      onClick?: () => void;
      type?: "button" | "submit" | "reset";
    } & BaseProps)
  | ({
      as: "link";
      href: string;
      onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void;
    } & BaseProps);

export function ActionIconButton(props: ButtonProps) {
  const Icon = iconByAction[props.action];
  const label = props.label ?? labelByAction[props.action];
  const tone = props.tone ?? "default";

  const toneClasses: Record<typeof tone, string> = {
    default:
      "border-gray-200 bg-white text-gray-800 hover:border-blue-300 hover:text-blue-700",
    primary:
      "border-blue-200 bg-blue-600 text-white hover:border-blue-300 hover:bg-blue-700 hover:text-white",
    danger:
      "border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100",
  };

  const sharedClasses = cn(
    "relative inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60",
    toneClasses[tone],
  );

  if (props.as === "link") {
    const { href, onClick, className, disabled } = props;
    return (
      <Link
        href={href}
        onClick={(e) => {
          if (disabled) {
            e.preventDefault();
            return;
          }
          onClick?.(e);
        }}
        aria-label={label}
        className={cn(sharedClasses, "group no-underline", className)}
        aria-disabled={disabled ? "true" : undefined}
      >
        <Icon
          className="h-4 w-4"
          aria-hidden
          data-testid={`${props.action}-icon`}
        />
        <span className="sr-only">{label}</span>
        <span
          data-testid={`${props.action}-tooltip`}
          className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-gray-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:inline-flex group-hover:opacity-100"
        >
          {label}
        </span>
      </Link>
    );
  }

  const { onClick, type = "button", className, disabled } = props;
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      aria-label={label}
      className={cn(sharedClasses, "group", className)}
    >
      <Icon
        className="h-4 w-4"
        aria-hidden
        data-testid={`${props.action}-icon`}
      />
      <span className="sr-only">{label}</span>
      <span
        data-testid={`${props.action}-tooltip`}
        className="pointer-events-none absolute -top-9 left-1/2 hidden -translate-x-1/2 whitespace-nowrap rounded-full bg-gray-900 px-2 py-1 text-[11px] font-semibold text-white opacity-0 shadow-lg transition group-hover:inline-flex group-hover:opacity-100"
      >
        {label}
      </span>
    </button>
  );
}
