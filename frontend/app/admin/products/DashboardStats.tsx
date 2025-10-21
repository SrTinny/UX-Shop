"use client";

import React from "react";

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  createdAt?: string;
  updatedAt?: string;
  imageUrl?: string | null;
};

type Props = {
  items: Product[];
};

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

export default function DashboardStats({ items }: Props) {
  const total = items.length;
  const outOfStock = items.filter((p) => p.stock === 0).length;
  const totalValue = items.reduce((acc, p) => acc + (p.price * (p.stock ?? 0)), 0);
  const maxPrice = items.length ? Math.max(...items.map((p) => p.price)) : 0;

  return (
    <section aria-label="Estatísticas do catálogo" className="grid grid-cols-1 sm:grid-cols-4 gap-4">
      <div className="card p-4">
        <div className="text-sm text-slate-500">Total de produtos</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{total}</div>
      </div>

      <div className="card p-4">
        <div className="text-sm text-slate-500">Itens sem estoque</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{outOfStock}</div>
      </div>

      <div className="card p-4">
        <div className="text-sm text-slate-500">Valor total em estoque</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{formatBRL(totalValue)}</div>
      </div>

      <div className="card p-4">
        <div className="text-sm text-slate-500">Produto mais caro</div>
        <div className="mt-2 text-2xl font-semibold text-slate-900">{items.length ? formatBRL(maxPrice) : "—"}</div>
      </div>
    </section>
  );
}
