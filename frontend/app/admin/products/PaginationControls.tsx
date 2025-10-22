"use client";

import React from "react";

type Props = {
  currentPage: number;
  totalPages: number;
  onPageChange: (n: number) => void;
};

export default function PaginationControls({ currentPage, totalPages, onPageChange }: Props) {
  return (
    <div className="flex items-center justify-between py-3">
      <button
        className="btn border mr-2"
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
        disabled={currentPage <= 1}
      >
        Anterior
      </button>

      <div className="text-sm text-slate-600">Página {currentPage} de {totalPages}</div>

      <button
        className="btn border ml-2"
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
        disabled={currentPage >= totalPages}
      >
        Próxima
      </button>
    </div>
  );
}
