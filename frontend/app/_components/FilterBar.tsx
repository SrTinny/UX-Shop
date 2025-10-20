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
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-600 dark:text-slate-300">Ordenar por:</label>
        <select
          value={sort}
          onChange={(e) => onSortChange(e.target.value)}
          className="rounded-md border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
        >
          <option value="relevance">Relevância</option>
          <option value="price_asc">Menor Preço</option>
          <option value="price_desc">Maior Preço</option>
          <option value="name_asc">Nome (A-Z)</option>
        </select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm text-slate-600 dark:text-slate-300">Categoria:</label>
        <select
          value={category}
          onChange={(e) => onFilterChange(e.target.value)}
          className="rounded-md border border-black/10 dark:border-white/10 px-3 py-2 text-sm"
        >
          <option value="">Todas</option>
          <option value="eletronicos">Eletrônicos</option>
          <option value="roupas">Roupas</option>
          <option value="livros">Livros</option>
        </select>
      </div>
    </div>
  );
}
