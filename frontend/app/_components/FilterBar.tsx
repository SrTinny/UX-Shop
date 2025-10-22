"use client";

import React from 'react';

type Props = {
  sort: string;
  category: string;
  onSortChange: (value: string) => void;
  onFilterChange: (value: string) => void;
};

export default function FilterBar({ sort, category, onSortChange, onFilterChange }: Props) {
  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end">
     <div className="flex flex-wrap items-center gap-3 rounded-md p-2 shadow-sm"
       style={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600 dark:text-slate-300">Ordenar por</label>
            <select
              value={sort}
              onChange={(e) => onSortChange(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm min-w-[150px] sm:min-w-[180px] bg-[var(--color-card)] text-[var(--color-text)] dark:bg-[var(--color-card)] dark:text-[var(--color-text)] appearance-none focus:outline-none focus:ring-2 focus:ring-brand"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <option value="relevance">Relevância</option>
              <option value="price_asc">Menor Preço</option>
              <option value="price_desc">Maior Preço</option>
              <option value="name_asc">Nome (A-Z)</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600 dark:text-slate-300">Categoria</label>
            <select
              value={category}
              onChange={(e) => onFilterChange(e.target.value)}
              className="rounded-md border px-3 py-2 text-sm min-w-[140px] sm:min-w-[160px] bg-[var(--color-card)] text-[var(--color-text)] dark:bg-[var(--color-card)] dark:text-[var(--color-text)] appearance-none focus:outline-none focus:ring-2 focus:ring-brand"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <option value="">Todas</option>
              <option value="eletronicos">Eletrônicos</option>
              <option value="roupas">Roupas</option>
              <option value="livros">Livros</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
