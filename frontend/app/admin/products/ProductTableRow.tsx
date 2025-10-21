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
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40"><rect width="100%" height="100%" fill="%23e5e7eb"/></svg>';

export default function ProductTableRow({ product, onEdit, onRemove, removingId }: Props) {
  const src = product.imageUrl || PLACEHOLDER;

  return (
    <tr className="transition-colors hover:bg-black/5 dark:hover:bg-white/5">
      <td className="p-3">
        <Image src={src} alt={product.name} width={40} height={40} className="rounded" />
      </td>
      <td className="p-3 font-medium">{product.name}</td>
      <td className="p-3">{formatBRL(product.price)}</td>
      <td className="p-3">{product.stock}</td>
      <td className="hidden p-3 text-slate-600 dark:text-slate-300 lg:table-cell">
        {formatDate(product.updatedAt ?? product.createdAt)}
      </td>
      <td className="p-3 text-slate-600 dark:text-slate-300">{product.description ?? "—"}</td>
      <td className="p-3">
        <div className="flex justify-end gap-2">
          <button
            className="inline-flex items-center gap-2 px-2 py-1 border border-black/10 rounded"
            onClick={() => onEdit(product)}
          >
            Editar
            <span className="sr-only">Editar {product.name}</span>
          </button>
          <button
            className="inline-flex items-center gap-2 px-2 py-1 border border-red-600 text-red-600 rounded hover:bg-red-600 hover:text-white disabled:opacity-50"
            disabled={removingId === product.id}
            onClick={() => onRemove(product.id)}
          >
            {removingId === product.id ? "Removendo…" : "Remover"}
          </button>
        </div>
      </td>
    </tr>
  );
}
