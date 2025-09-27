'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import axios from 'axios';
import { api } from '@/lib/api';
import { isAuthenticated, clearToken } from '@/lib/auth';
import { toast } from 'sonner';

type Product = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  stock: number;
};

const formatBRL = (v: number) =>
  new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
    v,
  );

export default function ProductsPage() {
  const [ready, setReady] = useState(false);

  // produtos
  const [items, setItems] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // carrinho (badge)
  const [cartQty, setCartQty] = useState<number>(0);
  const [cartLoading, setCartLoading] = useState(false);

  // botão adicionar
  const [addingId, setAddingId] = useState<string | null>(null);

  // controle de debounce
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!isAuthenticated()) {
      window.location.href = '/login';
    } else {
      setReady(true);
    }
  }, []);

  async function fetchProducts(term?: string) {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get('/products', {
        params: { page: 1, perPage: 20, search: term || undefined },
      });

      const data = res.data as { items?: Product[] };
      const list = data.items ?? [];
      setItems(list);

      if (list.length === 0 && (term?.length ?? 0) > 0) {
        toast.info('Nenhum produto encontrado para sua busca.');
      }
    } catch (e: unknown) {
      let msg = 'Erro ao carregar produtos';
      if (axios.isAxiosError(e)) {
        msg =
          (e.response?.data as { message?: string } | undefined)?.message ??
          e.message ??
          msg;
      } else if (e instanceof Error) {
        msg = e.message;
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  async function fetchCartQty() {
    try {
      setCartLoading(true);
      const res = await api.get('/cart');
      const total = (res.data?.items ?? []).reduce(
        (acc: number, it: { quantity: number }) => acc + it.quantity,
        0,
      );
      setCartQty(total);
    } catch {
      setCartQty(0);
    } finally {
      setCartLoading(false);
    }
  }

  // carga inicial
  useEffect(() => {
    if (!ready) return;
    void fetchProducts();
    void fetchCartQty();
  }, [ready]);

  // debounce da busca
  useEffect(() => {
    if (!ready) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      void fetchProducts(search.trim());
    }, 450);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [search, ready]);

  const handleLogout = () => {
    clearToken();
    window.location.href = '/login';
  };

  async function addToCart(productId: string) {
    // otimista: aumenta badge já
    const prev = cartQty;
    setCartQty((q) => q + 1);
    try {
      setAddingId(productId);
      await api.post('/cart/items', { productId, quantity: 1 });
      toast.success('Item adicionado ao carrinho!');
    } catch (e: unknown) {
      // desfaz o otimista
      setCartQty(prev);
      let msg = 'Erro ao adicionar ao carrinho';
      if (axios.isAxiosError(e)) {
        msg =
          (e.response?.data as { message?: string } | undefined)?.message ??
          e.message ??
          msg;
      } else if (e instanceof Error) {
        msg = e.message;
      }
      toast.error(msg);
    } finally {
      setAddingId(null);
    }
  }

  const hasResults = useMemo(() => items.length > 0, [items]);

  if (!ready) return null;

  return (
    <main className="mx-auto max-w-3xl p-6 space-y-4">
      <header className="flex items-center justify-between pb-4 border-b">
        <h1 className="text-2xl font-semibold">Produtos</h1>
        <div className="flex items-center gap-3">
          <a href="/cart" className="text-sm underline flex items-center gap-2">
            Meu carrinho
            <span className="inline-flex items-center justify-center min-w-6 h-6 px-2 rounded-full bg-black text-white text-xs">
              {cartLoading ? '…' : cartQty}
            </span>
          </a>
          <button
            onClick={handleLogout}
            className="text-sm bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-700 transition"
          >
            Sair
          </button>
        </div>
      </header>

      <form
        className="flex gap-2 pt-2"
        onSubmit={(e) => {
          e.preventDefault();
          // submit manual força buscar sem esperar o debounce
          void fetchProducts(search.trim());
        }}
      >
        <input
          className="border rounded p-2 flex-1"
          placeholder="Buscar por nome…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? 'Buscando…' : 'Buscar'}
        </button>
      </form>

      {error && <p className="text-red-600 text-sm">{error}</p>}

      {/* SKELETON */}
      {loading && (
        <ul className="grid gap-3" aria-busy="true" aria-live="polite">
          {Array.from({ length: 4 }).map((_, i) => (
            <li
              key={i}
              className="border rounded p-3 flex items-center justify-between animate-pulse"
            >
              <div className="flex-1">
                <div className="h-4 w-40 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-72 bg-gray-200 rounded mb-2" />
                <div className="h-3 w-56 bg-gray-200 rounded" />
              </div>
              <div className="h-9 w-28 bg-gray-200 rounded" />
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && !hasResults && (
        <p className="text-sm text-gray-600">Nenhum produto encontrado.</p>
      )}

      {!loading && hasResults && (
        <ul className="grid gap-3">
          {items.map((p) => (
            <li
              key={p.id}
              className="border rounded p-3 flex items-center justify-between"
            >
              <div>
                <div className="font-medium">{p.name}</div>
                {p.description && (
                  <div className="text-sm text-gray-600">{p.description}</div>
                )}
                <div className="text-sm mt-1">
                  {formatBRL(p.price)} · estoque: {p.stock}
                </div>
              </div>
              <button
                disabled={p.stock <= 0 || addingId === p.id}
                onClick={() => addToCart(p.id)}
                className="bg-black text-white px-3 py-2 rounded disabled:opacity-50"
                title={p.stock <= 0 ? 'Sem estoque' : 'Adicionar ao carrinho'}
              >
                {addingId === p.id ? 'Adicionando…' : 'Adicionar'}
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
