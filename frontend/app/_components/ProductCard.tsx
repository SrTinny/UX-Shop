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
  tag?: 'Promoção' | 'Novo';
  category?: { id: string; name: string } | null;
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
    <li className="card p-1 sm:p-2 md:p-3 flex flex-col gap-2 h-full group transform transition-transform duration-150 hover:scale-102 hover:shadow-md focus-within:scale-102 focus-within:shadow-md">
      <div className="relative w-full aspect-[4/3] sm:aspect-[3/2] lg:aspect-[4/3] xl:aspect-[3/2] 2xl:aspect-[4/3] overflow-hidden rounded-lg bg-black/5">
        {/* Badge for tag */}
        {product.tag && (
          <span
            className={clsx(
              'absolute top-2 left-2 z-10 px-2 py-0.5 text-xs font-semibold rounded-md text-white',
              product.tag === 'Promoção' ? 'bg-red-500' : 'bg-emerald-500',
            )}
          >
            {product.tag}
          </span>
        )}

        <Image
          src={product.imageUrl ?? '/placeholder.png'}
          alt={product.name}
          fill
          sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      <div className="flex-1 min-h-10 md:min-h-12 flex flex-col items-start sm:items-center text-left sm:text-center">
        <h3 className="font-medium text-sm md:text-sm lg:text-sm xl:text-base leading-snug">{highlight(product.name, searchTerm.trim())}</h3>
        {product.description && (
          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
            {product.description}
          </p>
        )}
        {product.category?.name && (
          <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{product.category.name}</div>
        )}
      </div>

      <div className="flex items-center justify-center flex-col gap-1 w-full">
        <div className="text-sm text-center">
          <div className="font-semibold text-sm md:text-sm lg:text-sm xl:text-base">{formatBRL(product.price)}</div>
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

        {/* Add button: visible only on hover or focus-within */}
        <button
          disabled={product.stock <= 0 || adding}
          onClick={handleAdd}
          className={clsx(
            'mt-1 inline-flex items-center gap-2 rounded-md bg-brand text-white px-2 py-1 text-xs transition-opacity duration-150',
            'opacity-0 translate-y-1',
            'group-hover:opacity-100 group-focus-within:opacity-100 group-hover:translate-y-0 group-focus-within:translate-y-0',
            'disabled:opacity-60',
          )}
          title={product.stock <= 0 ? 'Sem estoque' : 'Adicionar ao carrinho'}
          aria-disabled={product.stock <= 0 || adding}
        >
          {adding ? '…' : <PlusIcon className="h-3 w-3" />}
        </button>
      </div>
    </li>
  );
}
