"use client";

import React from "react";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (n: number) => void;
  loading?: boolean;
};

export default function PaginationControls({ currentPage, totalPages, onPageChange, loading }: Props) {
  // Helper: compute range of pages to show (max 7)
  const makeRange = (cur: number, total: number, maxLen = 7) => {
    if (total <= maxLen) return Array.from({ length: total }, (_, i) => i + 1);
    const half = Math.floor(maxLen / 2);
    let start = Math.max(1, cur - half);
    let end = start + maxLen - 1;
    if (end > total) {
      end = total;
      start = end - maxLen + 1;
    }
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const pages = makeRange(currentPage, totalPages, 7);

  return (
  <div className="flex flex-wrap items-center gap-2 py-3">
      <button
        className="btn border"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={loading || currentPage <= 1}
      >
        Anterior
      </button>

  <div className="flex flex-wrap items-center gap-1">
        {pages.map((p) => {
          const base = 'px-3 py-1 rounded border text-sm transition-colors';
          const activeCls = 'bg-brand text-white shadow';
          const inactiveCls = 'bg-white text-slate-700 border-black/10 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:border-white/10 dark:hover:bg-slate-700';
          return (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              disabled={loading || p === currentPage}
              aria-current={p === currentPage}
              className={`${base} ${p === currentPage ? activeCls : inactiveCls} min-w-[36px] text-center`}
            >
              {p}
            </button>
          );
        })}
      </div>

      <button
        className="btn border"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={loading || currentPage >= totalPages}
      >
        Próxima
      </button>
    </div>
  );
}
