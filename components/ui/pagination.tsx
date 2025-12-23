import React from "react";
import { cn } from "@/lib/utils";

type PaginationProps = {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  className?: string;
};

export function Pagination({
  currentPage,
  pageSize,
  totalCount,
  onPageChange,
  className,
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;
  const from = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(totalCount, currentPage * pageSize);

  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e5e7eb] bg-white px-4 py-3 text-sm text-[#1b2653] shadow-sm",
        className,
      )}
    >
      <div className="text-xs text-[#6b7280]">
        {totalCount === 0
          ? "Aucune donnée"
          : `Afficher ${from}–${to} sur ${totalCount}`}
      </div>
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-[#e5e7eb] bg-white px-3 py-1 text-xs font-semibold text-[#1b2653] shadow-sm transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => canPrev && onPageChange(currentPage - 1)}
          disabled={!canPrev}
        >
          ← Précédent
        </button>
        <span className="text-xs font-semibold text-[#1b2653]">
          Page {currentPage} / {totalPages}
        </span>
        <button
          type="button"
          className="inline-flex items-center justify-center rounded-lg border border-[#e5e7eb] bg-white px-3 py-1 text-xs font-semibold text-[#1b2653] shadow-sm transition hover:bg-[#f8fafc] disabled:cursor-not-allowed disabled:opacity-50"
          onClick={() => canNext && onPageChange(currentPage + 1)}
          disabled={!canNext}
        >
          Suivant →
        </button>
      </div>
    </div>
  );
}
