import { cn } from "@/lib/utils";

type StatusType = "success" | "error";

const styles: Record<StatusType, string> = {
  success: "bg-green-50 text-green-800 border-green-200",
  error: "bg-red-50 text-red-800 border-red-200",
};

interface FormStatusProps {
  type: StatusType;
  message: string;
  title?: string;
  className?: string;
}

export function FormStatus({
  type,
  message,
  title,
  className,
}: FormStatusProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-3 text-sm",
        styles[type],
        className,
      )}
    >
      <div className="flex flex-col">
        {title ? <span className="font-semibold">{title}</span> : null}
        <span>{message}</span>
      </div>
    </div>
  );
}
