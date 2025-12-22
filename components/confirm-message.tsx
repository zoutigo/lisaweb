type ConfirmMessageProps = {
  type: "success" | "error";
  message: string;
  className?: string;
};

export function ConfirmMessage({
  type,
  message,
  className,
}: ConfirmMessageProps) {
  const base =
    "rounded-xl px-4 py-2 text-sm font-medium " +
    (type === "success"
      ? "bg-green-50 text-green-700 border border-green-100"
      : "bg-red-50 text-red-700 border border-red-100");
  return <div className={`${base} ${className || ""}`.trim()}>{message}</div>;
}
