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
    <div className="w-full flex items-center justify-between gap-2 py-3">
      {/* small screens: compact selector + prev/next */}
      <div className="flex items-center gap-2 w-full sm:w-auto">
        <button
          className="btn border px-3 py-2"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={loading || currentPage <= 1}
        >
          ‹
          <span className="sr-only">Anterior</span>
        </button>

        <div className="flex items-center gap-2 sm:hidden">
          <label className="sr-only">Página</label>
          <select
            className="input-base"
            value={currentPage}
            onChange={(e) => onPageChange(Number(e.target.value))}
            disabled={loading}
          >
            {Array.from({ length: totalPages }).map((_, i) => (
              <option key={i + 1} value={i + 1}>
                {i + 1} / {totalPages}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn border px-3 py-2"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={loading || currentPage >= totalPages}
        >
          ›
          <span className="sr-only">Próxima</span>
        </button>
      </div>

      {/* medium+ screens: full pager */}
      <div className="hidden sm:flex sm:items-center sm:gap-2 overflow-x-auto">
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
      </div>
    </div>
  );
}
