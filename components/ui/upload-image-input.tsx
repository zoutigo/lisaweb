"use client";

import { useId, useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

type UploadImageInputProps = {
  label: string;
  value?: string;
  placeholder?: string;
  onChange: (url: string) => void;
  helperText?: string;
  onUploadingChange?: (uploading: boolean) => void;
  onError?: (message: string | null) => void;
  className?: string;
};

export function UploadImageInput({
  label,
  value,
  placeholder = "/partner-placeholder.svg",
  onChange,
  helperText = "Formats image, uploadé vers /files.",
  onUploadingChange,
  onError,
  className,
}: UploadImageInputProps) {
  const inputId = useId();
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState("");
  const buildPreview = () => {
    if (!value) return placeholder;
    if (value.startsWith("http")) return value;
    if (value.startsWith("/")) return value;
    return `/files/${value}`;
  };
  const preview = buildPreview();

  const handleUpload = async (file?: File) => {
    if (!file) return;
    setUploading(true);
    onUploadingChange?.(true);
    onError?.(null);
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/files/upload", {
      method: "POST",
      body: formData,
    });
    setUploading(false);
    onUploadingChange?.(false);
    if (!res.ok) {
      onError?.("Upload échoué.");
      return;
    }
    const data: { path?: string } = await res.json();
    const path = data.path || placeholder;
    onChange(path);
    setFileName(file.name);
  };

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-semibold text-gray-800">
        {label}
      </label>
      <label className="flex cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium text-gray-800 shadow-sm transition hover:border-blue-300 hover:bg-white focus-within:border-blue-400 focus-within:bg-white">
        <div className="flex items-center gap-3">
          <Image
            src={preview}
            alt={`${label} preview`}
            width={40}
            height={40}
            className="h-10 w-10 rounded-full object-cover"
          />
          <span>{fileName || "Choisir un fichier image"}</span>
        </div>
        <input
          id={inputId}
          type="file"
          accept="image/*"
          aria-label={label}
          onChange={(e) => handleUpload(e.target.files?.[0] || undefined)}
          className="sr-only"
        />
      </label>
      <p className="text-xs text-gray-500">
        {uploading ? "Upload..." : helperText}
      </p>
    </div>
  );
}
