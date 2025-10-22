"use client";

import Image from "next/image";
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
  product: Product;
  onEdit: (p: Product) => void;
  onRemove: (id: string) => void;
  removingId?: string | null;
};

const formatBRL = (n: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(n);

const formatDate = (iso?: string) => {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(d);
};

const PLACEHOLDER =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="400" height="240"><rect width="100%" height="100%" fill="%23e5e7eb"/></svg>';

export default function ProductAdminCard({ product, onEdit, onRemove, removingId }: Props) {
  const src = product.imageUrl || PLACEHOLDER;

  return (
    <article key={product.id} className="card p-4 space-y-2" aria-label={`Produto ${product.name}`}>
      <div className="relative aspect-[3/2] w-full overflow-hidden rounded bg-black/5">
        <Image src={src} alt={product.name} fill style={{ objectFit: 'cover' }} sizes="(max-width: 640px) 100vw, 400px" />
      </div>

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
        <h3 className="font-semibold leading-tight">{product.name}</h3>
        <span className="text-sm text-slate-600 dark:text-slate-300">{formatDate(product.updatedAt ?? product.createdAt)}</span>
      </div>

      <div className="text-sm text-slate-700 dark:text-slate-300">{product.description ?? "—"}</div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
        <div className="flex items-center gap-3">
          <span className="text-brand font-semibold">{formatBRL(product.price)}</span>
          <span className="text-sm text-slate-600 dark:text-slate-300">Estoque: {product.stock}</span>
        </div>

        <div className="mt-2 sm:mt-0 sm:ml-auto flex gap-2">
          <button
            className="btn border border-black/10 dark:border-white/10 px-3 py-2 rounded-md min-w-[88px]"
            onClick={() => onEdit(product)}
          >
            Editar
          </button>
          <button
            className="btn border border-red-600 text-red-600 hover:bg-red-600 hover:text-white disabled:opacity-50 px-3 py-2 rounded-md min-w-[88px]"
            disabled={removingId === product.id}
            onClick={() => onRemove(product.id)}
          >
            {removingId === product.id ? "Removendo…" : "Remover"}
          </button>
        </div>
      </div>
    </article>
  );
}
