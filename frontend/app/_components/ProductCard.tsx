"use client";

import Image from 'next/image';
import { useState } from 'react';
import { PlusIcon } from '@/app/components/Icons';

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
  imageUrl?: string | null;
};

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(v);

function clsx(...args: (string | false | undefined)[]) {
  return args.filter(Boolean).join(' ');
}

function highlight(text: string, term: string) {
  if (!term) return text;
  const safe = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`(${safe})`, 'ig');
  const parts = text.split(re);
  return parts.map((p, i) =>
    re.test(p) ? (
      <mark key={i} className="bg-brand/20 text-brand rounded px-0.5">
        {p}
      </mark>
    ) : (
      <span key={i}>{p}</span>
    ),
  );
}

type Props = {
  product: Product;
  searchTerm: string;
  onAddToCart: (productId: string) => Promise<void> | void;
};

export default function ProductCard({ product, searchTerm, onAddToCart }: Props) {
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    if (product.stock <= 0 || adding) return;
    try {
      setAdding(true);
      await onAddToCart(product.id);
    } finally {
      setAdding(false);
    }
  };

  return (
    <li className="card p-4 flex flex-col gap-3 h-full">
      <div className="relative w-full aspect-[3/2] overflow-hidden rounded-xl bg-black/5">
        <Image
          src={product.imageUrl ?? '/placeholder.png'}
          alt={product.name}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-h-20">
        <h3 className="font-medium">{highlight(product.name, searchTerm.trim())}</h3>
        {product.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
            {product.description}
          </p>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="text-sm">
          <div className="font-semibold">{formatBRL(product.price)}</div>
          <div
            className={clsx(
              'mt-1 inline-flex items-center px-2 py-0.5 rounded text-xs',
              product.stock > 0
                ? 'bg-accent/10 text-accent'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300',
            )}
            title={`Estoque: ${product.stock}`}
          >
            {product.stock > 0 ? `Estoque: ${product.stock}` : 'Sem estoque'}
          </div>
        </div>

        <button
          disabled={product.stock <= 0 || adding}
          onClick={handleAdd}
          className="inline-flex items-center gap-2 rounded-md bg-brand text-white px-3 py-2 text-sm hover:opacity-95 disabled:opacity-60"
          title={product.stock <= 0 ? 'Sem estoque' : 'Adicionar ao carrinho'}
          aria-disabled={product.stock <= 0 || adding}
        >
          {adding ? 'Adicionando…' : <><PlusIcon className="h-4 w-4" />Adicionar</>}
        </button>
      </div>
    </li>
  );
}
